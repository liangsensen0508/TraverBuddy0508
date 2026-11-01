<template>
  <div class="header">
    <!-- 个人中心入口：未登录时会被路由守卫重定向到登录页 -->
    <div class="profile-entry" @click="goProfile">
      <van-icon name="manager" size="20" />
    </div>

    <div class="header-content">
      <div class="welcome-text">
        <p class="hi">Hi, 我叫卯卯</p>
        <p class="desc">你的专属旅游助手，可以帮助你规划行程和解答出游问题！</p>
      </div>
      <div class="img-container">
        <img src="@/assets/mm1.jpg" alt="云游宝" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

/** 点击个人中心：未登录时路由守卫会自动转到登录页 */
function goProfile() {
  router.push('/profile')
}
</script>

<style scoped lang="less">
@text-main: #333;

.header {
  position: relative;
  padding: 30px 20px 20px;

  // 右上角个人中心入口
  .profile-entry {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3d9bff;
    background: #eaf4ff;
    border-radius: 50%;
    cursor: pointer;
    z-index: 1;

    &:active {
      transform: scale(0.94);
    }
  }

  // 左右布局容器
  .header-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
  }

  // 左侧文案区
  .welcome-text {
    flex: 1;
    min-width: 0;

    .hi {
      font-size: 18px;
      font-weight: bold;
      color: @text-main;
      margin: 0 0 6px;
    }

    .desc {
      font-size: 13px;
      color: #555;
      line-height: 1.6;
      margin: 0;
    }
  }

  // 右侧人物图容器
  .img-container {
    width: 100px;
    height: 120px;
    flex-shrink: 0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(61, 155, 255, 0.2);
    background: #fff;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }
  }
}
</style>
