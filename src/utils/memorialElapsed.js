import day from '@/utils/dayjs.js'
import {
  parseDate,
  parseDateTime,
  diffYearsFromDate,
  diffMonthsFromDate
} from '@/utils/dateHelpers.js'

function getMemorialStart(dateStr) {
  return parseDateTime(dateStr) || parseDate(dateStr)
}

/** 距纪念日开始已过去的毫秒数（含具体时分秒） */
export function elapsedMsSinceMemorial(dateStr) {
  const start = getMemorialStart(dateStr)
  if (!start) return 0
  const diff = day().valueOf() - start.valueOf()
  return diff > 0 ? diff : 0
}

/** 距未来纪念日剩余的毫秒数 */
export function remainingMsUntilMemorial(dateStr) {
  const target = getMemorialStart(dateStr)
  if (!target) return 0
  const diff = target.valueOf() - day().valueOf()
  return diff > 0 ? diff : 0
}

/** 格式：X天 HH:mm:ss */
export function formatElapsedDuration(ms) {
  let totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  totalSeconds %= 86400
  const hours = Math.floor(totalSeconds / 3600)
  totalSeconds %= 3600
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${days}天 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`
}

const MS_WEEK = 1000 * 60 * 60 * 24 * 7
const MS_DAY = 1000 * 60 * 60 * 24
const MS_HOUR = 1000 * 60 * 60
const MS_MINUTE = 1000 * 60

function floorUnitsFromMs(ms) {
  return {
    weeks: Math.floor(ms / MS_WEEK),
    days: Math.floor(ms / MS_DAY),
    hours: Math.floor(ms / MS_HOUR),
    minutes: Math.floor(ms / MS_MINUTE),
    seconds: Math.floor(ms / 1000)
  }
}

/** 正计时：年/月按日历，其余按毫秒取整 */
export function getElapsedUnits(ms, dateStr) {
  const start = getMemorialStart(dateStr)
  const floor = floorUnitsFromMs(ms)
  return {
    years: start ? diffYearsFromDate(start) : 0,
    months: start ? diffMonthsFromDate(start) : 0,
    ...floor
  }
}

/** 倒计时：全部按毫秒取整 */
export function getCountdownUnits(ms) {
  return {
    years: Math.floor(ms / (MS_DAY * 365)),
    months: Math.floor(ms / (MS_DAY * 30)),
    ...floorUnitsFromMs(ms)
  }
}
