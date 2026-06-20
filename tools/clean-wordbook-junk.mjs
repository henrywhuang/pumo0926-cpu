#!/usr/bin/env node
// 清理词库里的非记忆词汇：单元/栏目标题（Unit X、Topic Talk、Getting ready…）、
// 句子片段、OCR 乱码、以及把栏目标题与多个词义混在一起的「* 合并」脏条目。
// 同步清理 data/wordbooks.real.json（运行时词库）与 data/wordbooks.official-authorized.csv（同源导出）。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const JSON_FILE = path.join(ROOT, "data", "wordbooks.real.json");
const CSV_FILE = path.join(ROOT, "data", "wordbooks.official-authorized.csv");

// 判定一个「word」是否为非记忆词汇（应删除）。保留 around the world、get ready 等真实短语。
export function isJunkWord(raw) {
  const w = (raw || "").trim();
  if (!w) return true;
  if (w.includes("*")) return true; // OCR 把多个词义/栏目标题合并的脏条目
  if (/\d/.test(w) && /\s/.test(w)) return true; // 数字+空格：页码、音标乱码、句子片段
  if (/^(starter|unit|module|topic|section|lesson|period|review|revision|project|part|appendix|stage)\s*\d/i.test(w)) return true;
  if (/^starter(\s+unit|\b)/i.test(w)) return true; // Starter / Starter Unit X
  if (/\b(workshop|reading club|chat room dialogue)\b/i.test(w) && /\s/.test(w)) return true;
  if (/^(topic talk|words and expressions|self[- ]?check|grammar focus|welcome to the unit|review of units?|(wrapping up|preparing for|developing|exploring) the topic|getting ready|listening and speaking|around the world in)\b/i.test(w)) return true;
  return false;
}

function cleanJson() {
  const data = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
  let total = 0;
  let removed = 0;
  for (const publisher of data.publishers || []) {
    for (const grade of publisher.grades || []) {
      for (const unit of grade.units || []) {
        const before = (unit.words || []).length;
        total += before;
        unit.words = (unit.words || []).filter((it) => !isJunkWord(it.word));
        removed += before - unit.words.length;
      }
    }
  }
  fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2) + "\n");
  console.log(`JSON: 总 ${total}，删除 ${removed}，保留 ${total - removed}`);
}

// 引号感知的 CSV 解析（支持字段内逗号/换行/转义引号），按记录过滤后重写。
function parseCsvRecords(text) {
  const records = [];
  let field = "";
  let record = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      record.push(field); field = "";
    } else if (c === "\n") {
      record.push(field); records.push(record); record = []; field = "";
    } else if (c === "\r") {
      // 忽略，配合 \n 处理
    } else field += c;
  }
  if (field.length || record.length) { record.push(field); records.push(record); }
  return records;
}

function csvField(value) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function cleanCsv() {
  if (!fs.existsSync(CSV_FILE)) return;
  const records = parseCsvRecords(fs.readFileSync(CSV_FILE, "utf8"));
  if (!records.length) return;
  const header = records[0];
  const wordIdx = header.indexOf("word");
  const kept = [header];
  let removed = 0;
  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    if (row.length === 1 && row[0] === "") continue; // 末尾空行
    if (isJunkWord(row[wordIdx])) { removed++; continue; }
    kept.push(row);
  }
  const out = kept.map((r) => r.map(csvField).join(",")).join("\n") + "\n";
  fs.writeFileSync(CSV_FILE, out);
  console.log(`CSV: 总 ${records.length - 1}，删除 ${removed}，保留 ${kept.length - 1}`);
}

cleanJson();
cleanCsv();
