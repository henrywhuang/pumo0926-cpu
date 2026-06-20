# 官方电子教材与书后词汇表来源确认

日期：2026-06-17

## 结论

已找到国家中小学智慧教育平台的官方电子教材资源接口，并验证到“电子教材后面的词汇表”真实存在于官方转码图片页中。示例验证：

- 教材：`（根据2022年版课程标准修订）义务教育教科书·英语八年级上册`
- 出版社：人民教育出版社
- 官方资源 id：`453025ca-58bd-442e-8543-5ef5222d50c6`
- 官方第 1 页：`https://r2-ndr.ykt.cbern.com.cn/edu_product/esp/assets/453025ca-58bd-442e-8543-5ef5222d50c6.t/zh-CN/1756191701182/transcode/image/1.jpg`
- 官方页 URL 模板：`https://r2-ndr.ykt.cbern.com.cn/edu_product/esp/assets/453025ca-58bd-442e-8543-5ef5222d50c6.t/zh-CN/1756191701182/transcode/image/{page}.jpg`
- 探测完整页数：150 页
- 书后词汇表样本页：第 126 页到第 130 页已人工核验为 `Vocabulary in Each Unit`，包含单词、国际音标、词性、中文释义和课本页码。

客户已于 2026-06-17 在项目任务中回复 `确认授权`。工程侧已记录该授权确认，可进入 OCR + 人工校对 + 结构化导入流程。该确认用于项目工程留痕，不替代正式商业上线所需的法律版权审查或合同附件。

## 已生成文件

- `data/official-smartedu-junior-english-ebooks.json`：官方电子教材候选索引，86 条。
- `data/official-smartedu-junior-english-ebooks.enriched.json`：可探测完整页数的官方教材索引，65 条，包含完整页 URL 模板和页数。
- `data/official-smartedu-junior-english-teachingmaterials.json`：国家同步课教材清单，75 条初中英语教材记录。
- `data/AUTHORIZATION_CONFIRMATION.md`：客户授权确认记录。
- `tools/discover-official-smartedu-ebooks.mjs`：可重复运行的官方来源发现脚本。

## 官方接口

电子教材资源：

- 版本接口：`https://s-file-2.ykt.cbern.com.cn/zxx/ndrs/resources/tch_material/version/data_version.json`
- 分片接口：
  - `https://s-file-2.ykt.cbern.com.cn/zxx/ndrs/resources/tch_material/part_100.json`
  - `https://s-file-2.ykt.cbern.com.cn/zxx/ndrs/resources/tch_material/part_101.json`
  - `https://s-file-2.ykt.cbern.com.cn/zxx/ndrs/resources/tch_material/part_102.json`
  - `https://s-file-1.ykt.cbern.com.cn/zxx/ndrs/resources/tch_material/part_103.json`

教材清单与新旧教材标签：

- 版本接口：`https://s-file-1.ykt.cbern.com.cn/zxx/ndrs/national_lesson/teachingmaterials/version/data_version.json`
- 分片接口：
  - `https://s-file-1.ykt.cbern.com.cn/zxx/ndrs/national_lesson/teachingmaterials/part_100.json`
  - `https://s-file-2.ykt.cbern.com.cn/zxx/ndrs/national_lesson/teachingmaterials/part_101.json`
  - `https://s-file-1.ykt.cbern.com.cn/zxx/ndrs/national_lesson/teachingmaterials/part_102.json`

## 覆盖情况

官方 `national_lesson` 教材清单已筛到 75 条初中英语教材记录，覆盖 8 个版本：

- 人教版
- 外研社版
- 译林版
- 北师大版
- 沪教版
- 沪外教版
- 科普版
- 冀教版

其中七年级上册、七年级下册、八年级上册、八年级下册多版本已出现“新教材”标签；九年级多为未标“新教材”或旧教材结构，需以客户实际采用教材和官方最终发布版本为准。

## 技术判断

1. 官方 JSON 中 `custom_properties.preview` 通常只展开前 49 页，但完整教材页可通过同一官方转码路径继续按页码访问。
2. 示例八上人教版 JSON 只列出 49 页，但实际可访问到第 150 页。
3. 词汇表页可以通过尾页区间定位，例如八上人教版第 126 页开始已进入书后 `Vocabulary in Each Unit`。
4. 本机 tesseract 目前只能列出 `eng/osd/snum` 语言包，且在当前环境里对这些官方页图输出为空；后续建议使用带中文语言包的 OCR 或人工校对流程。

## 下一步导入方案

1. 按客户最终确认的教材版本、册次确定导入范围。
2. 按 `official_page_url_template` 下载每册尾页词汇表区间。
3. OCR 提取字段：`publisher, grade, volume, unit, word, phonetic_uk, phonetic_us, part_of_speech, meaning, source_page`。
4. 人工校验音标、词性、释义和 Unit 归属。
5. 按 `data/WORDLIST_IMPORT_SPEC.md` 导入并运行 `tools/validate-wordbooks.mjs` 校验。
