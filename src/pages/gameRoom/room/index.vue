<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />
    <view class="page-content">
      <view class="room-head">
        <text class="room-title">{{ roomTitle }}</text>
        <view class="room-head-actions">
          <view
            class="head-btn"
            hover-class="head-btn--press"
            :hover-stay-time="80"
            @click="onInvite"
          >
            <u-icon name="share" size="18" color="var(--color-primary)" />
            <text class="head-btn-text">邀请</text>
          </view>
        </view>
      </view>

      <view class="sum-card">
        <view class="sum-row">
          <text class="sum-label">本局待结算</text>
          <text
            class="sum-value"
            :class="{
              'sum-value--ok': pendingSum === 0 && pendingList.length > 0,
              'sum-value--bad': pendingSum !== 0 && pendingList.length > 0
            }"
          >
            {{ pendingSumText }}
          </text>
        </view>
        <text class="sum-hint">本局分数合计为 0 后可结算</text>
      </view>

      <view class="block-card players-section">
        <view class="block-card__head">
          <text class="block-card__title">玩家</text>
          <text class="block-card__tip">点击头像记分</text>
        </view>
        <view class="players-grid">
          <view
            v-for="member in members"
            :key="member.id"
            class="players-grid__cell"
            hover-class="players-grid__cell--press"
            :hover-stay-time="80"
            @click="openScoreInput(member)"
            @longpress="onMemberLongPress(member)"
          >
            <view
              class="player-chip"
              :style="{ '--player-accent': member.avatarColorBg }"
            >
              <view class="player-chip__avatar-wrap">
                <member-avatar
                  :src="member.avatarUrl"
                  size="md"
                  :bgColor="member.avatarColorBg"
                  :textColor="member.avatarColorText"
                  :label="member.avatarLabel"
                />
              </view>
              <view class="player-chip__main">
                <text class="player-chip__name">{{ member.displayName }}</text>
                <text
                  class="player-chip__score"
                  :class="member.balanceClass"
                >
                  {{ member.balanceText }}
                </text>
              </view>
            </view>
          </view>
          <view
            v-if="members.length < maxMembers"
            :class="[
              'players-grid__cell',
              { 'players-grid__cell--solo': addCellSolo }
            ]"
            hover-class="players-grid__cell--press"
            :hover-stay-time="80"
            @click="onAddMember"
          >
            <view class="player-chip player-chip--add">
              <view class="player-chip__add-icon">
                <u-icon name="plus" size="20" color="var(--color-primary)" />
              </view>
              <view class="player-chip__main">
                <text class="player-chip__name player-chip__name--add">添加牌友</text>
                <text class="player-chip__score player-chip__score--add">邀请或手动添加</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="pendingList.length" class="round-section">
        <view class="block-card__head round-section__head">
          <text class="block-card__title">本局记录</text>
          <view
            class="round-section__clear"
            hover-class="round-section__clear--press"
            :hover-stay-time="80"
            @click="onClearPending"
          >
            <text class="round-section__clear-text">清空</text>
          </view>
        </view>
        <view class="block-card round-card">
          <view
            v-for="item in pendingList"
            :key="item.id"
            class="pending-row"
          >
            <text class="pending-name">{{ item.displayName }}</text>
            <text
              class="pending-amount"
              :class="item.amount > 0 ? 'pending-amount--win' : 'pending-amount--loss'"
            >
              {{ item.amountText }}
            </text>
            <view
              class="pending-remove"
              hover-class="pending-remove--press"
              :hover-stay-time="80"
              @click.stop="removePending(item.id)"
            >
              <text class="pending-remove-x">×</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="rounds.length" class="history-block">
        <text class="history-title">历史局数</text>
        <view
          v-for="round in rounds"
          :key="round.id"
          class="history-card"
        >
          <text class="history-time">{{ round.createdAtLabel }}</text>
          <view class="history-entries">
            <text
              v-for="(entry, idx) in round.entries"
              :key="idx"
              class="history-entry"
            >
              {{ entry.displayName }} {{ formatSigned(entry.amount) }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="footer-bar">
      <view
        class="btn-primary btn-primary--full"
        :class="{ 'btn-primary--disabled': !canConfirmRound }"
        hover-class="btn-primary--press"
        :hover-stay-time="100"
        @click="onConfirmRound"
      >
        <text class="btn-primary-text">结算本局</text>
      </view>
    </view>

    <!-- 记分弹窗 -->
    <u-popup
      :show="showScoreModal"
      mode="center"
      round="16"
      :safeAreaInsetBottom="false"
      @close="closeScoreModal"
    >
      <view class="modal-card">
        <text class="modal-title">给 {{ scoreTargetName }} 记分</text>
        <text class="modal-hint">正数表示赢，负数表示输</text>
        <input
          v-model="scoreInput"
          class="score-input"
          type="digit"
          focus
          placeholder="例如 50 或 -30"
          placeholder-class="ph"
        />
        <view class="modal-actions">
          <view
            class="modal-btn modal-btn--ghost"
            hover-class="modal-btn--press"
            @click="closeScoreModal"
          >
            <text class="modal-btn-text modal-btn-text--muted">取消</text>
          </view>
          <view
            class="modal-btn modal-btn--primary"
            hover-class="modal-btn--press"
            @click="submitScore"
          >
            <text class="modal-btn-text modal-btn-text--white">确定</text>
          </view>
        </view>
      </view>
    </u-popup>

    <u-popup
      :show="showColorPicker"
      mode="center"
      round="16"
      @close="closeColorPicker"
    >
      <view class="color-picker-card">
        <text class="color-picker-title">选择头像颜色</text>
        <text class="color-picker-hint">长按玩家卡片也可更换颜色</text>
        <view class="color-grid">
          <view
            v-for="color in avatarColors"
            :key="color.id"
            class="color-swatch"
            :class="{ 'color-swatch--active': colorPickerMember && colorPickerMember.avatarColor === color.id }"
            :style="{ background: color.bg }"
            hover-class="color-swatch--press"
            @click="applyAvatarColor(color.id)"
          >
            <text class="color-swatch-text" :style="{ color: color.text }">{{ color.label }}</text>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { MAX_MEMBERS, ROOM_PAGE, MEMBER_AVATAR_COLORS } from '@/constants/gameRoom.js'
import {
  ensureUserInRoom,
  addPendingEntry,
  addGuestMember,
  removePendingEntry,
  clearPending,
  confirmPendingRound,
  sumAmounts,
  formatSigned,
  formatBalance,
  getMemberTotalBalance,
  updateMemberDisplayName,
  updateMemberAvatarColor
} from '@/utils/gameRoom.js'
import {
  resolveMemberAvatarColor,
  getAvatarInitial
} from '@/utils/gameRoomAvatar.js'
import { getOrCreateUserId, getUserProfile, saveUserProfile } from '@/utils/deviceUser.js'
import MemberAvatar from '@/components/MemberAvatar.vue'

export default {
  components: { MemberAvatar },
  data() {
    return {
      roomId: '',
      room: null,
      maxMembers: MAX_MEMBERS,
      showScoreModal: false,
      showColorPicker: false,
      colorPickerMember: null,
      scoreTarget: null,
      scoreInput: '',
      avatarColors: MEMBER_AVATAR_COLORS
    }
  },
  computed: {
    roomTitle() {
      return (this.room && this.room.title) || '牌局房间'
    },
    members() {
      const room = this.room
      const list = (room && room.members) || []
      return list.map((m, index) => {
        const balance = getMemberTotalBalance(room, m.id)
        const colorMeta = resolveMemberAvatarColor(m, index)
        return {
          ...m,
          avatarColor: m.avatarColor || colorMeta.id,
          avatarColorBg: colorMeta.bg,
          avatarColorText: colorMeta.text,
          avatarLabel: getAvatarInitial(m.displayName),
          balanceText: formatBalance(balance),
          balanceClass:
            balance > 0
              ? 'player-chip__score--win'
              : balance < 0
                ? 'player-chip__score--loss'
                : ''
        }
      })
    },
    pendingList() {
      const list = (this.room && this.room.pendingEntries) || []
      return list.map((p) => ({
        ...p,
        amountText: formatSigned(p.amount)
      }))
    },
    pendingSum() {
      return sumAmounts(this.room && this.room.pendingEntries)
    },
    pendingSumText() {
      if (!this.pendingList.length) return '—'
      return formatSigned(this.pendingSum)
    },
    rounds() {
      return (this.room && this.room.rounds) || []
    },
    canConfirmRound() {
      return this.pendingList.length > 0 && Math.abs(this.pendingSum) < 0.001
    },
    scoreTargetName() {
      return (this.scoreTarget && this.scoreTarget.displayName) || ''
    },
    currentUserId() {
      return getOrCreateUserId()
    },
    addCellSolo() {
      return (this.members.length + 1) % 2 === 1
    }
  },
  onLoad(options) {
    const roomId = options.roomId || ''
    if (!roomId) {
      uni.showToast({ title: '房间不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 400)
      return
    }
    this.roomId = roomId
    this.loadRoom()
  },
  onShow() {
    this.loadRoom()
  },
  onShareAppMessage() {
    return {
      title: `邀请你加入「${this.roomTitle}」记账`,
      path: `${ROOM_PAGE}?roomId=${this.roomId}`
    }
  },
  methods: {
    formatSigned,
    loadRoom() {
      if (!this.roomId) return
      try {
        this.room = ensureUserInRoom(this.roomId)
      } catch (e) {
        console.error('[gameRoom] load room failed', e)
        uni.showToast({ title: '房间不存在', icon: 'none' })
        setTimeout(() => uni.navigateBack(), 400)
      }
    },
    onAddMember() {
      uni.showActionSheet({
        itemList: ['添加牌友（同桌记分）', '邀请微信好友加入'],
        success: (res) => {
          if (res.tapIndex === 0) this.promptAddGuest()
          else if (res.tapIndex === 1) this.onInvite()
        }
      })
    },
    promptAddGuest() {
      uni.showModal({
        title: '添加牌友',
        editable: true,
        placeholderText: '输入姓名',
        success: (res) => {
          if (!res.confirm) return
          const name = (res.content || '').trim()
          if (!name) return
          try {
            this.room = addGuestMember(this.roomId, name)
            uni.showToast({ title: '已添加', icon: 'success' })
          } catch (e) {
            uni.showToast({ title: e.message || '添加失败', icon: 'none' })
          }
        }
      })
    },
    onInvite() {
      // #ifdef MP-WEIXIN
      uni.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
      uni.showToast({ title: '请点击右上角分享给好友', icon: 'none' })
      // #endif
      // #ifndef MP-WEIXIN
      uni.setClipboardData({
        data: `${ROOM_PAGE}?roomId=${this.roomId}`,
        success: () => uni.showToast({ title: '链接已复制', icon: 'success' })
      })
      // #endif
    },
    openScoreInput(member) {
      this.scoreTarget = member
      this.scoreInput = ''
      this.showScoreModal = true
    },
    closeScoreModal() {
      this.showScoreModal = false
      this.scoreTarget = null
      this.scoreInput = ''
    },
    submitScore() {
      const raw = String(this.scoreInput).trim()
      if (!raw) {
        uni.showToast({ title: '请输入数字', icon: 'none' })
        return
      }
      const amount = Number(raw)
      if (!Number.isFinite(amount) || amount === 0) {
        uni.showToast({ title: '请输入非零数字', icon: 'none' })
        return
      }
      try {
        this.room = addPendingEntry(this.roomId, this.scoreTarget.id, amount)
        this.closeScoreModal()
        uni.showToast({ title: '已记录', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: e.message || '记录失败', icon: 'none' })
      }
    },
    removePending(pendingId) {
      this.room = removePendingEntry(this.roomId, pendingId)
    },
    onClearPending() {
      uni.showModal({
        title: '清空本局',
        content: '确定清空当前未结算的记分？',
        success: (res) => {
          if (!res.confirm) return
          this.room = clearPending(this.roomId)
        }
      })
    },
    onConfirmRound() {
      if (!this.canConfirmRound) {
        if (!this.pendingList.length) {
          uni.showToast({ title: '请先点击头像记分', icon: 'none' })
        } else {
          uni.showToast({
            title: `合计须为 0，当前 ${formatSigned(this.pendingSum)}`,
            icon: 'none'
          })
        }
        return
      }
      try {
        this.room = confirmPendingRound(this.roomId)
        uni.showToast({ title: '本局已结算', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: e.message || '结算失败', icon: 'none' })
      }
    },
    onMemberLongPress(member) {
      const isSelf = member.userId === this.currentUserId
      const items = isSelf ? ['修改昵称', '更换头像颜色'] : ['更换头像颜色']
      uni.showActionSheet({
        itemList: items,
        success: (res) => {
          if (isSelf && res.tapIndex === 0) {
            this.promptRename(member)
            return
          }
          this.openColorPicker(member)
        }
      })
    },
    promptRename(member) {
      uni.showModal({
        title: '修改昵称',
        editable: true,
        placeholderText: member.displayName,
        success: (res) => {
          if (!res.confirm) return
          const name = (res.content || '').trim()
          if (!name) return
          try {
            this.room = updateMemberDisplayName(this.roomId, member.id, name)
            const profile = getUserProfile() || {}
            saveUserProfile({ ...profile, displayName: name })
          } catch (e) {
            uni.showToast({ title: '修改失败', icon: 'none' })
          }
        }
      })
    },
    openColorPicker(member) {
      this.colorPickerMember = member
      this.showColorPicker = true
    },
    closeColorPicker() {
      this.showColorPicker = false
      this.colorPickerMember = null
    },
    applyAvatarColor(colorId) {
      if (!this.colorPickerMember) return
      try {
        this.room = updateMemberAvatarColor(
          this.roomId,
          this.colorPickerMember.id,
          colorId
        )
        if (this.colorPickerMember.userId === this.currentUserId) {
          const profile = getUserProfile() || {}
          saveUserProfile({ ...profile, avatarColor: colorId })
        }
        this.closeColorPicker()
        uni.showToast({ title: '颜色已更新', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '更新失败', icon: 'none' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  position: relative;
  background: var(--bg-page);
  padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
}

.page-bg {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 400rpx;
  background: var(--gradient-page-top);
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 24rpx 28rpx;
}

.room-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.room-title {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.room-head-actions {
  display: flex;
  gap: 12rpx;
}

.head-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: var(--bg-card);
  border: 1rpx solid var(--border-color);
}

.head-btn--press {
  background: var(--bg-hover);
}

.head-btn-text {
  font-size: 26rpx;
  color: var(--color-primary);
}

.sum-card {
  padding: 24rpx;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  border: 1rpx solid var(--border-color);
}

.sum-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sum-label {
  font-size: 28rpx;
  color: var(--text-regular);
}

.sum-value {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-secondary);
}

.sum-value--ok {
  color: var(--success);
}

.sum-value--bad {
  color: var(--error);
}

.sum-hint {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: var(--text-placeholder);
  line-height: 1.5;
}

.block-card {
  padding: 24rpx;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  background: var(--bg-card);
  border: 1rpx solid var(--border-color);
  box-shadow: var(--shadow-sm);
  box-sizing: border-box;
}

.block-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.block-card__title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.block-card__tip {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.players-grid {
  display: flex;
  flex-wrap: wrap;
  margin: -8rpx;
}

.players-grid__cell {
  width: 50%;
  padding: 8rpx;
  box-sizing: border-box;
  display: flex;
}

.players-grid__cell--solo {
  width: 100%;
}

.players-grid__cell--press .player-chip {
  transform: scale(0.98);
  opacity: 0.92;
}

.player-chip {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
  padding: 12rpx 16rpx 12rpx 12rpx;
  box-sizing: border-box;
  border-radius: 20rpx;
  background: var(--bg-page);
  border: 1rpx solid var(--border-color);
  border-left: 8rpx solid var(--player-accent, var(--color-primary));
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.player-chip__avatar-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-chip__main {
  flex: 1;
  width: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  gap: 10rpx;
  padding: 4rpx 0;
}

.player-chip__name {
  display: block;
  width: 100%;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-chip__score {
  display: block;
  width: 100%;
  font-size: 48rpx;
  font-weight: 700;
  line-height: 1.1;
  color: var(--text-regular);
  letter-spacing: -1rpx;
}

.player-chip__score--win {
  color: var(--success);
}

.player-chip__score--loss {
  color: var(--error);
}

.player-chip--add {
  gap: 20rpx;
  padding: 12rpx 16rpx;
  background: var(--color-primary-light);
  border: 2rpx dashed rgba(99, 102, 241, 0.35);
  border-left: 2rpx dashed rgba(99, 102, 241, 0.35);
}

.player-chip--add .player-chip__main {
  gap: 8rpx;
}

.player-chip__add-icon {
  width: 96rpx;
  height: 96rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1rpx solid var(--border-color);
}

.player-chip__name--add {
  color: var(--color-primary);
}

.player-chip__score--add {
  font-size: 24rpx;
  font-weight: 400;
  line-height: 1.35;
  color: var(--text-secondary);
  letter-spacing: 0;
}

.color-picker-card {
  width: 600rpx;
  padding: 36rpx 32rpx 32rpx;
  box-sizing: border-box;
}

.color-picker-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.color-picker-hint {
  display: block;
  margin-top: 10rpx;
  margin-bottom: 28rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
  text-align: center;
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
}

.color-swatch {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid transparent;
  box-sizing: border-box;
}

.color-swatch--active {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 4rpx var(--color-primary-light);
}

.color-swatch--press {
  opacity: 0.88;
}

.color-swatch-text {
  font-size: 28rpx;
  font-weight: 600;
}

.round-section {
  margin-bottom: 24rpx;
}

.round-section__head {
  margin-bottom: 12rpx;
  padding: 0 4rpx;
}

.round-section__clear-text {
  font-size: 26rpx;
  color: var(--color-primary);
}

.round-section__clear--press {
  opacity: 0.7;
}

.round-card {
  padding: 8rpx 24rpx 16rpx;
}

.round-card .pending-row:first-child {
  border-top: none;
}

.pending-row {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-top: 1rpx solid var(--border-color);
}

.pending-name {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-regular);
}

.pending-amount {
  font-size: 30rpx;
  font-weight: 600;
  margin-right: 16rpx;
}

.pending-amount--win {
  color: var(--success);
}

.pending-amount--loss {
  color: var(--error);
}

.pending-remove {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pending-remove-x {
  font-size: 36rpx;
  color: var(--text-placeholder);
  line-height: 1;
}

.history-block {
  margin-top: 8rpx;
}

.history-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.history-card {
  padding: 20rpx 24rpx;
  margin-bottom: 12rpx;
  border-radius: 16rpx;
  background: var(--bg-card);
  border: 1rpx solid var(--border-color);
}

.history-time {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 8rpx;
}

.history-entries {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx 20rpx;
}

.history-entry {
  font-size: 26rpx;
  color: var(--text-regular);
}

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  gap: 16rpx;
  padding: 20rpx 28rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  border-top: 1rpx solid var(--border-color);
  backdrop-filter: blur(8px);
}

.btn-primary {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: var(--gradient-primary);
  box-shadow: var(--shadow-sm);
}

.btn-primary--full {
  flex: 1;
  width: 100%;
}

.btn-primary--disabled {
  opacity: 0.45;
}

.btn-primary--press {
  opacity: 0.9;
}

.btn-primary-text {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--text-white);
}

.modal-card {
  width: 600rpx;
  padding: 40rpx 36rpx 36rpx;
  box-sizing: border-box;
}

.modal-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.modal-hint {
  display: block;
  margin-top: 12rpx;
  margin-bottom: 28rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
}

.score-input {
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: var(--neutral-light);
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
}

.modal-btn--ghost {
  background: var(--neutral-light);
}

.modal-btn--primary {
  background: var(--gradient-primary);
}

.modal-btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

.modal-btn-text--muted {
  color: var(--text-regular);
}

.modal-btn-text--white {
  color: var(--text-white);
}

.ph {
  color: var(--text-placeholder);
}
</style>
