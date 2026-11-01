/**
 * 天气查询工具（Tool）
 *
 * 一个"工具"由两部分组成：
 * 1. definition —— 函数的"说明书"，按 OpenAI function calling 格式编写。
 *                  大模型通过阅读它来决定"什么时候调用这个函数、要传什么参数"。
 * 2. execute    —— 函数的"真正实现"，由我们的 Node 服务在本地执行，
 *                  执行结果会以 role:"tool" 消息的形式喂回给模型。
 *
 * 当前 execute 使用模拟数据（无需任何 API Key，开箱即用）。
 * 以后想接真实天气服务（如高德开放平台 lbs.amap.com 的免费天气接口），
 * 只需替换 execute 内部实现，definition 和调用方代码完全不用改。
 */

// ---------- 1. 工具定义（给模型看的"说明书"） ----------
const definition = {
  type: "function",
  function: {
    name: "get_weather", // 函数名，模型回调时靠它定位工具，必须全局唯一
    description:
      "查询指定城市当前的实时天气，包括天气状况、温度、湿度、风力和空气质量。当用户询问天气相关问题时调用。",
    parameters: {
      // 参数用 JSON Schema 描述，模型会严格按此结构生成参数
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "城市名称，例如：杭州、上海、北京",
        },
      },
      required: ["city"], // 必填参数，模型调用时一定会传
    },
  },
};

// ---------- 2. 模拟数据 ----------
// 预置几个常见城市；查不到的城市会返回一份通用数据
const MOCK_WEATHER_DB = {
  杭州: { condition: "多云转晴", temp: 22, low: 15, high: 24, humidity: 65, wind: "东风 2 级", aqi: 42 },
  上海: { condition: "晴", temp: 21, low: 14, high: 23, humidity: 58, wind: "东南风 3 级", aqi: 38 },
  北京: { condition: "晴", temp: 12, low: 5, high: 14, humidity: 30, wind: "北风 3 级", aqi: 65 },
};

// ---------- 3. 工具实现 ----------
/**
 * 执行天气查询
 * @param {Object} args 模型传来的参数（已被注册表解析成对象）
 * @param {string} args.city 城市名
 * @returns {Promise<string>} JSON 字符串 —— 工具结果必须以字符串返回给模型阅读
 */
async function execute({ city }) {
  // TODO: 接入真实天气 API 时，把下面这行换成 fetch 请求即可，例如：
  //   const res = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${AMAP_KEY}`);
  const data = MOCK_WEATHER_DB[city] || {
    condition: "阴",
    temp: 18,
    low: 12,
    high: 20,
    humidity: 60,
    wind: "微风",
    aqi: 50,
  };

  // 返回 JSON 字符串：模型会阅读这段内容，再组织成自然语言回答用户
  return JSON.stringify({
    city,
    ...data,
    updateTime: new Date().toLocaleString("zh-CN"),
    source: "模拟数据（演示用）",
  });
}

module.exports = { definition, execute };
