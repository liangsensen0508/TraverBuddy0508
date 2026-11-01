<template>
  <div class="register-page">
    <!-- 顶部导航：返回登录页 -->
    <van-nav-bar left-arrow :border="false" @click-left="goLogin" />

    <!-- 标题区 -->
    <div class="brand">
      <h1 class="brand-title">创建账号</h1>
      <p class="brand-sub">注册后即可使用云游宝的全部功能</p>
    </div>

    <!-- 注册表单卡片 -->
    <div class="form-card">
      <van-field
        v-model="form.username"
        class="form-field"
        maxlength="16"
        left-icon="user-o"
        placeholder="请输入用户名"
      />
      <van-field
        v-model="form.phone"
        class="form-field"
        type="tel"
        maxlength="11"
        left-icon="phone-o"
        placeholder="请输入手机号"
      />
      <van-field
        v-model="form.password"
        class="form-field"
        :type="showPassword ? 'text' : 'password'"
        left-icon="lock"
        placeholder="请设置密码（6-20 位）"
        :right-icon="showPassword ? 'eye-o' : 'closed-eye'"
        @click-right-icon="showPassword = !showPassword"
      />
      <van-field
        v-model="form.confirmPassword"
        class="form-field"
        :type="showPassword ? 'text' : 'password'"
        left-icon="shield-o"
        placeholder="请再次输入密码"
      />

      <!-- 协议勾选 -->
      <div class="agreement-row">
        <van-checkbox v-model="agreed" icon-size="14">
          <span class="agreement-text">
            我已阅读并同意
            <span class="link">《用户协议》</span>和<span class="link">《隐私政策》</span>
          </span>
        </van-checkbox>
      </div>

      <!-- 注册按钮：loading 期间禁止重复点击 -->
      <van-button
        type="primary"
        round
        block
        class="register-btn"
        :loading="submitting"
        loading-text="注册中..."
        @click="onRegister"
      >
        注册
      </van-button>

      <!-- 登录入口 -->
      <div class="footer-link">
        <span class="tip">已有账号？</span>
        <span class="link" @click="goLogin">去登录</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { registerApi } from '@/api'

const router = useRouter()
const route = useRoute()

/** 表单数据：用户名、手机号、密码、确认密码 */
const form = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

/** 是否明文显示密码 */
const showPassword = ref(false)

/** 是否同意协议 */
const agreed = ref(false)

/** 是否正在注册：用于按钮 loading 与防重复点击 */
const submitting = ref(false)

/** 表单校验：用户名、手机号、密码长度、两次密码一致、协议勾选 */
function validate() {
  if (!form.username.trim()) {
    showToast('请输入用户名')
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    showToast('请输入正确的手机号')
    return false
  }
  if (form.password.length < 6 || form.password.length > 20) {
    showToast('密码长度需为 6-20 位')
    return false
  }
  if (form.password !== form.confirmPassword) {
    showToast('两次输入的密码不一致')
    return false
  }
  if (!agreed.value) {
    showToast('请先阅读并同意用户协议')
    return false
  }
  return true
}

/**
 * 注册提交：调用 POST /user/register
 * 成功后跳转登录页，由用户登录后进入个人中心；失败由响应拦截器统一提示
 */
async function onRegister() {
  if (!validate()) return

  submitting.value = true
  try {
    await registerApi({
      username: form.username.trim(),
      password: form.password,
      phone: form.phone,
    })
    showToast('注册成功，请登录')
    // 注册只是建账号、不算登录，所以跳到登录页继续；
    // 带上 redirect（从登录页/详情页一路传过来的），登录成功后能回到原页面
    setTimeout(goLogin, 400)
  } catch {
    // 错误提示已由响应拦截器处理
  } finally {
    submitting.value = false
  }
}

/** 回到登录页：带上 redirect（有的话），登录成功后能回到用户最初想去的页面 */
function goLogin() {
  const redirect = route.query.redirect as string | undefined
  router.replace(redirect ? { path: '/login', query: { redirect } } : '/login')
}
</script>

<style scoped lang="less">
@primary: #3d9bff;
@text-main: #1f2a3d;
@text-sub: #8a94a6;

.register-page {
  min-height: 100vh;
  padding: 10px 24px calc(24px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, #eaf4ff 0%, #f7f9fc 40%);
  :deep(.van-nav-bar) {
    background: transparent;
  }
}

/* 标题区 */
.brand {
  padding: 8px 24px 0;

  .brand-title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: @text-main;
  }

  .brand-sub {
    margin: 8px 0 0;
    font-size: 13px;
    color: @text-sub;
  }
}

/* 表单卡片 */
.form-card {
  margin-top: 24px;
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

  .agreement-row {
    margin-top: 14px;

    :deep(.van-checkbox__label) {
      font-size: 12px;
      color: @text-sub;
    }

    .agreement-text .link {
      color: @primary;
    }
  }

  .register-btn {
    margin-top: 18px;
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
