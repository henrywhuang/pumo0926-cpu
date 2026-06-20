# 官方授权词库批量导入摘要

日期：2026-06-20

## 导入结果

- 已批量扫描官方电子教材：34 本可稳定映射教材版本/册次的电子书。
- 成功导入词库：29 个教材版本/册次组合。
- 合并词条数：17,311 条。
- 输出 CSV：`data/wordbooks.official-authorized.csv`
- 输出 JSON：`data/wordbooks.real.json`
- 批量报告：`data/wordbooks.official-authorized.batch-report.json`
- 校验报告：`data/wordbooks.real.validation.json`

## 已接入前端

H5 demo 已加载 `data/wordbooks.real.json`。当用户选择已有真实词库的教材版本/册次时，页面优先使用真实导入词库；未导入的书仍回退到原 demo 样例，保证体验不中断。

已验证示例：

- 人教版 八年级上：544 条
- 科普版 八年级上：1,227 条
- 译林版 九年级下：283 条
- 北师大版 九年级全一册：538 条

## 未完成项

以下 5 本已映射教材未被当前 OCR 规则命中书后词表页，需要针对出版社页面标题继续补规则：

- 冀教版 八年级上
- 沪教版 八年级上
- 冀教版 八年级下
- 冀教版 七年级下
- 沪教版 七年级下

另有 31 条官方电子书尚未能从教材清单稳定映射到教材版本/册次，未做伪造导入，保留在 `data/wordbooks.official-authorized.batch-report.json` 的 `skippedBooks` 中。

## 质量说明

本次为自动 OCR 批量导入，已保留 `source_url` 和 `authorization_id` 供回溯。部分版本词条数偏高或偏低，说明不同出版社书后词表版式差异较大，正式上线前仍需要按批量报告做抽检和人工校对。
