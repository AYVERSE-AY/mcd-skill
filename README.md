<div align="center">

# 🍔 麦门省钱 · 套餐推荐助手

**M-CODE 麦当劳程序员创意开发大赛参赛作品** · 基于 **McDonald's MCP** 的 AI Skill

一个帮你「**今天吃什么更值**」的助手：查今日日期、看本月活动、按热量预算推荐套餐——全程调用**麦当劳官方真实数据**。

</div>

---

## ✨ 它能做什么

| 能力 | 底层 MCP 工具 | 你的收益 |
|---|---|---|
| 📅 报时 | `now-time-info` | 让助手知道"今天"，做时效性推荐 |
| 🎉 本月活动速览 | `campaign-calendar` | 一屏看清麦当劳当月在搞什么活动 |
| 🍔 低卡/营养推荐 | `list-nutrition-foods` | 「身材管控期也能吃麦当劳」，按热量预算挑餐 |

> 本项目是**最小可用版本（MVP）**，主干逻辑已跑通真实 MCP 数据，可直接扩展 `create-order`(点餐)、`calculate-price`(优惠算价)、`query-meals`(门店菜单) 等能力。

## 🚀 快速开始

```bash
# 1. 克隆并安装依赖
git clone https://github.com/<你的用户名>/<仓库名>.git && cd <仓库名>
npm install

# 2. 配置 Token
#    到 open.mcd.cn 用手机号登录申请 MCP Token，填入环境变量：
#    MCD_MCP_TOKEN=你的TOKEN   （详见 mcp-config.example.json 与 .env.example）

# 3. 一键演示（适合录屏展示）
npm run demo

# 4. 交互式使用
npm start
```

### 交互命令

```
mcd> today          # 查看今天日期
mcd> campaign       # 查看本月麦当劳活动
mcd> eat 600        # 按热量预算推荐（≤600千卡）
mcd> help           # 帮助
mcd> exit           # 退出
```

## 📦 目标用户

- **身材/健康管控人群**：想吃麦当劳又在意热量，需要"低卡选餐"建议；
- **快结束型消费者**：想快速知道最近有什么活动、怎么点更划算。

## 🗂️ 目录结构

```
└─ src/
   ├─ config.js      # 读取配置（Token / 服务地址，来自环境变量）
   ├─ mcpClient.js   # MCP 客户端封装（Streamable HTTP + Bearer 鉴权）
   ├─ assistant.js   # 业务逻辑（营养数据解析 + 推荐算法）
   └─ main.js        # 交互式 CLI
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

- 每个 Token 限 **600 次/分钟**，请合理控制调用频率。
- 本仓库不含任何真实 Token；`.env` 已被 `.gitignore` 忽略，请勿提交。

## 🖼️ 参赛信息

- 活动：1024 程序员节 · 麦当劳程序员创意开发大赛（M-CODE）
- 官方仓库：[M-China/mcd-developer-innovation-challenge](https://github.com/M-China/mcd-developer-innovation-challenge)