// 交互式 CLI：跑一个"麦门省钱/套餐推荐助手"
import readline from "node:readline/promises";
import { McMenuAssistant } from "./assistant.js";

function fmt(v) {
  return v == null ? "-" : v;
}

async function showToday(a) {
  const d = await a.today();
  const dt = d.datetime ?? d.text ?? JSON.stringify(d);
  return `📅 今天是：${dt}`;
}

async function showCampaigns(a) {
  const data = await a.campaigns();
  // campaign-calendar 的 data 通常是 { activities: [...] }
  const list = Array.isArray(data?.activities) ? data.activities : Array.isArray(data) ? data : [];
  if (list.length === 0) return "暂时没查到正在进行的活动，稍后再来看看。";
  const lines = list.map((x, i) => {
    const title = x.title ?? x.name ?? x.subject ?? "未命名活动";
    const date = x.startDate ?? x.start_time ?? x.date ?? "";
    return `  ${i + 1}. ${title}${date ? "（" + date + "）" : ""}`;
  });
  return `🎉 本月麦当劳活动速览：\n${lines.join("\n")}`;
}

async function showRecommend(a, raw) {
  const maxKcal = Number(raw.trim()) || 800;
  const { items } = await a.recommend({ maxKcal });
  if (items.length === 0) return `在 ${maxKcal} 千卡内没找到合适单品，试试放宽预算。`;
  const lines = items.map(
    (x, i) =>
      `  ${i + 1}. ${x.name} —— ${x.kcal}千卡 / 蛋白${fmt(x.protein)}g / 脂肪${fmt(x.fat)}g / 碳水${fmt(x.carbohydrate)}g`
  );
  return `🍔 ≤${maxKcal}千卡推荐（按营养综合排序）：\n${lines.join("\n")}`;
}

const HELP = `可用命令：
  today            查看当前日期
  campaign         查看本月麦当劳活动
  eat <千卡>       按热量预算推荐（如 eat 600）
  help             显示帮助
  exit / quit      退出`;

async function main() {
  const a = new McMenuAssistant();
  await a.start();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log("麦门省钱/套餐推荐助手已连接 McDonald's MCP，输入 help 查看命令。");

  try {
    while (true) {
      const line = (await rl.question("mcd> ")).trim();
      if (!line) continue;
      const [cmd, arg] = line.split(/\s+/, 2);
      let out;
      if (cmd === "today") out = await showToday(a);
      else if (cmd === "campaign") out = await showCampaigns(a);
      else if (cmd === "eat") out = await showRecommend(a, arg || "800");
      else if (cmd === "help") out = HELP;
      else if (cmd === "exit" || cmd === "quit") break;
      else out = `未知命令：${cmd}（输入 help 查看用法）`;
      console.log(out + "\n");
    }
  } finally {
    rl.close();
    await a.stop();
  }
}

main().catch((e) => {
  console.error("出错：", e.message);
  process.exit(1);
});