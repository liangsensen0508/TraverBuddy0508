/** 使用 localStorage 保存登录 token 和用户信息，统一维护本地登录态。 */

export interface UserInfo {
  /** 昵称 */
  nickname: string
  /** 手机号 */
  phone: string
  /** 头像地址，为空时页面显示默认头像 */
  avatar?: string
}

const USER_KEY = 'travel_user_info'
const TOKEN_KEY = 'travel_token'

/** 是否已登录 */
export function isLoggedIn(): boolean {
  return !!localStorage.getItem(USER_KEY)
}

/** 读取本地 token，未登录返回空字符串 */
export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || ''
}

/** 保存登录成功后后端返回的 token */
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

/** 读取当前登录用户信息，未登录返回 null */
export function getUserInfo(): UserInfo | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

/**
 * 保存登录成功的用户信息
 * TODO: 接入接口后，登录/注册成功时用后端返回的用户信息调用本方法
 */
export function setUserInfo(user: UserInfo) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/** 退出登录：清除本地登录态（用户信息 + token） */
export function logout() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
}
