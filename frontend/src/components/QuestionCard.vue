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
        @click="handleSelect(item)"
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
// 点击推荐问题后把问题文本抛给父组件，由父组件直接发给 AI
const emit = defineEmits<{ select: [string] }>()

/** 杭州相关的默认推荐问题 */
const questions = [
  '杭州天气怎么样',
  '西湖有哪些必打卡的景点',
  '杭州三天两晚怎么安排行程',
  '去杭州坐高铁怎么买票',
  '杭州有哪些当地美食推荐',
]

/** 点击某个问题：通知父组件自动发送 */
function handleSelect(text: string) {
  emit('select', text)
}
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
