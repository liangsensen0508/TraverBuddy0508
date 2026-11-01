<template>
  <div class="weather-card">
    <!-- 城市与更新时间 -->
    <div class="city-row">
      <van-icon name="location-o" size="13" />
      <span class="city">{{ city }}</span>
      <span class="update">{{ updateTime }} 更新</span>
    </div>

    <!-- 当前温度与天气 -->
    <div class="temp-row">
      <div class="temp">{{ temperature }}<span class="deg">°</span></div>
      <div class="cond">
        <div class="cond-text">{{ condition }}</div>
        <div class="range">{{ low }}° ~ {{ high }}°</div>
      </div>

      <svg
        v-if="iconType === 'sun'"
        class="weather-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      >
        <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" opacity="0.9" />
        <path
          d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"
        />
      </svg>

      <svg
        v-else-if="iconType === 'cloud'"
        class="weather-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z" />
      </svg>

      <svg
        v-else
        class="weather-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
        <path d="M16 13v6M8 13v6M12 15v6" />
      </svg>
    </div>

    <!-- 湿度、风力 -->
    <div class="meta-row">
      <span class="meta-item">湿度 {{ humidity }}</span>
      <span class="meta-divider"></span>
      <span class="meta-item">{{ wind }}</span>
    </div>

    <!-- 未来几天 -->
    <div class="forecast">
      <div v-for="(f, i) in forecast" :key="i" class="forecast-item">
        <span class="f-day">{{ f.day }}</span>
        <span class="f-cond">{{ f.condition }}</span>
        <span class="f-range">{{ f.high }}° / {{ f.low }}°</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ForecastDay {
  /** 今天 / 明天 / 后天 */
  day: string
  /** 天气状况 */
  condition: string
  /** 最高温 */
  high: number
  /** 最低温 */
  low: number
}

interface Props {
  /** 城市 */
  city: string
  /** 当前温度 */
  temperature: number
  /** 当前天气状况 */
  condition: string
  /** 最高温 */
  high: number
  /** 最低温 */
  low: number
  /** 湿度 */
  humidity: string
  /** 风力 */
  wind: string
  /** 数据更新时间 */
  updateTime: string
  /** 未来几天预报 */
  forecast: ForecastDay[]
}

const props = defineProps<Props>()

/** 根据天气状况选择图标 */
const iconType = computed(() => {
  if (/雨|雪/.test(props.condition)) return 'rain'
  if (/云|阴|雾|霾/.test(props.condition)) return 'cloud'
  return 'sun'
})
</script>

<style scoped lang="less">
.weather-card {
  position: relative;
  width: 100%;
  max-width: 288px;
  box-sizing: border-box;
  padding: 14px 16px 12px;
  border-radius: 16px;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(135deg, #58b7ff 0%, #3078f5 100%);
  box-shadow: 0 6px 18px rgba(48, 120, 245, 0.28);

  // 右上角光晕装饰
  &::after {
    content: '';
    position: absolute;
    top: -46px;
    right: -34px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.14);
    pointer-events: none;
  }

  .city-row {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;

    .city {
      font-weight: 600;
    }

    .update {
      margin-left: auto;
      font-size: 10px;
      opacity: 0.72;
    }
  }

  .temp-row {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    margin-top: 8px;

    .temp {
      font-size: 42px;
      font-weight: 700;
      line-height: 1;
      font-variant-numeric: tabular-nums;

      .deg {
        margin-left: 1px;
        font-size: 20px;
        font-weight: 400;
      }
    }

    .cond {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-left: 10px;

      .cond-text {
        font-size: 14px;
        font-weight: 600;
      }

      .range {
        font-size: 11px;
        opacity: 0.8;
      }
    }

    .weather-icon {
      width: 46px;
      height: 46px;
      margin-left: auto;
      opacity: 0.92;
    }
  }

  .meta-row {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    font-size: 11px;
    opacity: 0.85;

    .meta-divider {
      width: 1px;
      height: 10px;
      background: rgba(255, 255, 255, 0.5);
    }
  }

  .forecast {
    position: relative;
    z-index: 1;
    display: flex;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.25);

    .forecast-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;

      .f-day {
        font-size: 11px;
        opacity: 0.9;
      }

      .f-cond {
        font-size: 10px;
        opacity: 0.72;
      }

      .f-range {
        font-size: 11px;
        font-weight: 600;
      }
    }
  }
}
</style>
