<template>
  <div class="goods-list-page">
    <!-- 顶栏 -->
    <van-nav-bar
      title="旅游商品"
      left-arrow
      :border="false"
      @click-left="onBack"
    />

    <!-- 搜索 -->
    <van-search
      v-model="keyword"
      placeholder="搜索目的地 / 商品名称"
      shape="round"
      background="transparent"
    />

    <!-- 排序栏 -->
    <div class="sort-bar">
      <div
        v-for="s in sorts"
        :key="s.value"
        class="sort-item"
        :class="{ active: sort === s.value }"
        @click="sort = s.value"
      >
        {{ s.label }}
      </div>
      <span class="count">共 {{ list.length }} 件</span>
    </div>

    <!-- 商品列表 -->
    <div class="goods-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="goods-card"
        @click="openDetail(item.id)"
      >
        <van-image
          class="cover"
          :src="item.image"
          width="104px"
          height="104px"
          fit="cover"
          radius="10px"
        />

        <div class="goods-info">
          <div class="goods-title">{{ item.title }}</div>
          <div class="goods-desc">{{ item.desc }}</div>

          <div class="goods-tags">
            <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>

          <div class="goods-bottom">
            <div class="price">
              <span class="symbol">¥</span>
              <span class="amount">{{ item.price }}</span>
              <span class="unit">{{ item.unit }}/人</span>
            </div>
            <span class="sales">{{ item.sales }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="empty">加载中...</div>
    <!-- 空状态 -->
    <div v-else-if="!list.length" class="empty">暂无相关商品，换个关键词试试</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getProductListApi, type ProductListItem } from '@/api'

const router = useRouter()
const keyword = ref('')
const sort = ref<'default' | 'price' | 'rating'>('default')

/** 接口返回的全部商品 */
const products = ref<ProductListItem[]>([])
/** 是否加载中 */
const loading = ref(false)

const sorts = [
  { label: '综合推荐', value: 'default' },
  { label: '价格最低', value: 'price' },
  { label: '好评优先', value: 'rating' },
] as const

/** 搜索 + 排序后的商品列表 */
const list = computed(() => {
  const kw = keyword.value.trim()
  const arr = products.value.filter(
    (p) =>
      !kw ||
      p.title.includes(kw) ||
      p.desc.includes(kw) ||
      p.tags.some((t) => t.includes(kw))
  )

  if (sort.value === 'price') return [...arr].sort((a, b) => Number(a.price) - Number(b.price))
  if (sort.value === 'rating') return [...arr].sort((a, b) => Number(b.rating) - Number(a.rating))
  return arr
})

/** 点击商品：跳详情页并带上商品 id */
function openDetail(id: string) {
  router.push({ name: 'goods-details', query: { id } })
}

/** 返回上一页，没有历史记录时回首页 */
function onBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

/** 进入页面时拉取商品列表 */
onMounted(async () => {
  loading.value = true
  try {
    products.value = await getProductListApi()
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

.goods-list-page {
  min-height: 100vh;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));

  :deep(.van-nav-bar) {
    background: #fff;
  }

  :deep(.van-search) {
    padding: 8px 12px;
  }

  :deep(.van-search__content) {
    background: #fff;
    box-shadow: 0 2px 8px rgba(31, 62, 110, 0.06);
  }

  .sort-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 4px 16px 10px;

    .sort-item {
      position: relative;
      font-size: 13px;
      color: @text-sub;
      cursor: pointer;

      &.active {
        font-weight: 600;
        color: @primary;

        &::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -5px;
          width: 16px;
          height: 3px;
          border-radius: 2px;
          background: @primary;
          transform: translateX(-50%);
        }
      }
    }

    .count {
      margin-left: auto;
      font-size: 11px;
      color: @text-sub;
    }
  }

  .goods-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 12px;
  }

  .goods-card {
    display: flex;
    gap: 12px;
    padding: 10px;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(31, 62, 110, 0.06);
    cursor: pointer;
    transition: transform 0.15s ease;

    &:active {
      transform: scale(0.98);
    }

    .cover {
      flex-shrink: 0;
      line-height: 0;
    }

    .goods-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .goods-title {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.4;
      color: @text-main;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .goods-desc {
      margin-top: 4px;
      font-size: 12px;
      color: @text-sub;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .goods-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 6px;

      .tag {
        padding: 1px 6px;
        font-size: 10px;
        color: @primary;
        background: #eaf4ff;
        border-radius: 4px;
      }
    }

    .goods-bottom {
      display: flex;
      align-items: baseline;
      margin-top: 6px;

      .price {
        display: flex;
        align-items: baseline;
        font-weight: 700;
        color: @price;

        .symbol {
          font-size: 11px;
        }

        .amount {
          font-size: 17px;
          line-height: 1;
        }

        .unit {
          margin-left: 2px;
          font-size: 10px;
          font-weight: 400;
          color: @text-sub;
        }
      }

      .sales {
        margin-left: auto;
        font-size: 11px;
        color: @text-sub;
      }
    }
  }

  .empty {
    padding: 60px 0;
    font-size: 13px;
    text-align: center;
    color: @text-sub;
  }
}
</style>
