<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />
    <view v-if="item" class="page-content">
      <view class="hero-card">
        <view class="hero-icon" :style="{ background: item.iconBg }">
          <u-icon :name="item.icon" size="24" :color="item.countColor" />
        </view>
        <view class="hero-body">
          <text class="hero-title">{{ item.title }}</text>
          <text class="hero-date">{{ heroDateLabel }}</text>
          <view v-if="item.repeatYearly" class="hero-tag">
            <text class="hero-tag-text">每年重复</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <view class="section-icon">
            <u-icon name="clock-fill" size="20" :color="ds.colorPrimary" />
          </view>
          <text class="section-title">距离这一天还有</text>
        </view>
        <view class="timer-card">
          <text class="timer-main" :style="{ color: item.countColor }">{{ mainDisplay }}</text>
          <text class="timer-tip">期待那一天的到来</text>
        </view>
      </view>

      <view class="breakdown-card">
        <view
          v-for="(unit, index) in breakdownUnits"
          :key="unit.label"
          class="breakdown-item"
          :class="{ 'breakdown-item--solo': breakdownLastRowSolo && index === breakdownUnits.length - 1 }"
        >
          <text class="breakdown-num" :style="{ color: item.countColor }">{{ unit.value }}</text>
          <text class="breakdown-label">{{ unit.label }}</text>
        </view>
      </view>
    </view>

    <view v-if="item" class="footer-bar">
      <view
        class="btn-primary"
        hover-class="btn-primary--press"
        :hover-stay-time="100"
        @click="goEdit"
      >
        <text class="btn-primary-text">编辑倒数日</text>
      </view>
      <view
        class="btn-danger"
        hover-class="btn-danger--press"
        :hover-stay-time="100"
        @click="onDelete"
      >
        <text class="btn-danger-text">删除倒数日</text>
      </view>
    </view>
  </view>
</template>

<script>
import { DS } from '@/constants/designSystem.js'
import {
  getCountdownDayById,
  enrichCountdownItem,
  deleteCountdownDay,
  formatCountdownHeroDateLabel,
  EDIT_PAGE
} from '@/utils/countdownDays.js'
import { remainingMsUntilMemorial, getCountdownUnits } from '@/utils/memorialElapsed.js'
import { remainingMsUntilYearly } from '@/utils/memorialDays.js'

const BREAKDOWN_LABELS = [
  { key: 'years', label: '年' },
  { key: 'months', label: '月' },
  { key: 'weeks', label: '周' },
  { key: 'days', label: '天' },
  { key: 'hours', label: '小时' },
  { key: 'minutes', label: '分钟' },
  { key: 'seconds', label: '秒' }
]

export default {
  data() {
    return {
      ds: DS,
      itemId: null,
      item: null,
      durationMs: 0,
      timer: null
    }
  },
  computed: {
    heroDateLabel() {
      if (!this.item) return ''
      return formatCountdownHeroDateLabel(this.item)
    },
    mainDisplay() {
      if (!this.item) return ''
      const days = Math.floor(this.durationMs / 86400000)
      return `${days} 天`
    },
    breakdownUnits() {
      const units = getCountdownUnits(this.durationMs)
      return BREAKDOWN_LABELS.map(({ key, label }) => ({
        label,
        value: units[key] ?? 0
      }))
    },
    breakdownLastRowSolo() {
      const n = this.breakdownUnits.length
      return n > 0 && n % 3 === 1
    }
  },
  onLoad(options) {
    if (options && options.id) {
      this.itemId = decodeURIComponent(options.id)
    }
    this.loadItem()
  },
  onShow() {
    this.loadItem()
    this.startTimer()
  },
  onHide() {
    this.stopTimer()
  },
  onUnload() {
    this.stopTimer()
  },
  methods: {
    loadItem() {
      if (!this.itemId) {
        this.handleMissing()
        return
      }
      const raw = getCountdownDayById(this.itemId)
      if (!raw) {
        this.handleMissing()
        return
      }
      this.item = enrichCountdownItem(raw)
      uni.setNavigationBarTitle({ title: raw.name || '倒数日' })
      this.updateDuration()
    },
    handleMissing() {
      uni.showToast({ title: '倒数日不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 400)
    },
    updateDuration() {
      if (!this.item) return
      if (this.item.repeatYearly) {
        this.durationMs = remainingMsUntilYearly(this.item.date)
        return
      }
      this.durationMs = remainingMsUntilMemorial(this.item.date)
    },
    startTimer() {
      this.stopTimer()
      if (!this.item) return
      this.updateDuration()
      this.timer = setInterval(() => {
        this.updateDuration()
      }, 1000)
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    goEdit() {
      if (!this.itemId) return
      uni.navigateTo({
        url: `${EDIT_PAGE}?id=${encodeURIComponent(this.itemId)}`
      })
    },
    onDelete() {
      uni.showModal({
        title: '删除倒数日',
        content: '删除后无法恢复，确定删除吗？',
        confirmColor: DS.error,
        success: (res) => {
          if (!res.confirm) return
          deleteCountdownDay(this.itemId)
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
}

.page-bg {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 520rpx;
  background: linear-gradient(180deg, #f3f0ff 0%, var(--bg-page) 100%);
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 32rpx 28rpx;
  padding-bottom: calc(240rpx + env(safe-area-inset-bottom));
}

.hero-card {
  display: flex;
  align-items: flex-start;
  padding: 40rpx;
  background: linear-gradient(135deg, #fce7f3 0%, #e0e7ff 100%);
  border-radius: 32rpx;
  box-shadow: var(--shadow-sm);
}

.hero-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-body {
  flex: 1;
  margin-left: 24rpx;
  min-width: 0;
}

.hero-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.35;
}

.hero-date {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--text-secondary);
  line-height: 1.4;
}

.hero-tag {
  display: inline-flex;
  margin-top: 16rpx;
  padding: 6rpx 16rpx;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 999rpx;
}

.hero-tag-text {
  font-size: 22rpx;
  color: var(--color-primary);
}

.section {
  margin-top: 32rpx;
}

.section-head {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.timer-card {
  padding: 48rpx 40rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.timer-main {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  line-height: 1.2;
}

.timer-tip {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: var(--text-secondary);
}

.breakdown-card {
  margin-top: 24rpx;
  padding: 32rpx 24rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24rpx 16rpx;
}

.breakdown-item {
  width: calc((100% - 32rpx) / 3);
  text-align: center;
  box-sizing: border-box;
}

.breakdown-num {
  font-size: 36rpx;
  font-weight: 700;
  line-height: 48rpx;
}

.breakdown-label {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 36rpx;
  color: var(--text-secondary);
}

.breakdown-item--solo {
  width: 100%;
  max-width: 360rpx;
}

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: 24rpx 48rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(246, 247, 251, 0) 0%, var(--bg-page) 32%);
}

.btn-primary {
  height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--color-primary) 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.btn-primary--press {
  opacity: 0.92;
  transform: scale(0.98);
}

.btn-primary-text {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--text-white);
}

.btn-danger {
  margin-top: 20rpx;
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
