import day from '@/utils/dayjs.js'
import { DATETIME_FORMAT } from '@/utils/dayjs.js'
import {
  STORAGE_KEY,
  VENUE_TYPE,
  STAT_PERIOD,
  VENUE_LABELS,
  STAKES_PRESETS
} from '@/constants/pokerLedger.js'

function parseList(raw) {
  if (!raw) return []
  try {
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(list) ? list : []
  } catch (e) {
    console.warn('[pokerLedger] parse failed', e)
    return []
  }
}

export function getSessionList() {
  return parseList(uni.getStorageSync(STORAGE_KEY))
}

export function setSessionList(list) {
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(list))
}

export function getSessionById(id) {
  const numId = Number(id)
  return getSessionList().find((s) => s.id === numId) || null
}

export function upsertSession(session) {
  const list = getSessionList()
  const idx = list.findIndex((s) => s.id === session.id)
  if (idx >= 0) {
    list[idx] = session
  } else {
    list.unshift(session)
  }
  setSessionList(list)
  return session
}

export function deleteSession(id) {
  const numId = Number(id)
  setSessionList(getSessionList().filter((s) => s.id !== numId))
}

export function clearAllSessions() {
  setSessionList([])
}

export { filterSessionsByPeriod, getAvailableYears, getStatPeriodLabel } from '@/utils/ledgerPeriod.js'

export function computeSessionStats(sessions) {
  const totalSessions = sessions.length
  const totalProfit = sessions.reduce((sum, s) => sum + Number(s.profit || 0), 0)
  const winCount = sessions.filter((s) => Number(s.profit) > 0).length
  const winRate = totalSessions ? (winCount / totalSessions) * 100 : 0
  return { totalProfit, totalSessions, winRate, winCount }
}

export function formatProfit(value, { withSign = true } = {}) {
  const num = Number(value) || 0
  const abs = Math.abs(num).toFixed(2)
  if (!withSign) return abs
  if (num > 0) return `+${abs}`
  if (num < 0) return `-${abs}`
  return '0.00'
}

export function formatWinRate(rate) {
  const n = Number(rate) || 0
  return `${n.toFixed(1)}%`
}

export function formatSessionDateTime(playedAt) {
  if (!playedAt) return ''
  return day(playedAt).format('MM/DD HH:mm')
}

export function formatDurationHours(hours) {
  const n = Number(hours)
  if (!Number.isFinite(n) || n <= 0) return ''
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}h`
}

export function isPresetStakes(stakes) {
  const s = (stakes || '').trim()
  return s && STAKES_PRESETS.includes(s)
}

export function buildSessionDetailLine(session) {
  const duration = formatDurationHours(session.durationHours)
  const durationPart = duration ? `时长 ${duration}` : ''
  const stakesPart = (session.stakes || '').trim()
  return [durationPart, stakesPart].filter(Boolean).join(' / ')
}

export function enrichSession(session) {
  const profit = Number(session.profit) || 0
  const venueLabel = VENUE_LABELS[session.venueType] || '牌局'
  const detailLine = buildSessionDetailLine(session)
  const stakesText = (session.stakes || '').trim()
  return {
    ...session,
    profit,
    listTitle: venueLabel,
    venueLabel,
    stakesText,
    dateTimeLabel: formatSessionDateTime(session.playedAt),
    detailLine,
    hasDetail: !!detailLine,
    hasStakes: !!stakesText,
    profitText: formatProfit(profit),
    isWin: profit > 0,
    isLoss: profit < 0
  }
}

export function getEnrichedSessionList() {
  return getSessionList()
    .map(enrichSession)
    .sort((a, b) => day(b.playedAt).valueOf() - day(a.playedAt).valueOf())
}

export function getMonthlyTrends(sessions, limit = 6) {
  const map = new Map()
  sessions.forEach((s) => {
    const key = day(s.playedAt).format('YYYY-MM')
    const prev = map.get(key) || { month: key, profit: 0, count: 0 }
    prev.profit += Number(s.profit) || 0
    prev.count += 1
    map.set(key, prev)
  })
  return Array.from(map.values())
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, limit)
    .map((row) => ({
      ...row,
      monthLabel: day(`${row.month}-01`).format('YYYY年M月'),
      profitText: formatProfit(row.profit)
    }))
}

export function createEmptySession() {
  return {
    id: Date.now(),
    venueType: VENUE_TYPE.offline,
    playedAt: day().format(DATETIME_FORMAT),
    durationHours: '',
    stakes: '',
    profit: '',
    note: ''
  }
}

export { VENUE_TYPE, STAT_PERIOD, VENUE_LABELS, STAKES_PRESETS }
