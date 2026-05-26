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
        title: '和Ta在一起已经',
        dateLabel: '2024年5月20日',
        value: 520,
        valueUnit: '天',
        ...THEMES.memorial,
        url: LIST_PAGE_URL,
        isDemo: true
      },
      {
        id: 'demo-birthday',
        title: '妈妈生日',
        dateLabel: '2026年6月1日',
        value: 19,
        valueUnit: '天后',
        ...THEMES.birthday,
        url: COUNTDOWN_LIST_PAGE,
        isDemo: true
      },
      {
        id: 'demo-trip',
        title: '家庭旅行',
        dateLabel: '2026年8月15日',
        value: 84,
        valueUnit: '天后',
        ...THEMES.countdown,
        url: COUNTDOWN_LIST_PAGE,
        isDemo: true
      }
    ].slice(0, limit)
  }

  return items.slice(0, limit)
}
