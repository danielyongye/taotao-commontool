<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />
    <view class="page-content">
      <text class="page-tip">{{ isEdit ? '修改后将更新列表中的倒计时' : '记录一个重要日子，倒数每一天' }}</text>

      <view class="form-card">
        <view class="form-section">
          <text class="field-label">事件名称</text>
          <input
            v-model="formName"
            class="field-input"
            type="text"
            maxlength="40"
            placeholder="例如：旅行、考试、生日"
            placeholder-class="ph"
            confirm-type="done"
          />
        </view>

        <view class="form-section">
          <view class="section-head">
            <text class="field-label section-head-label">目标日期</text>
            <text class="field-hint">年月日必填</text>
          </view>
          <view
            class="datetime-row"
            hover-class="datetime-row--press"
            :hover-stay-time="100"
            @click="showDatePicker = true"
          >
            <view class="datetime-row-left">
              <view class="datetime-icon">
                <u-icon name="calendar" size="18" :color="ds.colorPrimary" />
              </view>
              <text class="datetime-part-label">选择日期</text>
            </view>
            <view class="datetime-row-right">
              <text :class="formDate ? 'datetime-value' : 'datetime-placeholder'">
                {{ formDate ? datePreview : '选择年月日' }}
              </text>
              <u-icon name="arrow-right" size="14" :color="ds.textSecondary" />
            </view>
          </view>
        </view>

        <view class="form-section form-section-repeat">
          <view class="repeat-row">
            <view class="repeat-copy">
              <text class="repeat-title">每年重复</text>
              <text class="repeat-hint">仅比较月日，适合生日、元旦等</text>
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
        <text class="btn-danger-text">删除倒数日</text>
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
  </view>
</template>

<script>
import { DS } from '@/constants/designSystem.js'
import day from '@/utils/dayjs.js'
import {
  buildDateOnlyFromTimestamp,
  pickerValueToTimestamp,
  todayIsoDate
} from '@/utils/dateHelpers.js'
import {
  getCountdownDayById,
  upsertCountdownDay,
  deleteCountdownDay,
  formatCountdownDateLabel
} from '@/utils/countdownDays.js'

export default {
  data() {
    return {
      ds: DS,
      editId: null,
      formName: '',
      formDate: '',
      formDateValue: day().valueOf(),
      formRepeatYearly: false,
      showDatePicker: false,
      submitting: false
    }
  },
  computed: {
    isEdit() {
      return !!this.editId
    },
    canSubmit() {
      return !!(this.formName || '').trim() && !!this.formDate
    },
    submitLabel() {
      if (this.submitting) return '保存中…'
      return this.isEdit ? '保存' : '添加倒数日'
    },
    datePreview() {
      if (!this.formDate) return ''
      return formatCountdownDateLabel({
        date: this.formDate,
        repeatYearly: this.formRepeatYearly
      })
    }
  },
  onLoad(options) {
    if (options && options.id) {
      this.editId = decodeURIComponent(options.id)
      uni.setNavigationBarTitle({ title: '编辑倒数日' })
      this.loadEditData()
    } else {
      uni.setNavigationBarTitle({ title: '添加倒数日' })
      this.formDate = todayIsoDate()
      this.formDateValue = day(this.formDate).valueOf()
    }
  },
  methods: {
    loadEditData() {
      const item = getCountdownDayById(this.editId)
      if (!item) {
        uni.showToast({ title: '未找到该倒数日', icon: 'none' })
        setTimeout(() => uni.navigateBack(), 1500)
        return
      }
      this.formName = item.name || ''
      this.formDate = String(item.date).substr(0, 10)
      this.formDateValue = day(this.formDate).valueOf()
      this.formRepeatYearly = !!item.repeatYearly
    },
    onRepeatChange(e) {
      this.formRepeatYearly = !!(e.detail && e.detail.value)
    },
    onDateConfirm(e) {
      const val = e && e.value !== undefined ? e.value : e
      this.formDateValue = pickerValueToTimestamp(val)
      this.formDate = buildDateOnlyFromTimestamp(this.formDateValue)
      this.showDatePicker = false
    },
    onSubmit() {
      if (!this.canSubmit || this.submitting) return
      this.submitting = true
      const existing = this.isEdit ? getCountdownDayById(this.editId) : null
      const entry = {
        id: this.isEdit ? (existing ? existing.id : this.editId) : Date.now(),
        name: (this.formName || '').trim(),
        date: this.formDate,
        repeatYearly: this.formRepeatYearly,
        theme: (existing && existing.theme) || 'default'
      }
      try {
        upsertCountdownDay(entry)
        uni.showToast({ title: '已保存', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 400)
      } catch (err) {
        console.error('[countdownEdit] save failed', err)
        uni.showToast({ title: '保存失败', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    onDelete() {
      uni.showModal({
        title: '删除倒数日',
        content: '删除后无法恢复，确定删除吗？',
        confirmColor: DS.error,
        success: (res) => {
          if (!res.confirm) return
          deleteCountdownDay(this.editId)
          uni.showToast({ title: '已删除', icon: 'success' })
          const pages = getCurrentPages()
          const delta = pages.length >= 3 ? 2 : 1
          setTimeout(() => uni.navigateBack({ delta }), 400)
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
  padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
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

.datetime-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  min-height: 96rpx;
  background: var(--bg-hover);
  border-radius: 16rpx;
  box-sizing: border-box;
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

.repeat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.repeat-title {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

.repeat-hint {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
  line-height: 1.4;
}

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 48rpx calc(24rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, transparent 0%, var(--bg-page) 24%);
  z-index: 10;
}

.btn-primary {
  height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: opacity 0.3s ease;
}

.btn-primary--disabled {
  opacity: 0.45;
}

.btn-primary--press {
  opacity: 0.88;
}

.btn-primary-text {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--text-white);
}

.btn-danger {
  margin-top: 24rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-danger--press {
  opacity: 0.72;
}

.btn-danger-text {
  font-size: 28rpx;
  color: var(--error);
}
</style>
