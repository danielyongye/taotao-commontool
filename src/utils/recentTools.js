import { buildToolsMap, normalizeToolForHome } from '@/utils/toolsCatalog.js'

const LEGACY_TOOL_IDS = {
  timeTransfer: 'rentCalculator',
  lifewishlist: 'wishRecommend',
  poker: 'pokerLedger',
  mahjong: 'mahjongLedger',
  cards: 'cardsLedger'
}

const ALL_TOOLS_MAP = buildToolsMap()

function getToolById(id) {
  const resolved = LEGACY_TOOL_IDS[id] || id
  return normalizeToolForHome(ALL_TOOLS_MAP[resolved])
}

const STORAGE_KEY = 'recent_tool_ids'
const MAX_RECENT = 4

export function getRecentToolIds() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    return Array.isArray(raw) ? raw : []
  } catch (e) {
    return []
  }
}

export function getRecentTools() {
  return getRecentToolIds()
    .map((id) => getToolById(id))
    .filter(Boolean)
}

export function recordRecentTool(toolId) {
  if (!toolId) return
  const ids = getRecentToolIds().filter((id) => id !== toolId)
  ids.unshift(toolId)
  uni.setStorageSync(STORAGE_KEY, ids.slice(0, MAX_RECENT))
}
