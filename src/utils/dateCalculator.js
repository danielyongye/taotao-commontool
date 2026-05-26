import { parseDate } from '@/utils/dateHelpers.js'
import { DATE_FORMAT } from '@/utils/dayjs.js'

/** 日历差：年 / 月 / 日（非总天数的拆分） */
export function getCalendarDateDiff(startIso, endIso) {
  const start = parseDate(startIso)
  const end = parseDate(endIso)
  if (!start || !end) {
    return { totalDays: 0, years: 0, months: 0, days: 0 }
  }

  let from = start
  let to = end
  if (to.isBefore(from)) {
    const tmp = from
    from = to
    to = tmp
  }

  const totalDays = to.diff(from, 'day')

  let years = to.year() - from.year()
  let months = to.month() - from.month()
  let days = to.date() - from.date()

  if (days < 0) {
    months -= 1
    days += to.clone().subtract(1, 'month').daysInMonth()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  return { totalDays, years, months, days }
}

/** 在基准日期上推算 */
export function offsetDate(baseIso, amount, unit, forward = true) {
  const base = parseDate(baseIso)
  if (!base || !Number.isFinite(amount)) return ''
  const sign = forward ? 1 : -1
  const next = base.add(sign * amount, unit)
  return next.isValid() ? next.format(DATE_FORMAT) : ''
}

export function formatDateWeekday(iso) {
  const d = parseDate(iso)
  return d ? d.format('YYYY-MM-DD dddd') : ''
}
