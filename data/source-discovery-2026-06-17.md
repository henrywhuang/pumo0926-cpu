# 最新教材词表公开来源发现记录

日期：2026-06-17

## 结论

未找到可直接确认并导入的“客户最新教材版本完整单词表 Excel”。

公开网络中可以找到一些教材资源入口和第三方词表页面，但它们存在以下问题：

- 多数不是客户提供的正式词表文件；
- 多数不能确认覆盖所有教材版本、所有年级册次、所有 Unit；
- 部分来源是第三方整理，版本年份、完整性、授权均不能确认；
- 官方平台更适合核验教材版本，不直接提供结构化词表 Excel。

因此，本轮没有把第三方词表导入为真实词库，避免把不完整或未经确认的数据误标为“客户最新教材单词表”。

## 已发现来源

详见：

`data/source-discovery-2026-06-17.csv`

重点来源：

- 国家中小学智慧教育平台电子教材：`https://basic.smartedu.cn/elecEdu`
- 人民教育出版社七年级上册资源页：`https://www.pep.com.cn/zslth/yyptzy/czyy/7s/`
- 腾讯文库新人教七上 2024 秋单词表：`https://wenku.docs.qq.com/detail?docId=GXyrta18H1&docType=0`
- 新东方在线外研社七上词汇表：`https://www.koolearn.com/dict/tag_1612_1.html`
- 新东方在线译林牛津七上词汇表：`https://www.koolearn.com/dict/tag_1468_1.html`

## 正式导入标准

只有满足以下条件的数据，才能标记为真实词库：

- 客户提供，或有明确授权；
- 明确教材版本、年份、册次；
- 按 `教材版本 -> 年级册次 -> Unit -> 词汇` 组织；
- 每条词汇带来源批次：`customer_wordlist_id`；
- 通过 `tools/validate-wordbooks.mjs` 校验，且：

```json
"missingBooks": [],
"incompleteSourceBooks": [],
"notCustomerLatestBooks": []
```

## 下一步

需要客户提供最新教材词表 Excel/CSV，或确认允许使用某个公开来源作为正式词库来源。

## 2026-06-17 追加搜索

继续搜索了 `filetype:xlsx/xls/csv + 初中英语 + 单词表 + 人教版/外研版/七年级上册/2024` 等组合。

结果：

- 未找到覆盖全教材版本、全册次的官方或客户 Excel；
- 搜索结果中的 `.xls/.xlsx` 大多是教育局获奖名单、论文列表、报刊订购表等无关文件；
- 个别第三方页面只覆盖单册或单版本，仍不能确认是客户最新教材单词表；
- 不执行导入，避免把无关或非授权来源写入真实词库。
