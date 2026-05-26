<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />
    <view class="page-content">
      <text class="page-tip">{{ isEdit ? '修改后将更新列表中的倒计时' : '记录一个重要时刻，随时回看已过去多久' }}</text>

      <view class="form-card">
        <view class="form-section">
          <text class="field-label">纪念日名称</text>
          <input
            v-model="formTitle"
            class="field-input"
            type="text"
            maxlength="40"
            placeholder="例如：在一起、生日、毕业"
            placeholder-class="ph"
            confirm-type="done"
          />
        </view>

        <view class="form-section form-section-datetime">
          <view class="section-head">
            <text class="field-label section-head-label">日期</text>
            <text class="field-hint">年月日必填</text>
          </view>

          <view v-if="formDate" class="datetime-preview">
            <text class="datetime-preview-text">{{ fullDateTimePreview }}</text>
          </view>

          <view class="datetime-pickers">
            <view
              class="datetime-row"
              hover-class="datetime-row--press"
              :hover-stay-time="100"
              @click="openDatePicker"
            >
              <view class="datetime-row-left">
                <view class="datetime-icon">
                  <u-icon name="calendar" size="18" :color="ds.colorPrimary" />
                </view>
                <text class="datetime-part-label">年月日</text>
              </view>
              <view class="datetime-row-right">
                <text :class="formDate ? 'datetime-value' : 'datetime-placeholder'">
                  {{ formDate ? datePartPreview : '选择年月日' }}
                </text>
                <u-icon name="arrow-right" size="14" :color="ds.textSecondary" />
              </view>
            </view>
            <view
              v-if="!formTimeEnabled"
              class="datetime-row datetime-row--add"
              hover-class="datetime-row--press"
              :hover-stay-time="100"
              @click="enableTime"
            >
              <view class="datetime-row-left">
                <view class="datetime-icon datetime-icon--muted">
                  <u-icon name="clock" size="18" :color="ds.textSecondary" />
                </view>
                <text class="datetime-add-label">添加具体时间</text>
              </view>
              <view class="datetime-row-right">
                <text class="datetime-add-hint">可选</text>
                <u-icon name="plus" size="14" :color="ds.colorPrimary" />
              </view>
            </view>
            <template v-else>
              <view
                class="datetime-row"
                hover-class="datetime-row--press"
                :hover-stay-time="100"
                @click="openTimePicker"
              >
                <view class="datetime-row-left">
                  <view class="datetime-icon">
                    <u-icon name="clock" size="18" :color="ds.colorPrimary" />
                  </view>
                  <text class="datetime-part-label">时分秒</text>
                </view>
                <view class="datetime-row-right">
                  <text class="datetime-value">{{ timePartPreview }}</text>
                  <u-icon name="arrow-right" size="14" :color="ds.textSecondary" />
                </view>
              </view>
              <view
                class="datetime-clear"
                hover-class="datetime-clear--press"
                :hover-stay-time="100"
                @click="disableTime"
              >
                <text class="datetime-clear-text">不设置具体时间</text>
              </view>
            </template>
          </view>
        </view>

        <view class="form-section form-section-repeat">
          <view class="repeat-row">
            <view class="repeat-copy">
              <text class="repeat-title">每年重复</text>
              <text class="repeat-hint">仅比较月日，适合生日等每年同一天</text>
            </view>
            <switch
              :checked="formRepeatYearly"
              :color="ds.colorPrimary"
              @change="onRepeatChange"
            />
          </view>
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
        <text class="btn-primary-text">{{ submitLabel }}</text>
      </view>
      <view
        v-if="isEdit"
        class="btn-danger"
        hover-class="btn-danger--press"
        :hover-stay-time="100"
        @click="onDelete"
      >
        <text class="btn-danger-text">删除纪念日</text>
      </view>
    </view>

    <u-datetime-picker
      v-model="formDateValue"
      mode="date"
      :show="showDatePicker"
      @confirm="onDateConfirm"
      @cancel="showDatePicker = false"
      @close="showDatePicker = false"
    />

    <u-picker
      :show="showTimePicker"
      :columns="timeColumns"
      :defaultIndex="timeDefaultIndex"
      @confirm="onTimeConfirm"
      @cancel="showTimePicker = false"
      @close="showTimePicker = false"
    />
  </view>
</template>

<script>
import { DS } from '@/constants/designSystem.js'
import day from '@/utils/dayjs.js'
import {
  buildDateOnlyFromTimestamp,
  buildDateTimeFromParts,
  formatDotDate,
  hasDateTimePart,
  parseDateTime,
  parseDateTimeParts,
  formatDateTimeDisplay,
  pickerValueToTimestamp
} from '@/utils/dateHelpers.js'
import {
  getMemorialDayById,
  upsertMemorialDay,
  deleteMemorialDay,
  formatMemorialDateLabel
} from '@/utils/memorialDays.js'

const pad2 = (n) => String(n).padStart(2, '0')
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => pad2(i))
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => pad2(i))
const SECOND_OPTIONS = Array.from({ length: 60 }, (_, i) => pad2(i))

export default {
  data() {
    return {
      ds: DS,
      editId: null,
      formTitle: '',
      formDate: '',
      formDateValue: day().valueOf(),
      formHour: 0,
      formMinute: 0,
      formSecond: 0,
      formTimeEnabled: false,
      formRepeatYearly: false,
      showDatePicker: false,
      showTimePicker: false,
      submitting: false,
      timeColumns: [HOUR_OPTIONS, MINUTE_OPTIONS, SECOND_OPTIONS]
    }
  },
  computed: {
    isEdit() {
      return !!this.editId
    },
    canSubmit() {
      return !!(this.formTitle || '').trim() && !!this.formDate
    },
    submitLabel() {
      if (this.submitting) return '保存中…'
      return this.isEdit ? '保存' : '添加纪念日'
    },
    timeDefaultIndex() {
      return [
        Math.min(23, Math.max(0, this.formHour)),
        Math.min(59, Math.max(0, this.formMinute)),
        Math.min(59, Math.max(0, this.formSecond))
      ]
    },
    timePartPreview() {
      return `${pad2(this.formHour)}:${pad2(this.formMinute)}:${pad2(this.formSecond)}`
    },
    datePartPreview() {
      if (!this.formDate) return ''
      if (this.formRepeatYearly) {
        return formatMemorialDateLabel({
          date: this.formDate,
          repeatYearly: true
        })
      }
      return formatDotDate(this.formDate)
    },
    fullDateTimePreview() {
      if (!this.formDate) return ''
      if (this.formRepeatYearly) {
        const dateLabel = formatMemorialDateLabel({
          date: this.formDate,
          repeatYearly: true
        })
        if (!this.formTimeEnabled) return dateLabel
        return `${dateLabel} · ${this.timePartPreview}`
      }
      return formatDateTimeDisplay(this.formDate)
    }
  },
  onLoad(options) {
    if (options && options.id) {
      this.editId = Number(options.id)
      uni.setNavigationBarTitle({ title: '编辑纪念日' })
      this.loadEditData()
    } else {
      uni.setNavigationBarTitle({ title: '添加纪念日' })
      this.initDefaultDate()
    }
  },
  methods: {
    buildFormDateString() {
      if (!this.formDateValue) return ''
      if (this.formTimeEnabled) {
        return buildDateTimeFromParts(
          this.formDateValue,
          this.formHour,
          this.formMinute,
          this.formSecond
        )
      }
      return buildDateOnlyFromTimestamp(this.formDateValue)
    },
    syncFormDate() {
      this.formDate = this.buildFormDateString()
    },
    initDefaultDate() {
      this.formDateValue = day().valueOf()
      this.formHour = 0
      this.formMinute = 0
      this.formSecond = 0
      this.formTimeEnabled = false
      this.syncFormDate()
    },
    loadEditData() {
      const item = getMemorialDayById(this.editId)
      if (!item) {
        uni.showToast({ title: '纪念日不存在', icon: 'none' })
        setTimeout(() => uni.navigateBack(), 800)
        return
      }
      this.formTitle = item.title || ''
      this.formDate = item.date || ''
      this.formRepeatYearly = !!item.repeatYearly
      const parsed = parseDateTime(item.date)
      this.formDateValue = parsed ? parsed.valueOf() : day().valueOf()
      this.formTimeEnabled = hasDateTimePart(item.date)
      const parts = parseDateTimeParts(item.date)
      this.formHour = parts.hour
      this.formMinute = parts.minute
      this.formSecond = parts.second
    },
    enableTime() {
      this.formTimeEnabled = true
      this.syncFormDate()
      this.openTimePicker()
    },
    disableTime() {
      this.formTimeEnabled = false
      this.formHour = 0
      this.formMinute = 0
      this.formSecond = 0
      this.syncFormDate()
    },
    openDatePicker() {
      this.showDatePicker = true
    },
    openTimePicker() {
      this.showTimePicker = true
    },
    onRepeatChange(e) {
      this.formRepeatYearly = !!(e.detail && e.detail.value)
    },
    onDateConfirm(e) {
      let val = e && e.value !== undefined ? e.value : e
      this.formDateValue = pickerValueToTimestamp(val)
      this.syncFormDate()
      this.showDatePicker = false
    },
    onTimeConfirm(e) {
      const values = e.value || []
      const indexs = e.indexs || []
      const pick = (i) => {
        if (values[i] !== undefined) return parseInt(values[i], 10)
        if (indexs[i] !== undefined) return indexs[i]
        return 0
      }
      this.formHour = pick(0)
      this.formMinute = pick(1)
      this.formSecond = pick(2)
      this.syncFormDate()
      this.showTimePicker = false
    },
    onSubmit() {
      if (this.submitting) return
      const title = (this.formTitle || '').trim()
      if (!title) {
        uni.showToast({ title: '请输入名称', icon: 'none' })
        return
      }
      if (!this.formDate) {
        uni.showToast({ title: '请选择年月日', icon: 'none' })
        return
      }
      this.submitting = true
      const date = this.buildFormDateString()
      const existing = this.isEdit ? getMemorialDayById(this.editId) : null
      upsertMemorialDay({
        id: this.isEdit ? this.editId : Date.now(),
        title,
        date,
        repeatYearly: this.formRepeatYearly,
        theme: (existing && existing.theme) || 'love'
      })
      if (!this.isEdit) {
        uni.setStorageSync('memorialDate', date.substr(0, 10))
      }
      uni.showToast({
        title: this.isEdit ? '已保存' : '已添加',
        icon: 'success'
      })
      setTimeout(() => {
        this.submitting = false
        uni.navigateBack()
      }, 400)
    },
    onDelete() {
      uni.showModal({
        title: '删除纪念日',
        content: '确定要删除这条纪念日吗？删除后无法恢复。',
        confirmColor: DS.colorPrimary,
        success: (res) => {
          if (!res.confirm) return
          deleteMemorialDay(this.editId)
          uni.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 400)
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
  padding-bottom: calc(220rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.page-bg {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 480rpx;
  background: linear-gradient(135deg, #fce7f3 0%, #e0e7ff 100%);
  opacity: 0.55;
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 48rpx 48rpx 0;
}

.page-tip {
  display: block;
  margin-bottom: 32rpx;
  font-size: 26rpx;
  line-height: 40rpx;
  color: var(--text-secondary);
}

.form-card {
  background: var(--bg-card);
  border-radius: 24rpx;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.form-section {
  padding: 48rpx;
}

.form-section + .form-section {
  padding-top: 40rpx;
  border-top: 1rpx solid var(--border-color);
}

.field-label {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  line-height: 40rpx;
  color: var(--text-secondary);
  margin-bottom: 16rpx;
}

.field-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  line-height: 88rpx;
  color: var(--text-primary);
  background: var(--bg-card);
  border: 1rpx solid var(--border-color);
  border-radius: 16rpx;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.ph {
  color: var(--text-placeholder);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-head-label {
  margin-bottom: 0;
}

.field-hint {
  font-size: 22rpx;
  line-height: 32rpx;
  color: var(--text-placeholder);
}

.datetime-preview {
  margin-bottom: 16rpx;
  padding: 24rpx;
  background: var(--bg-emphasis);
  border-radius: 16rpx;
}

.datetime-preview-text {
  font-size: 28rpx;
  font-weight: 500;
  line-height: 40rpx;
  color: var(--color-primary);
}

.datetime-pickers {
  background: var(--bg-hover);
  border-radius: 16rpx;
  overflow: hidden;
}

.datetime-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  min-height: 96rpx;
  box-sizing: border-box;
  transition: background 0.3s ease;
}

.datetime-row + .datetime-row {
  border-top: 1rpx solid var(--border-color);
}

.datetime-row--press {
  background: var(--bg-card);
}

.datetime-row-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.datetime-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.datetime-part-label {
  font-size: 28rpx;
  line-height: 40rpx;
  color: var(--text-regular);
}

.datetime-row-right {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: 24rpx;
}

.datetime-value,
.datetime-placeholder {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: 30rpx;
  line-height: 40rpx;
  padding-right: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.datetime-value {
  color: var(--text-primary);
  font-weight: 500;
}

.datetime-placeholder {
  color: var(--text-placeholder);
}

.datetime-icon--muted {
  background: var(--neutral-light);
}

.datetime-row--add .datetime-add-label {
  font-size: 28rpx;
  line-height: 40rpx;
  color: var(--text-regular);
}

.datetime-add-hint {
  font-size: 24rpx;
  line-height: 36rpx;
  color: var(--text-placeholder);
  padding-right: 12rpx;
}

.datetime-clear {
  padding: 16rpx 24rpx 24rpx;
  text-align: center;
  transition: background 0.3s ease;
}

.datetime-clear--press {
  opacity: 0.72;
}

.datetime-clear-text {
  font-size: 24rpx;
  line-height: 36rpx;
  color: var(--text-secondary);
}

.repeat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.repeat-copy {
  flex: 1;
  min-width: 0;
}

.repeat-title {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 44rpx;
  color: var(--text-primary);
}

.repeat-hint {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 36rpx;
  color: var(--text-secondary);
}

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: 24rpx 48rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: linear-gradient(
    180deg,
    rgba(246, 247, 251, 0) 0%,
    var(--bg-page) 32%
  );
}

.btn-primary {
  height: 88rpx;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary) 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.btn-primary--press {
  opacity: 0.92;
  transform: scale(0.98);
}

.btn-primary--disabled {
  background: #e5e7eb;
  box-shadow: none;
}

.btn-primary--disabled .btn-primary-text {
  color: #9ca3af;
}

.btn-primary-text {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--text-white);
}

.btn-danger {
  margin-top: 16rpx;
  height: 88rpx;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1rpx solid var(--error-light);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.btn-danger--press {
  background: var(--error-light);
}

.btn-danger-text {
  font-size: 28rpx;
  color: var(--error);
}
</style>
