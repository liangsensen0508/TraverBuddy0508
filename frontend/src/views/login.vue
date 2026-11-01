<template>
  <div class="login-page">
    <van-nav-bar left-arrow :border="false" @click-left="goBack" />
    <!-- 顶部品牌区：吉祥物 + 产品名 -->
    <div class="brand">
      <div class="brand-img">
        <img src="@/assets/mm1.jpg" alt="云游宝" />
      </div>
      <h1 class="brand-title">欢迎回到云游宝</h1>
      <p class="brand-sub">登录后开启你的专属旅行助手</p>
    </div>

    <!-- 登录表单卡片 -->
    <div class="form-card">
      <van-field
        v-model="form.username"
        class="form-field"
        left-icon="user-o"
        placeholder="请输入用户名"
      />
      <van-field
        v-model="form.password"
        class="form-field"
        :type="showPassword ? 'text' : 'password'"
        left-icon="lock"
        placeholder="请输入密码"
        :right-icon="showPassword ? 'eye-o' : 'closed-eye'"
        @click-right-icon="showPassword = !showPassword"
      />

      <!-- 登录按钮：loading 期间禁止重复点击 -->
      <van-button
        type="primary"
        round
        block
        class="login-btn"
        :loading="submitting"
        loading-text="登录中..."
        @click="onLogin"
      >
        登录
      </van-button>

      <!-- 注册入口 -->
      <div class="footer-link">
        <span class="tip">还没有账号？</span>
        <span class="link" @click="goRegister">立即注册</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { setUserInfo, setToken } from '@/utils/auth'
import { loginApi } from '@/api'

const router = useRouter()
const route = useRoute()

/** 表单数据：用户名 + 密码 */
const form = reactive({
  username: '',
  password: '',
})

/** 点击返回：返回上一页 */
function goBack() {
  router.replace('/')
}

/** 是否明文显示密码 */
const showPassword = ref(false)

/** 是否正在登录：用于按钮 loading 与防重复点击 */
const submitting = ref(false)

/** 表单校验：用户名、密码非空 */
function validate() {
  if (!form.username.trim()) {
    showToast('请输入用户名')
    return false
  }
  if (!form.password) {
    showToast('请输入密码')
    return false
  }
  return true
}

/**
 * 登录提交：调用 POST /user/login
 * 成功后保存 token 与用户信息，并回到登录前想去的页面（没指定就回首页）；
 * 失败由响应拦截器统一提示
 */
async function onLogin() {
  if (!validate()) return

  submitting.value = true
  try {
    const res = await loginApi({
      username: form.username.trim(),
      password: form.password,
    })
    if (res?.token) setToken(res.token)
    setUserInfo({
      nickname: form.username.trim(),
      phone: res?.phone || '',  
      avatar: res?.avatar,
    })
    showToast('登录成功')
    // redirect 由「需要登录」的页面带过来，例如商品详情 /goods-details?id=xxx
    // 只接受站内路径（以 / 开头），防止被构造成外链跳走
    const redirect = route.query.redirect as string | undefined
    const target = redirect?.startsWith('/') ? redirect : '/'
    setTimeout(() => router.replace(target), 400)
  } catch {
    // 错误提示已由响应拦截器处理
  } finally {
    submitting.value = false
  }
}

/** 跳转到注册页 */
function goRegister() {
  router.push('/register')
}
</script>

<style scoped lang="less">
@primary: #3d9bff;
@text-main: #1f2a3d;
@text-sub: #8a94a6;

.login-page {
  min-height: 100vh;
  padding: 10px 24px calc(24px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, #eaf4ff 0%, #f7f9fc 40%);
  :deep(.van-nav-bar) {
    background: transparent;
  }
}

/* 顶部品牌区 */
.brand {
  display: flex;
  flex-direction: column;
  align-items: center;

  .brand-img {
    width: 88px;
    height: 88px;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(61, 155, 255, 0.25);
    background: #fff;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }
  }

  .brand-title {
    margin: 16px 0 0;
    font-size: 22px;
    font-weight: 700;
    color: @text-main;
  }

  .brand-sub {
    margin: 6px 0 0;
    font-size: 13px;
    color: @text-sub;
  }
}

/* 表单卡片 */
.form-card {
  margin-top: 36px;
  padding: 20px 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(31, 62, 110, 0.06);

  // 输入框：去掉 Vant 默认下边框，改成浅灰圆角块
  :deep(.form-field) {
    padding: 12px;
    background: #f7f9fc;
    border-radius: 10px;

    & + .form-field {
      margin-top: 12px;
    }

    &::after {
      display: none;
    }

    .van-field__left-icon {
      color: @text-sub;
      margin-right: 6px;
    }

    .van-field__control {
      font-size: 14px;
      color: @text-main;
    }

    .van-field__right-icon {
      color: @text-sub;
    }
  }

  .login-btn {
    margin-top: 20px;
    height: 46px;
    font-size: 15px;
    background: linear-gradient(135deg, #4aa8ff, #3d9bff);
    border: none;
    box-shadow: 0 6px 16px rgba(61, 155, 255, 0.3);
  }

  .footer-link {
    margin-top: 16px;
    text-align: center;
    font-size: 13px;

    .tip {
      color: @text-sub;
    }

    .link {
      color: @primary;
      font-weight: 600;
      cursor: pointer;
    }
  }
}
</style>
