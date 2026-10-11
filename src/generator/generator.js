// 麦门神谕生成器：MCP 上下文 → 模板渲染 → 文案
// 核心原则：模板引擎先行、离线可跑；MCP 有真实数据时自动注入，无 Token 时优雅降级。
import { getStyle, DISH_FALLBACKS, styleNames } from "./templates.js";

// 可选 seed 使生成可复现（演示录屏时用）
function rng(seed) {
  let s = seed == null ? Math.floor(Math.random() * 2 ** 31) : seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function pick(arr, rand) {
  return arr[Math.floor(rand() * arr.length)];
}

// 由当前时间推导餐段
export function mealPeriodFrom(date = new Date()) {
  const h = date.getHours();
  if (h < 10) return "早餐";
  if (h < 14) return "午餐";
  if (h < 17) return "下午茶";
  if (h < 21) return "晚餐";
  return "夜宵";
}

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 生成一篇麦门神谕文案
export function generate({ style = "morning", seed, context = {} } = {}) {
  const def = getStyle(style) || getStyle("morning");
  const rand = rng(seed);
  const template = pick(def.templates, rand);
  const ctx = {
    mealPeriod: context.mealPeriod || mealPeriodFrom(),
    dish: context.dish || pick(DISH_FALLBACKS, rand),
    activity: context.activity || "本月麦门惊喜",
    date: context.date || today(),
    num: 10 + Math.floor(rand() * 90),
    calories: context.calories ?? "—",
    protein: context.protein ?? "—",
    source: context.source || "fallback",
  };
  const text = template.replace(/\{(\w+)\}/g, (_, k) => ctx[k] ?? "");
  return {
    style,
    styleName: def.name,
    emoji: def.emoji,
    tag: def.tag,
    blurb: def.blerb,
    text,
    context: ctx,
    seed: seed ?? null,
  };
}

export function randomStyle(seed) {
  const names = styleNames();
  return pick(names, rng(seed));
}
