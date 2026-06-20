# 真实教材词库导入规范

目标结构：

`教材版本 -> 年级册次 -> Unit -> 书后单词表词汇`

## 覆盖范围

当前按“完整初中”校验这些年级册次：

- 七年级上
- 七年级下
- 八年级上
- 八年级下
- 九年级上
- 九年级下

当前按 Demo 中已列出的教材版本校验：

- 人教版
- 外研版
- 译林版
- 沪教牛津版
- 北师大版
- 仁爱版
- 冀教版
- 鲁教版
- 教科版

## CSV 字段

参考 `data/wordbooks.template.csv`。

- `publisher`：教材版本，例如 `人教版`
- `grade`：年级册次，例如 `七年级上`
- `unit`：单元，例如 `Unit 1`、`Starter`
- `word`：英文词汇
- `phonetic_uk`：英式 IPA
- `phonetic_us`：美式 IPA
- `part`：词性
- `cn`：中文释义
- `chunks`：词块，用 `|` 分隔，例如 `wel|come`
- `phonics`：音素，用 `|` 分隔
- `example`：英文例句
- `example_cn`：中文例句
- `source`：来源，建议写 `书后单词表`，并在文件名或备注中保留教材版本/年份
- `textbook_version`：教材版本年份或版次，例如 `2026版`
- `customer_wordlist_id`：客户提供词表批次 ID、文件名或交付编号
- `source_url`：官方电子教材页或客户提供源文件路径
- `authorization_id`：授权确认记录，当前可填 `AUTHORIZATION_CONFIRMATION_2026-06-17`

## 导入命令

```bash
node tools/import-wordbooks.mjs data/真实词表.csv data/wordbooks.real.json
node tools/validate-wordbooks.mjs data/wordbooks.real.json
```

## 重要说明

客户已在 2026-06-17 项目任务中回复 `确认授权`，工程侧已记录在 `data/AUTHORIZATION_CONFIRMATION.md`。
如果需要确认“真实词库来自客户授权的最新教材版本单词表”，导入 CSV 中必须满足：

- `source` 填写 `客户授权官方电子教材书后词汇表`
- `textbook_version` 非空
- `customer_wordlist_id` 非空
- `source_url` 非空
- `authorization_id` 填写 `AUTHORIZATION_CONFIRMATION_2026-06-17`
- 校验器中 `notCustomerLatestBooks` 为空
拿到各版本教材书后词表后，按 CSV 模板整理并运行导入器即可生成标准 JSON。
