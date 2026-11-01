// 天气查询控制器：调用 Open-Meteo（免费、无需 API Key）
// 分两步：① 地理编码把城市名转成经纬度  ② 用经纬度查当前天气 + 近 15 天预报
// Open-Meteo 文档：https://open-meteo.com/

/**
 * 把 Open-Meteo 的天气代码转成中文天气状况
 * 代码含义见：https://open-meteo.com/en/docs 的 WMO Weather interpretation codes
 */
function codeToText(code) {
  if (code === 0) return "晴";
  if ([1, 2].includes(code)) return "多云";
  if (code === 3) return "阴";
  if ([45, 48].includes(code)) return "雾";
  if ([51, 53, 55, 56, 57].includes(code)) return "毛毛雨";
  if ([61, 63, 65, 66, 67].includes(code)) return "雨";
  if ([71, 73, 75, 77].includes(code)) return "雪";
  if ([80, 81, 82].includes(code)) return "阵雨";
  if ([85, 86].includes(code)) return "阵雪";
  if ([95, 96, 99].includes(code)) return "雷阵雨";
  return "多云";
}

/**
 * GET /weather?city=杭州
 * 返回当前天气 + 近 15 天预报
 */
async function getWeather(req, res) {
  const city = (req.query.city || "").trim();
  if (!city) {
    return res.status(400).json({ code: 400, message: "请传入城市名 city" });
  }

  try {
    // ---------- ① 地理编码：城市名 -> 经纬度 ----------
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1&language=zh&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    // 没查到该城市
    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ code: 404, message: `未找到城市：${city}` });
    }

    const { latitude, longitude, name, admin1 } = geoData.results[0];

    // ---------- ② 用经纬度查天气 ----------
    // current：当前实况；daily：每日预报；forecast_days=15 表示近 15 天；时区用上海
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=15&timezone=Asia%2FShanghai`;
    const wRes = await fetch(weatherUrl);
    const wData = await wRes.json();

    // ---------- 整理成前端需要的结构 ----------
    const daily = wData.daily;
    const forecast = daily.time.map((date, i) => ({
      date, // 如 "2026-11-01"
      condition: codeToText(daily.weather_code[i]), // 中文天气
      high: Math.round(daily.temperature_2m_max[i]), // 最高温
      low: Math.round(daily.temperature_2m_min[i]), // 最低温
    }));

    res.json({
      code: 200,
      data: {
        // 优先显示「省 市」更直观，例如「浙江 杭州」
        city: admin1 ? `${admin1} ${name}` : name,
        temperature: Math.round(wData.current.temperature_2m), // 当前温度
        condition: codeToText(wData.current.weather_code), // 当前天气
        high: forecast[0].high, // 今天最高温
        low: forecast[0].low, // 今天最低温
        humidity: `${wData.current.relative_humidity_2m}%`, // 湿度
        wind: `${Math.round(wData.current.wind_speed_10m)} km/h`, // 风速
        updateTime: new Date().toTimeString().slice(0, 5), // 更新时间 HH:mm
        forecast, // 近 15 天预报
      },
    });
  } catch (err) {
    console.error("天气查询失败:", err.message);
    res.status(500).json({ code: 500, message: "天气服务暂时不可用，请稍后再试" });
  }
}

module.exports = { getWeather };
