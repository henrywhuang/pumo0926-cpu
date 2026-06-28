import fs from "node:fs";
import path from "node:path";

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function parseCsv(text) {
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

export function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}

export function writeCsv(file, header, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const lines = [header, ...rows].map((row) => row.map(csvCell).join(","));
  fs.writeFileSync(file, `${lines.join("\n")}\n`);
}

export function* walkWords(data) {
  for (const publisher of data.publishers || []) {
    for (const grade of publisher.grades || []) {
      for (const unit of grade.units || []) {
        for (const item of unit.words || []) {
          yield { publisher, grade, unit, item };
        }
      }
    }
  }
}

export function normalizeWord(word) {
  return String(word || "").trim().toLowerCase();
}

export function alphaKey(word) {
  return normalizeWord(word).replace(/[^a-z]/g, "");
}

export function displayableIpa(ipa) {
  const text = String(ipa || "").trim();
  if (!/^\/[^/]{1,60}\/$/.test(text)) return "";
  if (/[A-Z0-9_{}[\]\\]/.test(text)) return "";
  return text;
}

export function splitPipe(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "").split("|").map((item) => item.trim()).filter(Boolean);
}

