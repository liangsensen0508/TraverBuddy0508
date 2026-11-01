/**
 * 工具注册表（Tool Registry）
 *
 * 所有工具在这里统一登记、统一出口。以后新增工具只需三步：
 *   1. 新建 xxx.tool.js（包含 definition + execute）
 *   2. 在本文件 require 进来
 *   3. 加进 TOOL_MAP
 * controller/chat.js 不需要任何改动 —— 这就是"注册表"模式的好处。
 */
const weatherTool = require("./weather.tool");
const trainTool = require("./train.tool");

// key 是函数名（必须与各工具 definition.function.name 一致），value 是工具模块
const TOOL_MAP = {
  get_weather: weatherTool,
  get_train_tickets: trainTool,
};

// 汇总所有工具定义，调用大模型时整体传给 tools 参数
const toolDefinitions = Object.values(TOOL_MAP).map((t) => t.definition);

/**
 * 按函数名执行工具
 * @param {string} name     模型要调用的函数名（如 "get_weather"）
 * @param {string} argsJson 模型传来的参数（JSON 字符串，如 '{"city":"杭州"}'）
 * @returns {Promise<string>} 工具执行结果（字符串，会喂回给模型）
 */
async function executeTool(name, argsJson) {
  const tool = TOOL_MAP[name];
  if (!tool) {
    // 模型"幻觉"出不存在的工具时，返回错误信息让它自行纠正，而不是直接崩溃
    return JSON.stringify({ error: `未找到工具: ${name}` });
  }

  try {
    // 模型传来的参数是 JSON 字符串，先解析成对象再传给工具
    const args = argsJson ? JSON.parse(argsJson) : {};
    return await tool.execute(args);
  } catch (err) {
    // 工具报错时不要抛异常中断整个对话，把错误信息返回给模型，让它自行处理
    return JSON.stringify({ error: `工具执行失败: ${err.message}` });
  }
}

module.exports = { toolDefinitions, executeTool };
