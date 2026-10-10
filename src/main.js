// 交互式 CLI：麦门文学生成器
import readline from "node:readline/promises";
import { McMenuWriter } from "./assistant.js";
import { styleNames } from "./generator/templates.js";

const WIDTH = 40;

function divider(ch = "━") {
  return ch.repeat(WIDTH);
}

function renderCard(a) {
  const { emoji, tag, styleName, text, context } = a;
  const title = `${emoji} ${tag} · ${styleName}`;
  const pad = Math.max(0, WIDTH - title.length);
  return [
    `${title}${" ".repeat(pad)}`,
    divider(),
    ...text.split("\n").map((l) => `  ${l}`),
    divider("─"),
    context.source === "mcp"
      ? `数据源：McDonald's MCP 实时 · 活动「${context.activity}」· 单品「${context.dish}」`
      : `数据源：离线示例（未配置 MCD_MCP_TOKEN）`,
  ].join("\n");
}

async function showCampaigns(a) {
  const camps = await a.campaigns();
  if (camps.length === 0) return "暂未获取到本月活动（离线模式或暂无活动）。";
  const lines = camps.map((x, i) => `  ${i + 1}. ${x.title}${x.date ? "（" + x.date + "）" : ""}`);
  return `🎉 本月麦当劳活动速览：\n${lines.join("\n")}`;
}

const HELP = `可用命令：
  gen [风格]        生成一篇麦门文学（风格：${styleNames().join("/")}，缺省随机）
  styles            列出全部风格
  campaign          查看本月麦当劳活动（MCP 真实数据）
  status            查看数据源状态（mcp / fallback）
  help              显示帮助
  exit / quit       退出`;

async function main() {
  const w = new McMenuWriter();
  const mcpOk = await w.start();
  console.log(
    mcpOk
      ? "麦门文学生成器已连接 McDonald's MCP（实时数据模式）。"
      : "麦门文学生成器已启动（离线示例模式：未配置 MCD_MCP_TOKEN，使用内置示例数据）。"
  );
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    while (true) {
      const line = (await rl.question("mcd> ")).trim();
      if (!line) continue;
      const [cmd, arg] = line.split(/\s+/, 2);
      let out;
      if (cmd === "gen") out = renderCard(await w.write({ style: arg || "random" }));
      else if (cmd === "styles") out = styleNames().map((s) => `  ${s}`).join("\n");
      else if (cmd === "campaign") out = await showCampaigns(w);
      else if (cmd === "status") out = w.status() === "mcp" ? "MCP 实时数据模式 ✅" : "离线示例模式（未配置 MCD_MCP_TOKEN）";
      else if (cmd === "help") out = HELP;
      else if (cmd === "exit" || cmd === "quit") break;
      else out = `未知命令：${cmd}（输入 help 查看用法）`;
      console.log(out + "\n");
    }
  } finally {
    rl.close();
    await w.stop();
  }
}

main().catch((e) => {
  console.error("出错：", e.message);
  process.exit(1);
});
