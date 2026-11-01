const OpenAI = require("openai");
const {
  SILICONFLOW_API_KEY,
  SILICONFLOW_BASE_URL,
  SILICONFLOW_MODEL,
} = require("../config/index.js");
// 工具注册表：所有工具的定义和执行入口都在这里
const { toolDefinitions, executeTool } = require("../tools/index.js");

// 一次对话中最多允许的工具调用轮数，防止模型陷入"调用死循环"
const MAX_TOOL_ROUNDS = 5;

// 懒加载：首次真正调用时才实例化，避免启动时因未配置 API Key 直接崩溃
let openai = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: SILICONFLOW_API_KEY,
      baseURL: SILICONFLOW_BASE_URL,
    });
  }
  return openai;
}

/**
 * 带自动重试的大模型调用
 * 遇到 429(限流) 或 5xx(服务端错误) 时指数退避重试，最多   3 次
 */
async function callWithRetry(params, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await getOpenAI().chat.completions.create(params);
    } catch (err) {
      lastError = err;

      const isRateLimit = err.status === 429 || err.code === "limit_requests";
      const isServerError = err.status >= 500;

      if ((isRateLimit || isServerError) && attempt < maxRetries) {
        const waitMs = Math.pow(2, attempt) * 1000; // 2s → 4s → 8s
        console.log(`[重试 ${attempt}/${maxRetries}] ${err.status || err.code}，${waitMs}ms 后重试...`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

class ChatController {
  /**
   * POST /chat  —— SSE 流式输出
   * 请求体: { message: string }
   * 响应: text/event-stream，每帧格式 `data: {"content":"..."}\n\n`，
   *       结束时推送 `data: {"done":true}\n\n`
   */
  async chatMessage(req, res) {
    // 参数校验放在设置 SSE 头之前，这样出错还能返回普通 JSON
    if (!SILICONFLOW_API_KEY) {
      return res.status(500).json({
        error: "未配置 API Key",
        detail: "请在 config/index.js 或环境变量 SILICONFLOW_API_KEY 中填入硅基流动的 API Key",
      });
    }

    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "缺少参数 message" });
    }

    // ---------- SSE 响应头 ----------
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    // 让 nginx 等反向代理不要缓冲，否则流式会变成一次性返回
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // 客户端提前断开时停止推送
    // 注意：要监听 res 而不是 req —— Node 16+ 的 req 在请求体读完时就会触发 close
    let closed = false;
    res.on("close", () => {
      closed = true;
    });

    const send = (payload) => {
      if (!closed) res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    try {
      // ---------- 对话历史 ----------
      // 工具调用的本质：模型 → 决定调哪个工具 → 我们执行 → 结果喂回 → 模型继续
      // 整个过程的每一步都要追加进 messages，模型才"记得"上下文
      // 把当前日期告诉模型，否则它不知道"今天/明天"是哪一天，查票会传错日期
      const today = new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const messages = [
        {
          role: "system",       
          content:
            `今天是 ${today}。` +
            "你的名字叫卯卯，你可以帮助用户回答在杭州旅游相关问题，可以帮助用户规划游玩路线,只需回答旅游相关问题，不要凭空编造。",
        },
        { role: "user", content: message },
      ];

      // ---------- 工具调用循环 ----------
      // 模型可能连续调用多次工具（比如先查天气、再查车票），
      // 所以用循环处理，直到模型给出最终文字回答为止
      for (let round = 1; round <= MAX_TOOL_ROUNDS; round++) {
        const stream = await callWithRetry({
          model: SILICONFLOW_MODEL,
          messages,
          tools: toolDefinitions, // 把所有工具的"说明书"传给模型
          stream: true, // 流式输出
        });

        // 一边流式接收，一边累积本轮结果
        let contentBuf = ""; // 本轮模型输出的文字
        // 流式模式下，一次工具调用的 id/name/arguments 会分散在多个 chunk 里，
        // 需要按 index 分片累积，拼回完整的调用信息
        const toolCallMap = new Map();

        for await (const chunk of stream) {
          if (closed) break;
          const delta = chunk.choices?.[0]?.delta;
          if (!delta) continue;

          // ① 普通文字 → 直接 SSE 推给前端（这就是"逐字输出"的来源）
          if (delta.content) {
            contentBuf += delta.content;
            send({ content: delta.content });
          }

          // ② 工具调用分片 → 按 index 累积
          if (delta.tool_calls) {
            for (const piece of delta.tool_calls) {
              const acc = toolCallMap.get(piece.index) || { id: "", name: "", arguments: "" };
              if (piece.id) acc.id = piece.id;
              if (piece.function?.name) acc.name += piece.function.name;
              if (piece.function?.arguments) acc.arguments += piece.function.arguments;
              toolCallMap.set(piece.index, acc);
            }
          }
        }

        // 本轮没有任何工具调用 → 模型已给出最终回答，结束对话
        if (toolCallMap.size === 0) {
          send({ done: true });
          return;
        }

        // ---------- 有工具调用：执行工具，把结果喂回模型 ----------
        // 先把模型"我要调工具"这个决定记入对话历史（OpenAI 格式强制要求）
        const assistantToolCalls = [...toolCallMap.values()].map((tc, i) => ({
          // 个别模型不返回 id 时兜底生成一个，保证与下面 role:"tool" 消息对得上
          id: tc.id || `call_${Date.now()}_${i}`,
          type: "function",
          function: { name: tc.name, arguments: tc.arguments },
        }));
        messages.push({
          role: "assistant",
          content: contentBuf || null,
          tool_calls: assistantToolCalls,
        });

        // 逐个执行工具
        for (const tc of assistantToolCalls) {
          // 通知前端"正在查询xxx"，可用于显示加载状态
          send({ tool: tc.function.name, status: "calling" });
          const result = await executeTool(tc.function.name, tc.function.arguments);
          send({ tool: tc.function.name, status: "done" });

          // 工具结果以 role:"tool" 消息喂回，tool_call_id 必须与上面的 id 对应
          messages.push({ role: "tool", tool_call_id: tc.id, content: result });
        }
        // 进入下一轮循环：模型基于工具结果继续生成（可能再次调用工具，也可能直接回答）
      }

      // 超过最大轮数仍未收敛，兜底结束
      send({ error: "工具调用轮数过多，请简化问题后重试" });
    } catch (err) {
      console.error("大模型调用失败:", err);
      send({ error: err.message });
    } finally {
      res.end();
    }
  }
}

module.exports = new ChatController();
