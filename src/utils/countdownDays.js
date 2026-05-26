import day from '@/utils/dayjs.js'
import {
  formatDateShort,
  formatDateWithWeekday,
  daysUntil
} from '@/utils/dateHelpers.js'
import { daysUntilYearly } from '@/utils/memorialDays.js'

export const STORAGE_KEY = 'countdownEvents'

export const COUNTDOWN_THEMES = {
  travel: { icon: 'map-fill', iconBg: '#EEF0FF', countColor: '#6366F1' },
  exam: { icon: 'star-fill', iconBg: '#FFF6E5', countColor: '#F59E0B' },
  festival: { icon: 'calendar-fill', iconBg: '#E8F1FF', countColor: '#3B82F6' },
  birthday: { icon: 'gift-fill', iconBg: '#FFE8F0', countColor: '#FF6B9D' },
  default: { icon: 'calendar-fill', iconBg: '#EEF0FF', countColor: '#6366F1' }
}

const LIST_PAGE = '/pages/countdownList/index'
const DETAIL_PAGE = '/pages/countdownDetail/index'
const EDIT_PAGE = '/pages/countdownEdit/index'

export { LIST_PAGE, DETAIL_PAGE, EDIT_PAGE }

/** 仅本地已保存的数据（不含演示项） */
export function getCountdownStorageList() {
  let list = uni.getStorageSync(STORAGE_KEY)
  if (!Array.isArray(list)) return []
  return list.filter((item) => item && item.name && item.date)
}

export function getCountdownRemainingDays(item) {
  if (!item || !item.date) return 0
  if (item.repeatYearly) return daysUntilYearly(item.date)
  return daysUntil(item.date)
}

export function formatCountdownDateLabel(item) {
  if (!item || !item.date) return ''
  const d = day(String(item.date).substr(0, 10))
  if (!d.isValid()) return ''
  if (item.repeatYearly) {
    return `每年 ${d.format('MM.DD')}`
  }
  return formatDateShort(item.date)
}

/** 顶部大卡：2024.06.15 星期六 */
export function formatCountdownHeroDateLabel(item) {
  if (!item || !item.date) return ''
  if (item.repeatYearly) {
    const d = day(String(item.date).substr(0, 10))
    if (!d.isValid()) return ''
    return `每年 ${d.format('MM.DD')}`
  }
  return formatDateWithWeekday(item.date)
}

export function getCountdownDayList() {
  return getCountdownStorageList()
}

export function saveCountdownDayList(list) {
  uni.setStorageSync(STORAGE_KEY, list)
}

export function enrichCountdownItem(item) {
  const theme = COUNTDOWN_THEMES[item.theme] || COUNTDOWN_THEMES.default
  const value = getCountdownRemainingDays(item)
  return {
    ...item,
    title: item.name,
    ...theme,
    dateLabel: formatCountdownDateLabel(item),
    value,
    valueUnit: '天后'
  }
}

export function getEnrichedCountdownList() {
  return getCountdownDayList()
    .map(enrichCountdownItem)
    .sort((a, b) => a.value - b.value)
}

export function getCountdownDayById(id) {
  if (id === undefined || id === null || id === '') return null
  const key = String(id)
  return getCountdownStorageList().find((item) => String(item.id) === key) || null
}

export function upsertCountdownDay(entry) {
  const list = getCountdownStorageList()
  const idx = list.findIndex((item) => String(item.id) === String(entry.id))
  if (idx >= 0) {
    const prev = list[idx]
    list[idx] = {
      ...prev,
      ...entry,
      id: prev.id,
      theme: entry.theme || prev.theme || 'default'
    }
  } else {
    list.push({
      ...entry,
      id: entry.id != null ? entry.id : Date.now(),
      theme: entry.theme || 'default'
    })
  }
  saveCountdownDayList(list)
  return list
}

export function deleteCountdownDay(id) {
  if (id === undefined || id === null || id === '') return
  const key = String(id)
  const list = getCountdownStorageList().filter((item) => String(item.id) !== key)
  saveCountdownDayList(list)
}
