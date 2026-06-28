#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { alphaKey, readJson, walkWords, writeCsv, writeJson } from "./pronunciation-utils.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const INPUT = path.join(ROOT, "data", "wordbooks.real.json");
const JSON_OUT = path.join(ROOT, "data", "phonics-master.json");
const CSV_OUT = path.join(ROOT, "data", "phonics-master.csv");

const data = readJson(INPUT);

const GRAPHEMES = [
  ["eigh", "/eɪ/"], ["ough", "待复核"], ["augh", "待复核"],
  ["tch", "/tʃ/"], ["dge", "/dʒ/"], ["igh", "/aɪ/"],
  ["air", "/eə/"], ["ear", "待复核"], ["eer", "/ɪə/"], ["are", "/eə/"],
  ["ai", "/eɪ/"], ["ay", "/eɪ/"], ["ee", "/iː/"], ["ea", "待复核"],
  ["oa", "/əʊ/"], ["ow", "待复核"], ["ou", "待复核"], ["oo", "待复核"],
  ["oi", "/ɔɪ/"], ["oy", "/ɔɪ/"], ["ar", "/ɑː/"], ["or", "/ɔː/"],
  ["er", "/ə/"], ["ir", "/ɜː/"], ["ur", "/ɜː/"],
  ["ch", "/tʃ/"], ["sh", "/ʃ/"], ["th", "待复核"], ["ph", "/f/"],
  ["wh", "/w/"], ["ck", "/k/"], ["ng", "/ŋ/"], ["qu", "/kw/"],
  ["kn", "/n/"], ["wr", "/r/"], ["gn", "/n/"]
];

const LETTER_SOUNDS = {
  a: "待复核", b: "/b/", c: "待复核", d: "/d/", e: "待复核", f: "/f/",
  g: "待复核", h: "/h/", i: "待复核", j: "/dʒ/", k: "/k/", l: "/l/",
  m: "/m/", n: "/n/", o: "待复核", p: "/p/", q: "/kw/", r: "/r/",
  s: "待复核", t: "/t/", u: "待复核", v: "/v/", w: "/w/", x: "/ks/",
  y: "待复核", z: "/z/"
};

const unique = new Map();
for (const { item } of walkWords(data)) {
  const key = alphaKey(item.word);
  if (key && !unique.has(key)) unique.set(key, item.word);
}

const rows = [...unique.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, word]) => buildEntry(word, key));

writeJson(JSON_OUT, {
  generatedAt: new Date().toISOString(),
  sourceFile: "data/wordbooks.real.json",
  schema: "phonics-master.v1",
  note: "自然拼读候选主表。status 非 ok/verified/reviewed 时，前端不会展示为正式拼读拆分。",
  words: rows
});

const header = ["word", "normalized_word", "chunks", "phonics", "rule_tags", "status", "confidence", "review_note"];
writeCsv(CSV_OUT, header, rows.map((entry) => header.map((name) => (
  Array.isArray(entry[name]) ? entry[name].join("|") : entry[name]
))));

const summary = {
  totalUniqueWords: rows.length,
  candidate: rows.filter((row) => row.status === "candidate").length,
  needsReview: rows.filter((row) => row.status === "needs_review").length,
  phraseOrNonAlpha: rows.filter((row) => row.status === "phrase_or_non_alpha").length
};

writeJson(path.join(ROOT, "data", "phonics-master-report.json"), summary);
await import("node:fs").then(({ default: fs }) => fs.writeFileSync(path.join(ROOT, "data", "phonics-master-report.md"), [
  "# 自然拼读候选主表生成报告",
  "",
  `- 生成时间：${new Date().toISOString()}`,
  `- 唯一单词数：${summary.totalUniqueWords}`,
  `- 已生成候选拆分：${summary.candidate}`,
  `- 待复核：${summary.needsReview}`,
  `- 词组或非纯字母：${summary.phraseOrNonAlpha}`,
  "",
  "说明：本脚本生成的是候选拆分，不会自动标记为已审核。只有人工把 status 改成 ok/verified/reviewed 后，前端才会展示自然拼读块。"
].join("\n") + "\n"));

console.log(JSON.stringify(summary, null, 2));

function buildEntry(word, key) {
  if (!/^[a-z]+$/.test(key)) {
    return {
      word,
      normalized_word: key,
      chunks: [word],
      phonics: [],
      rule_tags: [],
      status: "phrase_or_non_alpha",
      confidence: "low",
      review_note: "词组或非纯字母，需人工拆分"
    };
  }
  const parsed = parseGraphemes(key);
  const uncertain = parsed.phonics.some((sound) => sound === "待复核");
  return {
    word,
    normalized_word: key,
    chunks: parsed.chunks,
    phonics: parsed.phonics,
    rule_tags: parsed.tags,
    status: uncertain ? "needs_review" : "candidate",
    confidence: uncertain ? "low" : "medium",
    review_note: uncertain ? "含多音字母或多音字母组合，需教研确认" : "规则候选，需抽检后改为 reviewed"
  };
}

function parseGraphemes(word) {
  const chunks = [];
  const phonics = [];
  const tags = [];
  for (let i = 0; i < word.length;) {
    if (i === word.length - 1 && word[i] === "e" && chunks.length) {
      chunks.push("e");
      phonics.push("silent");
      tags.push("silent-e");
      i += 1;
      continue;
    }
    const hit = GRAPHEMES.find(([letters]) => word.startsWith(letters, i));
    if (hit) {
      chunks.push(hit[0]);
      phonics.push(hit[1]);
      tags.push(`grapheme:${hit[0]}`);
      i += hit[0].length;
      continue;
    }
    const letter = word[i];
    chunks.push(letter);
    phonics.push(LETTER_SOUNDS[letter] || "待复核");
    tags.push(`letter:${letter}`);
    i += 1;
  }
  return { chunks, phonics, tags };
}

