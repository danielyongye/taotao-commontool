import day from '@/utils/dayjs.js'

/** 从记录中提取可选年份（含当前年），降序 */
export function getAvailableYears(sessions) {
  const years = new Set([day().year()])
  sessions.forEach((s) => {
    if (s.playedAt) years.add(day(s.playedAt).year())
  })
  return [...years].sort((a, b) => b - a)
}

/**
 * @param {'month'|'year'|'all'} period
 * @param {{ year?: number }} options - period 为 year 时指定日历年份
 */
export function filterSessionsByPeriod(sessions, period, { year } = {}) {
  const now = day()
  if (period === 'all') return sessions
  if (period === 'month') {
    return sessions.filter((s) => day(s.playedAt).isSame(now, 'month'))
  }
  if (period === 'year') {
    const y = year != null ? Number(year) : now.year()
    return sessions.filter((s) => day(s.playedAt).year() === y)
  }
  return sessions
}

export function getStatPeriodLabel(period, year) {
  if (period === 'month') return '本月统计'
  if (period === 'all') return '全部统计'
  if (period === 'year') {
    const y = year != null ? Number(year) : day().year()
    return `${y}年统计`
  }
  return '统计'
}
