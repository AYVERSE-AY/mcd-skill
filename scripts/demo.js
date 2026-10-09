// 一键演示脚本：自动跑一遍"日期 + 活动 + 低卡推荐"，方便录屏展示
import { McMenuAssistant } from "../src/assistant.js";

function fmt(v) {
  return v == null ? "-" : v;
}

async function main() {
  const a = new McMenuAssistant();
  await a.start();

  // 1) 当前日期
  const d = await a.today();
  const dt = d.datetime ?? d.text ?? JSON.stringify(d);
  console.log(`📅 今天是：${dt}\n`);

  // 2) 本月活动
  const data = await a.campaigns();
  const list = Array.isArray(data?.activities) ? data.activities : Array.isArray(data) ? data : [];
  if (list.length) {
    console.log("🎉 本月麦当劳活动速览：");
    list.forEach((x, i) => {
      const title = x.title ?? x.name ?? x.subject ?? "未命名活动";
      const date = x.startDate ?? x.start_time ?? x.date ?? "";
      console.log(`  ${i + 1}. ${title}${date ? "（" + date + "）" : ""}`);
    });
  } else {
    console.log("本月暂无查询到活动。");
  }

  // 3) 低卡推荐
  console.log("\n🍔 ≤600千卡推荐（按营养综合排序）：");
  const { items } = await a.recommend({ maxKcal: 600 });
  if (items.length === 0) {
    console.log("  在 600 千卡内没找到合适单品。");
  } else {
    items.forEach((x, i) => {
      console.log(
        `  ${i + 1}. ${x.name} —— ${x.kcal}千卡 / 蛋白${fmt(x.protein)}g / 脂肪${fmt(x.fat)}g / 碳水${fmt(x.carbohydrate)}g`
      );
    });
  }

  await a.stop();
}

main().catch((e) => {
  console.error("出错：", e.message);
  process.exit(1);
});