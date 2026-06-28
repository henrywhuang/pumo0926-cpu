#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  alphaKey,
  parseCsv,
  readJson,
  splitPipe,
  walkWords,
  writeCsv,
  writeJson
} from "./pronunciation-utils.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const WORD_JSON = path.join(ROOT, "data", "wordbooks.real.json");
const WORD_CSV = path.join(ROOT, "data", "wordbooks.official-authorized.csv");
const PRON_JSON = path.join(ROOT, "data", "pronunciation-master.json");
const PHONICS_JSON = path.join(ROOT, "data", "phonics-master.json");

const data = readJson(WORD_JSON);
const pron = readJson(PRON_JSON);
const phonics = readJson(PHONICS_JSON);
const pronMap = new Map((pron.words || []).map((item) => [item.normalized_word, item]));
const phonicsMap = new Map((phonics.words || []).map((item) => [item.normalized_word, item]));

const stats = {
  jsonWords: 0,
  jsonPronunciationTouched: 0,
  jsonPhonicsTouched: 0,
  csvRows: 0,
  csvPronunciationTouched: 0,
  csvPhonicsTouched: 0
};

for (const { item } of walkWords(data)) {
  const key = alphaKey(item.word);
  if (!key) continue;
  stats.jsonWords += 1;
  const p = pronMap.get(key);
  if (p) {
    item.phonetic = item.phonetic || {};
    item.phonetic.uk = p.phonetic_uk || "";
    item.phonetic.us = p.phonetic_us || "";
    item.phoneticStatus = p.status || "needs_review";
    item.phoneticSource = p.source || "pronunciation-master";
    item.phoneticConfidence = p.confidence || "low";
    item.phoneticReviewNote = p.review_note || "";
    stats.jsonPronunciationTouched += 1;
  }
  const ph = phonicsMap.get(key);
  if (ph) {
    item.chunks = splitPipe(ph.chunks);
    item.phonics = splitPipe(ph.phonics);
    item.phonicsStatus = ph.status || "needs_review";
    item.phonicsSource = "phonics-master";
    item.phonicsConfidence = ph.confidence || "low";
    item.phonicsReviewNote = ph.review_note || "";
    stats.jsonPhonicsTouched += 1;
  }
}

writeJson(WORD_JSON, data);

if (fs.existsSync(WORD_CSV)) {
  const rows = parseCsv(fs.readFileSync(WORD_CSV, "utf8").replace(/^\uFEFF/, ""));
  const header = rows[0];
  const records = rows.slice(1).filter((row) => row.some((cell) => cell.trim()));
  const index = ensureColumns(header, [
    "phonetic_status",
    "phonetic_source",
    "phonetic_confidence",
    "phonetic_review_note",
    "phonics_status",
    "phonics_source",
    "phonics_confidence",
    "phonics_review_note"
  ]);
  const wordIndex = header.indexOf("word");
  const ukIndex = header.indexOf("phonetic_uk");
  const usIndex = header.indexOf("phonetic_us");
  const chunksIndex = header.indexOf("chunks");
  const phonicsIndex = header.indexOf("phonics");

  for (const row of records) {
    while (row.length < header.length) row.push("");
    const key = alphaKey(row[wordIndex]);
    if (!key) continue;
    stats.csvRows += 1;
    const p = pronMap.get(key);
    if (p) {
      row[ukIndex] = p.phonetic_uk || "";
      row[usIndex] = p.phonetic_us || "";
      row[index.phonetic_status] = p.status || "needs_review";
      row[index.phonetic_source] = p.source || "pronunciation-master";
      row[index.phonetic_confidence] = p.confidence || "low";
      row[index.phonetic_review_note] = p.review_note || "";
      stats.csvPronunciationTouched += 1;
    }
    const ph = phonicsMap.get(key);
    if (ph) {
      row[chunksIndex] = splitPipe(ph.chunks).join("|");
      row[phonicsIndex] = splitPipe(ph.phonics).join("|");
      row[index.phonics_status] = ph.status || "needs_review";
      row[index.phonics_source] = "phonics-master";
      row[index.phonics_confidence] = ph.confidence || "low";
      row[index.phonics_review_note] = ph.review_note || "";
      stats.csvPhonicsTouched += 1;
    }
  }
  writeCsv(WORD_CSV, header, records);
}

writeJson(path.join(ROOT, "data", "pronunciation-phonics-apply-report.json"), stats);
fs.writeFileSync(path.join(ROOT, "data", "pronunciation-phonics-apply-report.md"), [
  "# 音标与自然拼读写回报告",
  "",
  `- 写回时间：${new Date().toISOString()}`,
  `- JSON 词条数：${stats.jsonWords}`,
  `- JSON 音标写回：${stats.jsonPronunciationTouched}`,
  `- JSON 自然拼读写回：${stats.jsonPhonicsTouched}`,
  `- CSV 词条数：${stats.csvRows}`,
  `- CSV 音标写回：${stats.csvPronunciationTouched}`,
  `- CSV 自然拼读写回：${stats.csvPhonicsTouched}`,
  "",
  "说明：写回的是候选与状态字段。前端只展示 ok/verified/reviewed 的音标和自然拼读，其他显示待校验。"
].join("\n") + "\n");

console.log(JSON.stringify(stats, null, 2));

function ensureColumns(header, names) {
  for (const name of names) {
    if (!header.includes(name)) header.push(name);
  }
  return Object.fromEntries(header.map((name, i) => [name, i]));
}

