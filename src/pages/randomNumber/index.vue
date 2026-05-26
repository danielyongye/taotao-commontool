<template>
  <view class="life-tool-page">
    <view class="life-tool-page__bg" aria-hidden="true" />
    <view class="life-tool-page__content">
      <view class="life-tool-card">
        <view class="range-row">
          <view class="range-row__main">
            <text class="range-row__label">最小值</text>
            <text class="range-row__num">{{ minValue }}</text>
          </view>
          <view class="life-tool-stepper">
            <view class="life-tool-stepper__btn" @click="changeMin(-1)">
              <text class="life-tool-stepper__symbol">−</text>
            </view>
            <view class="life-tool-stepper__btn" @click="changeMin(1)">
              <text class="life-tool-stepper__symbol">+</text>
            </view>
          </view>
        </view>
        <view class="range-row">
          <view class="range-row__main">
            <text class="range-row__label">最大值</text>
            <text class="range-row__num">{{ maxValue }}</text>
          </view>
          <view class="life-tool-stepper">
            <view class="life-tool-stepper__btn" @click="changeMax(-1)">
              <text class="life-tool-stepper__symbol">−</text>
            </view>
            <view class="life-tool-stepper__btn" @click="changeMax(1)">
              <text class="life-tool-stepper__symbol">+</text>
            </view>
          </view>
        </view>
      </view>

      <view class="life-tool-card result-panel">
        <text class="result-panel__label">随机结果</text>
        <text class="result-panel__value">{{ resultDisplay }}</text>
        <view
          class="life-tool-primary-btn"
          hover-class="life-tool-footer__btn--press"
          :hover-stay-time="100"
          @click="generate"
        >
          <text class="life-tool-primary-btn__text">生成随机数</text>
        </view>
      </view>

      <view v-if="history.length" class="life-tool-card history-card">
        <text class="history-card__label">历史记录</text>
        <scroll-view scroll-x class="history-scroll" :show-scrollbar="false">
          <view class="history-list">
            <view v-for="(n, idx) in history" :key="idx" class="history-chip">
              <text class="history-chip__text">{{ n }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
const HISTORY_MAX = 12

export default {
  data() {
    return {
      minValue: 1,
      maxValue: 100,
      currentResult: null,
      history: []
    }
  },
  computed: {
    resultDisplay() {
      return this.currentResult != null ? String(this.currentResult) : '--'
    }
  },
  methods: {
    changeMin(delta) {
      const next = this.minValue + delta
      if (next < 0) return
      this.minValue = next
      if (this.minValue > this.maxValue) this.maxValue = this.minValue
    },
    changeMax(delta) {
      const next = this.maxValue + delta
      if (next < 0) return
      this.maxValue = next
      if (this.maxValue < this.minValue) this.minValue = this.maxValue
    },
    generate() {
      const min = this.minValue
      const max = this.maxValue
      if (max < min) {
        uni.showToast({ title: '最大值不能小于最小值', icon: 'none' })
        return
      }
      const n = Math.floor(Math.random() * (max - min + 1)) + min
      this.currentResult = n
      this.history = [n, ...this.history].slice(0, HISTORY_MAX)
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/style/life-tool-page.scss';

.range-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
}

.range-row + .range-row {
  border-top: 1rpx solid var(--border-color);
}

.range-row__main {
  flex: 1;
}

.range-row__label {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 8rpx;
}

.range-row__num {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.result-panel {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-panel__label {
  align-self: flex-start;
  font-size: 26rpx;
  color: var(--text-secondary);
}

.result-panel__value {
  margin: 32rpx 0 8rpx;
  font-size: 96rpx;
  font-weight: 700;
  line-height: 1;
  color: var(--color-primary);
}

.history-card {
  padding: 28rpx 32rpx 32rpx;
}

.history-card__label {
  display: block;
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-bottom: 20rpx;
}

.history-scroll {
  width: 100%;
  white-space: nowrap;
}

.history-list {
  display: inline-flex;
  gap: 16rpx;
}

.history-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  height: 72rpx;
  padding: 0 20rpx;
  border-radius: 16rpx;
  border: 1rpx solid var(--border-color);
  background: var(--bg-card);
  box-sizing: border-box;
}

.history-chip__text {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
}
</style>
