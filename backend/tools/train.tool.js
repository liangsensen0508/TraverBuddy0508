/**
 * 火车票查询工具（Tool）
 *
 * 结构与 weather.tool.js 完全相同：
 * - definition 给模型看（什么时候调、传什么参数）
 * - execute 在本地真正执行（当前为模拟数据）
 *
 * 以后想接真实车票数据（如聚合数据 juhe.cn 的火车票接口），
 * 只需替换 execute 内部实现。
 */

// ---------- 1. 工具定义（给模型看的"说明书"） ----------
const definition = {
  type: "function",
  function: {
    name: "get_train_tickets",
    description:
      "查询两个城市之间指定日期的火车票/高铁车次信息，包括车次号、出发到达时间、历时、票价和余票。当用户询问火车票、高铁票、车次时调用。",
    parameters: {
      type: "object",
      properties: {
        from: { type: "string", description: "出发城市，例如：杭州" },
        to: { type: "string", description: "到达城市，例如：上海" },
        date: {
          type: "string",
          description: "出发日期，格式 YYYY-MM-DD，例如 2026-11-01。用户没说明日期时可不传，默认查今天。",
        },
      },
      required: ["from", "to"], // date 可选
    },
  },
};

// ---------- 2. 辅助函数 ----------
/** 数字补零：7 -> "07"，用于拼时间字符串 */
function pad(n) {
  return String(n).padStart(2, "0");
}

// ---------- 3. 工具实现 ----------
/**
 * 执行火车票查询
 * @param {Object} args 模型传来的参数
 * @param {string} args.from 出发城市
 * @param {string} args.to   到达城市
 * @param {string} [args.date] 出发日期（可选，默认今天）
 * @returns {Promise<string>} JSON 字符串，包含车次列表
 */
async function execute({ from, to, date }) {
  const queryDate = date || new Date().toISOString().slice(0, 10);

  // 用城市名长度做一个固定"种子"：
  // 保证同样的城市组合每次查出来的车次数量一致，看起来更像真实接口
  const seed = (from.length + to.length) % 3;
  const count = 3 + seed; // 3 ~ 5 趟

  // TODO: 接入真实火车票 API 时，把下面这个循环换成 fetch 请求即可
  const trains = [];
  for (let i = 0; i < count; i++) {
    const departMinutes = 7 * 60 + i * 150; // 首班 07:00，之后每隔 2.5 小时一班
    const durationMinutes = 50 + ((i * 23) % 80); // 历时 50 ~ 130 分钟
    const arriveMinutes = departMinutes + durationMinutes;

    trains.push({
      trainNo: `G${7500 + i * 2 + from.length}`, // 模拟高铁车次号
      fromStation: `${from}东`,
      toStation: `${to}虹桥`,
      departTime: `${pad(Math.floor(departMinutes / 60))}:${pad(departMinutes % 60)}`,
      arriveTime: `${pad(Math.floor(arriveMinutes / 60))}:${pad(arriveMinutes % 60)}`,
      duration: `${Math.floor(durationMinutes / 60)}小时${durationMinutes % 60}分`,
      price: { 二等座: 60 + i * 5, 一等座: 96 + i * 8 },
      seatsLeft: { 二等座: "有", 一等座: i % 2 === 0 ? "有" : "无" },
    });
  }

  return JSON.stringify({
    from,
    to,
    date: queryDate,
    total: trains.length,
    trains,
    source: "模拟数据（演示用）",
  });
}

module.exports = { definition, execute };
