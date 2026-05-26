import day from '@/utils/dayjs.js'
import {
  parseDate,
  parseDateTime,
  formatDateTimeDisplay,
  daysSince,
  daysUntil,
  formatDateShort
} from '@/utils/dateHelpers.js'

export const STORAGE_KEY = 'memorialDayList'

export const MEMORIAL_THEMES = {
  love: { icon: 'heart-fill', iconBg: '#FFE8F0', valueColor: '#FF6B9D' },
  birthday: { icon: 'gift-fill', iconBg: '#FFF3E0', valueColor: '#FF9F43' },
  meet: { icon: 'map-fill', iconBg: '#F3EBFF', valueColor: '#1a1d26' },
  grad: { icon: 'bookmark-fill', iconBg: '#E8F4FF', valueColor: '#1a1d26' },
  travel: { icon: 'bag-fill', iconBg: '#E8F8F0', valueColor: '#1a1d26' }
}

const DEMO_LIST = [
  {
    id: 1,
    title: '和Ta在一起已经',
    date: '2022-05-20',
    repeatYearly: false,
    theme: 'love'
  },
  {
    id: 2,
    title: '我的生日',
    date: '2000-05-26',
    repeatYearly: true,
    theme: 'birthday'
  },
  {
    id: 3,
    title: '我们相识纪念日',
    date: '2021-03-14',
    repeatYearly: false,
    theme: 'meet'
  },
  {
    id: 4,
    title: '毕业纪念日',
    date: '2020-06-20',
    repeatYearly: false,
    theme: 'grad'
  },
  {
    id: 5,
    title: '第一次旅行',
    date: '2023-08-10',
    repeatYearly: false,
    theme: 'travel'
  }
]

export function getNextYearlyOccurrence(dateStr) {
  const d = parseDateTime(dateStr) || parseDate(dateStr)
  if (!d) return null
  const today = day().startOf('day')
  let next = d.year(today.year()).startOf('day')
  if (!next.isAfter(today)) {
    next = next.add(1, 'year')
  }
  return next
}

export function daysUntilYearly(dateStr) {
  const next = getNextYearlyOccurrence(dateStr)
  if (!next) return 0
  return Math.max(0, next.diff(day().startOf('day'), 'day'))
}

export function remainingMsUntilYearly(dateStr) {
  const next = getNextYearlyOccurrence(dateStr)
  if (!next) return 0
  const diff = next.valueOf() - day().startOf('day').valueOf()
  return diff > 0 ? diff : 0
}

export function formatMemorialDateLabel(item) {
  if (!item || !item.date) return ''
  const d = parseDateTime(item.date) || parseDate(item.date)
  if (!d) return ''
  if (item.repeatYearly) {
    return `每年 ${d.format('MM.DD')}`
  }
  const s = String(item.date).trim()
  if (s.length > 10) return formatDateTimeDisplay(item.date)
  return formatDateShort(item.date)
}

export function getMemorialDayDisplay(item) {
  if (item.repeatYearly) {
    return {
      value: daysUntilYearly(item.date),
      unit: '天后',
      valueColor: (MEMORIAL_THEMES[item.theme] || MEMORIAL_THEMES.love).valueColor
    }
  }
  const start = parseDateTime(item.date) || parseDate(item.date)
  const theme = MEMORIAL_THEMES[item.theme] || MEMORIAL_THEMES.love
  if (start && start.isAfter(day())) {
    return {
      value: daysUntil(item.date),
      unit: '天后',
      valueColor: theme.valueColor
    }
  }
  return {
    value: daysSince(item.date),
    unit: '天',
    valueColor: theme.valueColor
  }
}

function migrateLegacySingleDate(list) {
  if (list.length) return list
  const legacy = uni.getStorageSync('memorialDate')
  if (!legacy) return list
  return [
    {
      id: Date.now(),
      title: '和Ta在一起已经',
      date: String(legacy).substr(0, 10),
      repeatYearly: false,
      theme: 'love'
    }
  ]
}

export function getMemorialDayList() {
  let list = uni.getStorageSync(STORAGE_KEY)
  if (!Array.isArray(list)) list = []
  list = migrateLegacySingleDate(list)
  if (!list.length) return DEMO_LIST.map((item) => ({ ...item, isDemo: true }))
  return list
}

export function saveMemorialDayList(list) {
  uni.setStorageSync(STORAGE_KEY, list)
}

export function enrichMemorialDayItem(item) {
  const theme = MEMORIAL_THEMES[item.theme] || MEMORIAL_THEMES.love
  const display = getMemorialDayDisplay(item)
  return {
    ...item,
    ...theme,
    dateLabel: formatMemorialDateLabel(item),
    value: display.value,
    valueUnit: display.unit,
    countColor: display.valueColor
  }
}

export function getEnrichedMemorialDayList() {
  return getMemorialDayList().map(enrichMemorialDayItem)
}

export function getMemorialDayById(id) {
  const numId = Number(id)
  if (!numId) return null
  const list = getMemorialDayList().filter((item) => !item.isDemo)
  return list.find((item) => item.id === numId) || null
}

/** 解析创建/更新时间（兼容旧数据：无字段时用 id 作为创建时间） */
export function resolveMemorialTimestamps(item) {
  if (!item) return { createdAt: null, updatedAt: null }
  const createdAt = item.createdAt || item.id || null
  const updatedAt = item.updatedAt || createdAt
  return { createdAt, updatedAt }
}

export function upsertMemorialDay(entry) {
  const list = getMemorialDayList().filter((item) => !item.isDemo)
  const now = Date.now()
  const idx = list.findIndex((item) => item.id === entry.id)
  if (idx >= 0) {
    const prev = list[idx]
    list[idx] = {
      ...prev,
      ...entry,
      createdAt: prev.createdAt || prev.id || now,
      updatedAt: now
    }
  } else {
    list.push({
      ...entry,
      createdAt: now,
      updatedAt: now
    })
  }
  saveMemorialDayList(list)
  return list
}

export function deleteMemorialDay(id) {
  const numId = Number(id)
  const list = getMemorialDayList()
    .filter((item) => !item.isDemo && item.id !== numId)
  saveMemorialDayList(list)
}
