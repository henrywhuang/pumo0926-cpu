import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const AUTHORIZATION_ID = "AUTHORIZATION_CONFIRMATION_2026-06-17";
const SOURCE = "客户授权官方电子教材书后词汇表";
const OCR_BIN = path.join(os.tmpdir(), "vision-ocr-tool");
const CACHE_ROOT = path.join(os.tmpdir(), "smartedu-official-vocab-batch");

await ensureOcrBinary();

const ebooks = JSON.parse(await fs.readFile("data/official-smartedu-junior-english-ebooks.enriched.json", "utf8")).items;
const materials = JSON.parse(await fs.readFile("data/official-smartedu-junior-english-teachingmaterials.json", "utf8")).items;
const materialByAsset = mapMaterialsByAsset(materials);
const coverMetaById = await readCoverMetadata();
const candidates = ebooks
  .map((ebook) => resolveBookCandidate(ebook, materialByAsset, coverMetaById))
  .filter(Boolean)
  .filter((book) => book.publisher && book.grade && book.pageTemplate && book.pageCount);
const { books, duplicateBooks } = selectBooks(candidates);

const allRows = [];
const report = {
  generatedAt: new Date().toISOString(),
  candidateBookCount: candidates.length,
  mappedBookCount: books.length,
  duplicateBooks,
  importedBooks: [],
  skippedBooks: ebooks
    .filter((ebook) => !candidates.some((book) => book.id === ebook.id))
    .map((ebook) => ({ id: ebook.id, title: ebook.title, labels: ebook.labels, reason: skipReason(ebook, coverMetaById) })),
};

for (const book of books) {
  console.log(`\n[${book.publisher} ${book.grade}] ${book.id}`);
  const ocrPages = await scanBookPages(book);
  const vocabPages = selectVocabularyPages(ocrPages);
  if (!vocabPages.length) {
    report.importedBooks.push({ ...bookSummary(book), pageCount: 0, wordCount: 0, status: "no-vocabulary-pages-detected" });
    console.log("  no vocabulary pages detected");
    continue;
  }
  const rows = parseBook(book, vocabPages);
  allRows.push(...rows);
  report.importedBooks.push({
    ...bookSummary(book),
    pageCount: vocabPages.length,
    pages: vocabPages.map((page) => page.page),
    wordCount: rows.length,
    status: rows.length ? "imported" : "empty-after-parse",
  });
  console.log(`  pages=${vocabPages.map((page) => page.page).join(",")} words=${rows.length}`);
}

const deduped = dedupeRows(allRows);
const csvPath = "data/wordbooks.official-authorized.csv";
const jsonPath = "data/wordbooks.real.json";
await fs.mkdir("data", { recursive: true });
await fs.writeFile(csvPath, toCsv(deduped));
execFileSync("node", ["tools/import-wordbooks.mjs", csvPath, jsonPath], { stdio: "inherit" });
report.rawRowCount = allRows.length;
report.rowCount = deduped.length;
report.outputCsv = csvPath;
report.outputJson = jsonPath;
await fs.writeFile("data/wordbooks.official-authorized.batch-report.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(`\nBatch imported ${deduped.length} rows from ${books.length} mapped official books.`);

async function ensureOcrBinary() {
  try {
    const [src, bin] = await Promise.all([fs.stat("tools/vision-ocr.swift"), fs.stat(OCR_BIN)]);
    if (bin.mtimeMs >= src.mtimeMs) return;
  } catch {
    // compile below
  }
  execFileSync("swiftc", ["tools/vision-ocr.swift", "-o", OCR_BIN], { stdio: "inherit" });
}

async function scanBookPages(book) {
  const start = Math.max(1, book.pageCount - 65);
  const pages = [];
  for (let page = start; page <= book.pageCount; page += 1) {
    const imagePath = await downloadPage(book, page);
    if (!imagePath) continue;
    const ocrPath = path.join(CACHE_ROOT, book.id, `p${page}.json`);
    let lines;
    try {
      lines = JSON.parse(await fs.readFile(ocrPath, "utf8"));
    } catch {
      lines = ocrImage(imagePath);
      await fs.writeFile(ocrPath, `${JSON.stringify(lines)}\n`);
    }
    pages.push({ page, lines, sourceUrl: book.pageTemplate.replace("{page}", String(page)) });
  }
  return pages;
}

function selectVocabularyPages(pages) {
  const result = [];
  let started = false;
  let silence = 0;
  for (const page of pages) {
    const text = page.lines.map((line) => line.text).join(" ");
    const starts = /Vocabulary in Each Unit|Words and Expressions|Word List|Wordlist|单词表|词汇表/i.test(text);
    const stop = /Vocabulary A-Z|Vocabulary from Primary School|Irregular Verbs|Tapescripts|Appendix/i.test(text);
    if (!started && starts && /Unit\s*[1-9S]|Module\s*[1-9]|Lesson\s*[1-9]/i.test(text)) started = true;
    if (started && stop) break;
    if (started) {
      const hasEntry = page.lines.some((line) => isEntryStart(cleanText(line.text)) || readUnit(cleanText(line.text)));
      if (hasEntry) {
        result.push(page);
        silence = 0;
      } else {
        silence += 1;
        if (silence >= 2) break;
      }
    }
  }
  return result;
}

function parseBook(book, pages) {
  const rows = [];
  let currentUnit = "";
  for (const page of pages) {
    const columns = splitColumns(page.lines);
    for (const column of columns) {
      let currentEntry = null;
      for (const line of column) {
        const text = cleanText(line.text);
        if (!text || shouldSkip(text)) continue;
        const unit = readUnit(text);
        if (unit) {
          currentUnit = unit;
          currentEntry = null;
          continue;
        }
        if (!currentUnit) currentUnit = "Book Vocabulary";
        if (isEntryStart(text)) {
          if (currentEntry) pushEntry(rows, book, page, currentEntry);
          currentEntry = { unit: currentUnit, raw: text };
        } else if (currentEntry) {
          currentEntry.raw += ` ${text}`;
        }
      }
      if (currentEntry) pushEntry(rows, book, page, currentEntry);
    }
  }
  return dedupeRows(rows);
}

function pushEntry(rows, book, page, entry) {
  const parsed = parseEntry(entry.raw);
  if (!parsed.word || parsed.word.length < 2) return;
  if (/^(p|P)\.?[0-9]+$/.test(parsed.word)) return;
  rows.push({
    publisher: book.publisher,
    grade: book.grade,
    unit: entry.unit,
    word: parsed.word,
    phonetic_uk: parsed.phonetic,
    phonetic_us: parsed.phonetic,
    part: parsed.part,
    cn: parsed.cn,
    chunks: makeChunks(parsed.word),
    phonics: "",
    example: "",
    example_cn: "",
    source: SOURCE,
    textbook_version: book.textbookVersion,
    customer_wordlist_id: book.customerWordlistId,
    source_url: `${page.sourceUrl}#ocr-page-${page.page}`,
    authorization_id: AUTHORIZATION_ID,
  });
}

function parseEntry(raw) {
  let text = normalizeOcr(raw)
    .replace(/\s+/g, " ")
    .replace(/\b[Pp]\.?\s*[0-9ISlSs]+$/g, "")
    .trim();
  const firstChinese = text.search(/[\u3400-\u9fff]/);
  const beforeChinese = firstChinese >= 0 ? text.slice(0, firstChinese).trim() : text;
  const afterChinese = firstChinese >= 0 ? text.slice(firstChinese).trim() : "";
  const wordMatch = beforeChinese.match(/^([A-Za-z][A-Za-z0-9'’.,() -]*?)(?=\s*\/|\s+(?:n|v|adj|adv|pron|prep|conj|modal|interj)\b|$)/);
  let word = cleanWord(wordMatch?.[1] || beforeChinese.split(/\s{2,}/)[0] || "");
  const phonetic = (text.match(/\/[^/]{1,40}\//)?.[0] || "").replace(/[()（）]/g, "").trim();
  const partMatch = text.match(/\b(adj|acj|adv|adu|n|v|pron|prep|conj|modal v|interj|modal)\.?\b/i);
  const part = normalizePart(partMatch?.[0] || (word.includes(" ") ? "phr." : ""));
  const cn = cleanupMeaning(afterChinese || text.replace(beforeChinese, ""));
  if (!cn && !phonetic && word.split(/\s+/).length > 5) word = "";
  return { word, phonetic, part, cn };
}

function mapMaterialsByAsset(items) {
  const map = new Map();
  for (const item of items) {
    const assetId = assetIdFromUrl(item.thumbnail || "");
    if (assetId) map.set(assetId, item);
  }
  return map;
}

async function readCoverMetadata() {
  try {
    const rows = JSON.parse(await fs.readFile("data/official-smartedu-unmapped-cover-ocr.json", "utf8"));
    return new Map(rows.map((row) => [row.id, row]));
  } catch {
    return new Map();
  }
}

function resolveBookCandidate(ebook, materialByAsset, coverMetaById) {
  const material = materialByAsset.get(ebook.id);
  if (material) {
    return makeBook(ebook, {
      publisher: normalizePublisher(material.publisher),
      grade: normalizeGrade(material.grade, material.volume),
      officialTitle: material.title,
      textbookVersion: `${material.textbook_status || "官方教材"}-${ebook.update_time || material.update_time || ""}`,
      mappingMethod: "official-material-asset",
    });
  }
  const cover = coverMetaById.get(ebook.id);
  if (!cover || !cover.publisher || !cover.grade || /五四学制/.test(ebook.title)) return null;
  return makeBook(ebook, {
    publisher: cover.publisher,
    grade: cover.grade,
    officialTitle: cover.title || ebook.title,
    textbookVersion: `官方电子教材封面OCR-${ebook.update_time || ""}`,
    mappingMethod: "cover-ocr",
  });
}

function makeBook(ebook, meta) {
  return {
    key: `${meta.publisher}-${meta.grade}-${ebook.id.slice(0, 8)}`,
    id: ebook.id,
    publisher: meta.publisher,
    grade: meta.grade,
    textbookVersion: meta.textbookVersion,
    customerWordlistId: `smartedu-${ebook.id}-vocabulary`,
    pageTemplate: ebook.official_page_url_template,
    pageCount: ebook.probed_full_page_count,
    sourceTitle: ebook.title,
    officialTitle: meta.officialTitle,
    updateTime: ebook.update_time || "",
    mappingMethod: meta.mappingMethod,
  };
}

function selectBooks(items) {
  const groups = new Map();
  for (const item of items) {
    const key = `${item.publisher}|${item.grade}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  const books = [];
  const duplicateBooks = [];
  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => candidateScore(b) - candidateScore(a));
    books.push(sorted[0]);
    for (const item of sorted.slice(1)) {
      duplicateBooks.push({
        id: item.id,
        publisher: item.publisher,
        grade: item.grade,
        sourceTitle: item.sourceTitle,
        updateTime: item.updateTime,
        mappingMethod: item.mappingMethod,
        reason: `same publisher/grade as selected ${sorted[0].id}`,
      });
    }
  }
  return { books: books.sort((a, b) => a.publisher.localeCompare(b.publisher, "zh-Hans-CN") || gradeRank(a.grade) - gradeRank(b.grade)), duplicateBooks };
}

function candidateScore(book) {
  let score = Date.parse(book.updateTime.replace(/([+-]\d{2})(\d{2})$/, "$1:$2")) || 0;
  if (/根据2022年版课程标准修订/.test(book.sourceTitle)) score += 10_000_000_000_000;
  if (book.mappingMethod === "official-material-asset") score += 1_000_000_000;
  if (/五四学制/.test(book.sourceTitle)) score -= 20_000_000_000_000;
  return score;
}

function gradeRank(grade) {
  const order = ["七年级上", "七年级下", "八年级上", "八年级下", "九年级上", "九年级下", "九年级全一册"];
  const index = order.indexOf(grade);
  return index >= 0 ? index : 999;
}

function skipReason(ebook, coverMetaById) {
  if (/五四学制/.test(ebook.title)) return "excluded-wusi-system";
  const cover = coverMetaById.get(ebook.id);
  if (!cover) return "no-official-material-asset-or-cover-ocr";
  if (!cover.publisher || !cover.grade) return "cover-ocr-missing-publisher-or-grade";
  return "missing-page-template-or-page-count";
}

function assetIdFromUrl(url = "") {
  return url.match(/assets(?:_document)?\/([^/.]+)(?:\.t|\.pkg|\/image|$)/)?.[1] || "";
}

function normalizePublisher(name) {
  return name === "外研社版" ? "外研版" : name;
}

function normalizeGrade(grade, volume) {
  const g = String(grade || "").replace("年级", "年级");
  const v = String(volume || "").replace("上册", "上").replace("下册", "下");
  return `${g}${v}`;
}

function bookSummary(book) {
  return {
    id: book.id,
    publisher: book.publisher,
    grade: book.grade,
    pageCountTotal: book.pageCount,
    sourceTitle: book.sourceTitle,
    officialTitle: book.officialTitle,
  };
}

function cleanWord(value) {
  return value
    .replace(/[，。；;:：]+$/g, "")
    .replace(/\s+\/.*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanupMeaning(value) {
  return value
    .replace(/\b[Pp]\.?\s*[0-9ISlSs]+\b/g, "")
    .replace(/\s+/g, " ")
    .replace(/^[,.;:，。；：\s]+/g, "")
    .trim();
}

function normalizeOcr(text) {
  return text
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/⋯/g, "…")
    .replace(/•••••|••••|•••|••/g, "…")
    .replace(/\bacj\b/gi, "adj")
    .replace(/\badu\b/gi, "adv")
    .replace(/\b1\./g, "n.")
    .replace(/\b1(?=\s*[\u3400-\u9fff])/g, "n.")
    .replace(/\bV\./g, "v.")
    .replace(/\bV(?=\s*[\u3400-\u9fff])/g, "v.");
}

function normalizePart(part) {
  return part
    ? `${part.toLowerCase().replace("acj", "adj").replace("adu", "adv").replace(/\.$/, "")}.`
    : "";
}

function splitColumns(lines) {
  const filtered = lines
    .filter((line) => line.y > 0.04 && line.y < 0.94)
    .sort((a, b) => (b.y === a.y ? a.x - b.x : b.y - a.y));
  return [filtered.filter((line) => line.x < 0.49), filtered.filter((line) => line.x >= 0.49)];
}

function readUnit(text) {
  const match = text.match(/^(Unit|Module|Lesson)\s*([1-9S])$/i);
  if (!match) return "";
  const label = match[1][0].toUpperCase() + match[1].slice(1).toLowerCase();
  return `${label} ${match[2].toUpperCase() === "S" ? "5" : match[2]}`;
}

function isEntryStart(text) {
  if (!/^[A-Za-z]/.test(text)) return false;
  if (/^(ad|adj|adv|n|v|pron|prep|conj|modal|interj)\.?\b/i.test(text)) return false;
  if (/^(Vocabulary|Unit|Module|Lesson|P\.|p\.)/.test(text)) return false;
  return /[\u3400-\u9fff]|\/|[A-Za-z]+\s+[A-Za-z]+/.test(text);
}

function shouldSkip(text) {
  return (
    /^人民/.test(text) ||
    /^八民/.test(text) ||
    /^Vocabulary/.test(text) ||
    /^Words and Expressions/.test(text) ||
    /^Word List/.test(text) ||
    /^（?注/.test(text) ||
    /^[0-9]+$/.test(text) ||
    /^[Pp]\.?\s*[0-9ISlSs]+$/.test(text)
  );
}

function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function makeChunks(word) {
  if (!/^[A-Za-z][A-Za-z'-]*$/.test(word)) return "";
  const chunks = word.match(/[bcdfghjklmnpqrstvwxyz]*[aeiouy]+[bcdfghjklmnpqrstvwxyz]*/gi);
  return chunks?.length ? chunks.join("|") : word;
}

function dedupeRows(rows) {
  const seen = new Set();
  const result = [];
  for (const row of rows) {
    const key = `${row.publisher}|${row.grade}|${row.unit}|${row.word.toLowerCase()}|${row.cn}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row);
  }
  return result;
}

function toCsv(rows) {
  const header = [
    "publisher",
    "grade",
    "unit",
    "word",
    "phonetic_uk",
    "phonetic_us",
    "part",
    "cn",
    "chunks",
    "phonics",
    "example",
    "example_cn",
    "source",
    "textbook_version",
    "customer_wordlist_id",
    "source_url",
    "authorization_id",
  ];
  return `${[header.join(","), ...rows.map((row) => header.map((key) => csvCell(row[key] || "")).join(","))].join("\n")}\n`;
}

function csvCell(value) {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function downloadPage(book, page) {
  const dir = path.join(CACHE_ROOT, book.id);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `p${page}.jpg`);
  try {
    const stat = await fs.stat(file);
    if (stat.size > 0) return file;
  } catch {
    // download below
  }
  const url = book.pageTemplate.replace("{page}", String(page));
  const response = await fetch(url);
  if (!response.ok) {
    console.warn(`  skip page ${page}: ${response.status}`);
    return null;
  }
  await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
  return file;
}

function ocrImage(imagePath) {
  const output = execFileSync(OCR_BIN, [imagePath], {
    encoding: "utf8",
    env: { ...process.env, VISION_OCR_LANGS: "zh-Hans,en-US" },
    maxBuffer: 1024 * 1024 * 20,
  });
  return JSON.parse(output);
}
