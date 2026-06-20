import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const AUTHORIZATION_ID = "AUTHORIZATION_CONFIRMATION_2026-06-17";
const SOURCE = "客户授权官方电子教材书后词汇表";

const BOOKS = {
  "pep-8a-2024": {
    publisher: "人教版",
    grade: "八年级上",
    textbookVersion: "2024审定-2022课标修订",
    customerWordlistId: "smartedu-453025ca-58bd-442e-8543-5ef5222d50c6-vocabulary-in-each-unit",
    pageTemplate:
      "https://r2-ndr.ykt.cbern.com.cn/edu_product/esp/assets/453025ca-58bd-442e-8543-5ef5222d50c6.t/zh-CN/1756191701182/transcode/image/{page}.jpg",
    pages: range(120, 131),
  },
};

const [bookKey = "pep-8a-2024"] = process.argv.slice(2);
const book = BOOKS[bookKey];
if (!book) {
  console.error(`Unknown book key: ${bookKey}`);
  console.error(`Available: ${Object.keys(BOOKS).join(", ")}`);
  process.exit(1);
}

const cacheDir = path.join(os.tmpdir(), "smartedu-official-vocab", bookKey);
await fs.mkdir(cacheDir, { recursive: true });

const allRows = [];
let currentUnit = "";

for (const page of book.pages) {
  const imagePath = path.join(cacheDir, `p${page}.jpg`);
  const sourceUrl = book.pageTemplate.replace("{page}", String(page));
  await downloadIfMissing(sourceUrl, imagePath);
  const lines = ocrImage(imagePath);
  const columns = splitColumns(lines);

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
      if (!currentUnit) continue;
      if (isEntryStart(text)) {
        if (currentEntry) pushEntry(currentEntry);
        currentEntry = {
          unit: currentUnit,
          sourcePage: page,
          sourceUrl,
          raw: text,
        };
      } else if (currentEntry) {
        currentEntry.raw += ` ${text}`;
      }
    }
    if (currentEntry) pushEntry(currentEntry);
  }
}

const deduped = dedupeRows(allRows);
const csvPath = "data/wordbooks.official-authorized.csv";
const jsonPath = "data/wordbooks.real.json";
await fs.mkdir("data", { recursive: true });
await fs.writeFile(csvPath, toCsv(deduped));

execFileSync("node", ["tools/import-wordbooks.mjs", csvPath, jsonPath], { stdio: "inherit" });

await fs.writeFile(
  "data/wordbooks.official-authorized.import-report.json",
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      bookKey,
      publisher: book.publisher,
      grade: book.grade,
      pageCount: book.pages.length,
      rawRowCount: allRows.length,
      rowCount: deduped.length,
      outputCsv: csvPath,
      outputJson: jsonPath,
      source: SOURCE,
      authorizationId: AUTHORIZATION_ID,
    },
    null,
    2,
  )}\n`,
);

console.log(`Imported ${deduped.length} authorized official words from ${bookKey}`);

function pushEntry(entry) {
  const parsed = parseEntry(entry.raw);
  if (!parsed.word || parsed.word.length < 2) return;
  if (/^(p|P)\.?[0-9]+$/.test(parsed.word)) return;
  allRows.push({
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
    source_url: `${entry.sourceUrl}#ocr-page-${entry.sourcePage}`,
    authorization_id: AUTHORIZATION_ID,
  });
}

function parseEntry(raw) {
  let text = normalizeOcr(raw)
    .replace(/\s+/g, " ")
    .replace(/\b[Pp]\.?\s*[0-9ISl]+$/g, "")
    .trim();

  const firstChinese = text.search(/[\u3400-\u9fff]/);
  const beforeChinese = firstChinese >= 0 ? text.slice(0, firstChinese).trim() : text;
  const afterChinese = firstChinese >= 0 ? text.slice(firstChinese).trim() : "";

  const wordMatch = beforeChinese.match(/^([A-Za-z][A-Za-z0-9'’.,() -]*?)(?=\s*\/|\s+(?:n|v|adj|adv|pron|prep|conj|modal|interj)\b|$)/);
  const word = cleanWord(wordMatch?.[1] || beforeChinese.split(/\s{2,}/)[0] || "");
  const phonetic = (text.match(/\/[^/]{1,40}\//)?.[0] || "").replace(/[()（）]/g, "").trim();
  const partMatch = text.match(/\b(adj|acj|adv|adu|n|v|pron|prep|conj|modal v|interj|modal)\.?\b/i);
  const part = normalizePart(partMatch?.[0] || (word.includes(" ") ? "phr." : ""));
  const cn = cleanupMeaning(afterChinese || text.replace(beforeChinese, ""));

  return { word, phonetic, part, cn };
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
    .toLowerCase()
    .replace("acj", "adj")
    .replace("adu", "adv")
    .replace(/\.$/, "") + (part ? "." : "");
}

function splitColumns(lines) {
  const filtered = lines
    .filter((line) => line.y > 0.04 && line.y < 0.94)
    .sort((a, b) => (b.y === a.y ? a.x - b.x : b.y - a.y));
  return [
    filtered.filter((line) => line.x < 0.49),
    filtered.filter((line) => line.x >= 0.49),
  ];
}

function readUnit(text) {
  const match = text.match(/^Unit\s*([1-8S])$/i);
  if (!match) return "";
  return `Unit ${match[1].toUpperCase() === "S" ? "5" : match[1]}`;
}

function isEntryStart(text) {
  if (!/^[A-Za-z]/.test(text)) return false;
  if (/^(ad|adj|adv|n|v|pron|prep|conj|modal|interj)\.?\b/i.test(text)) return false;
  if (/^(adj|adv|n|v|pron|prep|conj|modal|interj)\.?\b/i.test(text)) return false;
  if (/^(Vocabulary|Unit|P\.|p\.)/.test(text)) return false;
  return /[\u3400-\u9fff]|\/|[A-Za-z]+\s+[A-Za-z]+/.test(text);
}

function shouldSkip(text) {
  return (
    /^人民/.test(text) ||
    /^八民/.test(text) ||
    /^Vocabulary in Each Unit/.test(text) ||
    /^（?注/.test(text) ||
    /^[0-9]+$/.test(text) ||
    /^[Pp]\.?\s*[0-9ISl]+$/.test(text)
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
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(header.map((key) => csvCell(row[key] || "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function csvCell(value) {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function downloadIfMissing(url, file) {
  try {
    const stat = await fs.stat(file);
    if (stat.size > 0) return;
  } catch {
    // continue
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
  await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
}

function ocrImage(imagePath) {
  const output = execFileSync("swift", ["tools/vision-ocr.swift", imagePath], {
    encoding: "utf8",
    env: { ...process.env, VISION_OCR_LANGS: "zh-Hans,en-US" },
    maxBuffer: 1024 * 1024 * 20,
  });
  return JSON.parse(output);
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
