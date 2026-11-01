<template>
  <!-- 占位元素：为固定底部面板预留固定空间，高度恒定，避免页面高度变化引起滚动抖动 -->
  <div class="bottom-placeholder"></div>

  <!-- 固定底部面板：功能按钮在上，输入框在下 -->
  <div class="bottom-bar">
    <!-- 未输入且未向下滚动时显示五个功能按钮，输入或下滑时收起 -->
    <Transition name="fade-slide">
      <div v-if="showActions" class="action-bar">
        <div
          class="action-item"
          v-for="(item, i) in actions"
          :key="i"
          @click="onAction(item)"
        >
          <div class="action-icon">
            <van-icon :name="item.icon" size="20" />
          </div>
          <span class="action-label">{{ item.label }}</span>
        </div>
      </div>
    </Transition>

    <div class="input-bar">
      <!-- 已选图片预览 -->
      <div v-if="image" class="image-preview">
        <van-image :src="image" width="56px" height="56px" fit="cover" radius="6px" />
        <div class="remove-btn" @click="image = ''">
          <van-icon name="cross" size="12" />
        </div>
      </div>

      <div class="input-row">
        <van-icon
          name="photograph"
          size="22"
          class="image-btn"
          @click="pickImage"
        />
        <van-field
          v-model="message"
          placeholder="请输入询问内容"
          class="chat-input"
          :border="false"
          @keyup.enter="handleSend"
        />
        <van-button
          type="primary"
          class="send-btn"
          :disabled="!message.trim() && !image"
          @click="handleSend"
        >
          发送
        </van-button>
      </div>

      <!-- 隐藏的文件选择框 -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="file-input"
        @change="onFileChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const message = defineModel<string>({ default: '' })

const router = useRouter()

const emit = defineEmits<{
  send: [payload: { text: string; image?: string }]
}>()

interface ActionItem {
  /** 图标名 */
  icon: string
  /** 按钮文案 */
  label: string
  /** 点击后跳转的路由路径 */
  path?: string
}

const image = ref('')
const fileInputRef = ref<HTMLInputElement>()

/** 是否处于向下滚动状态：向下滑隐藏按钮，向上滑重新出现 */
const isScrollingDown = ref(false)
let lastScrollY = 0

function onScroll() {
  const y = window.scrollY
  // 抖动小于 4px 忽略，避免轻微晃动导致按钮闪烁
  if (Math.abs(y - lastScrollY) < 4) return
  isScrollingDown.value = y > lastScrollY
  lastScrollY = y
}

onMounted(() => {
  lastScrollY = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

// 未输入内容，且没有向下滚动时，才显示底部五个功能按钮
const showActions = computed(
  () => !isScrollingDown.value && !message.value.trim() && !image.value
)

const actions: ActionItem[] = [
  { icon: 'search', label: '查询车票' },
  { icon: 'guide-o', label: '查询天气' },
  { icon: 'user-o', label: '个人中心', path: '/profile' },
  { icon: 'shop-o', label: '旅游团购', path: '/goods-list' },
  { icon: 'warning-o', label: '一键投诉', path: '/complaint' },
]

/** 点击功能按钮：有配置跳转路径的直接跳转 */
function onAction(item: ActionItem) {
  if (item.path) router.push(item.path)
}

/** 打开系统文件选择框 */
function pickImage() {
  fileInputRef.value?.click()
}

/** 把选中的图片读成 base64，放进预览 */
function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !file.type.startsWith('image/')) return

  const reader = new FileReader()
  reader.onload = () => {
    image.value = reader.result as string
  }
  reader.readAsDataURL(file)

  // 清空 value，否则再次选择同一张图不会触发 change
  input.value = ''
}

/** 发送：文本或图片至少有一个才触发 */
function handleSend() {
  const text = message.value.trim()
  if (!text && !image.value) return
  emit('send', { text, image: image.value || undefined })
  message.value = ''
  image.value = ''
}
</script>

<style scoped lang="less">
@primary: #3d9bff;
@text-sub: #666;

.action-bar {
  display: flex;
  justify-content: space-around;
  padding: 0 16px;

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;

    .action-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #e8f4ff, #d0e8ff);
      display: flex;
      align-items: center;
      justify-content: center;
      color: @primary;
    }

    .action-label {
      font-size: 12px;
      color: @text-sub;
    }
  }
}

// 功能按钮显隐过渡
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

// 占位元素：高度恒定。若随按钮显隐在 0/75 之间变化，
// 滚到底部时页面高度收缩会让浏览器回拉 scrollY，被误判为「向上滑」，
// 从而按钮显示 → 高度恢复 → 再次判定向下滑，形成无限抖动循环
.bottom-placeholder {
  height: 75px;
}

// 固定定位容器：功能按钮悬浮在输入框上方，本身透明无背景
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
}

.input-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

  .image-preview {
    position: relative;
    align-self: flex-start;
    line-height: 0;
    border-radius: 6px;
    overflow: visible;

    .remove-btn {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .image-btn {
    flex-shrink: 0;
    color: @text-sub;
  }

  .chat-input {
    flex: 1;
    background: #f5f5f5;
    border-radius: 20px;
    padding: 4px 16px;
  }

  .send-btn {
    flex-shrink: 0;
    border-radius: 20px;
  }

  .file-input {
    display: none;
  }
}
</style>
