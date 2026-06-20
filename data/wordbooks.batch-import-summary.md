# 官方授权词库批量导入摘要

日期：2026-06-20

## 导入结果

- 已批量扫描并映射官方电子教材：47 本。
- 成功导入词库：47 个教材版本/册次组合。
- 未命中词表页册次：0。
- 合并词条数：17,173 条。
- 输出 CSV：`data/wordbooks.official-authorized.csv`
- 输出 JSON：`data/wordbooks.real.json`
- 批量报告：`data/wordbooks.official-authorized.batch-report.json`
- 校验报告：`data/wordbooks.real.validation.json`
- 封面 OCR 补映射报告：`data/official-smartedu-unmapped-cover-ocr.json`

## 工具扩展

- `tools/batch-import-official-vocab-pages.mjs` 已支持官方教材清单映射 + 封面 OCR 补映射。
- 同一教材版本/册次出现重复官方资源时，按普通初中六三学制、2022 课标修订、完整页数和更新时间选择导入源。
- 词表识别已覆盖 `Words and expressions`、`Words and Expressions in Each Unit`、`Wordlist (by unit)`、`Vocabulary (I)`、`Vocabularyin units`、`单词表`、`词汇表` 等版式。
- 已排除正文练习页、Notes 页、Vocabulary A-Z / Vocabulary Index、Vocabulary II、Proper nouns、Irregular Verbs、Pronunciation guide 等非按单元词表内容。
- 对官方图片页返回 403 的情况已改为记录并跳过，不再中断整批导入。

## 覆盖范围

本次导入覆盖 9 个出版社版本、47 个册次组合：

- 人教版：七年级上、七年级下、八年级上、八年级下、九年级全一册。
- 外研版：七年级上、七年级下、八年级上、八年级下、九年级上、九年级下。
- 译林版：七年级上、七年级下、八年级上、八年级下、九年级上、九年级下。
- 北师大版：七年级上、七年级下、八年级上、八年级下、九年级全一册。
- 冀教版：七年级上、七年级下、八年级上、八年级下、九年级全一册。
- 科普版：七年级上、七年级下、八年级上、八年级下、九年级上、九年级下。
- 沪教版：七年级上、七年级下、八年级上、八年级下、九年级上、九年级下。
- 沪外教版：七年级上、七年级下、八年级上、八年级下、九年级上、九年级下。
- 教科版：七年级上、七年级下。

## 已接入前端

H5 demo 已加载 `data/wordbooks.real.json`。当用户选择已有真实词库的教材版本/册次时，页面优先使用真实导入词库；未导入的书仍回退到原 demo 样例，保证体验不中断。

## 质量说明

本次为客户授权官方电子教材书后词表的自动 OCR 批量导入，已保留 `source_url` 和 `authorization_id` 供回溯。已完成异常词量排查，修正前部分册次误导入了正文练习页、Notes 页、Vocabulary A-Z / Vocabulary Index 和专有名词页，修正后单册最高词量为 684 条，800 条以上异常册次为 0。

校验报告显示空书为 0；以下 2 册词量低于 180，建议正式上线前重点人工抽检：

- 外研版 九年级下：123 条
- 译林版 九年级下：123 条

另有 2 条官方电子书因五四学制或无法稳定映射未导入，未做伪造数据。

异常排查详情见：`data/wordbooks.anomaly-audit-2026-06-20.md`。
