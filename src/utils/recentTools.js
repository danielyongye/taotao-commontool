import { QUICK_TOOLS } from '@/config/home.js'

const LEGACY_TOOL_IDS = {
  timeTransfer: 'rentCalculator',
  lifewishlist: 'wishRecommend'
}

function getToolById(id) {
  const resolved = LEGACY_TOOL_IDS[id] || id
  return QUICK_TOOLS.find((t) => t.id === resolved)
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
