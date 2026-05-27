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
  travel: { icon: 'bag-fill', iconBg: '#E8F8F0', valueColor: '#1a1d26' },
  bloom: { icon: 'star-fill', iconBg: '#FFF5F7', valueColor: '#EC4899' }
}

const DEMO_LIST = [
  {
    id: 1,
    title: '和 ta 在一起',
    date: '2019-11-23',
    repeatYearly: false,
    theme: 'love'
  },
  {
    id: 2,
    title: '花开的时间',
    date: '2022-09-29',
    repeatYearly: false,
    theme: 'bloom'
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
      title: '和 ta 在一起',
      date: String(legacy).substr(0, 10),
      repeatYearly: false,
      theme: 'love'
    }
  ]
}

function stripDemoMeta(item) {
  const { isDemo, ...rest } = item
  return rest
}

export function getMemorialDayList() {
  const stored = uni.getStorageSync(STORAGE_KEY)
  if (stored === '' || stored === null || stored === undefined) {
    return DEMO_LIST.map((item) => ({ ...item, isDemo: true }))
  }
  let list = stored
  if (!Array.isArray(list)) list = []
  list = migrateLegacySingleDate(list)
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
  return getMemorialDayList().find((item) => item.id === numId) || null
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
  if (!numId) return
  const list = getMemorialDayList()
    .filter((item) => item.id !== numId)
    .map(stripDemoMeta)
  saveMemorialDayList(list)
}
