# 常用工具（xwy-commontool）

面向日常生活的 **Uni-app + Vue 2** 多端小程序/H5 工具集。数据默认保存在本地（`uni.setStorageSync`），无需登录即可使用核心功能。

## 产品简介

「常用工具」聚合合租分摊、纪念日/倒数日、愿望清单、娱乐账本等轻量场景，首页汇总「近期重要日子」与快捷入口，底部 Tab 覆盖 **首页 / 工具 / 愿望 / 我的**。

整体 UI 遵循项目内 **AI Native Design System**（`src/style/design-tokens.css`），统一主色、圆角、间距与卡片风格。

---

## 功能模块

### 首页

- 快捷工具横向入口（合租计算器、纪念日、倒数日、愿望推荐、愿望清单）
- **近期重要日子**：合并展示纪念日与倒数日，点击进入详情
- 愿望横幅跳转「愿望推荐」
- **娱乐记账本**入口：德扑账本、麻将账本、跑胡子账本

### 生活工具

| 工具 | 说明 |
|------|------|
| **合租计算器** | 按人数、按比例、按面积三种模式分摊金额，支持备注 |
| **日期计算器** | 计算两日期间隔（天/年/月/日分解）；按天/周/月/月推算目标日期 |
| **BMI 计算器** | 输入身高体重计算 BMI，展示健康区间与说明 |
| **随机数** | 自定义范围生成随机整数，保留历史记录 |
| **单位换算** | 长度、重量、面积、体积、温度等常用单位互转 |
| **纪念日** | 记录重要日期；支持每年重复（如生日）；可选具体时分秒；详情页展示正计时/倒计时及年/月/周/天/时/分/秒分解 |
| **倒数日** | 面向未来事件的天数倒计时；支持每年重复；列表与详情页 |

### 愿望

| 页面 | 说明 |
|------|------|
| **愿望推荐** | 内置约 100 条人生目标灵感，支持分类筛选与搜索，一键加入愿望清单 |
| **愿望清单** | 本地管理已收藏愿望，支持增删 |

### 娱乐记账本

| 账本 | 说明 |
|------|------|
| **德扑账本** | 记一局盈亏；统计总盈亏、场次、胜率；按周/月/年查看 |
| **麻将账本** | 同上结构，独立本地存储 |

> 工具页还提供分类侧栏（常用 / 生活 / 记账本等）与搜索；娱乐游戏等分类仍有占位「即将上线」。

### 我的

- 个人资料区、会员入口（展示用）
- 快捷进入纪念日、倒数日、愿望清单等
- 本地数据统计展示

---

## 技术栈

- [uni-app](https://uniapp.dcloud.net.cn/)（Vue 2）
- [uView UI 2](https://www.uviewui.com/)
- [dayjs](https://day.js.org/)（日期计算，见 `src/utils/dayjs.js`）
- Sass + 设计 Token（`src/style/design-tokens.css`）

---

## 目录结构（节选）

```text
src/
├── components/          # 公共组件（如 AppTabBar）
├── config/              # 首页、工具页配置
├── constants/           # 设计系统、账本常量等
├── pages/               # 业务页面
│   ├── index/           # 首页
│   ├── tab/             # 工具 / 愿望 / 我的 Tab
│   ├── rentCalculator/
│   ├── dateCalculator/、bmiCalculator/、randomNumber/、unitConverter/
│   ├── memorialDayList|Edit|Detail/
│   ├── countdownList|Edit|Detail/
│   ├── wishlist/、wishRecommend/
│   └── pokerLedger/、mahjongLedger/、paohuziLedger/
├── style/               # design-tokens.css
└── utils/               # 纪念日、倒数日、账本、日期等纯函数
```

---

## 公开仓库配置

本仓库按 **Public** 维护：真实微信小程序 AppID 不写入 Git，由本地配置。

### 首次克隆（需要跑微信小程序时）

1. 复制微信工程配置：
   ```bash
   cp project.config.example.json project.config.json
   ```
2. 编辑 `project.config.json`，将 `appid` 改为你在 [微信公众平台](https://mp.weixin.qq.com/) 的小程序 AppID。
3. 编辑 `src/manifest.json` → `mp-weixin.appid`，填入同一 AppID。
4. （可选）避免误提交 manifest 中的 AppID：
   ```bash
   git update-index --skip-worktree src/manifest.json
   ```

H5 开发可跳过上述步骤。`.env.local` 可参考根目录 `.env.example`；**AppSecret 只能放在服务端**，不要写进前端或仓库。

### 已推送到远程的历史

若此前已将 AppID 提交到 Git，公开后历史中仍可能存在。AppID 本身不是密钥；若仍希望从历史中移除，需使用 `git filter-repo` 等工具重写历史后再 force push（需团队协调）。

更完整的敏感信息说明见 [SECURITY.md](./SECURITY.md)。

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
# H5（默认 serve）
npm run serve
# 或
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin
```

使用微信开发者工具打开编译输出目录（一般为 `dist/dev/mp-weixin`）。

### 构建

```bash
# H5 生产包
npm run build

# 微信小程序生产包
npm run build:mp-weixin
```

其他平台可使用 `package.json` 中对应的 `dev:mp-*` / `build:mp-*` 脚本。

---

## 数据存储说明

| 模块 | Storage Key（示例） |
|------|---------------------|
| 纪念日 | `memorialDayList` |
| 倒数日 | `countdownEvents` |
| 愿望清单 | `WISH_LIST` |
| 德扑 / 麻将 / 跑胡子账本 | 见 `src/utils/pokerLedger.js`、`mahjongLedger.js`、`paohuziLedger.js` |
| 最近使用工具 | `recentTools`（见 `src/utils/recentTools.js`） |

纪念日列表在未写入本地数据时会展示演示条目；用户保存后以本地数据为准。

---

## 开发约定（摘要）

- 页面负责编排，可复用逻辑放在 `src/utils/` 或后续 `composables/`
- 颜色与间距优先使用 `design-tokens.css` / `constants/designSystem.js`
- 网络请求（若后续接入）应统一走 `@/utils/request`，接口路径集中管理

更完整的工程规范见 `.cursor/rules/project.mdc` 与 `.cursor/rules/ui-rule.mdc`。

---

## 版本

当前 `package.json` 版本：`0.1.0`
