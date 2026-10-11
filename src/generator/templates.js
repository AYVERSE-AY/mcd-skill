// 麦门神谕模板库：6 种生活签 x 多组变体
// 槽位说明（由生成器用 MCP 真实数据填充，离线时用回退数据）：
//   {dish} 单品名   {activity} 活动名   {date} 日期   {num} 随机数
//   {calories} 热量   {protein} 蛋白质（轻食签专用）
// 内容原则：正面快乐、玩梗不贬损、规避直接宗教词汇、贴合真实生活场景。

const STYLES = {
  morning: {
    name: "早八续命签",
    emoji: "☕",
    tag: "晨起神谕",
    visual: "modern",
    blurb: "早八人的命，是麦咖啡给的",
    templates: [
      "早八人的命，是麦咖啡给的。今日续命：{dish}，配 {activity}，清醒到中午不点头。",
      "闹钟按掉三次？没关系，{dish} 已就位。麦门保佑，今日会议不犯困。",
      "晨起第一口麦，胜过十个闹钟。今日 {dish}，祝你通勤有座、打卡不迟到。",
      "天没亮就出门的你，值得一份 {dish}。今日能量条：■■■■□ 80%。",
      "别人还在梦里，你已经排队等 {dish}。这就是早八人的觉悟。",
    ],
  },
  lunch: {
    name: "中午干饭签",
    emoji: "🍔",
    tag: "干饭神谕",
    visual: "fantasy",
    blurb: "别问吃什么，问就是麦门",
    templates: [
      "别问吃什么，问就是麦门。今日干饭方案：{dish} + 薯条 + 可乐，饱到下午不摸鱼。",
      "选择困难症晚期？抽到这签，{dish} 就是你今天的命定之餐。",
      "中午不狠，地位不稳。今日 {dish}，一口回血，下午继续刚。",
      "午饭时间到，烦恼全抛掉。{dish} 在手，下午开会我不抖。",
      "同事还在纠结外卖，你已经拿起 {dish}。这就是干饭人的速度。",
    ],
  },
  afternoon: {
    name: "下午茶摸鱼签",
    emoji: "🍰",
    tag: "摸鱼神谕",
    visual: "classic",
    blurb: "三点几啦，饮茶先啦",
    templates: [
      "三点几啦，饮茶先啦。今日摸鱼搭子：{dish}，甜过初恋，老板看不见。",
      "下午茶的仪式感，从一份 {dish} 开始。糖分续命，快乐翻倍。",
      "困到眼皮打架？来口 {dish}，精神瞬间归位。摸鱼也要摸出品质。",
      "键盘敲到一半，心思飞到 {dish}。没关系，三点一刻是麦门时间。",
      "今天的班就先上到这儿，{dish} 会替我站好最后一班岗。",
    ],
  },
  overtime: {
    name: "加班回血签",
    emoji: "🌙",
    tag: "回血神谕",
    visual: "modern",
    blurb: "你辛苦了，值得被犒赏",
    templates: [
      "加班到很晚？今日回血包：{dish}。麦门说：你辛苦了，值得被犒赏。",
      "键盘敲烂了不要紧，{dish} 还在。吃饱再战，天亮之前都能赢。",
      "今夜无眠，但胃不能委屈。{dish} 陪你，把 PPT 熬成诗。",
      "深夜的办公室，只有 {dish} 懂你。咬一口，疲惫退散。",
      "月亮不睡我不睡，{dish} 陪我熬到位。",
    ],
  },
  feast: {
    name: "周末欢聚签",
    emoji: "🎉",
    tag: "欢聚神谕",
    visual: "fantasy",
    blurb: "快乐要 share 才完整",
    templates: [
      "周末不聚，人生无味。今日欢聚配置：{dish} × N，快乐要 share 才完整。",
      "朋友来家里？别做饭了，{dish} 一摆，气氛直接到位。",
      "追剧没有零食，快乐少一半。今日 {dish}，陪你从第一集刷到大结局。",
      "周末的快乐公式：朋友 + {dish} + {activity} = 完美一天。",
      "工作日的委屈，周末用 {dish} 补回来。",
    ],
  },
  light: {
    name: "自律轻食签",
    emoji: "🥗",
    tag: "轻食神谕",
    visual: "classic",
    blurb: "低卡也能很快乐",
    templates: [
      "今日自律签：{dish}（约 {calories} 卡 / {protein}g 蛋白）。麦门信徒，也能拥有好身材。",
      "减脂期不用苦哈哈，{dish} 陪你轻负担。今日热量已帮你算好，放心吃。",
      "想吃又怕胖？{dish} 是今日答案。低卡也能很快乐，麦门自有安排。",
      "自律不是不吃，而是吃得聪明。{dish} 给你饱腹感，不给负罪感。",
      "今天的麦门是健康的：{dish}，{calories} 卡，刚刚好。",
    ],
  },
};

export const DISH_FALLBACKS = ["巨无霸", "薯条", "麦辣鸡腿堡", "新地", "麦满分", "麦乐鸡", "热燕麦奶"];

export function styleNames() {
  return Object.keys(STYLES);
}

export function getStyle(name) {
  return STYLES[name] || null;
}
