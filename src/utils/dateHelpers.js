import day, {
  DATE_FORMAT,
  DATETIME_FORMAT,
  DISPLAY_DATE_FORMAT,
  DISPLAY_DATETIME_FORMAT,
  LABEL_DATE_FORMAT
} from '@/utils/dayjs.js'

const PARSE_DATE_FORMATS = [DATETIME_FORMAT, 'YYYY-MM-DD HH:mm', DATE_FORMAT]

export function parseDate(str) {
  if (!str) return null
  const s = String(str).substr(0, 10)
  const d = day(s, DATE_FORMAT, true)
  return d.isValid() ? d.startOf('day') : null
}

/** 支持 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss */
export function parseDateTime(str) {
  if (!str) return null
  const s = String(str).trim()
  if (s.length <= 10) return parseDate(s)
  let d = day(s, PARSE_DATE_FORMATS, true)
  if (!d.isValid()) {
    d = day(s.replace(/-/g, '/'))
  }
  return d.isValid() ? d : null
}

/** 从纪念日时间字符串解析时分秒 */
export function parseDateTimeParts(str) {
  const d = parseDateTime(str)
  if (!d) return { hour: 0, minute: 0, second: 0 }
  if (String(str || '').trim().length <= 10) {
    return { hour: 0, minute: 0, second: 0 }
  }
  return {
    hour: d.hour(),
    minute: d.minute(),
    second: d.second()
  }
}

/** 日期时间戳 → YYYY-MM-DD */
export function buildDateOnlyFromTimestamp(dateTimestamp) {
  const d = day(dateTimestamp)
  return d.isValid() ? d.format(DATE_FORMAT) : ''
}

export function hasDateTimePart(str) {
  return String(str || '').trim().length > 10
}

/** 日期时间戳 + 时分秒 → YYYY-MM-DD HH:mm:ss */
export function buildDateTimeFromParts(dateTimestamp, hour, minute, second) {
  const d = day(dateTimestamp)
  if (!d.isValid()) return ''
  return d
    .hour(Math.min(23, Math.max(0, hour)))
    .minute(Math.min(59, Math.max(0, minute)))
    .second(Math.min(59, Math.max(0, second)))
    .millisecond(0)
    .format(DATETIME_FORMAT)
}

/** 选择器返回值 → 时间戳 */
export function pickerValueToTimestamp(val) {
  if (typeof val === 'number') return val
  const d = day(String(val).replace(/-/g, '/'))
  return d.isValid() ? d.valueOf() : day().valueOf()
}

/** 时间戳或日期字符串 → YYYY-MM-DD */
export function formatIsoDate(val) {
  if (val === undefined || val === null || val === '') return ''
  const d = typeof val === 'number' ? day(val) : parseDateTime(val) || parseDate(val)
  return d && d.isValid() ? d.format(DATE_FORMAT) : ''
}

/** 当天 YYYY-MM-DD */
export function todayIsoDate() {
  return day().format(DATE_FORMAT)
}

/** 2024.06.15 或含时间 */
export function formatDateTimeDisplay(str) {
  const d = parseDateTime(str)
  if (!d) return ''
  if (String(str).trim().length <= 10) {
    return d.format(DISPLAY_DATE_FORMAT)
  }
  return d.format(DISPLAY_DATETIME_FORMAT)
}

/** 2024.06.15 */
export function formatDotDate(str) {
  const d = parseDateTime(str) || parseDate(str)
  return d ? d.format(DISPLAY_DATE_FORMAT) : ''
}

export function formatDateLabel(str) {
  const d = parseDate(str)
  return d ? d.format(LABEL_DATE_FORMAT) : ''
}

/** 2024.06.15 星期六 */
export function formatDateWithWeekday(str) {
  const d = parseDate(str)
  return d ? d.format(`${DISPLAY_DATE_FORMAT} dddd`) : ''
}

/** 2024.06.07 */
export function formatDateShort(str) {
  const d = parseDate(str)
  return d ? d.format(DISPLAY_DATE_FORMAT) : ''
}

export function daysSince(dateStr) {
  const start = parseDate(dateStr)
  if (!start) return 0
  const today = day().startOf('day')
  return Math.max(0, today.diff(start, 'day'))
}

export function daysUntil(dateStr) {
  const target = parseDate(dateStr)
  if (!target) return 0
  const today = day().startOf('day')
  return Math.max(0, target.diff(today, 'day'))
}

/** 距指定日期 0 点已过去的毫秒数 */
export function elapsedMsSinceDateStart(dateStr) {
  const raw = dateStr && dateStr.length > 10 ? String(dateStr).substr(0, 10) : dateStr
  const start = parseDate(raw)
  if (!start) return 0
  const diff = day().valueOf() - start.valueOf()
  return diff > 0 ? diff : 0
}

export function diffYearsFromDate(startDate) {
  const start = day(startDate)
  if (!start.isValid()) return 0
  const years = day().diff(start, 'year')
  return years < 0 ? 0 : years
}

export function diffMonthsFromDate(startDate) {
  const start = day(startDate)
  if (!start.isValid()) return 0
  const months = day().diff(start, 'month')
  return months < 0 ? 0 : months
}

/** 时间戳 → HH:mm */
export function formatTimeHM(input) {
  const d = day(input)
  return d.isValid() ? d.format('HH:mm') : ''
}

/** 时间戳 → YYYY-MM-DD HH:mm:ss */
export function formatFullDateTime(input) {
  const d = day(input)
  return d.isValid() ? d.format(DATETIME_FORMAT) : ''
}

/** 记录元信息：时间戳 → 2024.06.15 14:30:45 */
export function formatRecordMetaTime(ts) {
  const d = day(ts)
  return d.isValid() ? d.format(DISPLAY_DATETIME_FORMAT) : ''
}

/** 相对时间，如 3分钟前 */
export function formatRelativeTime(ts) {
  const d = day(ts)
  if (!d.isValid()) return ''
  return d.fromNow()
}

/** 记录天数（含首日） */
export function recordDaysSince(startAt) {
  const start = day(startAt)
  if (!start.isValid()) return 0
  return Math.max(1, day().diff(start, 'day') + 1)
}
