/** 德扑账本：枚举与展示文案（单一数据源） */

export const STORAGE_KEY = 'POKER_LEDGER_SESSIONS'

export const VENUE_TYPE = {
  offline: 'offline',
  online: 'online'
}

/** 盲注预设（下拉选项） */
export const STAKES_PRESETS = ['1/2', '2/4', '2/5', '5/10', '5/5', '10/20']

export const STAKES_PICKER_CUSTOM = '自定义'

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

export const EDIT_PAGE = '/pages/pokerLedger/edit/index'
export const INDEX_PAGE = '/pages/pokerLedger/index'
