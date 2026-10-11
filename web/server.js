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
