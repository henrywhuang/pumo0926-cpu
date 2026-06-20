import fs from "node:fs";

const [input = "data/wordbooks.current-demo.json"] = process.argv.slice(2);

const REQUIRED_SOURCE = "客户授权官方电子教材书后词汇表";
const REQUIRED_AUTHORIZATION_ID = "AUTHORIZATION_CONFIRMATION_2026-06-17";

const data = JSON.parse(fs.readFileSync(input, "utf8"));
const report = {
  input,
  checkedAt: new Date().toISOString(),
  summary: {
    publisherCount: data.publishers?.length || 0,
    bookCount: 0,
    wordCount: 0,
    emptyBooks: [],
    lowWordCountBooks: [],
    duplicateWords: [],
    incompleteSourceBooks: [],
    notCustomerLatestBooks: []
  },
  books: []
};

for (const publisher of data.publishers || []) {
  for (const grade of publisher.grades || []) {
    const publisherName = publisher.name;
    const gradeName = grade.name;
    const words = grade.units.flatMap((unit) => unit.words.map((word) => ({ ...word, unit: unit.name })));
    const duplicateWords = duplicates(words.map((item) => item.word.toLowerCase()));
    const nonBookSource = words.filter((item) => item.source !== "书后单词表" && item.source !== REQUIRED_SOURCE).length;
    const notCustomerLatest = words.filter((item) => (
      item.source !== REQUIRED_SOURCE ||
      !item.textbookVersion ||
      !item.customerWordlistId ||
      !item.sourceUrl ||
      item.authorizationId !== REQUIRED_AUTHORIZATION_ID
    )).length;
    const book = {
      publisher: publisherName,
      grade: gradeName,
      unitCount: grade.units.length,
      wordCount: words.length,
      duplicateWords,
      nonBookSource,
      notCustomerLatest,
      completeBySource: words.length > 0 && nonBookSource === 0,
      confirmedCustomerLatest: words.length > 0 && notCustomerLatest === 0
    };
    report.books.push(book);
    report.summary.bookCount += 1;
    report.summary.wordCount += words.length;
    if (!words.length) report.summary.emptyBooks.push(`${publisherName} ${gradeName}`);
    if (words.length > 0 && words.length < 200) report.summary.lowWordCountBooks.push(`${publisherName} ${gradeName}`);
    if (duplicateWords.length) {
      report.summary.duplicateWords.push({ book: `${publisherName} ${gradeName}`, words: duplicateWords });
    }
    if (!book.completeBySource) {
      report.summary.incompleteSourceBooks.push(`${publisherName} ${gradeName}`);
    }
    if (!book.confirmedCustomerLatest) {
      report.summary.notCustomerLatestBooks.push(`${publisherName} ${gradeName}`);
    }
  }
}

console.log(JSON.stringify(report, null, 2));

function duplicates(items) {
  const seen = new Set();
  const dup = new Set();
  for (const item of items) {
    if (seen.has(item)) dup.add(item);
    seen.add(item);
  }
  return [...dup];
}
