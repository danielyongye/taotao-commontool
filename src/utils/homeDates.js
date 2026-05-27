import {
  getMemorialDayList,
  enrichMemorialDayItem,
  MEMORIAL_THEMES
} from '@/utils/memorialDays.js'
import {
  getCountdownDayList,
  enrichCountdownItem,
  COUNTDOWN_THEMES,
  LIST_PAGE as COUNTDOWN_LIST_PAGE
} from '@/utils/countdownDays.js'

const THEMES = {
  memorial: MEMORIAL_THEMES.love,
  countdown: COUNTDOWN_THEMES.default,
  birthday: { icon: 'gift-fill', iconBg: '#F3EBFF', valueColor: '#9B7EDE' }
}

const LIST_PAGE_URL = '/pages/memorialDayList/index'

/** 首页「近期重要日子」列表 */
export function getHomeDateItems(limit = 3) {
  const items = []

  const memorialList = getMemorialDayList()
  memorialList.forEach((raw) => {
    const item = enrichMemorialDayItem(raw)
    items.push({
      id: 'memorial-' + item.id,
      title: item.title,
      dateLabel: item.dateLabel,
      value: item.value,
      valueUnit: item.valueUnit,
      icon: item.icon,
      iconBg: item.iconBg,
      valueColor: item.countColor,
      url: LIST_PAGE_URL,
      isDemo: !!raw.isDemo
    })
  })

  getCountdownDayList().forEach((raw) => {
    const item = enrichCountdownItem(raw)
    items.push({
      id: 'countdown-' + item.id,
      title: item.title,
      dateLabel: item.dateLabel,
      value: item.value,
      valueUnit: item.valueUnit,
      icon: item.icon,
      iconBg: item.iconBg,
      valueColor: item.countColor,
      url: COUNTDOWN_LIST_PAGE,
      isDemo: !!raw.isDemo
    })
  })

  if (!items.length) {
    return [
      {
        id: 'demo-memorial',
        title: '和 ta 在一起',
        dateLabel: '2019年11月23日',
        value: 520,
        valueUnit: '天',
        ...THEMES.memorial,
        url: LIST_PAGE_URL,
        isDemo: true
      },
      {
        id: 'demo-bloom',
        title: '花开的时间',
        dateLabel: '2022年9月29日',
        value: 999,
        valueUnit: '天',
        ...THEMES.memorial,
        url: LIST_PAGE_URL,
        isDemo: true
      }
    ].slice(0, limit)
  }

  return items.slice(0, limit)
}
