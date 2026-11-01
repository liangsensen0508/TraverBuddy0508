<template>
  <div class="page">
    <!-- 头部欢迎区 -->
    <HomeHeader />

    <!-- 推荐问题卡片 + 换一换 -->
    <QuestionCard />

    <!-- 商品列表（横向滚动，点击进入详情页） -->
    <ProductList :items="products" @select="openProduct" />

    <!-- 消息列表（有消息后才出现） -->
    <div v-if="messages.length" class="message-list">
      <ChatMessage
        v-for="(msg, i) in messages"
        :key="i"
        :role="msg.role"
        :text="msg.text"
        :image="msg.image"
      >
        <!-- 大模型回复中的工具卡片：数据由模拟生成器随机产生 -->
        <TrainTicketCard v-if="msg.tool === 'train' && msg.train" v-bind="msg.train" />
        <WeatherCard
          v-else-if="msg.tool === 'weather' && msg.weather"
          v-bind="msg.weather"
        />
      </ChatMessage>
      <!-- 大模型「正在输入」loading 气泡 -->
      <ChatMessage v-if="loading" role="ai" loading />
      <!-- 消息末尾锚点：滚动到这里，保证最新消息可见 -->
      <div ref="listEndRef" class="list-end"></div>
    </div>

    <!-- 底部功能栏 + 输入框 -->
    <BottomBar v-model="message" @send="handleSend" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import HomeHeader from '@/components/HomeHeader.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import ProductList from '@/components/ProductList.vue'
import BottomBar from '@/components/BottomBar.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import TrainTicketCard from '@/components/TrainTicketCard.vue'
import WeatherCard from '@/components/WeatherCard.vue'
import { getTrainCardMock, getWeatherCardMock, type TrainCardData, type WeatherCardData } from '@/mock/cards'
import { chatApi, getProductListApi, type ProductListItem } from '@/api'

interface ChatMsg {
  role: 'user' | 'ai'
  text: string
  image?: string
  /** 大模型回复附带的工具卡片类型 */
  tool?: 'train' | 'weather'
  /** 火车票工具数据 */
  train?: TrainCardData
  /** 天气工具数据 */
  weather?: WeatherCardData
}

const message = ref('')
const messages = ref<ChatMsg[]>([])
/** 大模型是否正在回复 */
const loading = ref(false)
const router = useRouter()

/** 首页推荐位展示的商品列表（接口加载） */
const products = ref<ProductListItem[]>([])

/** 消息列表末尾的锚点，作为自动滚动的目标 */
const listEndRef = ref<HTMLElement>()

// 消息新增、流式文本追加或工具卡片更新后，等 DOM 渲染完成再滚到最新消息。
// 使用瞬时滚动，避免平滑动画跟不上持续输出的文字。
watch(messages, async () => {
  await nextTick()
  listEndRef.value?.scrollIntoView({ block: 'end' })
}, { deep: true })

/** 点击商品：跳到详情页并带上商品 id */
function openProduct(item: ProductListItem) {
  router.push({ name: 'goods-details', query: { id: item.id } })
}

/** 进入首页时拉取商品列表，供推荐位展示 */
onMounted(async () => {
  try {
    products.value = await getProductListApi()
  } catch {
    // 错误提示已由请求拦截器统一处理
  }
})

/** 根据问题内容判断要调用的工具 */
function detectTool(text: string): ChatMsg['tool'] {
  if (/车票|火车|高铁|动车/.test(text)) return 'train'
  if (/天气|气温|温度|下雨|降雨/.test(text)) return 'weather'
  return undefined
}

/** 发送用户消息，并把流式返回的文本逐步追加到同一条 AI 消息中 */
async function handleSend(payload: { text: string; image?: string }) {
  messages.value.push({ role: 'user', text: payload.text, image: payload.image })

  const tool = detectTool(payload.text)
  const question = payload.text || '用户发送了一张图片，请描述这张图片的内容'
  const aiMessage = reactive<ChatMsg>({ role: 'ai', text: '' })
  let aiStarted = false
  loading.value = true

  try {
    await chatApi(question, (chunk) => {
      // 首段文字到达前只显示加载动画，避免插入空白气泡
      if (!aiStarted) {
        aiStarted = true
        loading.value = false
        messages.value.push(aiMessage)
      }
      aiMessage.text += chunk
    })

    if (!aiStarted) {
      aiMessage.text = '（本次回复内容为空）'
      messages.value.push(aiMessage)
    }

    // 工具卡片目前是演示数据，后端返回真实工具结果后替换这里
    aiMessage.tool = tool
    aiMessage.train = tool === 'train' ? getTrainCardMock() : undefined
    aiMessage.weather = tool === 'weather' ? getWeatherCardMock() : undefined
  } catch {
    messages.value.push({ role: 'ai', text: '抱歉，AI 服务暂时不可用，请稍后再试' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
}

.message-list {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

// 滚动锚点本身无内容。
// scroll-margin-bottom 让滚动停靠时在锚点下方留出空间，避开固定底部的输入栏，
// 避免最后一条消息被输入框遮挡
.list-end {
  scroll-margin-bottom: 90px;
}
</style>
