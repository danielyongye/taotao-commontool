import day from '@/utils/dayjs.js'
import { DATETIME_FORMAT } from '@/utils/dayjs.js'
import {
  STORAGE_KEY,
  VENUE_TYPE,
  STAT_PERIOD,
  VENUE_LABELS,
  MAX_PLAYERS
} from '@/constants/mahjongLedger.js'

function parseList(raw) {
  if (!raw) return []
  try {
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(list) ? list : []
  } catch (e) {
    console.warn('[mahjongLedger] parse failed', e)
    return []
  }
}

export function normalizePlayers(players) {
  if (!players) return []
  const arr = Array.isArray(players)
    ? players
    : String(players)
        .split(/[,，、\s]+/)
        .map((s) => s.trim())
  const seen = new Set()
  const result = []
  arr.forEach((name) => {
    const n = (name || '').trim()
    if (!n || seen.has(n)) return
    seen.add(n)
    result.push(n)
  })
  return result.slice(0, MAX_PLAYERS)
}

export function formatPlayersLine(players) {
  const list = normalizePlayers(players)
  if (!list.length) return ''
  return list.join('、')
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
  const payload = {
    ...session,
    players: normalizePlayers(session.players)
  }
  const idx = list.findIndex((s) => s.id === payload.id)
  if (idx >= 0) {
    list[idx] = payload
  } else {
    list.unshift(payload)
  }
  setSessionList(list)
  return payload
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

export function buildSessionDetailLine(session) {
  const duration = formatDurationHours(session.durationHours)
  const durationPart = duration ? `时长 ${duration}` : ''
  const playersPart = formatPlayersLine(session.players)
  if (playersPart && durationPart) return `${playersPart} · ${durationPart}`
  return playersPart || durationPart || ''
}

export function enrichSession(session) {
  const profit = Number(session.profit) || 0
  const venueLabel = VENUE_LABELS[session.venueType] || '麻将局'
  const players = normalizePlayers(session.players)
  const durationShort = formatDurationHours(session.durationHours)
  const durationText = durationShort ? `时长 ${durationShort}` : ''
  return {
    ...session,
    players,
    profit,
    listTitle: venueLabel,
    venueLabel,
    playersLine: formatPlayersLine(players),
    dateTimeLabel: formatSessionDateTime(session.playedAt),
    detailLine: buildSessionDetailLine({ ...session, players }),
    durationText,
    hasPlayers: players.length > 0,
    hasDuration: !!durationText,
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

export function getRecentPlayerNames(limit = 12) {
  const seen = new Set()
  const names = []
  getSessionList().forEach((s) => {
    normalizePlayers(s.players).forEach((name) => {
      if (seen.has(name)) return
      seen.add(name)
      names.push(name)
    })
  })
  return names.slice(0, limit)
}

export function createEmptySession() {
  return {
    id: Date.now(),
    venueType: VENUE_TYPE.offline,
    playedAt: day().format(DATETIME_FORMAT),
    durationHours: '',
    players: [],
    profit: '',
    note: ''
  }
}

export { VENUE_TYPE, STAT_PERIOD, VENUE_LABELS }
