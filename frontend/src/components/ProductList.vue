<template>
  <div class="product-list">
    <div
      v-for="item in items"
      :key="item.id"
      class="product-item"
      @click="emit('select', item)"
    >
      <!-- 上：商品图片 -->
      <div class="product-image">
        <van-image :src="item.image" width="100%" height="100%" fit="cover" />
      </div>

      <!-- 中：商品描述（最多两行） -->
      <div class="product-desc">{{ item.desc }}</div>

      <!-- 下：价格 -->
      <div class="product-price">
        <span class="symbol">¥</span>
        <span class="amount">{{ item.price }}</span>
        <span v-if="item.unit" class="unit">/{{ item.unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductListItem } from '@/api'

interface Props {
  /** 商品列表数据 */
  items: ProductListItem[]
}

defineProps<Props>()

const emit = defineEmits<{
  /** 点击某个商品 */
  select: [item: ProductListItem]
}>()
</script>

<style scoped lang="less">
@text-main: #1f2a3d;
@text-sub: #8a94a6;
@price: #ff6b35;

.product-list {
  display: flex;
  margin-left: 16px;  
  gap: 10px;
  padding: 2px 16px 8px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.product-item {
  flex: 0 0 112px;
  width: 112px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(31, 62, 110, 0.08);
  scroll-snap-align: start;
  cursor: pointer;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.97);
  }

  .product-image {
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    line-height: 0;
  }

  .product-desc {
    height: 33px;
    padding: 8px 8px 0;
    font-size: 12px;
    line-height: 1.35;
    color: @text-main;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .product-price {
    display: flex;
    align-items: baseline;
    padding: 6px 8px 10px;
    font-weight: 700;
    color: @price;

    .symbol {
      font-size: 11px;
    }

    .amount {
      font-size: 16px;
      line-height: 1;
    }

    .unit {
      margin-left: 2px;
      font-size: 10px;
      font-weight: 400;
      color: @text-sub;
    }
  }
}
</style>
