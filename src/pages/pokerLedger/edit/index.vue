<template>
  <view class="page">
    <view class="page-content">
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

        <view class="form-section">
          <view class="field-label-row">
            <text class="field-label field-label--mb0">时长 (小时)</text>
            <text class="field-optional">选填</text>
          </view>
          <input
            v-model="form.durationHours"
            class="field-input"
            type="digit"
            placeholder="例如 2.5"
            placeholder-class="ph"
          />
        </view>

        <view class="form-section">
          <text class="field-label">盲注</text>
          <view
            class="stakes-select"
            hover-class="stakes-select--press"
            :hover-stay-time="100"
            @click="showStakesPicker = true"
          >
            <text :class="stakesSelectText ? 'stakes-value' : 'stakes-placeholder'">
              {{ stakesSelectText || '请选择盲注' }}
            </text>
            <u-icon name="arrow-down" size="14" color="#8692A6" />
          </view>
          <input
            v-model="form.stakesCustom"
            class="field-input stakes-custom-input"
            type="text"
            maxlength="40"
            placeholder="或自行输入，如 2/5 NLH"
            placeholder-class="ph"
            @input="onStakesCustomInput"
            @focus="onStakesCustomFocus"
          />
        </view>

        <view class="form-section">
          <text class="field-label">盈亏 (元)</text>
          <input
            v-model="form.profit"
            class="field-input field-input--profit"
            type="digit"
            placeholder="正数为赢，负数为输，如 -150"
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

    <u-picker
      :show="showStakesPicker"
      :columns="stakesPickerColumns"
      @confirm="onStakesPickerConfirm"
      @cancel="showStakesPicker = false"
      @close="showStakesPicker = false"
    />
  </view>
</template>

<script>
import { DS } from '@/constants/designSystem.js'
import day from '@/utils/dayjs.js'
import { DATETIME_FORMAT } from '@/utils/dayjs.js'
import {
  VENUE_TYPE,
  VENUE_LABELS,
  STAKES_PRESETS,
  STAKES_PICKER_CUSTOM
} from '@/constants/pokerLedger.js'
import {
  getSessionById,
  upsertSession,
  deleteSession,
  createEmptySession,
  isPresetStakes
} from '@/utils/pokerLedger.js'

export default {
  data() {
    return {
      ds: DS,
      editId: null,
      form: {
        ...createEmptySession(),
        stakesCustom: ''
      },
      stakesPreset: '',
      datetimeValue: day().valueOf(),
      showDatetimePicker: false,
      showStakesPicker: false,
      submitting: false,
      venueOptions: [
        { value: VENUE_TYPE.offline, label: VENUE_LABELS.offline },
        { value: VENUE_TYPE.online, label: VENUE_LABELS.online }
      ],
      stakesPickerColumns: [[...STAKES_PRESETS, STAKES_PICKER_CUSTOM]]
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
    stakesSelectText() {
      if (this.stakesPreset) return this.stakesPreset
      return ''
    },
    canSubmit() {
      const profit = String(this.form.profit).trim()
      return profit !== '' && !Number.isNaN(Number(profit))
    }
  },
  onLoad(options) {
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
      this.form = { ...createEmptySession(), stakesCustom: '' }
      this.stakesPreset = ''
      this.datetimeValue = day().valueOf()
    }
  },
  methods: {
    initFormFromSession(item) {
      const stakes = (item.stakes || '').trim()
      const hasPreset = isPresetStakes(stakes)
      this.form = {
        ...createEmptySession(),
        ...item,
        durationHours:
          item.durationHours != null && Number(item.durationHours) > 0
            ? String(item.durationHours)
            : '',
        stakesCustom: hasPreset ? '' : stakes,
        profit: item.profit != null ? String(item.profit) : '',
        note: item.note || ''
      }
      this.stakesPreset = hasPreset ? stakes : ''
      this.datetimeValue = day(item.playedAt).valueOf()
    },
    resolveStakes() {
      const custom = (this.form.stakesCustom || '').trim()
      if (custom) return custom
      return (this.stakesPreset || '').trim()
    },
    onStakesPickerConfirm(e) {
      const val = e?.value?.[0] || e?.value || ''
      if (val === STAKES_PICKER_CUSTOM) {
        this.stakesPreset = ''
        this.showStakesPicker = false
        return
      }
      this.stakesPreset = val
      this.form.stakesCustom = ''
      this.showStakesPicker = false
    },
    onStakesCustomInput() {
      if ((this.form.stakesCustom || '').trim()) {
        this.stakesPreset = ''
      }
    },
    onStakesCustomFocus() {
      this.stakesPreset = ''
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
        stakes: this.resolveStakes(),
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
        console.error('[pokerLedger] save failed', e)
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
  background: var(--bg-page);
  padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
}

.page-content {
  padding: 24rpx 28rpx;
}

.form-card {
  padding: 8rpx 28rpx 16rpx;
  border-radius: 24rpx;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.form-section {
  padding: 24rpx 0;
  border-bottom: 1rpx solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
}

.field-label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: var(--text-primary);
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
  transition: all 0.3s ease;
}

.seg-item--active {
  background: var(--color-primary-light);
}

.seg-item--press {
  opacity: 0.9;
}

.seg-text {
  font-size: 28rpx;
  color: var(--text-regular);
}

.seg-item--active .seg-text {
  color: var(--color-primary);
  font-weight: 500;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid var(--border-color);
}

.form-row--press {
  opacity: 0.92;
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

.stakes-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  padding: 0 24rpx;
  margin-bottom: 16rpx;
  border-radius: 16rpx;
  background: var(--neutral-light);
}

.stakes-select--press {
  opacity: 0.92;
}

.stakes-value {
  font-size: 28rpx;
  color: var(--text-primary);
}

.stakes-placeholder {
  font-size: 28rpx;
  color: var(--text-placeholder);
}

.stakes-custom-input {
  margin-bottom: 0;
}

.field-input {
  height: 80rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: var(--neutral-light);
  font-size: 28rpx;
  color: var(--text-primary);
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
  background: var(--bg-card);
  border-top: 1rpx solid var(--border-color);
  z-index: 10;
}

.btn-primary {
  height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--color-primary) 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.btn-primary--disabled {
  opacity: 0.5;
}

.btn-primary--press {
  opacity: 0.92;
  transform: scale(0.99);
}

.btn-primary-text {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--text-white);
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

.btn-danger--press {
  opacity: 0.9;
}

.btn-danger-text {
  font-size: 28rpx;
  color: var(--error);
}
</style>
