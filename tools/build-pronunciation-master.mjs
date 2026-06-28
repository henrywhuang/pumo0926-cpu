#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { alphaKey, displayableIpa, readJson, walkWords, writeCsv, writeJson } from "./pronunciation-utils.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const INPUT = path.join(ROOT, "data", "wordbooks.real.json");
const JSON_OUT = path.join(ROOT, "data", "pronunciation-master.json");
const CSV_OUT = path.join(ROOT, "data", "pronunciation-master.csv");
const REPORT_OUT = path.join(ROOT, "data", "pronunciation-master-report.md");

const data = readJson(INPUT);
const byWord = new Map();

for (const { publisher, grade, unit, item } of walkWords(data)) {
  const key = alphaKey(item.word);
  if (!key) continue;
  if (!byWord.has(key)) {
    byWord.set(key, {
      word: item.word,
      normalized_word: key,
      phonetic_uk: "",
      phonetic_us: "",
      source: "",
      status: "needs_review",
      confidence: "low",
      review_note: "",
      occurrences: []
    });
  }
  const entry = byWord.get(key);
  const uk = displayableIpa(item.phonetic?.uk);
  const us = displayableIpa(item.phonetic?.us);
  if (!entry.phonetic_uk && uk) entry.phonetic_uk = uk;
  if (!entry.phonetic_us && us) entry.phonetic_us = us;
  entry.occurrences.push(`${publisher.name}/${grade.name}/${unit.name}`);
}

for (const entry of byWord.values()) {
  if (!entry.phonetic_uk && !entry.phonetic_us) {
    entry.status = "missing";
    entry.review_note = "未找到可展示 IPA，前端将显示待校验";
  } else if (!entry.phonetic_uk || !entry.phonetic_us) {
    entry.status = "needs_review";
    entry.confidence = "low";
    entry.review_note = "英式或美式音标缺失，需人工补齐";
  } else {
    entry.status = "needs_review";
    entry.confidence = "medium";
    entry.review_note = "当前为导入/修复候选音标，未做教研审核";
  }
  entry.source = "current-wordbook-candidate";
  entry.occurrence_count = entry.occurrences.length;
  entry.sample_occurrences = entry.occurrences.slice(0, 5);
  delete entry.occurrences;
}

const words = [...byWord.values()].sort((a, b) => a.normalized_word.localeCompare(b.normalized_word));
writeJson(JSON_OUT, {
  generatedAt: new Date().toISOString(),
  sourceFile: "data/wordbooks.real.json",
  schema: "pronunciation-master.v1",
  note: "候选音标主表。status 非 ok/verified/reviewed 时，前端只展示待校验，不作为正式教学音标。",
  words
});

const header = [
  "word",
  "normalized_word",
  "phonetic_uk",
  "phonetic_us",
  "source",
  "status",
  "confidence",
  "review_note",
  "occurrence_count",
  "sample_occurrences"
];
writeCsv(CSV_OUT, header, words.map((entry) => header.map((name) => (
  Array.isArray(entry[name]) ? entry[name].join("|") : entry[name]
))));

const summary = {
  totalUniqueWords: words.length,
  bothCandidate: words.filter((item) => item.phonetic_uk && item.phonetic_us).length,
  missingAny: words.filter((item) => !item.phonetic_uk || !item.phonetic_us).length,
  missingBoth: words.filter((item) => !item.phonetic_uk && !item.phonetic_us).length,
  needsReview: words.filter((item) => item.status === "needs_review").length,
  missing: words.filter((item) => item.status === "missing").length
};

const report = [
  "# 音标主表生成报告",
  "",
  `- 生成时间：${new Date().toISOString()}`,
  `- 唯一单词数：${summary.totalUniqueWords}`,
  `- 英美音标都有候选值：${summary.bothCandidate}`,
  `- 任一音标缺失：${summary.missingAny}`,
  `- 英美音标都缺失：${summary.missingBoth}`,
  `- 待教研复核：${summary.needsReview}`,
  `- 缺失：${summary.missing}`,
  "",
  "说明：本脚本只生成候选主表，不把候选值标记为已审核。前端会对非 ok/verified/reviewed 状态显示“待校验”。"
].join("\n");
writeJson(path.join(ROOT, "data", "pronunciation-master-report.json"), summary);
await import("node:fs").then(({ default: fs }) => fs.writeFileSync(REPORT_OUT, `${report}\n`));

console.log(JSON.stringify(summary, null, 2));

