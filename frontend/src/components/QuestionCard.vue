<template>
  <div class="question-card">
    <div class="card-header">
      <div class="avatar">
        <img src="@/assets/mm2.jpg" alt="卯卯" />
      </div>
      <span class="name">卯卯</span>
    </div>
    <div class="card-subtitle">你可以这样问我</div>
    <div class="question-list">
      <div
        v-for="item in questions"
        :key="item"
        class="question-item"
      >
        <van-icon name="chat-o" class="q-icon" />
        <span class="q-text">{{ item }}</span>
      </div>
    </div>
  </div>

  <div class="refresh-row">
    <van-button round size="small" icon="replay" type="primary" plain>
      换一换
    </van-button>
  </div>
</template>

<script setup lang="ts">
const questions = [
  '哀牢山可以进入探险旅游吗',
  '大理古城有哪些夜市可以逛',
  '昆明滇池可以游船吗',
  '带着家人到丽江旅游三天，帮我规划一个行程吧',
  '在云南旅游遇到黑导游怎么办',
]
</script>

<style scoped lang="less">
@primary: #3d9bff;
@text-main: #333;
@text-hint: #999;

.question-card {
  margin: 0 16px;
  background: #fff;
  border-radius: 16px;
  padding: 20px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        display: block;
      }
    }

    .name {
      font-size: 13px;
      font-weight: 500;
      color: @text-main;
    }
  }

  .card-subtitle {
    font-size: 13px;
    color: @text-hint;
    margin-bottom: 14px;
  }

  .question-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .question-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 14px;
      background: #f0f7ff;
      border-radius: 12px;
      font-size: 13px;
      color: @text-main;
      line-height: 1.5;
      cursor: pointer;
      transition: background 0.2s;

      &:active {
        background: #e0efff;
      }

      .q-icon {
        color: @primary;
        margin-top: 1px;
        flex-shrink: 0;
      }

      .q-text {
        flex: 1;
      }
    }
  }
}

.refresh-row {
  display: flex;
  justify-content: flex-start;
  margin-top: 15px;
  margin-bottom: 24px;
  margin-left: 16px;
}
</style>
