// 一键演示脚本：离线/在线自动生成 3 篇麦门文学 + 活动速览，方便录屏展示
import { McMenuWriter } from "../src/assistant.js";
import { styleNames } from "../src/generator/templates.js";

function renderCard(a) {
  const { emoji, tag, styleName, text, context } = a;
  return [
    `━━━ ${emoji} ${tag} · ${styleName} ━━━`,
    ...text.split("\n").map((l) => `  ${l}`),
    context.source === "mcp"
      ? `  ── 数据源：McDonald's MCP 实时 · 活动「${context.activity}」· 单品「${context.dish}」`
      : "  ── 数据源：离线示例",
  ].join("\n");
}

async function main() {
  const w = new McMenuWriter();
  const mcpOk = await w.start();
  console.log(mcpOk ? "✅ 已连接 McDonald's MCP（实时数据）\n" : "ℹ️ 离线示例模式（未配置 MCD_MCP_TOKEN）\n");

  if (mcpOk) {
    const camps = await w.campaigns();
    if (camps.length) {
      console.log("🎉 本月麦当劳活动速览：");
      camps.slice(0, 3).forEach((x, i) => console.log(`  ${i + 1}. ${x.title}${x.date ? "（" + x.date + "）" : ""}`));
      console.log();
    }
  }

  console.log("📖 语录体：");
  console.log(renderCard(await w.write({ style: "verse", seed: 20261010 })) + "\n");

  console.log("🙏 礼赞体：");
  console.log(renderCard(await w.write({ style: "liturgy", seed: 20261010 })) + "\n");

  console.log("🍀 祈福体：");
  console.log(renderCard(await w.write({ style: "blessing", seed: 20261010 })) + "\n");

  console.log(`（全部风格：${styleNames().join(" / ")}）`);
  await w.stop();
}

main().catch((e) => {
  console.error("出错：", e.message);
  process.exit(1);
});
