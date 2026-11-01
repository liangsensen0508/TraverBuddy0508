/** 项目接口与接口数据类型。页面统一从这里调用，不直接写请求路径。 */
import { get, post } from './request'

/* ---------------- 登录注册 ---------------- */

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 注册请求参数 */
export interface RegisterParams {
  username: string
  password: string
  phone: string
}

/** 登录成功返回（字段以后端实际返回为准） */
export interface LoginResult {
  token?: string
  phone?: string
  avatar?: string
}

/** 用户登录 */
export function loginApi(data: LoginParams) {
  return post<LoginResult>('/user/login', data)
}

/** 用户注册 */
export function registerApi(data: RegisterParams) {
  return post<unknown>('/user/register', data)
}

/* ---------------- AI 对话 ---------------- */

/** /chat 流式返回的单个数据块 */
export interface ChatChunk {
  /** 增量文本 */
  content?: string
  /** 是否为最后一块 */
  done?: boolean
}

/**
 * AI 对话（POST /chat，SSE 流式响应）
 * axios 无法增量读取流式响应，这里用 fetch 逐块解析，
 * 每收到一段文本就回调 onChunk，由页面实现打字机效果
 */
export async function chatApi(message: string, onChunk: (text: string) => void) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok || !res.body) {
    throw new Error('AI 对话请求失败')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  // 缓冲区：一个网络分包可能包含多条不完整的 data 行
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // 按行解析 SSE：每行格式为 `data: {"content":"..."}`
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      try {
        const chunk = JSON.parse(trimmed.slice(5).trim()) as ChatChunk
        if (chunk.content) onChunk(chunk.content)
        if (chunk.done) return
      } catch {
        // 忽略无法解析的行
      }
    }
  }
}

/* ---------------- 商品 ---------------- */

/** 行程亮点 */
export interface ProductHighlight {
  title: string
  desc: string
}

/** 用户评价 */
export interface ProductReview {
  name: string
  date: string
  content: string
}

/**
 * 商品列表项（字段与后端 GET /product/productList 返回一致）
 * price / rating / original_price 是 PostgreSQL NUMERIC，接口以字符串返回
 */
export interface ProductListItem {
  id: string
  image: string
  desc: string
  price: string
  unit?: string
  title: string
  sales: string
  rating: string
  original_price: string
  discount_tag: string
  tags: string[]
}

/** 商品详情（GET /product/productDetail 返回，jsonb 字段后端已解析为数组） */
export interface ProductDetail extends ProductListItem {
  review_count: string
  gallery: string[]
  highlights: ProductHighlight[]
  included: string[]
  excluded: string[]
  notices: string[]
  reviews: ProductReview[]
}

/** 获取商品列表 */
export function getProductListApi() {
  return get<ProductListItem[]>('/product/productList')
}

/** 获取商品详情 */
export function getProductDetailApi(id: string) {
  return get<ProductDetail>('/product/productDetail', { id })
}

/* ---------------- 支付 ---------------- */

/** 创建订单返回值（POST /pay/create） */
export interface CreatePayResult {
  /** 商户订单号 */
  order_no: string
  /** 金额，字符串如 "128.00" */
  pay_amount: string
  /** 订单过期时间 */
  expire_time: string
  /**
   * 支付宝支付表单 HTML：写入页面后表单自动提交，
   * 浏览器随即跳转到支付宝收银台
   */
  pay_form: string
}

/** 订单状态（GET /pay/status） */
export type PayStatus = 'WAIT_PAY' | 'PAID' | 'CANCELED'

/** 状态查询返回值 */
export interface PayStatusResult {
  status: PayStatus
  pay_amount: string
  expire_time: string
}

/** 创建支付订单并拿到支付宝支付表单 */
export function createPayApi(productId: string) {
  return post<CreatePayResult>('/pay/create', { productId })
}

/** 查询订单支付状态（后端会先向支付宝查一次真实状态再返回） */
export function getPayStatusApi(orderNo: string) {
  return get<PayStatusResult>('/pay/status', { orderNo })
}
