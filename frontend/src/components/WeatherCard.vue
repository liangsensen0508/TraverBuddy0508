<template>
  <div class="weather-card">
    <!-- 顶部：城市 + 当前天气，仿手机天气 App 头部 -->
    <div class="header">
      <div class="city">
        <van-icon name="location-o" size="14" />
        <span>{{ city }}</span>
      </div>
      <span class="update">{{ updateTime }} 更新</span>
    </div>

    <!-- 当前温度：大字号，居中显示 -->
    <div class="now">
      <div class="now-temp">{{ temperature }}<span class="deg">°</span></div>
      <div class="now-cond">{{ condition }}</div>
      <div class="now-range">{{ high }}° / {{ low }}°</div>
    </div>

    <!-- 当前湿度、风速 -->
    <div class="meta">
      <span>湿度 {{ humidity }}</span>
      <span class="dot"></span>
      <span>风速 {{ wind }}</span>
    </div>

    <!-- 近 15 天预报：横向滑动，每列一天 -->
    <div class="forecast">
      <div class="forecast-title">近 15 天预报</div>
      <div class="forecast-scroll">
        <div v-for="(f, i) in forecast" :key="f.date" class="day">
          <span class="day-name">{{ dayLabel(f.date, i) }}</span>
          <WeatherIcon :condition="f.condition" class="day-icon" />
          <span class="day-high">{{ f.high }}°</span>
          <span class="day-low">{{ f.low }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

interface ForecastDay {
  /** 日期，如 "2026-11-01" */
  date: string
  /** 中文天气状况 */
  condition: string
  /** 最高温 */
  high: number
  /** 最低温 */
  low: number
}

interface Props {
  city: string
  temperature: number
  condition: string
  high: number
  low: number
  humidity: string
  wind: string
  updateTime: string
  /** 近 15 天预报 */
  forecast: ForecastDay[]
}

const props = defineProps<Props>()

/** 日期显示：今天 / 明天 / 周X */
function dayLabel(date: string, index: number): string {
  if (index === 0) return '今天'
  if (index === 1) return '明天'
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return week[new Date(date).getDay()]
}

/**
 * 天气小图标（按天气状况返回不同 SVG）。
 * 用渲染函数定义，避免在模板里堆大段 SVG，保持代码简洁。
 */
const WeatherIcon = (p: { condition: string }) => {
  const c = p.condition
  // 根据天气状况选图形：雨/雪/雷 -> 雨云；多云/阴/雾 -> 云；其余 -> 太阳
  const type = /雨|雪|雷/.test(c) ? 'rain' : /云|阴|雾|霾/.test(c) ? 'cloud' : 'sun'
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 1.8,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    width: 26,
    height: 26,
  }
  if (type === 'sun') {
    return h('svg', common, [
      h('circle', { cx: 12, cy: 12, r: 4, fill: 'currentColor', stroke: 'none' }),
      h('path', { d: 'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19' }),
    ])
  }
  if (type === 'cloud') {
    return h('svg', common, [h('path', { d: 'M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z' })])
  }
  return h('svg', common, [
    h('path', { d: 'M20 15.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3' }),
    h('path', { d: 'M16 14v6M8 14v6M12 16v6' }),
  ])
}
</script>

<style scoped lang="less">
.weather-card {
  width: 100%;
  max-width: 320px;
  box-sizing: border-box;
  padding: 16px;
  border-radius: 18px;
  color: #fff;
  // 手机天气 App 常用的蓝色渐变背景
  background: linear-gradient(160deg, #4a9eff 0%, #2b6fe0 100%);
  box-shadow: 0 6px 20px rgba(43, 111, 224, 0.3);
}

// 顶部城市行
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .city {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 600;
  }

  .update {
    font-size: 11px;
    opacity: 0.75;
  }
}

// 当前温度区
.now {
  margin-top: 12px;
  text-align: center;

  .now-temp {
    font-size: 56px;
    font-weight: 300;
    line-height: 1;
    font-variant-numeric: tabular-nums;

    .deg {
      font-size: 28px;
      vertical-align: top;
    }
  }

  .now-cond {
    margin-top: 6px;
    font-size: 16px;
  }

  .now-range {
    margin-top: 4px;
    font-size: 13px;
    opacity: 0.85;
  }
}

// 湿度、风速
.meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.85;

  .dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: currentColor;
  }
}

// 近 15 天预报
.forecast {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);

  .forecast-title {
    font-size: 12px;
    opacity: 0.85;
    margin-bottom: 10px;
  }

  // 横向可滑动，超出可滚动；隐藏滚动条
  .forecast-scroll {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; // Firefox 隐藏滚动条

    &::-webkit-scrollbar {
      display: none; // Chrome/Safari 隐藏滚动条
    }

    .day {
      flex: 0 0 auto; // 不压缩，保持固定宽度
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      width: 40px;

      .day-name {
        font-size: 12px;
        opacity: 0.9;
      }

      .day-icon {
        color: #fff;
      }

      .day-high {
        font-size: 13px;
        font-weight: 600;
      }

      .day-low {
        font-size: 12px;
        opacity: 0.7;
      }
    }
  }
}
</style>
