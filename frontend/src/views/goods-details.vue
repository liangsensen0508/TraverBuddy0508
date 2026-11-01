<template>
  <div class="detail-page">
    <!-- 顶栏 -->
    <van-nav-bar
      title="商品详情"
      left-arrow
      :border="false"
      @click-left="onBack"
    />

    <!-- 加载中 / 加载失败 -->
    <div v-if="loading" class="detail-status">加载中...</div>
    <div v-else-if="!product" class="detail-status">商品不存在或加载失败</div>

    <template v-if="product">
    <!-- 图片轮播 -->
    <van-swipe class="gallery" :autoplay="3000" indicator-color="#fff">
      <van-swipe-item v-for="(img, i) in product.gallery" :key="i">
        <van-image :src="img" width="100%" height="100%" fit="cover" />
      </van-swipe-item>
    </van-swipe>

    <!-- 商品信息卡 -->
    <div class="info-card">
      <h2 class="title">{{ product.title }}</h2>

      <div class="meta">
        <div class="rating">
          <van-icon name="star" size="12" />
          {{ product.rating }}
          <span>· {{ product.review_count }}条评价</span>
        </div>
        <span>{{ product.sales }}</span>
      </div>

      <div class="price-row">
        <div class="price">
          <span class="symbol">¥</span>
          <span class="amount">{{ product.price }}</span>
          <span class="unit">{{ product.unit }}/人</span>
        </div>
        <span class="original">¥{{ product.original_price }}</span>
        <span class="discount-tag">{{ product.discount_tag }}</span>
      </div>

      <div class="tags">
        <span v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>

    <!-- 行程亮点 -->
    <section class="section">
      <div class="section-title">行程亮点</div>
      <div v-for="item in product.highlights" :key="item.title" class="highlight">
        <span class="dot"></span>
        <div>
          <div class="highlight-title">{{ item.title }}</div>
          <div class="highlight-desc">{{ item.desc }}</div>
        </div>
      </div>
    </section>

    <!-- 费用说明 -->
    <section class="section">
      <div class="section-title">费用说明</div>
      <div class="cost-row">
        <span class="label in">含</span>
        <span class="content">{{ product.included.join('、') }}</span>
      </div>
      <div class="cost-row">
        <span class="label out">不含</span>
        <span class="content">{{ product.excluded.join('、') }}</span>
      </div>
    </section>

    <!-- 预订须知 -->
    <section class="section">
      <div class="section-title">预订须知</div>
      <div v-for="(notice, i) in product.notices" :key="i" class="notice-item">
        <span class="notice-dot"></span>
        <span>{{ notice }}</span>
      </div>
    </section>

    <!-- 用户评价 -->
    <section class="section">
      <div class="section-title">用户评价</div>
      <div v-for="review in product.reviews" :key="review.name" class="review">
        <div class="review-avatar">{{ review.name.slice(0, 1) }}</div>
        <div class="review-body">
          <div class="review-head">
            <span class="name">{{ review.name }}</span>
            <span class="date">{{ review.date }}</span>
          </div>
          <div class="stars">
            <van-icon v-for="n in 5" :key="n" name="star" size="11" />
          </div>
          <div class="review-text">{{ review.content }}</div>
        </div>
      </div>
    </section>

    <!-- 底部操作栏 -->
    <div class="booking-bar">
      <div class="icon-btn">
        <van-icon name="service" size="20" />
        <span>客服</span>
      </div>
      <div class="icon-btn" @click="onFavorite">
        <van-icon :name="favorited ? 'star' : 'star-o'" size="20" />
        <span>收藏</span>
      </div>
      <div class="book-btn" :class="{ disabled: submitting }" @click="onBook">
        {{ submitting ? '下单中...' : '立即预订' }}
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getProductDetailApi, createPayApi, type ProductDetail } from '@/api'
import { isLoggedIn } from '@/utils/auth'

const route = useRoute()
const router = useRouter()
const favorited = ref(false)

/** 当前商品详情，加载成功前为 null */
const product = ref<ProductDetail | null>(null)
const loading = ref(false)

/** 收藏状态暂存于当前页面，接入收藏接口后再持久化 */
function onFavorite() {
  favorited.value = !favorited.value
  showToast(favorited.value ? '已收藏' : '已取消收藏')
}

/** 是否正在下单：防止重复点击 */
const submitting = ref(false)

/**
 * 立即预订：先检查登录，再创建订单并跳转支付宝收银台
 * 后端返回的 pay_form 是一段自动提交的 HTML 表单，
 * 写入页面后表单自动提交，浏览器随即跳到支付宝收银台；
 * 支付完成后支付宝把用户带回后端 /pay/return，再 302 到前端 /pay-result 结果页
 */
async function onBook() {
  if (!isLoggedIn()) {
    showToast('请先登录')
    // 带上当前页面地址，登录成功后能自动回到这个商品详情
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (!product.value || submitting.value) return

  submitting.value = true
  try {
    const res = await createPayApi(product.value.id)
    // 记下订单号，结果页拿不到回跳参数时兜底用
    sessionStorage.setItem('pay_order_no', res.order_no)
    // 把支付表单写入页面并触发提交，跳转支付宝收银台
    const container = document.createElement('div')
    container.innerHTML = res.pay_form
    document.body.appendChild(container)
    container.querySelector('form')?.submit()
  } catch {
    // 错误提示已由请求拦截器统一处理（如已有待支付订单）
  } finally {
    submitting.value = false
  }
}

/** 返回上一页，没有历史记录时回首页 */
function onBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

/** 进入页面时按 query.id 拉取商品详情 */
onMounted(async () => {
  const id = route.query.id as string | undefined
  if (!id) {
    showToast('缺少商品参数')
    return
  }
  loading.value = true
  try {
    product.value = await getProductDetailApi(id)
  } catch {
    // 错误提示已由请求拦截器统一处理
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="less">
@primary: #3d9bff;
@text-main: #1f2a3d;
@text-sub: #8a94a6;
@price: #ff6b35;

.detail-page {
  min-height: 100vh;
  padding-bottom: 92px;

  .detail-status {
    padding: 60px 0;
    font-size: 13px;
    text-align: center;
    color: @text-sub;
  }

  :deep(.van-nav-bar) {
    background: #fff;
  }

  .gallery {
    height: 240px;

    :deep(.van-swipe-item) {
      line-height: 0;
    }
  }

  .info-card {
    position: relative;
    z-index: 1;
    margin: -18px 12px 0;
    padding: 16px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(31, 62, 110, 0.1);

    .title {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      line-height: 1.4;
      color: @text-main;
    }

    .meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 12px;
      color: @text-sub;

      .rating {
        display: flex;
        align-items: center;
        gap: 2px;
        font-weight: 600;
        color: #ff9500;

        span {
          font-weight: 400;
          color: @text-sub;
        }
      }
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-top: 12px;

      .price {
        display: flex;
        align-items: baseline;
        font-weight: 700;
        color: @price;

        .symbol {
          font-size: 13px;
        }

        .amount {
          font-size: 24px;
          line-height: 1;
        }

        .unit {
          margin-left: 2px;
          font-size: 11px;
          font-weight: 400;
          color: @text-sub;
        }
      }

      .original {
        font-size: 12px;
        color: #b6bfcc;
        text-decoration: line-through;
      }

      .discount-tag {
        margin-left: auto;
        padding: 2px 8px;
        font-size: 11px;
        color: @price;
        background: #fff1ec;
        border-radius: 10px;
      }
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;

      .tag {
        padding: 3px 8px;
        font-size: 11px;
        color: @primary;
        background: #eaf4ff;
        border-radius: 6px;
      }
    }
  }

  .section {
    margin: 12px;
    padding: 16px;
    background: #fff;
    border-radius: 16px;

    .section-title {
      position: relative;
      padding-left: 10px;
      font-size: 15px;
      font-weight: 700;
      color: @text-main;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        width: 3px;
        height: 14px;
        border-radius: 2px;
        background: @primary;
        transform: translateY(-50%);
      }
    }

    .highlight {
      display: flex;
      gap: 10px;
      margin-top: 12px;

      .dot {
        flex-shrink: 0;
        width: 6px;
        height: 6px;
        margin-top: 6px;
        border-radius: 50%;
        background: @primary;
      }

      .highlight-title {
        font-size: 13px;
        font-weight: 600;
        color: @text-main;
      }

      .highlight-desc {
        margin-top: 2px;
        font-size: 12px;
        line-height: 1.5;
        color: @text-sub;
      }
    }

    .cost-row {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      font-size: 13px;
      line-height: 1.6;

      .label {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        height: 20px;
        padding: 0 8px;
        font-size: 11px;
        border-radius: 4px;

        &.in {
          color: #14a06a;
          background: #e7f8f0;
        }

        &.out {
          color: #d4380d;
          background: #fff1f0;
        }
      }

      .content {
        color: @text-main;
      }
    }

    .notice-item {
      display: flex;
      gap: 6px;
      margin-top: 10px;
      font-size: 12px;
      line-height: 1.6;
      color: #5b6b80;

      .notice-dot {
        flex-shrink: 0;
        width: 4px;
        height: 4px;
        margin-top: 8px;
        border-radius: 50%;
        background: #c0ccda;
      }
    }

    .review {
      display: flex;
      gap: 10px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f0f3f8;

      &:nth-child(2) {
        border-top: none;
      }

      .review-avatar {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        color: @primary;
        background: linear-gradient(135deg, #eaf4ff, #d6e9ff);
        border-radius: 50%;
      }

      .review-body {
        flex: 1;
        min-width: 0;

        .review-head {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .name {
            font-size: 12px;
            font-weight: 600;
            color: @text-main;
          }

          .date {
            font-size: 11px;
            color: @text-sub;
          }
        }

        .stars {
          display: flex;
          gap: 1px;
          margin-top: 3px;
          color: #ffb300;
        }

        .review-text {
          margin-top: 6px;
          font-size: 12px;
          line-height: 1.6;
          color: #5b6b80;
        }
      }
    }
  }

  .booking-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 16px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);

    .icon-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      font-size: 10px;
      color: #66768c;

      &:active {
        opacity: 0.7;
      }
    }

    .book-btn {
      flex: 1;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 600;
      color: #fff;
      background: linear-gradient(135deg, #6db8ff, @primary);
      border-radius: 22px;
      box-shadow: 0 6px 14px rgba(61, 155, 255, 0.35);

      &:active {
        opacity: 0.9;
      }

      &.disabled {
        opacity: 0.6;
        pointer-events: none;
      }
    }
  }
}
</style>
