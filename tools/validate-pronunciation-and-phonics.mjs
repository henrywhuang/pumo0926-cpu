#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { alphaKey, displayableIpa, readJson, walkWords, writeJson } from "./pronunciation-utils.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const INPUT = path.join(ROOT, "data", "wordbooks.real.json");
const data = readJson(INPUT);

const approved = new Set(["ok", "verified", "reviewed"]);
const report = {
  checkedAt: new Date().toISOString(),
  input: "data/wordbooks.real.json",
  summary: {
    wordCount: 0,
    approvedPhonetic: 0,
    pendingPhonetic: 0,
    invalidIpa: 0,
    approvedPhonics: 0,
    pendingPhonics: 0,
    invalidPhonicsJoin: 0,
    invalidPhonicsAlignment: 0
  },
  samples: {
    invalidIpa: [],
    invalidPhonicsJoin: [],
    invalidPhonicsAlignment: [],
    pendingPhonetic: [],
    pendingPhonics: []
  },
  books: []
};

for (const publisher of data.publishers || []) {
  for (const grade of publisher.grades || []) {
    const book = {
      publisher: publisher.name,
      grade: grade.name,
      wordCount: 0,
      approvedPhonetic: 0,
      pendingPhonetic: 0,
      approvedPhonics: 0,
      pendingPhonics: 0
    };
    for (const unit of grade.units || []) {
      for (const item of unit.words || []) {
        const ctx = `${publisher.name}/${grade.name}/${unit.name}/${item.word}`;
        const phoneticStatus = norm(item.phoneticStatus);
        const phonicsStatus = norm(item.phonicsStatus);
        const uk = displayableIpa(item.phonetic?.uk);
        const us = displayableIpa(item.phonetic?.us);
        const chunks = Array.isArray(item.chunks) ? item.chunks : [];
        const phonics = Array.isArray(item.phonics) ? item.phonics : [];
        const chunksJoin = alphaKey(chunks.join(""));
        const wordKey = alphaKey(item.word);

        report.summary.wordCount += 1;
        book.wordCount += 1;

        if (approved.has(phoneticStatus)) {
          report.summary.approvedPhonetic += 1;
          book.approvedPhonetic += 1;
          if (!uk || !us) pushSample("invalidIpa", ctx);
        } else {
          report.summary.pendingPhonetic += 1;
          book.pendingPhonetic += 1;
          pushSample("pendingPhonetic", ctx);
        }
        if ((item.phonetic?.uk && !uk) || (item.phonetic?.us && !us)) {
          report.summary.invalidIpa += 1;
          pushSample("invalidIpa", ctx);
        }

        if (approved.has(phonicsStatus)) {
          report.summary.approvedPhonics += 1;
          book.approvedPhonics += 1;
          if (chunksJoin !== wordKey) {
            report.summary.invalidPhonicsJoin += 1;
            pushSample("invalidPhonicsJoin", `${ctx} => ${chunks.join("|")}`);
          }
          if (!chunks.length || chunks.length !== phonics.length) {
            report.summary.invalidPhonicsAlignment += 1;
            pushSample("invalidPhonicsAlignment", `${ctx} chunks=${chunks.length} phonics=${phonics.length}`);
          }
        } else {
          report.summary.pendingPhonics += 1;
          book.pendingPhonics += 1;
          pushSample("pendingPhonics", ctx);
        }
      }
    }
    report.books.push(book);
  }
}

writeJson(path.join(ROOT, "data", "pronunciation-phonics-validation.json"), report);
fs.writeFileSync(path.join(ROOT, "data", "pronunciation-phonics-validation.md"), markdownReport(report));
console.log(JSON.stringify(report.summary, null, 2));

function norm(status) {
  return String(status || "needs_review").trim().toLowerCase().replace(/\s+/g, "_");
}

function pushSample(key, value) {
  if (report.samples[key].length < 50) report.samples[key].push(value);
}

function markdownReport(result) {
  const s = result.summary;
  return [
    "# 音标与自然拼读校验报告",
    "",
    `- 校验时间：${result.checkedAt}`,
    `- 总词条：${s.wordCount}`,
    `- 已审核音标：${s.approvedPhonetic}`,
    `- 待校验音标：${s.pendingPhonetic}`,
    `- IPA 格式异常：${s.invalidIpa}`,
    `- 已审核自然拼读：${s.approvedPhonics}`,
    `- 待校验自然拼读：${s.pendingPhonics}`,
    `- 自然拼读无法拼回原词：${s.invalidPhonicsJoin}`,
    `- 音块与发音数量不一致：${s.invalidPhonicsAlignment}`,
    "",
    "## 处理策略",
    "",
    "- 前端只展示状态为 ok/verified/reviewed 的音标与自然拼读。",
    "- 其他词统一显示待校验，避免错误内容进入教学流程。",
    "- 教研复核时可直接修改 pronunciation-master.csv 和 phonics-master.csv 的 status 字段。"
  ].join("\n") + "\n";
}

