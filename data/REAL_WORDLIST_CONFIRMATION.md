# 真实词库来源确认

确认时间：2026-06-17

## 结论

当前项目 **不能确认** 真实词库已经按“最新教材版本的客户单词表”导入。

## 依据

已运行：

```bash
node tools/validate-wordbooks.mjs data/wordbooks.current-demo.json > data/wordbooks.coverage-report.json
```

校验结果：

- 缺失册次：18 个
- 来源不完整册次：36 个
- 未确认来自客户最新教材单词表册次：36 个

当前 `data/wordbooks.current-demo.json` 中词汇来源为：

```text
demo_sample
```

不是：

```text
客户最新教材单词表
```

## 后续导入要求

真实导入文件必须按 `data/wordbooks.template.csv` 提供，并满足：

- `source` = `客户最新教材单词表`
- `textbook_version` 非空，例如 `2026版`
- `customer_wordlist_id` 非空，例如客户提供的文件名、批次号或交付编号
- 覆盖所有目标教材版本、所有年级册次、所有 Unit

导入后重新运行：

```bash
node tools/import-wordbooks.mjs data/客户最新教材词表.csv data/wordbooks.real.json
node tools/validate-wordbooks.mjs data/wordbooks.real.json > data/wordbooks.coverage-report.json
```

只有当 `wordbooks.coverage-report.json` 中：

```json
"missingBooks": [],
"incompleteSourceBooks": [],
"notCustomerLatestBooks": []
```

才可以确认真实词库已按最新教材版本的客户单词表导入。
