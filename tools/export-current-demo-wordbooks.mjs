import fs from "node:fs";

const src = fs.readFileSync("app.js", "utf8");
const publishers = evaluateArray("publishers");
const grades = evaluateArray("grades");
const wordMatches = [...src.matchAll(/w\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]*)",\s*"([^"]*)",\s*(\[[^\]]*\]),\s*(\[[^\]]*\]),\s*"([^"]*)",\s*"([^"]*)"\)/g)];
const words = wordMatches.map((match) => ({
  word: match[1],
  cn: match[2],
  part: match[3],
  grade: match[4],
  unit: match[5],
  uk: match[6],
  us: match[7],
  chunks: Function(`return ${match[8]}`)(),
  phonics: Function(`return ${match[9]}`)(),
  example: match[10],
  exampleCn: match[11]
}));

const data = {
  generatedAt: new Date().toISOString(),
  sourceFile: "app.js",
  schema: "wordbooks.v1",
  note: "This is the current interactive demo vocabulary, not a complete textbook back-matter word list.",
  publishers: publishers.map((publisher) => ({
    name: publisher,
    grades: grades.map((grade) => ({
      name: grade,
      units: groupUnits(words.filter((word) => word.grade === grade))
    }))
  }))
};

fs.writeFileSync("data/wordbooks.current-demo.json", `${JSON.stringify(data, null, 2)}\n`);
console.log(`Exported ${words.length} demo words -> data/wordbooks.current-demo.json`);

function evaluateArray(name) {
  const match = src.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`));
  if (!match) throw new Error(`Cannot find ${name}`);
  return Function(`return ${match[1]}`)();
}

function groupUnits(items) {
  const map = new Map();
  for (const item of items) {
    if (!map.has(item.unit)) {
      map.set(item.unit, { name: item.unit, words: [] });
    }
    map.get(item.unit).words.push({
      word: item.word,
      phonetic: { uk: item.uk, us: item.us },
      part: item.part,
      cn: item.cn,
      chunks: item.chunks,
      phonics: item.phonics,
      example: item.example,
      exampleCn: item.exampleCn,
      source: "demo_sample"
    });
  }
  return [...map.values()];
}
