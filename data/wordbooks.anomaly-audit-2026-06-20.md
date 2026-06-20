# 词库词量异常排查报告

日期：2026-06-20

## 结论

已确认此前存在异常导入：部分教材的正文练习页、Notes 页、Vocabulary A-Z / Vocabulary Index 按字母总表、Proper nouns 专有名词页被一并导入，导致个别册次词量异常放大到 1000+。

本次已修正批量导入规则并重新生成词库。

## 修复后结果

- 导入册次：47 个。
- 空词表册次：0。
- 总词条数：17,173 条。
- 单册最高词量：684 条。
- 单册最低词量：123 条。
- 800 条以上异常册次：0。

## 已修复的异常来源

- 排除正文 `Vocabulary in Use`、`Vocabulary practice`、`Building your vocabulary`。
- 排除正文句子里的 `words and expressions in the box/from the passage` 误命中。
- 只在页首识别 `Wordlist`、`单词表`、`词汇表` 等标题。
- 截断 `Vocabulary A-Z`、`Vocabulary Index`、`Vocabulary from Primary School`。
- 截断 `Wordlist (in alphabetical order)`。
- 截断 `Vocabulary II / Vocalbulary II`，避免导入按字母重复表。
- 截断 `Proper nouns`、`Names of People/Places`、`Irregular Verbs`、`Pronunciation guide`。

## 修复前后典型变化

- 人教版 八年级上：1274 -> 544。
- 人教版 八年级下：1100 -> 601。
- 冀教版 九年级全一册：1035 -> 446。
- 科普版 八年级上：1227 -> 529。
- 译林版 八年级上：923 -> 356。

## 仍建议人工抽检

以下册次词量低于 180，可能确为下册词量较少，也可能是该版式 OCR 仍有漏页，建议后续按官方 PDF 页面人工抽检：

- 外研版 九年级下：123 条。
- 译林版 九年级下：123 条。

## 输出文件

- 词库：`data/wordbooks.real.json`
- CSV：`data/wordbooks.official-authorized.csv`
- 批量报告：`data/wordbooks.official-authorized.batch-report.json`
- 机器审计 JSON：`data/wordbooks.anomaly-audit-2026-06-20.json`
- 校验报告：`data/wordbooks.real.validation.json`
