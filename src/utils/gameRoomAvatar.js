import {
  MEMBER_AVATAR_COLORS,
  LEGACY_AVATAR_COLOR_MAP
} from '@/constants/gameRoom.js'

function normalizeColorId(colorId) {
  if (!colorId) return ''
  return LEGACY_AVATAR_COLOR_MAP[colorId] || colorId
}

export function getAvatarColorById(colorId) {
  const id = normalizeColorId(colorId)
  return MEMBER_AVATAR_COLORS.find((c) => c.id === id) || MEMBER_AVATAR_COLORS[0]
}

/** 按成员序号分配未使用的颜色，保证同房间尽量不重复 */
export function pickAvatarColorIdForIndex(index, members = []) {
  const used = new Set(
    members.map((m) => normalizeColorId(m.avatarColor)).filter(Boolean)
  )
  for (let offset = 0; offset < MEMBER_AVATAR_COLORS.length; offset++) {
    const color = MEMBER_AVATAR_COLORS[(index + offset) % MEMBER_AVATAR_COLORS.length]
    if (!used.has(color.id)) return color.id
  }
  return MEMBER_AVATAR_COLORS[index % MEMBER_AVATAR_COLORS.length].id
}

export function pickAvatarColorId(room) {
  const members = room?.members || []
  return pickAvatarColorIdForIndex(members.length, members)
}

export function resolveMemberAvatarColor(member, index = 0) {
  if (member?.avatarColor) {
    return getAvatarColorById(member.avatarColor)
  }
  return getAvatarColorById(pickAvatarColorIdForIndex(index, []))
}

export function getAvatarInitial(displayName) {
  const name = String(displayName || '').trim()
  if (!name) return '?'
  return name.slice(0, 1)
}

/** 补全或修正重复的头像颜色，并写回存储 */
export function ensureMemberAvatarColors(room) {
  if (!room?.members?.length) return room
  const members = room.members.map((m) => ({ ...m }))
  const used = new Set()
  let changed = false

  members.forEach((m, index) => {
    const normalized = normalizeColorId(m.avatarColor)
    const needNew = !normalized || used.has(normalized)
    if (!needNew) {
      if (normalized !== m.avatarColor) {
        changed = true
        members[index] = { ...m, avatarColor: normalized }
      }
      used.add(normalized)
      return
    }
    changed = true
    const colorId = pickAvatarColorIdForIndex(index, members)
    members[index] = { ...m, avatarColor: colorId }
    used.add(colorId)
  })

  if (!changed) return room
  return { ...room, members }
}
