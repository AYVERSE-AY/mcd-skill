// 麦门省钱 / 套餐推荐助手：把 McDonald's MCP 的原始数据整理成用户能看懂的建议
import { McdMCP } from "./mcpClient.js";

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
// 示例: [1]{productName,nutritionDescription,energyKj,energyKcal,protein,fat,carbohydrate,sodium,calcium}:\n 猪柳麦满分,null,1288,308,16,16,24,781,213
function parseNutrition(text) {
  const data = extractData(text);
  const raw = typeof data === "string" ? data : String(data ?? "");
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

export class McMenuAssistant {
  constructor() {
    this.mcp = new McdMCP();
  }

  async start() {
    await this.mcp.connect();
  }

  async stop() {
    await this.mcp.close();
  }

  // 今天
  async today() {
    const text = await this.mcp.call("now-time-info");
    const data = extractData(text);
    return typeof data === "object" && data ? data : { text };
  }

  // 本月活动日历
  async campaigns() {
    const text = await this.mcp.call("campaign-calendar");
    const data = extractData(text);
    return typeof data === "object" && data ? data : { text };
  }

  // 依据营养信息做套餐/单品推荐
  async recommend({ maxKcal = 800, goal = "balance" } = {}) {
    const text = await this.mcp.call("list-nutrition-foods");
    const items = parseNutrition(text).filter((i) => i.productName);

    const scored = items
      .filter((i) => i.energyKcal != null && i.energyKcal <= maxKcal)
      .map((i) => {
        let score;
        if (goal === "low") score = 1000 - i.energyKcal;            // 低卡优先
        else if (goal === "protein") score = i.protein - i.fat * 0.6; // 高蛋白、控制脂肪
        else score = i.protein - i.fat * 0.5 - i.carbohydrate * 0.1;  // 综合
        return { name: i.productName, kcal: i.energyKcal, protein: i.protein, fat: i.fat, carbohydrate: i.carbohydrate, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { maxKcal, goal, items: scored };
  }
}