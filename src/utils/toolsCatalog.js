import { TOOLS_SECTIONS } from '@/config/toolsPage.js'

/** 首页顶部快捷入口默认顺序 */
export const DEFAULT_QUICK_TOOL_IDS = [
  'gameRoom',
  'memorialDay',
  'countdownTime',
  'wishRecommend',
  'wishlist'
]

/** 首页「娱乐记账本」横滑卡片顺序 */
export const LEDGER_TOOL_IDS = [
  'pokerLedger',
  'mahjongLedger',
  'cardsLedger',
  'gameRoom'
]

/** 从工具页配置构建 id -> tool 映射（同 id 以后出现的为准） */
export function buildToolsMap(sections = TOOLS_SECTIONS) {
  const map = {}
  sections.forEach((section) => {
    ;(section.tools || []).forEach((tool) => {
      if (tool?.id) map[tool.id] = tool
    })
  })
  return map
}

export function getToolCardBackground(tool) {
  return tool?.gradient || tool?.bg || '#EEF0FF'
}

/** 首页快捷入口展示结构（与工具页 name/desc/icon/gradient 对齐） */
export function normalizeToolForHome(tool) {
  if (!tool?.id) return null
  return {
    id: tool.id,
    name: tool.name,
    tag: tool.desc || tool.tag || '',
    icon: tool.icon,
    iconColor: tool.iconColor || '#ffffff',
    gradient: getToolCardBackground(tool),
    url: tool.url
  }
}

/** 首页记账本横滑卡片展示结构 */
export function normalizeToolForLedger(tool) {
  if (!tool?.id) return null
  return {
    id: tool.id,
    name: tool.name,
    tag: tool.desc || tool.tag || '',
    bg: getToolCardBackground(tool),
    icon: tool.icon,
    iconColor: tool.iconColor || '#ffffff',
    url: tool.url
  }
}

export function resolveToolsByIds(ids, toolMap, normalize) {
  return ids.map((id) => normalize(toolMap[id])).filter(Boolean)
}

export function getDefaultQuickTools(toolMap = buildToolsMap()) {
  return resolveToolsByIds(DEFAULT_QUICK_TOOL_IDS, toolMap, normalizeToolForHome)
}

export function getLedgerDisplayItems(toolMap = buildToolsMap()) {
  return resolveToolsByIds(LEDGER_TOOL_IDS, toolMap, normalizeToolForLedger)
}
