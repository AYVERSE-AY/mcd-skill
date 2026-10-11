// 麦门文学生成助手：收集 McDonald's MCP 真实数据（活动/单品），交给生成器产出麦门文学文案。
// MCP 不可用（无 Token/连接失败）时自动降级为内置回退数据，保证离线可跑。
import { McdMCP } from "./mcpClient.js";
import { generate, randomStyle } from "./generator/generator.js";

// 解析 MCP 返回的文本，取出其中的 data 字段（可能为字符串或对象）
function extractData(text) {
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === "object") return obj.data;
    return obj;
  } catch {
    return text;
  }
}

// 解析营养信息的紧凑 TOON 格式，转成对象数组
// 兼容两种返回：纯 TOON 文本，以及「外层 Markdown 内嵌 JSON，data 字段为 TOON 字符串」
// TOON 示例: [160]{productName,nutritionDescription,energyKj,energyKcal,protein,fat,carbohydrate,sodium,calcium}:\n 猪柳麦满分,null,1288,308,16,16,24,781,213
function parseNutrition(text) {
  const data = extractData(text);
  let raw = typeof data === "string" ? data : String(data ?? "");
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const obj = JSON.parse(jsonMatch[0]);
      if (typeof obj?.data === "string") raw = obj.data;
    } catch {
      /* 非 JSON 外壳，直接按原文本解析 */
    }
  }
  const headerMatch = raw.match(/\{(.+?)\}/);
  if (!headerMatch) return [];
  const fields = headerMatch[1].split(",");
  const bodyPart = raw.slice(raw.indexOf(":") + 1).trim();
  const lines = bodyPart.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    const vals = line.split(",");
    const item = {};
    fields.forEach((f, i) => {
      let v = vals[i];
      const num = Number(v);
      item[f] = v === null || v === undefined || v === "null" ? null : (Number.isNaN(num) ? v : num);
    });
    return item;
  });
}

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 解析活动列表：兼容 JSON 数组 与 campaign-calendar 的 Markdown 文本格式
// Markdown 示例：-   **活动标题**：超值9.9元早餐两件套陪你开工啦😋
function parseCampaigns(text) {
  const data = extractData(text);
  const toItem = (x) => ({
    title: x.title ?? x.name ?? x.subject ?? "未命名活动",
    date: x.startDate ?? x.start_time ?? x.date ?? "",
  });
  if (Array.isArray(data)) return data.map(toItem);
  if (Array.isArray(data?.activities)) return data.activities.map(toItem);
  const raw = typeof data === "string" ? data : String(data ?? "");
  const titles = [...raw.matchAll(/\*\*活动标题\*\*[：:]\s*(.+)/g)].map((m) => m[1].trim());
  return titles.map((title) => ({ title, date: "" }));
}

export class McMenuWriter {
  constructor() {
    this.mcp = new McdMCP();
    this.mcpOk = false;
  }

  // 尝试连接 MCP；失败不抛错，降级为离线模式
  async start() {
    try {
      await this.mcp.connect();
      this.mcpOk = true;
    } catch {
      this.mcpOk = false;
    }
    return this.mcpOk;
  }

  async stop() {
    if (this.mcpOk) await this.mcp.close();
  }

  status() {
    return this.mcpOk ? "mcp" : "fallback";
  }

  // 本月活动（MCP 真实调用，供展示与文案取数）
  async campaigns() {
    if (!this.mcpOk) return [];
    try {
      const text = await this.mcp.call("campaign-calendar");
      return parseCampaigns(text);
    } catch {
      return [];
    }
  }

  // 收集生成上下文：优先 MCP 实时数据；缺省项交给 generate 用 seed 兜底（保证可复现）
  async collectContext() {
    const ctx = { mealPeriod: null, dish: null, activity: null, date: null, source: "fallback" };
    if (this.mcpOk) {
      try {
        const camps = await this.campaigns();
        if (camps.length) ctx.activity = camps[0].title;

        const nutrText = await this.mcp.call("list-nutrition-foods");
        const items = parseNutrition(nutrText).filter((i) => i.productName);
        if (items.length) ctx.dish = pickRandom(items).productName;

        ctx.source = "mcp";
      } catch {
        ctx.source = "fallback";
      }
    }
    return ctx;
  }

  // 生成一篇麦门文学文案
  async write({ style, seed } = {}) {
    const s = style === "random" || style == null ? randomStyle(seed) : style;
    const ctx = await this.collectContext();
    return generate({ style: s, seed, context: ctx });
  }
}
