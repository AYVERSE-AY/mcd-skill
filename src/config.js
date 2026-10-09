import "dotenv/config";

export const MCP_URL = process.env.MCD_MCP_URL || "https://mcp.mcd.cn";

export function getToken() {
  const token = (process.env.MCD_MCP_TOKEN || "").trim();
  if (!token || token === "YOUR_MCP_TOKEN") {
    throw new Error(
      "未找到有效的 MCD_MCP_TOKEN。请复制 .env.example 为 .env，并把你申请的 Token 填进去。"
    );
  }
  return token;
}