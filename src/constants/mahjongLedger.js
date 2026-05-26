/** 麻将账本：枚举与展示文案（单一数据源） */

export const STORAGE_KEY = 'MAHJONG_LEDGER_SESSIONS'

export const VENUE_TYPE = {
  offline: 'offline',
  online: 'online'
}

export const STAT_PERIOD = {
  month: 'month',
  year: 'year',
  all: 'all'
}

export const VENUE_LABELS = {
  [VENUE_TYPE.offline]: '线下局',
  [VENUE_TYPE.online]: '线上局'
}

export const STAT_PERIOD_TABS = [
  { key: STAT_PERIOD.month, label: '本月' },
  { key: STAT_PERIOD.year, label: '年度' },
  { key: STAT_PERIOD.all, label: '全部' }
]

export const MAX_PLAYERS = 8
export const MAX_PLAYER_NAME_LEN = 12

export const EDIT_PAGE = '/pages/mahjongLedger/edit/index'
export const INDEX_PAGE = '/pages/mahjongLedger/index'
