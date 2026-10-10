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
| `campaign-calendar` | 查询当月营销活动日历 | 把**当月真实活动名**注入麦门文学文案，让玩梗内容带真实信息 |
| `list-nutrition-foods` | 获取常见餐品营养成分 | 从官方营养库**随机选取真实单品名**（巨无霸/麦辣鸡腿堡/新地…）嵌入文案，内容可溯源 |

> 说明：`now-time-info`、`create-order`、`calculate-price` 等工具本项目未调用；文案中的"餐段"由本地时间推导，避免为取数而调用多余接口。

## 三、调用流程

```
用户输入 gen [风格]
   │
   ▼
main.js (交互入口)
   │
   ▼
assistant.js ──► collectContext()：并行获取真实活动 + 单品名
   │                （MCP 不可用时自动降级为内置示例数据）
   ▼
mcpClient.js ──► MCP Connect (Bearer 鉴权) ──► callTool("campaign-calendar") / callTool("list-nutrition-foods")
   │
   ▼
mcp.mcd.cn (远程 MCP Server)
   │
   ▼
返回数据 ──► generator.js ──► 模板渲染（语录/礼赞/诗词/说唱/祈福）──► 输出文案卡片
```

关键实现点（`src/mcpClient.js` + `src/assistant.js`）：
```js
const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
  requestInit: { headers: { Authorization: `Bearer ${token}` } },
});
await client.connect(transport);

// assistant.js：取真实活动名与单品名注入文案
const campText = await this.mcp.call("campaign-calendar");       // → ctx.activity
const nutrText = await this.mcp.call("list-nutrition-foods");    // → ctx.dish
const result = generate({ style, context: ctx });                // 模板渲染
```

## 四、业务价值

- **创意 + 实用**：麦门文学是年轻圈层真实在玩的梗，具备天然传播力；作品把"玩梗"与"真实数据"结合，让每条文案都带可验证的麦当劳信息；
- **真实数据**：文案中的活动名与餐品名均来自麦当劳官方 MCP，非编造内容；
- **稳定可复现**：模板引擎先行，不依赖 LLM API；支持 seed 复现，录屏演示与评测结果一致；
- **可扩展**：生成器已预留 LLM 适配槽位，后续可无缝接入大模型自由创作，也可扩展 `create-order`（真点餐）等能力。
