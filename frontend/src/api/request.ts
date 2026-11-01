/**
 * axios 请求封装
 * - 统一的实例配置（baseURL / 超时）
 * - 请求拦截器：自动携带 token
 * - 响应拦截器：统一拆包、业务错误提示、401 跳登录
 * 页面中不要直接使用 axios，统一通过本文件导出的 get/post 方法发起请求
 */
import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { showToast } from 'vant'
import { getToken, logout } from '@/utils/auth'
import router from '@/router'

/**
 * 后端统一响应结构
 * TODO: 字段名以真实接口为准，不一致时只改这里即可
 */
interface ApiResult<T = unknown> {
  /** 业务状态码，0 或 200 视为成功 */
  code: number
  /** 业务数据 */
  data: T
  /** 提示信息 */
  message: string
}

/** 创建 axios 实例 */
const service = axios.create({
  // 接口根地址从环境变量读取（.env.development / .env.production）
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

/** 请求拦截器：有 token 时放入请求头 */
service.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** 响应拦截器：统一处理 HTTP 错误与业务错误 */
service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResult

    // 非标准结构（如文件流）直接返回
    if (typeof res !== 'object' || res === null || !('code' in res)) {
      return response.data
    }

    // 业务成功：拆包只返回 data
    if (res.code === 0 || res.code === 200) {
      return res.data
    }

    // 登录态失效：清除本地登录态并回登录页
    if (res.code === 401) {
      handleUnauthorized()
    }

    showToast(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    // HTTP 层错误（网络异常、4xx、5xx）
    if (error.response?.status === 401) {
      handleUnauthorized()
    }
    showToast(error.response?.data?.message || error.message || '网络异常，请稍后重试')
    return Promise.reject(error)
  }
)

/** 401 统一处理：退出登录并跳转登录页 */
function handleUnauthorized() {
  logout()
  router.replace('/login')
}

/** GET 请求，返回拆包后的业务数据 */
export function get<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  // 响应拦截器已把返回值拆包为 data，这里断言为业务数据类型
  return service.get(url, { params, ...config }) as unknown as Promise<T>
}

/** POST 请求，返回拆包后的业务数据 */
export function post<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
  return service.post(url, data, config) as unknown as Promise<T>
}

