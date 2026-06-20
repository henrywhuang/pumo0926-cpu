import { execFileSync } from "node:child_process";
import fs from "node:fs";

const [csvPath = "data/wordbooks.official-authorized.csv"] = process.argv.slice(2);

const csv = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const rows = parseCsv(csv);
const [header, ...records] = rows;
const index = Object.fromEntries(header.map((name, i) => [name.trim(), i]));
const required = ["word", "phonetic_uk", "phonetic_us", "part", "cn"];
const missing = required.filter((name) => !(name in index));
if (missing.length) throw new Error(`Missing CSV columns: ${missing.join(", ")}`);

let repaired = 0;
const samples = [];

for (const row of records) {
  if (!row.some((cell) => cell.trim())) continue;
  if (cell(row, "phonetic_uk") && cell(row, "phonetic_us")) continue;

  const fields = ["word", "part", "cn"];
  const found = fields
    .map((field) => ({ field, token: findEmbeddedPhonetic(cell(row, field)) }))
    .find((item) => item.token);

  if (!found) continue;

  const phonetic = normalizePhonetic(found.token.raw);
  if (!phonetic) continue;

  if (!cell(row, "phonetic_uk")) row[index.phonetic_uk] = phonetic;
  if (!cell(row, "phonetic_us")) row[index.phonetic_us] = phonetic;
  row[index[found.field]] = removeToken(cell(row, found.field), found.token);
  row[index.word] = cleanupWord(cell(row, "word"));
  row[index.part] = cleanupPart(cell(row, "part"));
  row[index.cn] = cleanupMeaning(cell(row, "cn"));

  repaired += 1;
  if (samples.length < 20) {
    samples.push({
      word: cell(row, "word"),
      phonetic,
      part: cell(row, "part"),
      cn: cell(row, "cn")
    });
  }
}

fs.writeFileSync(csvPath, toCsv([header, ...records]));
execFileSync("node", ["tools/import-wordbooks.mjs", csvPath, "data/wordbooks.real.json"], { stdio: "inherit" });

console.log(JSON.stringify({ repaired, samples }, null, 2));

function cell(row, name) {
  return (row[index[name]] || "").trim();
}

function findEmbeddedPhonetic(text) {
  if (!text) return null;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "/") {
      const end = text.indexOf("/", i + 1);
      if (end > i + 1) return { start: i, end: end + 1, raw: text.slice(i, end + 1) };
    }
    if (char === "J" && i > 0) {
      const end = text.indexOf("/", i + 1);
      if (end > i + 1) return { start: i, end: end + 1, raw: text.slice(i, end + 1) };
    }
    if (/[1Il]/.test(char) && /[,.，]/.test(text[i + 1] || "") && i > 0 && /\s/.test(text[i - 1] || "")) {
      const end = text.indexOf("/", i + 2);
      if (end > i + 2) return { start: i, end: end + 1, raw: text.slice(i, end + 1) };
    }
  }
  return null;
}

function normalizePhonetic(raw) {
  let text = raw
    .replace(/：/g, ":")
    .replace(/^J/, "/")
    .replace(/^[1Il][,.，]/, "/")
    .replace(/\s+/g, " ")
    .trim();
  if (!text.startsWith("/")) text = `/${text}`;
  if (!text.endsWith("/")) text = `${text}/`;
  text = text.replace(/0/g, "θ");
  if (/[\u3400-\u9fff]/.test(text)) return "";
  return /^\/[^/]{1,60}\/$/.test(text) ? text : "";
}

function removeToken(text, token) {
  return `${text.slice(0, token.start)} ${text.slice(token.end)}`.replace(/\s+/g, " ").trim();
}

function cleanupWord(value) {
  return value
    .replace(/\b(?:n|v|vi|vt|adj|adv|pron|prep|conj|phr|modal|interj)\.?\b/gi, "")
    .replace(/\b[0-9]+\.$/g, "")
    .replace(/\b[0-9]+\.\b/g, "")
    .replace(/[()（）]+$/g, "")
    .replace(/\s*[.。]+$/g, "")
    .replace(/[，。；;:：]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanupPart(value) {
  return value
    .replace(/[()（）]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanupMeaning(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/^[,.;:，。；：\s]+/g, "")
    .trim();
}

function toCsv(rows) {
  return `${rows.map((row) => row.map(escapeCsv).join(",")).join("\n")}\n`;
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, "\"\"")}"`;
  return text;
}

function parseCsv(text) {
  const parsed = [];
  let row = [];
  let field = "";
  let quote = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quote && char === "\"" && next === "\"") {
      field += "\"";
      i += 1;
    } else if (char === "\"") {
      quote = !quote;
    } else if (!quote && char === ",") {
      row.push(field);
      field = "";
    } else if (!quote && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      parsed.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    parsed.push(row);
  }
  return parsed;
}
