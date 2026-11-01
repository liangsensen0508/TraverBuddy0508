// 火车票和天气卡片的临时演示数据。后端提供真实数据后，删除本文件即可。

interface TrainTicket {
  trainNo: string
  departTime: string
  arriveTime: string
  fromStation: string
  toStation: string
  duration: string
  price: number
  seatType: string
  seatStatus: string
}

export interface TrainCardData {
  from: string
  to: string
  date: string
  tickets: TrainTicket[]
}

interface ForecastDay {
  day: string
  condition: string
  high: number
  low: number
}

export interface WeatherCardData {
  city: string
  temperature: number
  condition: string
  high: number
  low: number
  humidity: string
  wind: string
  updateTime: string
  forecast: ForecastDay[]
}

/** 返回一份火车票演示数据，字段与 TrainTicketCard 的 props 一致 */
export function getTrainCardMock(): TrainCardData {
  return {
    from: '杭州东',
    to: '上海虹桥',
    date: '11月1日 周日',
    tickets: [
      {
        trainNo: 'G7501',
        departTime: '08:12',
        arriveTime: '09:17',
        fromStation: '杭州东',
        toStation: '上海虹桥',
        duration: '1小时05分',
        price: 73,
        seatType: '二等座',
        seatStatus: '有票',
      },
      {
        trainNo: 'G7545',
        departTime: '09:26',
        arriveTime: '10:38',
        fromStation: '杭州东',
        toStation: '上海虹桥',
        duration: '1小时12分',
        price: 73,
        seatType: '二等座',
        seatStatus: '候补',
      },
    ],
  }
}

/** 返回一份天气演示数据，字段与 WeatherCard 的 props 一致 */
export function getWeatherCardMock(): WeatherCardData {
  return {
    city: '杭州',
    temperature: 26,
    condition: '多云',
    high: 27,
    low: 18,
    humidity: '62%',
    wind: '东南风 3级',
    updateTime: '08:00',
    forecast: [
      { day: '今天', condition: '多云', high: 27, low: 18 },
      { day: '明天', condition: '小雨', high: 24, low: 17 },
      { day: '后天', condition: '晴', high: 28, low: 19 },
    ],
  }
}
