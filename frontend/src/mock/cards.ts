// 火车票卡片的临时演示数据。后端提供真实数据后，删除本文件即可。
// 天气数据已改为真实接口（GET /weather），不再使用 mock。

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
