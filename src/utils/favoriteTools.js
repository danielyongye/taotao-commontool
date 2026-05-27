import { normalizeToolForHome } from '@/utils/toolsCatalog.js'

const FAVORITE_TOOL_STORAGE_KEY = 'favorite_tool_ids'
const FAVORITE_CHANGED_EVENT = 'favoriteToolsChanged'
const MAX_FAVORITE_COUNT = 8

export function getFavoriteToolIds() {
  try {
    const raw = uni.getStorageSync(FAVORITE_TOOL_STORAGE_KEY)
    return Array.isArray(raw) ? raw : []
  } catch (e) {
    return []
  }
}

export function setFavoriteToolIds(ids) {
  const safeIds = Array.from(new Set((ids || []).filter(Boolean))).slice(0, MAX_FAVORITE_COUNT)
  uni.setStorageSync(FAVORITE_TOOL_STORAGE_KEY, safeIds)
  uni.$emit(FAVORITE_CHANGED_EVENT)
  return safeIds
}

export function isFavoriteToolId(toolId) {
  if (!toolId) return false
  return getFavoriteToolIds().includes(toolId)
}

export function toggleFavoriteToolId(toolId) {
  if (!toolId) return []
  const current = getFavoriteToolIds()
  const exists = current.includes(toolId)
  if (exists) {
    return setFavoriteToolIds(current.filter((id) => id !== toolId))
  }
  return setFavoriteToolIds([toolId, ...current])
}

export function pickFavoriteTools(toolMap, maxCount = 4) {
  return getFavoriteToolIds()
    .map((id) => normalizeToolForHome(toolMap[id]))
    .filter(Boolean)
    .slice(0, maxCount)
}

export function mergeHomeQuickTools(defaultTools, toolMap, maxCount = 5) {
  const favoriteTools = pickFavoriteTools(toolMap, maxCount)
  if (favoriteTools.length > 0) {
    return favoriteTools
  }
  return defaultTools.slice(0, maxCount)
}
