# MCP 集成说明（MCP_INTEGRATION.md）

本文档说明本项目如何真实使用麦当劳 MCP 能力，及其调用流程与业务价值。

## 一、使用的 MCP Server

| 项 | 内容 |
|---|---|
| Server 地址 | `https://mcp.mcd.cn` |
| 传输协议 | Streamable HTTP |
| 鉴权方式 | 请求头 `Authorization: Bearer <MCP_TOKEN>` |
| Token 获取 | 到 `open.mcd.cn` 手机号登录后申请 |
| 限流 | 每 Token 每分钟最多 600 次请求 |

## 二、实际调用的 Tool

| Tool 名 | 用途 | 在本项目的业务价值 |
|---|---|---|
| `now-time-info` | 返回当前完整时间 | 让助手知道"今天"，为推荐提供时效性 |
| `campaign-calendar` | 查询当月营销活动日历 | 向用户展示最近/进行中的麦当劳活动 |
| `list-nutrition-foods` | 获取常见餐品营养成分（能量/蛋白/脂肪/碳水/钠/钙） | 按热量预算与营养结构做"低卡/高蛋白"套餐推荐 |

## 三、调用流程

```
用户提问
   │
   ▼
main.js (交互入口)
   │
   ▼
assistant.js ──► 解析意图：today / campaign / eat <千卡>
   │
   ▼
mcpClient.js ──► MCP Connect (Bearer 鉴权) ──► listTools / callTool
   │
   ▼
mcp.mcd.cn (远程 MCP Server)
   │
   ▼
返回数据 → 解析(TOON营养格式) → 按热量/营养打分排序 → 输出中文建议
```

关键实现点（`src/mcpClient.js`）：
```js
const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
  requestInit: { headers: { Authorization: `Bearer ${token}` } },
});
await client.connect(transport);
const text = await client.callTool({ name: "list-nutrition-foods" });
```

## 四、业务价值

- **实用**：把用户「想省心吃麦当劳」的真实需求，落地为"今日活动 + 热量适配"的可执行建议；
- **真实数据**：所有推荐均基于麦当劳官方 MCP 的真实营养/活动数据，非编造；
- **可扩展**：主干已打通，后续可无缝接入 `create-order`（真点餐）、`calculate-price`（帮算优惠后最低价）、`query-meals`（门店菜单）等，把"省钱助手"做完整。