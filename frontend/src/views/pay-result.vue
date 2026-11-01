<template>
  <div class="pay-result">
    <van-nav-bar title="支付结果" :border="false" />

    <!-- 查询中：转圈 + 提示 -->
    <div v-if="state === 'loading'" class="result-body">
      <van-loading size="48" vertical>正在确认支付结果...</van-loading>
    </div>

    <!-- 支付成功 -->
    <div v-else-if="state === 'PAID'" class="result-body">
      <van-icon name="checked" class="icon success" />
      <h2 class="title">支付成功</h2>
      <p class="sub">已支付 ¥{{ payAmount }}</p>
    </div>

    <!-- 订单已过期 / 取消 -->
    <div v-else-if="state === 'CANCELED'" class="result-body">
      <van-icon name="clock" class="icon warn" />
      <h2 class="title">订单已过期</h2>
      <p class="sub">订单超过 30 分钟未支付，已自动取消</p>
    </div>

    <!-- 轮询超时：无法自动确认 -->
    <div v-else class="result-body">
      <van-icon name="info-o" class="icon warn" />
      <h2 class="title">暂时无法确认支付结果</h2>
      <p class="sub">如果你已完成支付，稍后可回到本页重新查询</p>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <van-button
        v-if="state !== 'loading'"
        round
        block
        type="primary"
        @click="startPolling"
      >
        重新查询
      </van-button>
      <van-button round block plain @click="router.replace('/')">返回首页</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPayStatusApi, type PayStatus } from '@/api'

const route = useRoute()
const router = useRouter()

/** 页面状态：loading 查询中，其余为查询得到的订单状态或超时 */
const state = ref<'loading' | PayStatus | 'TIMEOUT'>('loading')
/** 订单金额，支付成功后展示 */
const payAmount = ref('')

/** 轮询间隔与次数上限：2 秒一次，最多查 30 次（约 1 分钟） */
const POLL_INTERVAL = 2000
const MAX_POLLS = 30
let pollCount = 0
let timer: number | undefined

/** 订单号：优先取回跳参数，拿不到时用下单时存的本页备份 */
function resolveOrderNo(): string {
  return (route.query.orderNo as string) || sessionStorage.getItem('pay_order_no') || ''
}

/**
 * 轮询订单状态直到得到结果：
 * 后端查询时会先向支付宝查一次真实状态，支付成功即返回 PAID
 */
async function poll() {
  const orderNo = resolveOrderNo()
  if (!orderNo) {
    state.value = 'TIMEOUT'
    return
  }
  try {
    const res = await getPayStatusApi(orderNo)
    payAmount.value = res.pay_amount
    if (res.status === 'PAID' || res.status === 'CANCELED') {
      state.value = res.status
      return
    }
  } catch {
    // 单次查询失败不中断，继续在时间窗口内重试
  }
  pollCount += 1
  if (pollCount >= MAX_POLLS) {
    state.value = 'TIMEOUT'
    return
  }
  timer = window.setTimeout(poll, POLL_INTERVAL)
}

/** 手动重新查询：重置计数后立即开始 */
function startPolling() {
  clearTimeout(timer)
  pollCount = 0
  state.value = 'loading'
  poll()
}

onMounted(startPolling)
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped lang="less">
@primary: #3d9bff;
@text-main: #1f2a3d;
@text-sub: #8a94a6;

.pay-result {
  min-height: 100vh;
  background: #f5f7fa;
}

.result-body {
  padding: 80px 24px 40px;
  text-align: center;

  .icon {
    font-size: 64px;

    &.success {
      color: #14a06a;
    }

    &.warn {
      color: #ff9500;
    }
  }

  .title {
    margin: 20px 0 0;
    font-size: 20px;
    font-weight: 700;
    color: @text-main;
  }

  .sub {
    margin: 10px 0 0;
    font-size: 13px;
    color: @text-sub;
  }
}

.actions {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
