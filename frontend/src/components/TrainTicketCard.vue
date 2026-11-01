<template>
  <div class="train-card">
    <!-- 头部：标题 + 日期 -->
    <div class="card-head">
      <div class="head-left">
        <span class="head-icon">
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="5" y="3.5" width="14" height="13" rx="3" />
            <path d="M5 9.5h14M8 20l1.2-2.6M16 20l-1.2-2.6" />
            <circle cx="9" cy="12.8" r="0.9" fill="currentColor" stroke="none" />
            <circle cx="15" cy="12.8" r="0.9" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <span class="head-title">火车票查询</span>
      </div>
      <span class="head-date">{{ date }}</span>
    </div>

    <!-- 路线 -->
    <div class="route">
      <span class="city">{{ from }}</span>
      <span class="route-arrow">
        <span class="line"></span>
        <van-icon name="arrow" size="12" />
      </span>
      <span class="city">{{ to }}</span>
    </div>

    <!-- 车次列表 -->
    <div class="ticket-list">
      <div v-for="t in tickets" :key="t.trainNo" class="ticket">
        <div class="ticket-top">
          <span class="train-no">{{ t.trainNo }}</span>
          <span class="price">
            ¥<em>{{ t.price }}</em>
            <span class="price-unit">起</span>
          </span>
        </div>

        <div class="ticket-main">
          <div class="endpoint">
            <span class="time">{{ t.departTime }}</span>
            <span class="station">{{ t.fromStation }}</span>
          </div>
          <div class="journey">
            <span class="duration">{{ t.duration }}</span>
            <span class="journey-line"></span>
          </div>
          <div class="endpoint arrive">
            <span class="time">{{ t.arriveTime }}</span>
            <span class="station">{{ t.toStation }}</span>
          </div>
        </div>

        <div class="ticket-foot">
          <span class="seat-type">{{ t.seatType }}</span>
          <span class="seat-status" :class="statusClass(t.seatStatus)">
            {{ t.seatStatus }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TrainTicket {
  /** 车次 */
  trainNo: string
  /** 出发时间 */
  departTime: string
  /** 到达时间 */
  arriveTime: string
  /** 出发站 */
  fromStation: string
  /** 到达站 */
  toStation: string
  /** 历时 */
  duration: string
  /** 最低票价 */
  price: number
  /** 席别 */
  seatType?: string
  /** 余票状态：有票 / 候补 / 无票 */
  seatStatus?: string
}

interface Props {
  /** 出发站 */
  from: string
  /** 到达站 */
  to: string
  /** 乘车日期 */
  date: string
  /** 车次列表 */
  tickets: TrainTicket[]
}

defineProps<Props>()

/** 余票状态对应的配色 */
function statusClass(status?: string) {
  if (!status) return ''
  if (status.includes('有')) return 'ok'
  if (status.includes('候补')) return 'warn'
  return 'none'
}
</script>

<style scoped lang="less">
@primary: #3d9bff;
@text-main: #1f2a3d;
@text-sub: #8a94a6;

.train-card {
  width: 100%;
  max-width: 288px;
  box-sizing: border-box;
  padding: 14px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(31, 62, 110, 0.08);

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .head-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .head-icon {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: linear-gradient(135deg, #6db8ff, @primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .head-title {
    font-size: 13px;
    font-weight: 600;
    color: @text-main;
  }

  .head-date {
    font-size: 11px;
    color: @text-sub;
  }

  .route {
    display: flex;
    align-items: center;
    margin-top: 12px;

    .city {
      font-size: 16px;
      font-weight: 700;
      color: @text-main;
    }

    .route-arrow {
      flex: 1;
      display: flex;
      align-items: center;
      margin: 0 8px;
      color: @primary;

      .line {
        flex: 1;
        height: 1px;
        margin-right: 2px;
        background: repeating-linear-gradient(
          90deg,
          #bcd8ff 0 4px,
          transparent 4px 8px
        );
      }
    }
  }

  .ticket-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
  }

  .ticket {
    padding: 10px 12px;
    background: #f7faff;
    border: 1px solid #e9f2ff;
    border-radius: 10px;
  }

  .ticket-top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .train-no {
      font-size: 13px;
      font-weight: 700;
      color: @primary;
      letter-spacing: 0.3px;
    }

    .price {
      font-size: 12px;
      font-weight: 600;
      color: #ff7a45;

      em {
        font-style: normal;
        font-size: 17px;
      }

      .price-unit {
        margin-left: 1px;
        font-size: 10px;
        font-weight: 400;
        color: @text-sub;
      }
    }
  }

  .ticket-main {
    display: flex;
    align-items: center;
    margin-top: 6px;

    .endpoint {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;

      .time {
        font-size: 20px;
        font-weight: 700;
        line-height: 1.2;
        color: @text-main;
        font-variant-numeric: tabular-nums;
      }

      .station {
        margin-top: 2px;
        font-size: 11px;
        color: @text-sub;
      }

      &.arrive {
        align-items: flex-end;
      }
    }

    .journey {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 10px;

      .duration {
        font-size: 10px;
        color: @text-sub;
        white-space: nowrap;
      }

      .journey-line {
        width: 100%;
        height: 1px;
        margin-top: 5px;
        background: #dbe8f9;
      }
    }
  }

  .ticket-foot {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;

    .seat-type {
      padding: 1px 6px;
      font-size: 10px;
      color: #5b7391;
      background: #edf4fc;
      border-radius: 4px;
    }

    .seat-status {
      padding: 1px 6px;
      font-size: 10px;
      border-radius: 4px;

      &.ok {
        color: #14a06a;
        background: #e7f8f0;
      }

      &.warn {
        color: #d48806;
        background: #fff5e6;
      }

      &.none {
        color: #d4380d;
        background: #fff1f0;
      }
    }
  }
}
</style>
