import fs from "node:fs";

const [input = "data/wordbooks.current-demo.json"] = process.argv.slice(2);

const EXPECTED_PUBLISHERS = ["人教版", "外研版", "译林版", "沪教牛津版", "北师大版", "仁爱版", "冀教版", "鲁教版", "教科版"];
const EXPECTED_GRADES = ["七年级上", "七年级下", "八年级上", "八年级下", "九年级上", "九年级下"];
const REQUIRED_SOURCE = "客户授权官方电子教材书后词汇表";
const REQUIRED_AUTHORIZATION_ID = "AUTHORIZATION_CONFIRMATION_2026-06-17";

const data = JSON.parse(fs.readFileSync(input, "utf8"));
const report = {
  input,
  checkedAt: new Date().toISOString(),
  expectedPublishers: EXPECTED_PUBLISHERS,
  expectedGrades: EXPECTED_GRADES,
  summary: {
    publisherCount: data.publishers?.length || 0,
    bookCount: 0,
    wordCount: 0,
    missingBooks: [],
    emptyBooks: [],
    duplicateWords: [],
    incompleteSourceBooks: [],
    notCustomerLatestBooks: []
  },
  books: []
};

const publisherMap = new Map((data.publishers || []).map((publisher) => [publisher.name, publisher]));

for (const publisherName of EXPECTED_PUBLISHERS) {
  const publisher = publisherMap.get(publisherName);
  for (const gradeName of EXPECTED_GRADES) {
    const grade = publisher?.grades?.find((item) => item.name === gradeName);
    if (!grade) {
      report.summary.missingBooks.push(`${publisherName} ${gradeName}`);
      continue;
    }
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
