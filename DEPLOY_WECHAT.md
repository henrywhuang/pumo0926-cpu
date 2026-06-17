# 微信公众号/小程序部署说明

当前目录保留 H5 Demo，新增的微信小程序工程在 `wechat-miniprogram/`。

## 目标形态

- 用户从公众号菜单或小程序入口进入。
- 首次进入自动微信登录，同时在 `users` 集合注册用户。
- 用户选择词书、导入词表、做计划、开始学习。
- 学习行为通过 `trackEvent` 云函数写入 `events` 和 `daily_active`。
- 学习进度通过 `syncProgress` 云函数写入 `progress`。
- 运营端可在小程序“数据”页查看近 7 日活跃、今日事件数、完成单词数和事件分布。

## 需要准备

1. 微信公众平台账号，并开通小程序。
2. 小程序 AppID。
3. 微信开发者工具。
4. 云开发环境 ID。
5. 公众号后台把小程序绑定到公众号，用菜单或图文跳转小程序。

## 工程配置

1. 用微信开发者工具导入 `wechat-miniprogram/`。
2. 修改 `wechat-miniprogram/project.config.json`：
   - 把 `appid` 替换为真实小程序 AppID。
3. 修改 `wechat-miniprogram/app.js`：
   - 把 `globalData.envId` 替换为真实云开发环境 ID。
4. 在开发者工具中开通云开发。
5. 上传并部署云函数：
   - `login`
   - `trackEvent`
   - `syncProgress`
   - `getDashboard`

## 数据集合

在云开发数据库中创建这些集合：

- `users`
  - 用户注册和登录信息。
  - 字段：`openid`、`unionid`、`registeredAt`、`lastLoginAt`、`loginCount`、`profile`、`status`
- `events`
  - 用户行为事件。
  - 字段：`openid`、`type`、`payload`、`day`、`createdAt`
- `daily_active`
  - 日活统计去重。
  - 字段：`openid`、`day`、`firstActiveAt`、`lastActiveAt`、`eventCount`
- `progress`
  - 单词学习进度。
  - 字段：`openid`、`wordId`、`record`、`createdAt`、`updatedAt`

建议权限：

- `users`、`events`、`daily_active`、`progress` 禁止小程序端直接写入。
- 所有写入通过云函数完成。
- `getDashboard` 后续应增加管理员校验，避免普通用户查看全量运营数据。

## 登录注册

小程序启动后执行：

1. `wx.cloud.init`
2. 调用 `login` 云函数
3. 云函数通过 `cloud.getWXContext()` 获取 `OPENID`
4. 查询 `users` 集合
5. 不存在则创建用户，存在则更新 `lastLoginAt` 和 `loginCount`

这里采用微信小程序的静默登录，不要求用户填写手机号。后续如果需要手机号注册，需要接入微信手机号授权能力，并增加用户授权说明。

## 活跃度统计

当前已埋点这些事件：

- `page_view`
- `select_book`
- `import_book`
- `save_plan`
- `start_study`
- `study_page_view`
- `play_audio`
- `step_done`
- `word_complete`

`trackEvent` 会同时写：

- 原始事件：`events`
- 日活去重表：`daily_active`

`dashboard` 页调用 `getDashboard`，展示：

- 近 7 日活跃用户
- 今日事件数
- 完成单词数
- 事件分布

## 公众号接入

在公众号后台：

1. 绑定同主体小程序。
2. 新建菜单。
3. 菜单类型选择“跳转小程序”。
4. 填入小程序 AppID。
5. 页面路径可填：
   - `pages/home/home`

## 发布流程

1. 微信开发者工具本地预览。
2. 真机调试登录、学习、数据上报。
3. 上传体验版。
4. 在微信公众平台提交审核。
5. 审核通过后发布。

## 后续建议

- 把 H5 里的完整词库同步到小程序 `vocab` 数据，或放到云数据库 `wordbooks`、`words` 集合。
- 增加家长端/运营端权限，限制数据页访问。
- 增加留存、完课率、七步漏斗、单词错误率等指标。
- 小程序审核前补齐隐私政策、用户协议、儿童个人信息保护说明。
