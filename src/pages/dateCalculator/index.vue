<template>
  <view class="life-tool-page">
    <view class="life-tool-page__bg" aria-hidden="true" />
    <view class="life-tool-page__content">
      <view class="segment-tabs">
        <view
          v-for="(tab, idx) in tabs"
          :key="tab.id"
          :class="['segment-tab', activeTab === idx ? 'segment-tab--active' : '']"
          @click="activeTab = idx"
        >
          <text class="segment-tab__text">{{ tab.label }}</text>
        </view>
      </view>

      <!-- 计算日期间隔 -->
      <template v-if="activeTab === 0">
        <view class="life-tool-card">
          <view class="date-field" @click="openPicker('start')">
            <text class="date-field__label">开始日期</text>
            <view class="date-field__box">
              <text class="date-field__value">{{ startDate }}</text>
              <u-icon name="calendar" size="18" color="#8692A6" />
            </view>
          </view>
          <view class="date-field" @click="openPicker('end')">
            <text class="date-field__label">结束日期</text>
            <view class="date-field__box">
              <text class="date-field__value">{{ endDate }}</text>
              <u-icon name="calendar" size="18" color="#8692A6" />
            </view>
          </view>
        </view>

        <view class="life-tool-card result-card">
          <view class="result-main">
            <text class="result-main__label">相差天数</text>
            <view class="result-main__row">
              <text class="result-main__num">{{ intervalDiff.totalDays }}</text>
              <text class="result-main__unit">天</text>
            </view>
          </view>
          <view class="result-breakdown">
            <view class="result-breakdown__item">
              <text class="result-breakdown__label">年</text>
              <text class="result-breakdown__num">{{ intervalDiff.years }}</text>
            </view>
            <view class="result-breakdown__item">
              <text class="result-breakdown__label">月</text>
              <text class="result-breakdown__num">{{ intervalDiff.months }}</text>
            </view>
            <view class="result-breakdown__item">
              <text class="result-breakdown__label">天</text>
              <text class="result-breakdown__num">{{ intervalDiff.days }}</text>
            </view>
          </view>
        </view>
      </template>

      <!-- 推算日期 -->
      <template v-else>
        <view class="life-tool-card">
          <view class="date-field" @click="openPicker('base')">
            <text class="date-field__label">基准日期</text>
            <view class="date-field__box">
              <text class="date-field__value">{{ baseDate }}</text>
              <u-icon name="calendar" size="18" color="#8692A6" />
            </view>
          </view>
          <view class="offset-row">
            <text class="offset-row__label">推算</text>
            <view class="life-tool-stepper">
              <view class="life-tool-stepper__btn" @click="changeOffset(-1)">
                <text class="life-tool-stepper__symbol">−</text>
              </view>
              <text class="life-tool-stepper__value">{{ offsetAmount }}</text>
              <view class="life-tool-stepper__btn" @click="changeOffset(1)">
                <text class="life-tool-stepper__symbol">+</text>
              </view>
            </view>
          </view>
          <view class="unit-chips">
            <view
              v-for="u in offsetUnits"
              :key="u.id"
              :class="['unit-chip', offsetUnit === u.id ? 'unit-chip--active' : '']"
              @click="offsetUnit = u.id"
            >
              <text class="unit-chip__text">{{ u.label }}</text>
            </view>
          </view>
          <view class="direction-row">
            <view
              :class="['dir-btn', offsetForward ? 'dir-btn--active' : '']"
              @click="offsetForward = true"
            >
              <text class="dir-btn__text">往后</text>
            </view>
            <view
              :class="['dir-btn', !offsetForward ? 'dir-btn--active' : '']"
              @click="offsetForward = false"
            >
              <text class="dir-btn__text">往前</text>
            </view>
          </view>
        </view>

        <view class="life-tool-card result-card">
          <view class="result-main">
            <text class="result-main__label">推算结果</text>
            <text class="offset-result-date">{{ offsetResultDate }}</text>
            <text v-if="offsetResultWeekday" class="offset-result-week">{{ offsetResultWeekday }}</text>
          </view>
        </view>
      </template>
    </view>

    <view class="life-tool-footer">
      <view
        class="life-tool-footer__btn"
        hover-class="life-tool-footer__btn--press"
        :hover-stay-time="100"
        @click="onReset"
      >
        <text class="life-tool-footer__btn-text">重置</text>
      </view>
    </view>

    <u-datetime-picker
      v-model="pickerValue"
      mode="date"
      :show="showPicker"
      @confirm="onPickerConfirm"
      @cancel="showPicker = false"
      @close="showPicker = false"
    />
  </view>
</template>

<script>
import day from '@/utils/dayjs.js'
import { todayIsoDate, buildDateOnlyFromTimestamp, pickerValueToTimestamp } from '@/utils/dateHelpers.js'
import { getCalendarDateDiff, offsetDate, formatDateWeekday } from '@/utils/dateCalculator.js'

const DEFAULT_START = '2024-05-20'
const DEFAULT_END = '2024-06-15'

export default {
  data() {
    return {
      tabs: [
        { id: 'interval', label: '计算日期间隔' },
        { id: 'offset', label: '推算日期' }
      ],
      activeTab: 0,
      startDate: DEFAULT_START,
      endDate: DEFAULT_END,
      baseDate: todayIsoDate(),
      offsetAmount: 7,
      offsetUnit: 'day',
      offsetForward: true,
      offsetUnits: [
        { id: 'day', label: '天' },
        { id: 'week', label: '周' },
        { id: 'month', label: '月' },
        { id: 'year', label: '年' }
      ],
      showPicker: false,
      pickerTarget: 'start',
      pickerValue: day().valueOf()
    }
  },
  computed: {
    intervalDiff() {
      return getCalendarDateDiff(this.startDate, this.endDate)
    },
    offsetResultDate() {
      return offsetDate(this.baseDate, this.offsetAmount, this.offsetUnit, this.offsetForward)
    },
    offsetResultWeekday() {
      return formatDateWeekday(this.offsetResultDate)
    }
  },
  methods: {
    openPicker(target) {
      this.pickerTarget = target
      let iso = this.startDate
      if (target === 'end') iso = this.endDate
      else if (target === 'base') iso = this.baseDate
      const d = day(iso)
      this.pickerValue = d.isValid() ? d.valueOf() : day().valueOf()
      this.showPicker = true
    },
    onPickerConfirm(e) {
      const val = e && e.value !== undefined ? e.value : e
      const iso = buildDateOnlyFromTimestamp(pickerValueToTimestamp(val))
      if (this.pickerTarget === 'start') this.startDate = iso
      else if (this.pickerTarget === 'end') this.endDate = iso
      else this.baseDate = iso
      this.showPicker = false
    },
    changeOffset(delta) {
      const next = this.offsetAmount + delta
      this.offsetAmount = next < 0 ? 0 : next
    },
    onReset() {
      if (this.activeTab === 0) {
        this.startDate = DEFAULT_START
        this.endDate = DEFAULT_END
      } else {
        this.baseDate = todayIsoDate()
        this.offsetAmount = 7
        this.offsetUnit = 'day'
        this.offsetForward = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/style/life-tool-page.scss';

.segment-tabs {
  display: flex;
  background: #e8ebf3;
  border-radius: 20rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
}

.segment-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 12rpx;
  border-radius: 16rpx;
}

.segment-tab--active {
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.segment-tab__text {
  font-size: 26rpx;
  color: var(--text-secondary);
  font-weight: 500;
}

.segment-tab--active .segment-tab__text {
  color: var(--color-primary);
  font-weight: 600;
}

.date-field {
  padding: 24rpx 32rpx;
}

.date-field + .date-field {
  border-top: 1rpx solid var(--border-color);
}

.date-field__label {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 16rpx;
}

.date-field__box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  padding: 0 24rpx;
  border: 1rpx solid var(--border-color);
  border-radius: 16rpx;
  background: var(--bg-card);
  box-sizing: border-box;
}

.date-field__value {
  font-size: 30rpx;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.result-card {
  padding: 40rpx 32rpx 32rpx;
}

.result-main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-main__label {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.result-main__row {
  display: flex;
  align-items: baseline;
  margin-top: 16rpx;
}

.result-main__num {
  font-size: 72rpx;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.result-main__unit {
  margin-left: 8rpx;
  font-size: 32rpx;
  color: var(--text-regular);
  font-weight: 500;
}

.result-breakdown {
  display: flex;
  margin-top: 40rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid var(--border-color);
}

.result-breakdown__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-breakdown__label {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.result-breakdown__num {
  margin-top: 12rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.offset-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid var(--border-color);
}

.offset-row__label {
  font-size: 28rpx;
  color: var(--text-primary);
}

.unit-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 0 32rpx 24rpx;
}

.unit-chip {
  padding: 12rpx 28rpx;
  border-radius: var(--radius-full);
  background: var(--bg-hover);
  border: 1rpx solid var(--border-color);
}

.unit-chip--active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.unit-chip__text {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.unit-chip--active .unit-chip__text {
  color: var(--color-primary);
  font-weight: 600;
}

.direction-row {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 28rpx;
}

.dir-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: var(--bg-hover);
  border: 1rpx solid var(--border-color);
}

.dir-btn--active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.dir-btn__text {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.dir-btn--active .dir-btn__text {
  color: var(--color-primary);
  font-weight: 600;
}

.offset-result-date {
  margin-top: 20rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-primary);
}

.offset-result-week {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--text-secondary);
}
</style>
