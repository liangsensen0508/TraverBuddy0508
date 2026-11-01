<template>
  <div class="chat-message" :class="role">
    <!-- AI 用卯卯头像；用户用蓝色图标头像，避免两边头像完全一样 -->
    <img v-if="role === 'ai'" class="message-avatar" src="@/assets/mm2.jpg" alt="卯卯" />
    <div v-else class="message-avatar user-avatar">
      <van-icon name="user-o" size="18" />
    </div>

    <!-- 消息内容：loading 时显示打字动画，否则图片在上、文本在下 -->
    <div class="message-content">
      <div v-if="loading" class="message-text loading">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <template v-else>
        <div v-if="image" class="message-image">
          <van-image :src="image" width="160px" fit="cover" radius="8px" />
        </div>
        <!-- AI 消息渲染 Markdown，用户消息按纯文本显示 -->
        <div v-if="text && role === 'ai'" class="message-text" v-html="renderedText"></div>
        <div v-else-if="text" class="message-text">{{ text }}</div>
      </template>
      <!-- 工具卡片（火车票 / 天气等）由使用方通过默认插槽插入 -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface Props {
  /** 消息来源：user 用户 / ai 大模型 */
  role?: 'user' | 'ai'
  /** 文本内容（AI 消息为 Markdown 格式） */
  text?: string
  /** 图片地址（可选） */
  image?: string
  /** 是否为「正在输入」loading 状态 */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  role: 'user',
  text: '',
  image: '',
  loading: false,
})

/**
 * 把 AI 回复的 Markdown 文本渲染成安全的 HTML。
 * marked 负责把 # 标题、**加粗**、- 列表等 Markdown 转成 HTML，
 * DOMPurify 负责过滤脚本等危险标签，防止 XSS。
 * 用户自己发的消息不需要渲染，模板里按纯文本显示。
 */
const renderedText = computed(() => {
  const html = marked.parse(props.text) as string
  return DOMPurify.sanitize(html)
})
</script>

<style scoped lang="less">
@primary: #3d9bff;
@text-main: #333;

.chat-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 16px;

  // 用户消息：头像在右，内容靠右
  &.user {
    flex-direction: row-reverse;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border-radius: 50%;
    object-fit: cover;
    object-position: center top;
  }

  // 用户头像：纯 CSS 圆形图标，和 AI 的照片头像区分开
  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: linear-gradient(135deg, #6db8ff, @primary);
  }

  .message-content {
    flex: 1;
    min-width: 0;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  &.user .message-content {
    align-items: flex-end;
  }

  .message-image {
    border-radius: 8px;
    overflow: hidden;
    line-height: 0;
  }

  .message-text {
    padding: 10px 14px;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
    white-space: pre-wrap;
  }

  // 大模型气泡：白底、左尖角
  &.ai .message-text {
    background: #fff;
    color: @text-main;
    border-radius: 2px 12px 12px 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    // Markdown 渲染成 HTML 后由块级元素控制换行，不再需要 pre-wrap
    white-space: normal;

    // 下面都是 Markdown 渲染出的元素样式（v-html 插入，需 :deep 命中）
    :deep(p) {
      margin: 0 0 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4) {
      margin: 10px 0 6px;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.4;
    }

    :deep(ul),
    :deep(ol) {
      margin: 0 0 8px;
      padding-left: 18px;
    }

    :deep(li) {
      margin: 3px 0;
    }

    :deep(strong) {
      font-weight: 700;
    }

    :deep(a) {
      color: @primary;
      text-decoration: none;
    }

    :deep(code) {
      padding: 1px 4px;
      font-size: 12px;
      background: #f2f4f7;
      border-radius: 4px;
    }

    :deep(pre) {
      margin: 8px 0;
      padding: 10px;
      overflow-x: auto;
      background: #f2f4f7;
      border-radius: 8px;
    }

    :deep(pre code) {
      padding: 0;
      background: none;
    }
  }

  // 用户气泡：蓝底、右尖角
  &.user .message-text {
    background: @primary;
    color: #fff;
    border-radius: 12px 2px 12px 12px;
  }

  // 大模型「正在输入」三点动画
  .message-text.loading {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 20px;

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: @primary;
      animation: dot-blink 1.2s infinite;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes dot-blink {
  0%,
  60%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}
</style>
