<div align="center">

# 🍔 麦门文学生成器

**M-CODE 麦当劳程序员创意开发大赛参赛作品** · 基于 **McDonald's MCP** 的 AI Skill

输入一句「给我来一篇麦门文学」，帮你生成**语录体 / 礼赞体 / 诗词体 / 说唱体 / 祈福体**五种风格的麦门文案——文案里的**活动、单品名来自麦当劳官方 MCP 真实数据**。

</div>

---

## ✨ 它能做什么

| 能力 | 底层 MCP 工具 | 你的收益 |
|---|---|---|
| 🎭 五种风格生成 | `campaign-calendar` + `list-nutrition-foods` | 语录/礼赞/诗词/说唱/祈福，一按即出 |
| 🎯 真实数据注入 | `campaign-calendar` | 文案自动带上**当月真实活动**名 |
| 🍔 真实单品入文 | `list-nutrition-foods` | 文案里的餐品名来自**官方营养库**，不是瞎编 |
| 🌙 餐段感知 | 本地时间推导 | 早/午/晚/夜宵自动切换语境 |
| 🔌 离线降级 | 内置示例数据 | 没配 Token 也能跑通全流程，配了就自动升级 |

> 模板引擎先行、LLM 适配槽位预留：当前**不依赖任何 LLM API**，确定性、可复现（支持 seed）；后续可无缝接入大模型做自由创作。

## 🚀 快速开始

```bash
# 1. 克隆并安装依赖
git clone https://github.com/AYVERSE-AY/mcd-skill.git && cd mcd-skill
npm install

# 2. （可选）配置 MCP Token
#    到 open.mcd.cn 用手机号登录申请 Token，填入 .env：
#    MCD_MCP_TOKEN=你的TOKEN   （详见 mcp-config.example.json 与 .env.example）
#    不配置也能跑，自动使用离线示例数据

# 3. 一键演示（适合录屏展示，同 seed 输出可复现）
npm run demo

# 4. 交互式使用
npm start
```

### 交互命令

```
mcd> gen                # 随机风格生成一篇
mcd> gen poem           # 指定风格：verse/liturgy/poem/rap/blessing
mcd> styles             # 列出全部风格
mcd> campaign           # 查看本月麦当劳活动（MCP 真实数据）
mcd> status             # 查看数据源状态（mcp / fallback）
mcd> help               # 帮助
mcd> exit               # 退出
```

### 输出示例

```
━━━ 🍀 麦门好运签 · 祈福体 ━━━
  麦门保佑你：今日套餐不售罄，薯条永远脆，可乐永远冰，快乐永远满杯。本月麦门惊喜正等你来。
  ── 数据源：离线示例
```

## 📦 目标用户

- **爱玩梗的年轻人**：麦门文学是圈层黑话，适合发朋友圈/小红书/微博；
- **社媒内容创作者**：一键产出带真实活动信息的麦门文案，做内容不缺素材；
- **麦门信徒**：语录、礼赞、好运签，总有一款适合今天的心情。

## 🗂️ 目录结构

```
└─ src/
   ├─ config.js            # 读取配置（Token / 服务地址，来自环境变量）
   ├─ mcpClient.js         # MCP 客户端封装（Streamable HTTP + Bearer 鉴权）
   ├─ assistant.js         # 麦门文学生成助手（MCP 数据收集 + 离线降级）
   ├─ generator/
   │  ├─ templates.js      # 麦门文学模板库（5 风格 x 多组变体）
   │  └─ generator.js      # 生成器核心（上下文 → 模板渲染 → 文案）
   └─ main.js              # 交互式 CLI
```

## 🔌 MCP 集成说明

- **Server**：`https://mcp.mcd.cn`（远程托管，Streamable HTTP）
- **鉴权**：请求头 `Authorization: Bearer <Token>`
- **调用流程与业务价值**：见 [MCP_INTEGRATION.md](MCP_INTEGRATION.md)

## 📄 参赛相关

- 参赛声明：[CONTEST_DECLARATION.md](CONTEST_DECLARATION.md)
- MCP 配置示例：[mcp-config.example.json](mcp-config.example.json)
- WorkBuddy 专项奖励上下文：[workbuddy.md](workbuddy.md)

## ⚠️ 说明

- 内容为 AI 生成的娱乐向文案，不含任何真实餐品承诺；餐品信息以麦当劳官方渠道实时结果为准。
- 每个 Token 限 **600 次/分钟**，请合理控制调用频率。
- 本仓库不含任何真实 Token；`.env` 已被 `.gitignore` 忽略，请勿提交。

## 🖼️ 参赛信息

- 活动：1024 程序员节 · 麦当劳程序员创意开发大赛（M-CODE）
- 官方仓库：[M-China/mcd-developer-innovation-challenge](https://github.com/M-China/mcd-developer-innovation-challenge)
