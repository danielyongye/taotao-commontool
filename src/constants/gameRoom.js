/** 牌局记分房间：枚举与路由（单一数据源） */

export const STORAGE_KEY_ROOMS = 'GAME_ROOM_LIST'
export const STORAGE_KEY_USER = 'GAME_ROOM_USER'

export const MAX_MEMBERS = 8
export const MIN_MEMBERS = 2
export const MAX_DISPLAY_NAME_LEN = 12
export const MAX_ROOM_TITLE_LEN = 20

export const INDEX_PAGE = '/pages/gameRoom/index'
export const ROOM_PAGE = '/pages/gameRoom/room/index'

/** 微信云开发环境 ID，配置后多设备可同步；留空则仅本机存储 */
export const CLOUD_ENV_ID = ''

/**
 * 成员默认头像色（高对比、色相拉开，避免靛/紫/蓝等相近色）
 * 按数组顺序依次分配，相邻成员也尽量易区分
 */
export const MEMBER_AVATAR_COLORS = [
  { id: 'blue', bg: '#2563EB', text: '#FFFFFF', label: '蓝' },
  { id: 'orange', bg: '#EA580C', text: '#FFFFFF', label: '橙' },
  { id: 'green', bg: '#16A34A', text: '#FFFFFF', label: '绿' },
  { id: 'pink', bg: '#DB2777', text: '#FFFFFF', label: '粉' },
  { id: 'cyan', bg: '#0891B2', text: '#FFFFFF', label: '青' },
  { id: 'gold', bg: '#CA8A04', text: '#FFFFFF', label: '金' },
  { id: 'red', bg: '#DC2626', text: '#FFFFFF', label: '红' },
  { id: 'purple', bg: '#9333EA', text: '#FFFFFF', label: '紫' }
]

/** 旧版 colorId → 新色板（避免升级后仍显示相近色） */
export const LEGACY_AVATAR_COLOR_MAP = {
  indigo: 'blue',
  violet: 'purple',
  teal: 'cyan',
  amber: 'gold',
  rose: 'pink',
  slate: 'cyan'
}
