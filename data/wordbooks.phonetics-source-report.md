# 原始词表音标来源校验

- 生成时间：2026-06-20T11:15:13.435Z
- 来源：data/wordbooks.official-authorized.csv
- 目标：data/wordbooks.real.json
- 规则：音标只取原始词表 phonetic_uk / phonetic_us 字段；若 OCR 把音标夹在原始 word/part/cn 文本中，则先抽出回填到 CSV 字段，再导入 JSON。
- 总词条：17173
- 已有英式+美式音标：14403
- 未提供音标：2770
- 覆盖率：83.87%

未提供音标的条目主要是短语、栏目标题或原始 OCR 未给出音标的行。
