import { STORAGE_KEY_USER } from '@/constants/gameRoom.js'

function parseProfile(raw) {
  if (!raw) return null
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!data || !data.userId) return null
    return data
  } catch (e) {
    console.warn('[deviceUser] parse failed', e)
    return null
  }
}

export function getOrCreateUserId() {
  const profile = getUserProfile()
  if (profile && profile.userId) return profile.userId
  const userId = `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  uni.setStorageSync(
    STORAGE_KEY_USER,
    JSON.stringify({
      userId,
      nickName: '',
      displayName: '',
      avatarUrl: ''
    })
  )
  return userId
}

export function getUserProfile() {
  return parseProfile(uni.getStorageSync(STORAGE_KEY_USER))
}

export function saveUserProfile(profile) {
  const prev = getUserProfile() || {}
  const next = {
    ...prev,
    ...profile,
    userId: profile.userId || prev.userId || getOrCreateUserId()
  }
  uni.setStorageSync(STORAGE_KEY_USER, JSON.stringify(next))
  return next
}

export function hasCompleteProfile() {
  const p = getUserProfile()
  if (!p) return false
  const name = (p.displayName || p.nickName || '').trim()
  return Boolean(name)
}
