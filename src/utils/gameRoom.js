import day from '@/utils/dayjs.js'
import { DATETIME_FORMAT } from '@/utils/dayjs.js'
import {
  STORAGE_KEY_ROOMS,
  MAX_MEMBERS,
  MAX_DISPLAY_NAME_LEN,
  MAX_ROOM_TITLE_LEN
} from '@/constants/gameRoom.js'
import { getOrCreateUserId, getUserProfile } from '@/utils/deviceUser.js'
import {
  pickAvatarColorId,
  pickAvatarColorIdForIndex,
  ensureMemberAvatarColors
} from '@/utils/gameRoomAvatar.js'

function parseRooms(raw) {
  if (!raw) return []
  try {
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(list) ? list : []
  } catch (e) {
    console.warn('[gameRoom] parse failed', e)
    return []
  }
}

function saveRooms(list) {
  uni.setStorageSync(STORAGE_KEY_ROOMS, JSON.stringify(list))
}

export function generateRoomId() {
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export function generateMemberId() {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function getRoomList() {
  return parseRooms(uni.getStorageSync(STORAGE_KEY_ROOMS))
}

export function getRoomById(roomId) {
  if (!roomId) return null
  return getRoomList().find((r) => r.id === roomId) || null
}

function upsertRoomInList(room) {
  const list = getRoomList()
  const idx = list.findIndex((r) => r.id === room.id)
  const next = { ...room, updatedAt: Date.now() }
  if (idx >= 0) list[idx] = next
  else list.unshift(next)
  saveRooms(list)
  return next
}

export function createRoom({ title } = {}) {
  const userId = getOrCreateUserId()
  const roomId = generateRoomId()
  const now = Date.now()
  const room = {
    id: roomId,
    title: (title || '牌局房间').trim().slice(0, MAX_ROOM_TITLE_LEN) || '牌局房间',
    hostUserId: userId,
    createdAt: now,
    updatedAt: now,
    members: [],
    rounds: [],
    pendingEntries: []
  }
  return upsertRoomInList(room)
}

export function normalizeDisplayName(name) {
  return String(name || '')
    .trim()
    .slice(0, MAX_DISPLAY_NAME_LEN)
}

/** 自动加入房间时的默认昵称（无需选头像） */
export function getDefaultJoinName(room, userId) {
  const members = room?.members || []
  const existing = members.find((m) => m.userId === userId)
  if (existing?.displayName) return existing.displayName

  const profile = getUserProfile()
  const fromProfile = normalizeDisplayName(profile?.displayName || profile?.nickName)
  if (fromProfile) return fromProfile

  if (!members.length) return '我'

  const used = new Set(members.map((m) => m.displayName))
  for (let i = 2; i <= 99; i++) {
    const name = `牌友${i}`
    if (!used.has(name)) return name
  }
  return `牌友${members.length + 1}`
}

/** 当前用户自动进入房间（无资料弹窗） */
export function ensureUserInRoom(roomId) {
  if (!roomId) throw new Error('房间不存在')
  const userId = getOrCreateUserId()
  let room = getRoomById(roomId)
  if (!room) {
    const now = Date.now()
    room = {
      id: roomId,
      title: '牌局房间',
      hostUserId: userId,
      createdAt: now,
      updatedAt: now,
      members: [],
      rounds: [],
      pendingEntries: []
    }
    upsertRoomInList(room)
  }
  const profile = getUserProfile() || {}
  const joined = joinRoom(roomId, {
    userId,
    nickName: profile.nickName || '',
    displayName: getDefaultJoinName(room, userId),
    avatarUrl: profile.avatarUrl || '',
    avatarColor: profile.avatarColor || ''
  })
  return upsertRoomInList(ensureMemberAvatarColors(joined))
}

export function joinRoom(roomId, profile) {
  if (!roomId) throw new Error('房间不存在')
  const userId = profile.userId || getOrCreateUserId()
  let room = getRoomById(roomId)
  if (!room) {
    const now = Date.now()
    room = {
      id: roomId,
      title: '牌局房间',
      hostUserId: userId,
      createdAt: now,
      updatedAt: now,
      members: [],
      rounds: [],
      pendingEntries: []
    }
  }

  const displayName =
    normalizeDisplayName(profile.displayName) ||
    normalizeDisplayName(profile.nickName) ||
    '牌友'

  const existing = (room.members || []).find((m) => m.userId === userId)
  if (existing) {
    existing.nickName = profile.nickName || existing.nickName
    existing.avatarUrl = profile.avatarUrl || existing.avatarUrl
    existing.displayName = displayName || existing.displayName
    if (profile.avatarColor) existing.avatarColor = profile.avatarColor
  } else {
    if ((room.members || []).length >= MAX_MEMBERS) {
      throw new Error('房间人数已满')
    }
    room.members = room.members || []
    room.members.push({
      id: generateMemberId(),
      userId,
      nickName: profile.nickName || '',
      displayName,
      avatarUrl: profile.avatarUrl || '',
      avatarColor:
        profile.avatarColor || pickAvatarColorIdForIndex(room.members.length, room.members),
      balance: 0
    })
  }

  return upsertRoomInList(ensureMemberAvatarColors(room))
}

export function addGuestMember(roomId, displayName) {
  const name = normalizeDisplayName(displayName)
  if (!name) throw new Error('请输入牌友名称')
  const room = getRoomById(roomId)
  if (!room) return null
  if ((room.members || []).length >= MAX_MEMBERS) {
    throw new Error('房间人数已满')
  }
  const dup = (room.members || []).some((m) => m.displayName === name)
  if (dup) throw new Error('该名称已存在')
  const memberId = generateMemberId()
  room.members = room.members || []
  room.members.push({
    id: memberId,
    userId: `guest_${memberId}`,
    nickName: '',
    displayName: name,
    avatarUrl: '',
    avatarColor: pickAvatarColorId(room),
    balance: 0,
    isGuest: true
  })
  return upsertRoomInList(room)
}

export function updateMemberAvatarColor(roomId, memberId, colorId) {
  const room = getRoomById(roomId)
  if (!room) return null
  const member = (room.members || []).find((m) => m.id === memberId)
  if (!member) return null
  member.avatarColor = colorId
  return upsertRoomInList(room)
}

export function updateMemberDisplayName(roomId, memberId, displayName) {
  const room = getRoomById(roomId)
  if (!room) return null
  const member = (room.members || []).find((m) => m.id === memberId)
  if (!member) return null
  member.displayName = normalizeDisplayName(displayName) || member.displayName
  return upsertRoomInList(room)
}

export function getMemberByUserId(room, userId) {
  return (room.members || []).find((m) => m.userId === userId) || null
}

export function sumAmounts(entries) {
  if (!entries || !entries.length) return 0
  return entries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
}

/** 某成员本局待结算合计 */
export function getMemberPendingSum(room, memberId) {
  if (!room || !memberId) return 0
  return sumAmounts((room.pendingEntries || []).filter((p) => p.memberId === memberId))
}

/** 展示用总分 = 已结算累计 + 本局待结算 */
export function getMemberTotalBalance(room, memberId) {
  const member = (room.members || []).find((m) => m.id === memberId)
  const settled = member ? Number(member.balance) || 0 : 0
  return settled + getMemberPendingSum(room, memberId)
}

export function addPendingEntry(roomId, memberId, amount) {
  const room = getRoomById(roomId)
  if (!room) return null
  const num = Number(amount)
  if (!Number.isFinite(num) || num === 0) {
    throw new Error('请输入非零数字')
  }
  const member = (room.members || []).find((m) => m.id === memberId)
  if (!member) throw new Error('成员不存在')

  room.pendingEntries = room.pendingEntries || []
  room.pendingEntries.push({
    id: `p_${Date.now()}`,
    memberId,
    displayName: member.displayName,
    amount: num,
    createdAt: Date.now()
  })
  return upsertRoomInList(room)
}

export function removePendingEntry(roomId, pendingId) {
  const room = getRoomById(roomId)
  if (!room) return null
  room.pendingEntries = (room.pendingEntries || []).filter((p) => p.id !== pendingId)
  return upsertRoomInList(room)
}

export function clearPending(roomId) {
  const room = getRoomById(roomId)
  if (!room) return null
  room.pendingEntries = []
  return upsertRoomInList(room)
}

export function confirmPendingRound(roomId) {
  const room = getRoomById(roomId)
  if (!room) return null
  const pending = room.pendingEntries || []
  if (!pending.length) throw new Error('请先记分')
  const total = sumAmounts(pending)
  if (Math.abs(total) > 0.001) {
    throw new Error(`本局合计须为 0，当前为 ${formatSigned(total)}`)
  }

  pending.forEach((entry) => {
    const member = (room.members || []).find((m) => m.id === entry.memberId)
    if (member) member.balance = (Number(member.balance) || 0) + entry.amount
  })

  room.rounds = room.rounds || []
  room.rounds.unshift({
    id: `round_${Date.now()}`,
    createdAt: Date.now(),
    createdAtLabel: day().format(DATETIME_FORMAT),
    entries: pending.map((e) => ({ ...e }))
  })
  room.pendingEntries = []
  return upsertRoomInList(room)
}

export function deleteRoom(roomId) {
  const list = getRoomList().filter((r) => r.id !== roomId)
  saveRooms(list)
}

export function formatSigned(n) {
  const num = Number(n) || 0
  if (num > 0) return `+${num}`
  return String(num)
}

export function formatBalance(n) {
  const num = Number(n) || 0
  if (num > 0) return `+${num}`
  if (num < 0) return String(num)
  return '0'
}

export function getBalanceClass(n) {
  const num = Number(n) || 0
  if (num > 0) return 'balance--win'
  if (num < 0) return 'balance--loss'
  return ''
}
