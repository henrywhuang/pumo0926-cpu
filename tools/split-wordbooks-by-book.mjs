#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const INPUT = path.join(ROOT, "data", "wordbooks.real.json");
const BOOK_DIR = path.join(ROOT, "data", "books");
const INDEX_FILE = path.join(ROOT, "data", "books-index.json");

const data = JSON.parse(fs.readFileSync(INPUT, "utf8"));
fs.mkdirSync(BOOK_DIR, { recursive: true });

const index = {
  generatedAt: new Date().toISOString(),
  sourceFile: "data/wordbooks.real.json",
  schema: "wordbooks-index.v1",
  totalBooks: 0,
  totalWords: 0,
  books: []
};

let serial = 1;
for (const publisher of data.publishers || []) {
  for (const grade of publisher.grades || []) {
    const wordCount = (grade.units || []).reduce((sum, unit) => sum + (unit.words || []).length, 0);
    if (!wordCount) continue;
    const filename = `book-${String(serial).padStart(3, "0")}.json`;
    const output = {
      generatedAt: index.generatedAt,
      sourceFile: INDEX_FILE,
      schema: "wordbook-book.v1",
      publishers: [{
        name: publisher.name,
        grades: [grade]
      }]
    };
    fs.writeFileSync(path.join(BOOK_DIR, filename), `${JSON.stringify(output, null, 2)}\n`);
    index.books.push({
      id: `${publisher.name}-${grade.name}`,
      publisher: publisher.name,
      grade: grade.name,
      unitCount: (grade.units || []).length,
      wordCount,
      path: `data/books/${filename}`
    });
    index.totalBooks += 1;
    index.totalWords += wordCount;
    serial += 1;
  }
}

fs.writeFileSync(INDEX_FILE, `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify({
  books: index.totalBooks,
  words: index.totalWords,
  index: path.relative(ROOT, INDEX_FILE),
  dir: path.relative(ROOT, BOOK_DIR)
}, null, 2));
