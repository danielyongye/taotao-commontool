<template>
  <view class="life-tool-page">
    <view class="life-tool-page__bg" aria-hidden="true" />
    <view class="life-tool-page__content">
      <view class="life-tool-card">
        <view class="life-tool-row">
          <text class="life-tool-row__label">身高</text>
          <input
            v-model="height"
            class="life-tool-row__value bmi-input"
            type="digit"
            placeholder="175"
            placeholder-class="bmi-ph"
          />
          <text class="life-tool-row__unit">cm</text>
        </view>
        <view class="life-tool-row">
          <text class="life-tool-row__label">体重</text>
          <input
            v-model="weight"
            class="life-tool-row__value bmi-input"
            type="digit"
            placeholder="70"
            placeholder-class="bmi-ph"
          />
          <text class="life-tool-row__unit">kg</text>
        </view>
      </view>

      <view class="life-tool-card bmi-result-card">
        <view class="bmi-result-head">
          <text class="bmi-result-head__label">你的BMI</text>
          <view :class="['bmi-badge', `bmi-badge--${level.tone}`]">
            <text class="bmi-badge__text">{{ level.label }}</text>
          </view>
        </view>
        <text class="bmi-value">{{ bmiDisplay }}</text>

        <view class="bmi-scale-wrap">
          <view class="bmi-scale">
            <view class="bmi-scale__seg bmi-scale__seg--low" />
            <view class="bmi-scale__seg bmi-scale__seg--ok" />
            <view class="bmi-scale__seg bmi-scale__seg--high" />
            <view class="bmi-scale__pointer" :style="{ left: scaleLeft }">
              <u-icon name="heart-fill" size="14" :color="pointerColor" />
            </view>
          </view>
          <view class="bmi-scale-labels">
            <view class="bmi-scale-labels__item">
              <text class="bmi-scale-labels__num">18.5</text>
              <text class="bmi-scale-labels__hint">正常下限</text>
            </view>
            <view class="bmi-scale-labels__item bmi-scale-labels__item--right">
              <text class="bmi-scale-labels__num">24</text>
              <text class="bmi-scale-labels__hint">正常上限</text>
            </view>
          </view>
        </view>

        <view class="bmi-desc">
          <text class="bmi-desc__title">BMI说明</text>
          <text class="bmi-desc__text">{{ level.desc }}</text>
          <text class="bmi-desc__tip">{{ level.tip }}</text>
          <text class="bmi-desc__note">{{ referenceNote }}</text>
        </view>
      </view>
    </view>

    <view class="life-tool-footer">
      <view
        class="life-tool-footer__btn"
        hover-class="life-tool-footer__btn--press"
        :hover-stay-time="100"
        @click="onReset"
      >
        <text class="life-tool-footer__btn-text">重新计算</text>
      </view>
    </view>
  </view>
</template>

<script>
import {
  BMI_REFERENCE_NOTE,
  calcBmi,
  getBmiLevel,
  getBmiScalePosition
} from '@/utils/bmiCalculator.js'
import { DS } from '@/constants/designSystem.js'

export default {
  data() {
    return {
      ds: DS,
      referenceNote: BMI_REFERENCE_NOTE,
      height: '175',
      weight: '70'
    }
  },
  computed: {
    bmi() {
      return calcBmi(this.height, this.weight)
    },
    bmiDisplay() {
      return this.bmi != null ? String(this.bmi) : '--'
    },
    level() {
      return getBmiLevel(this.bmi)
    },
    scaleLeft() {
      const p = getBmiScalePosition(this.bmi)
      return `${Math.round(p * 100)}%`
    },
    pointerColor() {
      if (this.level.tone === 'success') return '#22C55E'
      if (this.level.tone === 'error') return '#EF4444'
      return '#F59E0B'
    }
  },
  methods: {
    onReset() {
      this.height = '175'
      this.weight = '70'
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/style/life-tool-page.scss';

.bmi-input {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: 36rpx;
  font-weight: 600;
}

.bmi-ph {
  color: var(--text-placeholder);
  font-weight: 400;
}

.bmi-result-card {
  padding: 32rpx;
}

.bmi-result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bmi-result-head__label {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.bmi-badge {
  padding: 8rpx 20rpx;
  border-radius: var(--radius-full);
}

.bmi-badge--success {
  background: var(--success-light);
}

.bmi-badge--success .bmi-badge__text {
  color: var(--success);
}

.bmi-badge--warning {
  background: var(--warning-light);
}

.bmi-badge--warning .bmi-badge__text {
  color: var(--warning);
}

.bmi-badge--error {
  background: var(--error-light);
}

.bmi-badge--error .bmi-badge__text {
  color: var(--error);
}

.bmi-badge__text {
  font-size: 24rpx;
  font-weight: 600;
}

.bmi-value {
  display: block;
  margin-top: 16rpx;
  font-size: 80rpx;
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-primary);
}

.bmi-scale-wrap {
  margin-top: 40rpx;
}

.bmi-scale {
  position: relative;
  display: flex;
  height: 16rpx;
  border-radius: 8rpx;
  overflow: visible;
}

.bmi-scale__seg {
  flex: 1;
  height: 100%;
}

.bmi-scale__seg--low {
  background: #e8f5e9;
  border-radius: 8rpx 0 0 8rpx;
}

.bmi-scale__seg--ok {
  background: #86efac;
}

.bmi-scale__seg--high {
  background: #e5e7eb;
  border-radius: 0 8rpx 8rpx 0;
}

.bmi-scale__pointer {
  position: absolute;
  top: -20rpx;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bmi-scale-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;
}

.bmi-scale-labels__item {
  display: flex;
  flex-direction: column;
}

.bmi-scale-labels__item--right {
  align-items: flex-end;
}

.bmi-scale-labels__num {
  font-size: 24rpx;
  color: var(--text-regular);
  font-weight: 600;
}

.bmi-scale-labels__hint {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: var(--text-secondary);
}

.bmi-desc {
  margin-top: 32rpx;
  padding-top: 28rpx;
  border-top: 1rpx solid var(--border-color);
}

.bmi-desc__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.bmi-desc__text {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 40rpx;
  color: var(--text-regular);
}

.bmi-desc__tip {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 40rpx;
  color: var(--text-regular);
}

.bmi-desc__note {
  display: block;
  margin-top: 16rpx;
  font-size: 22rpx;
  line-height: 34rpx;
  color: var(--text-placeholder);
}
</style>
