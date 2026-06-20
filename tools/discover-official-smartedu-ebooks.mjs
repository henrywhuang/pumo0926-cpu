import fs from "node:fs/promises";

const OUTPUT_DIR = "data";
const GENERATED_AT = "2026-06-17";

const TCH_MATERIAL_VERSION_URL =
  "https://s-file-2.ykt.cbern.com.cn/zxx/ndrs/resources/tch_material/version/data_version.json";
const NATIONAL_LESSON_VERSION_URL =
  "https://s-file-1.ykt.cbern.com.cn/zxx/ndrs/national_lesson/teachingmaterials/version/data_version.json";

const juniorEnglishPattern =
  /(初中|七年级|八年级|九年级).*(英语)|(英语).*(七年级|八年级|九年级|初中)/;
const officialTextbookPattern =
  /(人民教育出版社|河北教育出版社|陈琳主编|译林出版社|英语教材|义务教育教科书 英语|义务教育教科书·英语)/;

function titleOf(item) {
  return item.global_title?.["zh-CN"] || item.title || "";
}

function labelsOf(item) {
  return item.global_label?.["zh-CN"] || [];
}

function pageTemplateFromFirstUrl(url) {
  const match = url.match(
    /^(https:\/\/r\d-ndr\.ykt\.cbern\.com\.cn\/edu_product\/esp\/assets\/[^/]+\/zh-CN\/[^/]+\/transcode\/image\/)1\.jpg$/,
  );
  return match ? `${match[1]}{page}.jpg` : null;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

async function pageExists(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.status === 200;
  } catch {
    return false;
  }
}

async function probePageCount(template) {
  const urlFor = (page) => template.replace("{page}", String(page));
  let low = 1;
  let high = 64;

  while (await pageExists(urlFor(high))) {
    low = high;
    high *= 2;
    if (high > 512) break;
  }

  let left = low;
  let right = high;
  while (left + 1 < right) {
    const middle = Math.floor((left + right) / 2);
    if (await pageExists(urlFor(middle))) {
      left = middle;
    } else {
      right = middle;
    }
  }
  return left;
}

async function loadTchMaterialItems() {
  const version = await fetchJson(TCH_MATERIAL_VERSION_URL);
  const urls = String(version.urls)
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  const all = [];
  for (const sourceUrl of urls) {
    const items = await fetchJson(sourceUrl);
    for (const item of items) {
      all.push({ ...item, source_url: sourceUrl });
    }
  }
  return { version, items: all };
}

async function loadNationalLessonItems() {
  const version = await fetchJson(NATIONAL_LESSON_VERSION_URL);
  const urls = Array.isArray(version.urls) ? version.urls : [];
  const all = [];
  for (const sourceUrl of urls) {
    const items = await fetchJson(sourceUrl);
    for (const item of items) {
      all.push({ ...item, source_url: sourceUrl });
    }
  }
  return { version, items: all };
}

function toEbookRecord(item) {
  const preview = item.custom_properties?.preview || {};
  const slideNumbers = Object.keys(preview)
    .map((key) => Number((key.match(/\d+/) || [])[0]))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  return {
    id: item.id,
    title: titleOf(item),
    labels: labelsOf(item),
    resource_type_code: item.resource_type_code,
    resource_type_code_name: item.resource_type_code_name,
    format: item.custom_properties?.format,
    size: item.custom_properties?.size,
    page_count: slideNumbers.length,
    first_page: preview[`Slide${slideNumbers[0]}`] || "",
    last_listed_page: preview[`Slide${slideNumbers.at(-1)}`] || "",
    sample_tail_pages: slideNumbers.slice(-8).map((page) => ({
      page,
      url: preview[`Slide${page}`],
    })),
    source_url: item.source_url,
    create_time: item.create_time,
    update_time: item.update_time,
    online_time: item.online_time,
  };
}

function tagsOf(item) {
  return Object.fromEntries((item.tag_list || []).map((tag) => [tag.tag_dimension_id, tag.tag_name]));
}

function toTeachingMaterialRecord(item) {
  const tags = tagsOf(item);
  return {
    id: item.id,
    title: item.title,
    publisher: tags.zxxbb,
    grade: tags.zxxnj,
    volume: tags.zxxcc,
    subject: tags.zxxxk,
    stage: tags.zxxxd,
    textbook_status: tags.zxxxjjc || "",
    online_time: item.online_time,
    update_time: item.update_time,
    thumbnail: item.custom_properties?.thumbnails?.[0] || "",
    source_url: item.source_url,
  };
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const tch = await loadTchMaterialItems();
  const ebookItems = tch.items
    .filter((item) => juniorEnglishPattern.test(`${titleOf(item)} ${labelsOf(item).join(" ")}`))
    .map(toEbookRecord)
    .sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));

  await fs.writeFile(
    `${OUTPUT_DIR}/official-smartedu-junior-english-ebooks.json`,
    JSON.stringify(
      {
        generated_at: GENERATED_AT,
        source: "国家中小学智慧教育平台 tch_material 静态资源清单",
        version_url: TCH_MATERIAL_VERSION_URL,
        count: ebookItems.length,
        items: ebookItems,
      },
      null,
      2,
    ),
  );

  const enrichedItems = [];
  for (const item of ebookItems.filter((record) =>
    officialTextbookPattern.test(`${record.title} ${(record.labels || []).join(" ")}`),
  )) {
    const template = pageTemplateFromFirstUrl(item.first_page);
    if (!template) continue;
    const fullPageCount = await probePageCount(template);
    enrichedItems.push({
      id: item.id,
      title: item.title,
      labels: item.labels,
      update_time: item.update_time,
      official_first_page: item.first_page,
      official_page_url_template: template,
      json_listed_pages: item.page_count,
      probed_full_page_count: fullPageCount,
      tail_sample_pages: [Math.max(1, fullPageCount - 20), Math.max(1, fullPageCount - 10), fullPageCount].map(
        (page) => ({
          page,
          url: template.replace("{page}", String(page)),
        }),
      ),
    });
  }

  await fs.writeFile(
    `${OUTPUT_DIR}/official-smartedu-junior-english-ebooks.enriched.json`,
    JSON.stringify(
      {
        generated_at: GENERATED_AT,
        count: enrichedItems.length,
        note:
          "由国家中小学智慧教育平台 tch_material 官方图片页 URL 探测完整页数；未包含教材正文全文。",
        items: enrichedItems,
      },
      null,
      2,
    ),
  );

  const nationalLesson = await loadNationalLessonItems();
  const teachingMaterials = nationalLesson.items
    .filter((item) => {
      const tags = tagsOf(item);
      return tags.zxxxk === "英语" && tags.zxxxd === "初中";
    })
    .map(toTeachingMaterialRecord)
    .sort((a, b) =>
      [a.publisher, a.grade, a.volume, a.title]
        .join("|")
        .localeCompare([b.publisher, b.grade, b.volume, b.title].join("|"), "zh-CN"),
    );

  await fs.writeFile(
    `${OUTPUT_DIR}/official-smartedu-junior-english-teachingmaterials.json`,
    JSON.stringify(
      {
        generated_at: GENERATED_AT,
        source: "国家中小学智慧教育平台 national_lesson teachingmaterials 静态资源清单",
        version_url: NATIONAL_LESSON_VERSION_URL,
        count: teachingMaterials.length,
        items: teachingMaterials,
      },
      null,
      2,
    ),
  );

  console.log(`Saved ${ebookItems.length} ebook records`);
  console.log(`Saved ${enrichedItems.length} enriched ebook records`);
  console.log(`Saved ${teachingMaterials.length} teaching material records`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
