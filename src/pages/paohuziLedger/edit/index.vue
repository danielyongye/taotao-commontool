<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />
    <view class="page-content">
      <text class="page-tip">{{ isEdit ? '修改本局记录' : '记录盈亏，添加一起打牌的牌友' }}</text>
      <view class="form-card">
        <view class="form-section">
          <text class="field-label">类型</text>
          <view class="seg-row">
            <view
              v-for="opt in venueOptions"
              :key="opt.value"
              :class="['seg-item', { 'seg-item--active': form.venueType === opt.value }]"
              hover-class="seg-item--press"
              :hover-stay-time="80"
              @click="form.venueType = opt.value"
            >
              <text class="seg-text">{{ opt.label }}</text>
            </view>
          </view>
        </view>

        <view
          class="form-row"
          hover-class="form-row--press"
          :hover-stay-time="100"
          @click="showDatetimePicker = true"
        >
          <text class="field-label field-label--inline">时间</text>
          <view class="form-row-right">
            <text class="form-value">{{ dateTimePreview }}</text>
            <u-icon name="arrow-right" size="14" color="#8692A6" />
          </view>
        </view>

        <view class="form-section form-section--players">
          <text class="field-label">一起打牌</text>
          <text class="field-hint">添加牌友姓名，列表会单独展示</text>
          <view class="player-input-row">
            <input
              v-model="playerInput"
              class="player-input"
              type="text"
              :maxlength="maxPlayerNameLen"
              placeholder="输入牌友姓名"
              placeholder-class="ph"
              confirm-type="done"
              @confirm="addPlayer"
            />
            <view
              class="player-add-btn"
              :class="{ 'player-add-btn--disabled': !canAddPlayer }"
              hover-class="player-add-btn--press"
              :hover-stay-time="100"
              @click="addPlayer"
            >
              <text class="player-add-text">添加</text>
            </view>
          </view>

          <view v-if="recentPlayers.length" class="recent-block">
            <text class="recent-label">常用牌友</text>
            <view class="recent-chips">
              <view
                v-for="name in recentPlayers"
                :key="name"
                class="recent-chip"
                hover-class="recent-chip--press"
                :hover-stay-time="80"
                @click="addPlayerByName(name)"
              >
                <text class="recent-chip-text">{{ name }}</text>
              </view>
            </view>
          </view>

          <view v-if="form.players.length" class="player-tags">
            <view
              v-for="(name, idx) in form.players"
              :key="idx"
              class="player-tag"
            >
              <text class="player-tag-text">{{ name }}</text>
              <view
                class="player-tag-remove"
                hover-class="player-tag-remove--press"
                :hover-stay-time="80"
                @click.stop="removePlayer(idx)"
              >
                <text class="player-tag-x">×</text>
              </view>
            </view>
          </view>
          <text v-else class="player-hint">可添加最多 {{ maxPlayers }} 人</text>
        </view>

        <view class="form-section">
          <view class="field-label-row">
            <text class="field-label field-label--mb0">时长 (小时)</text>
            <text class="field-optional">选填</text>
          </view>
          <input
            v-model="form.durationHours"
            class="field-input"
            type="digit"
            placeholder="例如 3"
            placeholder-class="ph"
          />
        </view>

        <view class="form-section">
          <text class="field-label">盈亏 (元)</text>
          <input
            v-model="form.profit"
            class="field-input field-input--profit"
            type="digit"
            placeholder="正数为赢，负数为输，如 -80"
            placeholder-class="ph"
          />
        </view>

        <view class="form-section">
          <text class="field-label">备注</text>
          <input
            v-model="form.note"
            class="field-input"
            type="text"
            maxlength="80"
            placeholder="选填"
            placeholder-class="ph"
          />
        </view>
      </view>
    </view>

    <view class="footer-bar">
      <view
        class="btn-primary"
        :class="{ 'btn-primary--disabled': !canSubmit || submitting }"
        hover-class="btn-primary--press"
        :hover-stay-time="100"
        @click="onSubmit"
      >
        <text class="btn-primary-text">{{ isEdit ? '保存' : '记一局' }}</text>
      </view>
      <view
        v-if="isEdit"
        class="btn-danger"
        hover-class="btn-danger--press"
        :hover-stay-time="100"
        @click="onDelete"
      >
        <text class="btn-danger-text">删除本局</text>
      </view>
    </view>

    <u-datetime-picker
      v-model="datetimeValue"
      mode="datetime"
      :show="showDatetimePicker"
      @confirm="onDatetimeConfirm"
      @cancel="showDatetimePicker = false"
      @close="showDatetimePicker = false"
    />
  </view>
</template>

<script>
import day from '@/utils/dayjs.js'
import { DATETIME_FORMAT } from '@/utils/dayjs.js'
import {
  VENUE_TYPE,
  VENUE_LABELS,
  MAX_PLAYERS,
  MAX_PLAYER_NAME_LEN
} from '@/constants/paohuziLedger.js'
import {
  getSessionById,
  upsertSession,
  deleteSession,
  createEmptySession,
  normalizePlayers,
  getRecentPlayerNames
} from '@/utils/paohuziLedger.js'

export default {
  data() {
    return {
      editId: null,
      form: createEmptySession(),
      playerInput: '',
      recentPlayers: [],
      datetimeValue: day().valueOf(),
      showDatetimePicker: false,
      submitting: false,
      maxPlayers: MAX_PLAYERS,
      maxPlayerNameLen: MAX_PLAYER_NAME_LEN,
      venueOptions: [
        { value: VENUE_TYPE.offline, label: VENUE_LABELS.offline },
        { value: VENUE_TYPE.online, label: VENUE_LABELS.online }
      ]
    }
  },
  computed: {
    isEdit() {
      return this.editId != null
    },
    dateTimePreview() {
      if (!this.form.playedAt) return '选择日期时间'
      return day(this.form.playedAt).format('YYYY-MM-DD HH:mm')
    },
    canAddPlayer() {
      const name = (this.playerInput || '').trim()
      return (
        name &&
        this.form.players.length < MAX_PLAYERS &&
        !this.form.players.includes(name)
      )
    },
    canSubmit() {
      const profit = String(this.form.profit).trim()
      return profit !== '' && !Number.isNaN(Number(profit))
    }
  },
  onLoad(options) {
    this.refreshRecentPlayers()
    if (options.id) {
      this.editId = Number(options.id)
      uni.setNavigationBarTitle({ title: '编辑牌局' })
      const item = getSessionById(this.editId)
      if (!item) {
        uni.showToast({ title: '记录不存在', icon: 'none' })
        setTimeout(() => uni.navigateBack(), 400)
        return
      }
      this.initFormFromSession(item)
    } else {
      uni.setNavigationBarTitle({ title: '记一局' })
      this.form = createEmptySession()
      this.datetimeValue = day().valueOf()
    }
  },
  onShow() {
    this.refreshRecentPlayers()
  },
  methods: {
    refreshRecentPlayers() {
      const current = normalizePlayers(this.form.players)
      this.recentPlayers = getRecentPlayerNames().filter(
        (name) => !current.includes(name)
      )
    },
    initFormFromSession(item) {
      this.form = {
        ...createEmptySession(),
        ...item,
        players: normalizePlayers(item.players),
        durationHours:
          item.durationHours != null && Number(item.durationHours) > 0
            ? String(item.durationHours)
            : '',
        profit: item.profit != null ? String(item.profit) : '',
        note: item.note || ''
      }
      this.datetimeValue = day(item.playedAt).valueOf()
      this.refreshRecentPlayers()
    },
    addPlayer() {
      const name = (this.playerInput || '').trim()
      if (!name) return
      if (this.form.players.length >= MAX_PLAYERS) {
        uni.showToast({ title: `最多添加 ${MAX_PLAYERS} 人`, icon: 'none' })
        return
      }
      if (this.form.players.includes(name)) {
        uni.showToast({ title: '已添加该牌友', icon: 'none' })
        return
      }
      this.form.players.push(name)
      this.playerInput = ''
      this.refreshRecentPlayers()
    },
    addPlayerByName(name) {
      this.playerInput = name
      this.addPlayer()
    },
    removePlayer(idx) {
      this.form.players.splice(idx, 1)
      this.refreshRecentPlayers()
    },
    onDatetimeConfirm(e) {
      const val = e && e.value !== undefined ? e.value : e
      const ts = val != null ? val : this.datetimeValue
      this.datetimeValue = ts
      this.form.playedAt = day(ts).format(DATETIME_FORMAT)
      this.showDatetimePicker = false
    },
    buildPayload() {
      const durationStr = String(this.form.durationHours).trim()
      const duration = durationStr ? parseFloat(durationStr) : null
      return {
        id: this.isEdit ? this.editId : Date.now(),
        venueType: this.form.venueType,
        playedAt: this.form.playedAt,
        durationHours: Number.isFinite(duration) && duration > 0 ? duration : null,
        players: normalizePlayers(this.form.players),
        profit: Number(this.form.profit),
        note: (this.form.note || '').trim()
      }
    },
    onSubmit() {
      if (!this.canSubmit || this.submitting) return
      this.submitting = true
      try {
        upsertSession(this.buildPayload())
        uni.showToast({
          title: this.isEdit ? '已保存' : '已记录',
          icon: 'success'
        })
        setTimeout(() => uni.navigateBack(), 300)
      } catch (e) {
        console.error('[paohuziLedger] save failed', e)
        uni.showToast({ title: '保存失败', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    onDelete() {
      uni.showModal({
        title: '删除本局',
        content: '确定删除这条记录？',
        confirmColor: '#EF4444',
        success: (res) => {
          if (!res.confirm) return
          deleteSession(this.editId)
          uni.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 300)
        }
      })
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
  height: 360rpx;
  background: linear-gradient(180deg, #f0f6ff 0%, #e3eeff 42%, #f7f8fc 100%);
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 24rpx 28rpx;
}

.page-tip {
  display: block;
  margin-bottom: 20rpx;
  font-size: 26rpx;
  color: var(--text-secondary);
  line-height: 1.5;
}

.form-card {
  padding: 8rpx 28rpx 16rpx;
  border-radius: 24rpx;
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  border: 1rpx solid var(--border-color);
}

.form-section {
  padding: 24rpx 0;
  border-bottom: 1rpx solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
}

.form-section--players {
  padding: 28rpx 0;
  background: linear-gradient(180deg, var(--color-primary-light) 0%, transparent 100%);
  margin: 0 -28rpx;
  padding-left: 28rpx;
  padding-right: 28rpx;
  border-radius: 16rpx;
}

.field-label {
  display: block;
  margin-bottom: 8rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.field-hint {
  display: block;
  margin-bottom: 20rpx;
  font-size: 24rpx;
  color: var(--text-placeholder);
}

.field-label--inline {
  margin-bottom: 0;
}

.field-label--mb0 {
  margin-bottom: 0;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.field-optional {
  font-size: 24rpx;
  color: var(--text-placeholder);
}

.seg-row {
  display: flex;
  gap: 16rpx;
}

.seg-item {
  flex: 1;
  padding: 20rpx 0;
  border-radius: 16rpx;
  background: var(--neutral-light);
  text-align: center;
}

.seg-item--active {
  background: var(--color-primary-light);
}

.seg-item--active .seg-text {
  color: var(--color-primary);
  font-weight: 500;
}

.seg-text {
  font-size: 28rpx;
  color: var(--text-regular);
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid var(--border-color);
}

.form-row-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.form-value {
  font-size: 28rpx;
  color: var(--text-regular);
}

.player-input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.player-input {
  flex: 1;
  height: 80rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: var(--neutral-light);
  font-size: 28rpx;
}

.player-add-btn {
  flex-shrink: 0;
  padding: 0 28rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-add-btn--disabled {
  opacity: 0.45;
}

.player-add-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #fff;
}

.recent-block {
  margin-bottom: 20rpx;
}

.recent-label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.recent-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.recent-chip {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: var(--color-primary-light);
}

.recent-chip-text {
  font-size: 24rpx;
  color: var(--color-primary);
}

.player-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.player-tag {
  display: flex;
  align-items: center;
  padding: 10rpx 12rpx 10rpx 20rpx;
  border-radius: 999rpx;
  background: var(--bg-hover);
  border: 1rpx solid var(--border-color);
}

.player-tag-text {
  font-size: 26rpx;
  color: var(--text-primary);
}

.player-tag-remove {
  margin-left: 8rpx;
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-tag-x {
  font-size: 32rpx;
  line-height: 1;
  color: var(--text-secondary);
}

.player-hint {
  font-size: 24rpx;
  color: var(--text-placeholder);
}

.field-input {
  height: 80rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: var(--neutral-light);
  font-size: 28rpx;
}

.field-input--profit {
  font-weight: 600;
}

.ph {
  color: var(--text-placeholder);
}

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 28rpx calc(24rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  border-top: 1rpx solid var(--border-color);
  backdrop-filter: blur(12px);
  z-index: 10;
}

.btn-primary {
  height: 88rpx;
  border-radius: 999rpx;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary--disabled {
  opacity: 0.5;
}

.btn-primary-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #fff;
}

.btn-danger {
  margin-top: 20rpx;
  height: 88rpx;
  border-radius: 999rpx;
  background: var(--error-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-danger-text {
  font-size: 28rpx;
  color: var(--error);
}
</style>
