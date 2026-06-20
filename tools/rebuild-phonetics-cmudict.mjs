#!/usr/bin/env node
// 用 CMUdict（卡内基梅隆发音词典）重建音标，确保发音音标正确。
// US = 通用美音（保留 r），UK = 英音（非儿化：丢失音节尾 r、oʊ→əʊ）。
// 未在词典中的词（专有名词/生僻词/词组）保留原有音标。
// 同步更新 data/wordbooks.real.json（运行时）与 data/wordbooks.official-authorized.csv（同源）。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const JSON_FILE = path.join(ROOT, "data", "wordbooks.real.json");
const CSV_FILE = path.join(ROOT, "data", "wordbooks.official-authorized.csv");
const CMU_URL = "https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict";
const CMU_CACHE = path.join(os.tmpdir(), "cmudict.dict");

const ARPA = { AA: "ɑː", AE: "æ", AO: "ɔː", AW: "aʊ", AY: "aɪ", B: "b", CH: "tʃ", D: "d", DH: "ð", EH: "e", EY: "eɪ", F: "f", G: "ɡ", HH: "h", IH: "ɪ", JH: "dʒ", K: "k", L: "l", M: "m", N: "n", NG: "ŋ", OW: "oʊ", OY: "ɔɪ", P: "p", R: "r", S: "s", SH: "ʃ", T: "t", TH: "θ", UH: "ʊ", UW: "uː", V: "v", W: "w", Y: "j", Z: "z", ZH: "ʒ" };
const VOWELS = new Set(["AA", "AE", "AH", "AO", "AW", "AY", "EH", "ER", "EY", "IH", "IY", "OW", "OY", "UH", "UW"]);
const ONSETS = new Set(["b", "d", "f", "ɡ", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "z", "tʃ", "dʒ", "θ", "ð", "ʃ", "ʒ", "bl", "br", "kl", "kr", "dr", "fl", "fr", "ɡl", "ɡr", "pl", "pr", "sk", "sl", "sm", "sn", "sp", "st", "sw", "tr", "tw", "θr", "ʃr", "skr", "spl", "spr", "str", "skw", "kw", "sf", "pj", "bj", "kj", "fj", "mj", "vj", "hj"]);

function sym(p) {
  const base = p.replace(/\d$/, "");
  const stress = (p.match(/(\d)$/) || [])[1];
  if (base === "AH") return [stress && stress !== "0" ? "ʌ" : "ə", stress];
  if (base === "IY") return [stress === "0" ? "i" : "iː", stress];
  if (base === "ER") return [stress && stress !== "0" ? "ɜːr" : "ər", stress];
  return [ARPA[base] ?? base.toLowerCase(), stress];
}

function toIPA(arpa, rhotic) {
  const seq = arpa.map(sym);
  const isVowel = arpa.map((p) => VOWELS.has(p.replace(/\d$/, "")));
  const marks = {};
  for (let i = 0; i < seq.length; i++) {
    const [, stress] = seq[i];
    if (isVowel[i] && stress && stress !== "0") {
      let j = i - 1;
      let onset = "";
      while (j >= 0 && !isVowel[j]) {
        const cand = seq[j][0] + onset;
        if (ONSETS.has(cand)) { onset = cand; j--; } else break;
      }
      marks[j + 1] = stress === "1" ? "ˈ" : "ˌ";
    }
  }
  let res = "";
  for (let i = 0; i < seq.length; i++) {
    if (marks[i]) res += marks[i];
    let ipa = seq[i][0];
    if (!rhotic) {
      if (ipa === "ər") ipa = "ə";
      else if (ipa === "ɜːr") ipa = "ɜː";
      else if (ipa === "oʊ") ipa = "əʊ";
      else if (ipa === "r" && !(i + 1 < seq.length && isVowel[i + 1])) ipa = "";
    }
    res += ipa;
  }
  return `/${res}/`;
}

async function loadCmudict() {
  let text;
  if (fs.existsSync(CMU_CACHE)) {
    text = fs.readFileSync(CMU_CACHE, "utf8");
  } else {
    text = await (await fetch(CMU_URL)).text();
    fs.writeFileSync(CMU_CACHE, text);
  }
  const dict = new Map();
  for (const line of text.split("\n")) {
    if (!line || line.startsWith(";;;")) continue;
    const sp = line.indexOf(" ");
    if (sp < 0) continue;
    const w = line.slice(0, sp);
    if (/\(\d\)$/.test(w)) continue; // 只取首选发音
    dict.set(w.toLowerCase(), line.slice(sp + 1).split("#")[0].trim().split(/\s+/));
  }
  return dict;
}

function ipaFor(dict, word) {
  const w = (word || "").trim();
  if (!/^[A-Za-z][A-Za-z'-]*$/.test(w)) return null;
  const arpa = dict.get(w.toLowerCase()) || dict.get(w.toLowerCase().replace(/[''-]/g, ""));
  if (!arpa) return null;
  return { uk: toIPA(arpa, false), us: toIPA(arpa, true) };
}

// ---- CSV 引号感知解析/重写 ----
function parseCsv(text) {
  const records = []; let field = ""; let record = []; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === ",") { record.push(field); field = ""; }
    else if (c === "\n") { record.push(field); records.push(record); record = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length || record.length) { record.push(field); records.push(record); }
  return records;
}
const csvCell = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

async function main() {
  const dict = await loadCmudict();
  const data = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
  let total = 0; let fixed = 0; const samples = [];
  for (const p of data.publishers || []) {
    for (const g of p.grades || []) {
      for (const u of g.units || []) {
        for (const it of u.words || []) {
          total++;
          const ipa = ipaFor(dict, it.word);
          if (!ipa) continue;
          it.phonetic = it.phonetic || {};
          it.phonetic.uk = ipa.uk;
          it.phonetic.us = ipa.us;
          fixed++;
          if (samples.length < 12) samples.push(`${it.word}  UK ${ipa.uk}  US ${ipa.us}`);
        }
      }
    }
  }
  fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2) + "\n");
  console.log(`JSON: 总 ${total}，已修音标 ${fixed}（${(fixed / total * 100).toFixed(1)}%）`);
  console.log(samples.join("\n"));

  if (fs.existsSync(CSV_FILE)) {
    const recs = parseCsv(fs.readFileSync(CSV_FILE, "utf8"));
    const h = recs[0];
    const wi = h.indexOf("word"); const uki = h.indexOf("phonetic_uk"); const usi = h.indexOf("phonetic_us");
    let cfix = 0;
    for (let i = 1; i < recs.length; i++) {
      const r = recs[i];
      if (r.length === 1 && r[0] === "") continue;
      const ipa = ipaFor(dict, r[wi]);
      if (!ipa) continue;
      r[uki] = ipa.uk; r[usi] = ipa.us; cfix++;
    }
    const out = recs.filter((r) => !(r.length === 1 && r[0] === "")).map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
    fs.writeFileSync(CSV_FILE, out);
    console.log(`CSV: 已修音标 ${cfix}`);
  }
}

main();
