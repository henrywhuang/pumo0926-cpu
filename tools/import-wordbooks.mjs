import fs from "node:fs";
import path from "node:path";

const [input, output = "data/wordbooks.real.json"] = process.argv.slice(2);

if (!input) {
  console.error("Usage: node tools/import-wordbooks.mjs <input.csv> [output.json]");
  process.exit(1);
}

const csv = fs.readFileSync(input, "utf8").replace(/^\uFEFF/, "");
const rows = parseCsv(csv);
const [header, ...records] = rows;
const index = Object.fromEntries(header.map((name, i) => [name.trim(), i]));
const required = ["publisher", "grade", "unit", "word", "cn"];
const missing = required.filter((name) => !(name in index));
if (missing.length) {
  throw new Error(`Missing required CSV columns: ${missing.join(", ")}`);
}

const data = {
  generatedAt: new Date().toISOString(),
  sourceFile: path.basename(input),
  schema: "wordbooks.v1",
  publishers: []
};

const publisherMap = new Map();

for (const row of records) {
  if (!row.some((cell) => cell.trim())) continue;
  const item = readRow(row, index);
  const publisher = ensure(publisherMap, item.publisher, () => ({
    name: item.publisher,
    grades: []
  }));
  const gradeMap = publisher._gradeMap || (publisher._gradeMap = new Map());
  const grade = ensure(gradeMap, item.grade, () => ({
    name: item.grade,
    units: []
  }));
  const unitMap = grade._unitMap || (grade._unitMap = new Map());
  const unit = ensure(unitMap, item.unit, () => ({
    name: item.unit,
    words: []
  }));
  unit.words.push({
    word: item.word,
    phonetic: {
      uk: item.phonetic_uk,
      us: item.phonetic_us
    },
    phoneticStatus: item.phonetic_status,
    phoneticSource: item.phonetic_source,
    phoneticConfidence: item.phonetic_confidence,
    phoneticReviewNote: item.phonetic_review_note,
    part: item.part,
    cn: item.cn,
    chunks: splitList(item.chunks),
    phonics: splitList(item.phonics),
    phonicsStatus: item.phonics_status,
    phonicsSource: item.phonics_source,
    phonicsConfidence: item.phonics_confidence,
    phonicsReviewNote: item.phonics_review_note,
    example: item.example,
    exampleCn: item.example_cn,
    source: item.source || "客户授权官方电子教材书后词汇表",
    textbookVersion: item.textbook_version,
    customerWordlistId: item.customer_wordlist_id,
    sourceUrl: item.source_url,
    authorizationId: item.authorization_id
  });
}

for (const publisher of publisherMap.values()) {
  for (const grade of publisher._gradeMap.values()) {
    for (const unit of grade._unitMap.values()) {
      grade.units.push(unit);
    }
    delete grade._unitMap;
    publisher.grades.push(grade);
  }
  delete publisher._gradeMap;
  data.publishers.push(publisher);
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Imported ${records.length} rows -> ${output}`);

function readRow(row, index) {
  const value = (name) => (row[index[name]] || "").trim();
  return {
    publisher: value("publisher"),
    grade: value("grade"),
    unit: value("unit"),
    word: value("word"),
    phonetic_uk: value("phonetic_uk"),
    phonetic_us: value("phonetic_us"),
    phonetic_status: value("phonetic_status"),
    phonetic_source: value("phonetic_source"),
    phonetic_confidence: value("phonetic_confidence"),
    phonetic_review_note: value("phonetic_review_note"),
    part: value("part"),
    cn: value("cn"),
    chunks: value("chunks"),
    phonics: value("phonics"),
    phonics_status: value("phonics_status"),
    phonics_source: value("phonics_source"),
    phonics_confidence: value("phonics_confidence"),
    phonics_review_note: value("phonics_review_note"),
    example: value("example"),
    example_cn: value("example_cn"),
    source: value("source"),
    textbook_version: value("textbook_version"),
    customer_wordlist_id: value("customer_wordlist_id"),
    source_url: value("source_url"),
    authorization_id: value("authorization_id")
  };
}

function splitList(text) {
  return text ? text.split("|").map((item) => item.trim()).filter(Boolean) : [];
}

function ensure(map, key, create) {
  if (!key) throw new Error("CSV row contains empty grouping key");
  if (!map.has(key)) map.set(key, create());
  return map.get(key);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quote = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quote && char === "\"" && next === "\"") {
      cell += "\"";
      i += 1;
    } else if (char === "\"") {
      quote = !quote;
    } else if (!quote && char === ",") {
      row.push(cell);
      cell = "";
    } else if (!quote && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
