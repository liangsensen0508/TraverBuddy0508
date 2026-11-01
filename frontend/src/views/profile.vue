<template>
  <div class="profile-page">
    <!-- 顶部用户卡片：蓝色渐变背景 -->
    <div class="user-card">
      <van-nav-bar
        title="个人中心"
        left-arrow
        :border="false"
        @click-left="onBack"
      />
      <div class="user-info">
        <div class="avatar">
          <img v-if="user?.avatar" :src="user.avatar" alt="头像" />
          <van-icon v-else name="manager" size="36" />
        </div>
        <div class="user-meta">
          <p class="nickname">{{ user?.nickname || '未登录' }}</p>
          <p class="phone">{{ maskedPhone }}</p>
        </div>
        <van-icon name="arrow" class="arrow" />
      </div>
    </div>    <!-- 资产栏：订单 / 收藏（数字为占位，接入接口后替换） -->
    <div class="stats-card">
      <div class="stat-item" v-for="s in stats" :key="s.label">
        <p class="stat-num">{{ s.value }}</p>
        <p class="stat-label">{{ s.label }}</p>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-card">
      <van-cell-group :border="false">
        <van-cell
          v-for="m in menus"
          :key="m.label"
          :title="m.label"
          is-link
          @click="onMenu(m.label)"
        >
          <template #icon>
            <van-icon :name="m.icon" class="menu-icon" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 退出登录 -->
    <div class="logout-wrap">
      <van-button plain block round class="logout-btn" @click="onLogout">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { getUserInfo, logout } from '@/utils/auth'

const router = useRouter()

/** 路由守卫已保证用户登录；读取一次即可，页面内不会修改用户信息 */
const user = getUserInfo()

/** 手机号脱敏显示：138****8888 */
const maskedPhone = computed(() => {
  const phone = user?.phone || ''
  return phone ? phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') : '登录后同步个人信息'
})

/** 资产栏占位数据，TODO: 接入接口后换成真实数据 */
const stats = [
  { label: '我的订单', value: 0 },
  { label: '收藏', value: 0 },
]

/** 功能菜单，TODO: 各页面开发后补充跳转逻辑 */
const menus = [
  { icon: 'orders-o', label: '我的订单' },
  { icon: 'service-o', label: '联系客服' },
  { icon: 'info-o', label: '关于我们' },
]

/** 菜单对应功能尚未开发 */
function onMenu(label: string) {
  showToast(`「${label}」功能即将上线`)
}

/** 用户确认后清除本地登录态并返回登录页 */
async function onLogout() {
  try {
    await showConfirmDialog({ title: '退出登录', message: '确定要退出登录吗？' })
    logout()
    router.replace('/login')
  } catch {
    // 用户取消退出，无需处理
  }
}

/** 返回首页 */
function onBack() {
  router.push('/')
}
</script>

<style scoped lang="less">
@primary: #3d9bff;
@text-main: #1f2a3d;
@text-sub: #8a94a6;

.profile-page {
  min-height: 100vh;
  background: #f7f9fc;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

/* 顶部用户卡片 */
.user-card {
  background: linear-gradient(135deg, #4aa8ff, #3d9bff);
  padding-bottom: 40px;

  :deep(.van-nav-bar) {
    background: transparent;

    .van-nav-bar__title {
      color: #fff;
    }

    .van-icon {
      color: #fff;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    padding: 12px 20px 0;

    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }

    .user-meta {
      flex: 1;
      min-width: 0;
      margin-left: 14px;

      .nickname {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #fff;
      }

      .phone {
        margin: 6px 0 0;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.85);
      }
    }

    .arrow {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

/* 资产栏：向上悬浮盖住渐变背景 */
.stats-card {
  display: flex;
  margin: -24px 12px 0;
  padding: 14px 0;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(31, 62, 110, 0.06);

  .stat-item {
    flex: 1;
    text-align: center;

    & + .stat-item {
      border-left: 1px solid #f0f3f8;
    }

    .stat-num {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: @text-main;
    }

    .stat-label {
      margin: 4px 0 0;
      font-size: 12px;
      color: @text-sub;
    }
  }
}

/* 功能菜单 */
.menu-card {
  margin: 12px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(31, 62, 110, 0.06);

  .menu-icon {
    margin-right: 10px;
    font-size: 18px;
    color: @primary;
    vertical-align: -3px;
  }

  :deep(.van-cell) {
    padding: 14px 16px;
    font-size: 14px;
    color: @text-main;
  }
}

/* 退出登录 */
.logout-wrap {
  margin: 24px 12px 0;

  .logout-btn {
    height: 44px;
    font-size: 14px;
    color: #f56c6c;
    border-color: rgba(245, 108, 108, 0.4);
    background: #fff;
  }
}
</style>
