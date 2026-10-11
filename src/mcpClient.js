import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { MCP_URL, getToken } from "./config.js";

export class McdMCP {
  constructor() {
    this.client = null;
  }

  async connect() {
    const token = getToken();
    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
      requestInit: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
    const client = new Client({ name: "mcd-skill", version: "0.2.0" });
    await client.connect(transport);
    this.client = client;
    return this;
  }

  async toolNames() {
    const { tools } = await this.client.listTools();
    return tools.map((t) => t.name);
  }

  // 调用某个 MCP 工具，并把文本内容合并成一段字符串
  async call(name, args = {}) {
    const res = await this.client.callTool({ name, arguments: args });
    const text = (res.content || [])
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n");
    return text;
  }

  async close() {
    try {
      await this.client?.close();
    } catch {
      /* 忽略关闭时的异常 */
    }
  }
}