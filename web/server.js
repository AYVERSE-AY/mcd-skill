import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McMenuWriter } from "../src/assistant.js";
import { styleNames } from "../src/generator/templates.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const writer = new McMenuWriter();
await writer.start();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function json(res, code, payload) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function recommendStyle({ time, mood, scene, health }) {
  const scores = {
    morning: 0,   // 早八续命签
    lunch: 0,     // 中午干饭签
    afternoon: 0, // 下午茶摸鱼签
    overtime: 0,  // 加班回血签
    feast: 0,     // 周末欢聚签
    light: 0,     // 自律轻食签
  };
  const reasons = [];

  // 时间权重最高
  const timeMap = {
    morning: ["morning"],
    noon: ["lunch"],
    afternoon: ["afternoon"],
    evening: ["feast", "lunch"],
    night: ["overtime"],
  };
  if (timeMap[time]) {
    timeMap[time].forEach((k) => (scores[k] += 3));
    reasons.push(`当前时段倾向${label(timeMap[time][0])}`);
  }

  // 情绪
  const moodMap = {
    tired: ["morning", "overtime"],
    confused: ["lunch"],
    relaxed: ["afternoon"],
    happy: ["feast"],
    disciplined: ["light"],
    lazy: ["afternoon", "overtime"],
    stressed: ["overtime", "afternoon"],
  };
  if (moodMap[mood]) {
    moodMap[mood].forEach((k) => (scores[k] += 2));
    reasons.push(`你的状态${moodLabel(mood)}，适合${label(moodMap[mood][0])}`);
  }

  // 场景
  const sceneMap = {
    commute: ["morning"],
    office: ["lunch", "afternoon", "overtime"],
    home: ["feast", "afternoon"],
    gym: ["light"],
    party: ["feast"],
    outdoor: ["feast", "light"],
  };
  if (sceneMap[scene]) {
    sceneMap[scene].forEach((k) => (scores[k] += 2));
    reasons.push(`在${sceneLabel(scene)}场景下，推荐${label(sceneMap[scene][0])}`);
  }

  // 健康需求优先级高
  if (health === "yes") {
    scores.light += 4;
    reasons.push("你选择了健康低卡，优先推荐自律轻食签");
  }

  const style = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return {
    style,
    reason: reasons.slice(0, 2).join("；") + `。最终推荐：${label(style)}。`,
    scores,
  };
}

function label(key) {
  const map = {
    morning: "早八续命签",
    lunch: "中午干饭签",
    afternoon: "下午茶摸鱼签",
    overtime: "加班回血签",
    feast: "周末欢聚签",
    light: "自律轻食签",
  };
  return map[key] || key;
}

function moodLabel(key) {
  const map = {
    tired: "困倦",
    confused: "纠结",
    relaxed: "放松",
    happy: "开心",
    disciplined: "自律",
    lazy: "想摸鱼",
    stressed: "压力大",
  };
  return map[key] || key;
}

function sceneLabel(key) {
  const map = {
    commute: "通勤/路上",
    office: "办公室",
    home: "家里",
    gym: "健身",
    party: "聚会",
    outdoor: "户外",
  };
  return map[key] || key;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === "/api/styles" && req.method === "GET") {
      return json(res, 200, { styles: styleNames(), status: { mcp: writer.status() === "mcp" } });
    }
    if (url.pathname === "/api/write" && req.method === "POST") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const { style, seed } = JSON.parse(body || "{}");
      const card = await writer.write({ style: style || "random", seed: seed || undefined });
      return json(res, 200, card);
    }
    if (url.pathname === "/api/recommend" && req.method === "POST") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const answers = JSON.parse(body || "{}");
      const result = recommendStyle(answers);
      return json(res, 200, result);
    }
    const rel = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = path.resolve(__dirname, "." + rel);
    if (!filePath.startsWith(__dirname)) return json(res, 403, { error: "forbidden" });
    const content = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(content);
  } catch (err) {
    if (err.code === "ENOENT") return json(res, 404, { error: "not found" });
    json(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  const mode = writer.status() === "mcp" ? "MCP 实时" : "离线示例";
  console.log(`麦门文学生成器已启动：http://localhost:${PORT}（${mode}）`);
});
