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
          <text class="hero-date">{{ item.dateLabel }}</text>
          <view v-if="item.repeatYearly" class="hero-tag">
            <text class="hero-tag-text">每年重复</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <view class="section-icon">
            <u-icon :name="modeIcon" size="20" :color="ds.colorPrimary" />
          </view>
          <text class="section-title">{{ sectionTitle }}</text>
        </view>
        <view class="timer-card">
          <text class="timer-main" :style="{ color: item.countColor }">{{ mainDisplay }}</text>
          <text class="timer-tip">{{ timerTip }}</text>
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

      <view v-if="metaCreatedText" class="meta-card">
        <view class="meta-row">
          <text class="meta-label">创建时间</text>
          <text class="meta-value">{{ metaCreatedText }}</text>
        </view>
        <view v-if="showMetaUpdated" class="meta-row">
          <text class="meta-label">最近更新</text>
          <text class="meta-value">{{ metaUpdatedText }}</text>
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
        <text class="btn-primary-text">编辑纪念日</text>
      </view>
      <view
        class="btn-danger"
        hover-class="btn-danger--press"
        :hover-stay-time="100"
        @click="confirmDelete"
      >
        <text class="btn-danger-text">删除纪念日</text>
      </view>
    </view>
  </view>
</template>

<script>
import day from '@/utils/dayjs.js'
import { DS } from '@/constants/designSystem.js'
import { parseDate, parseDateTime } from '@/utils/dateHelpers.js'
import { formatRecordMetaTime } from '@/utils/dateHelpers.js'
import {
  getMemorialDayById,
  enrichMemorialDayItem,
  deleteMemorialDay,
  resolveMemorialTimestamps,
  daysUntilYearly,
  remainingMsUntilYearly
} from '@/utils/memorialDays.js'
import {
  elapsedMsSinceMemorial,
  remainingMsUntilMemorial,
  formatElapsedDuration,
  getElapsedUnits,
  getCountdownUnits
} from '@/utils/memorialElapsed.js'

const EDIT_PAGE = '/pages/memorialDayEdit/index'
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
      mode: 'elapsed',
      durationMs: 0,
      timer: null
    }
  },
  computed: {
    sectionTitle() {
      if (this.mode === 'countdown') return '距离这一天还有'
      if (this.mode === 'yearly') return '距离下次还有'
      return '已经过去了多久'
    },
    modeIcon() {
      if (this.mode === 'elapsed') return 'heart-fill'
      return 'clock-fill'
    },
    timerTip() {
      if (this.mode === 'countdown') return '期待那一天的到来'
      if (this.mode === 'yearly') return '每一年都值得庆祝'
      return '每一天都值得被铭记'
    },
    mainDisplay() {
      if (this.mode === 'yearly') {
        return `${daysUntilYearly(this.item.date)} 天`
      }
      return formatElapsedDuration(this.durationMs)
    },
    breakdownUnits() {
      let units
      if (this.mode === 'elapsed') {
        units = getElapsedUnits(this.durationMs, this.item.date)
      } else {
        units = getCountdownUnits(this.durationMs)
      }
      return BREAKDOWN_LABELS.map(({ key, label }) => ({
        label,
        value: units[key]
      }))
    },
    breakdownLastRowSolo() {
      const n = this.breakdownUnits.length
      return n > 0 && n % 3 === 1
    },
    memorialTimestamps() {
      if (!this.item) return { createdAt: null, updatedAt: null }
      return resolveMemorialTimestamps(this.item)
    },
    metaCreatedText() {
      return formatRecordMetaTime(this.memorialTimestamps.createdAt)
    },
    metaUpdatedText() {
      return formatRecordMetaTime(this.memorialTimestamps.updatedAt)
    },
    showMetaUpdated() {
      const { createdAt, updatedAt } = this.memorialTimestamps
      if (!createdAt || !updatedAt) return false
      return Math.abs(updatedAt - createdAt) > 1000
    }
  },
  onLoad(options) {
    this.itemId = options && options.id ? Number(options.id) : null
    this.loadItem()
  },
  onShow() {
    this.syncNavBarStyle()
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
    syncNavBarStyle() {
      uni.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#F3F0FF',
        animation: { duration: 0, timingFunc: 'linear' }
      })
    },
    loadItem() {
      if (!this.itemId) {
        this.handleMissing()
        return
      }
      const raw = getMemorialDayById(this.itemId)
      if (!raw) {
        this.handleMissing()
        return
      }
      this.item = enrichMemorialDayItem(raw)
      this.mode = resolveDetailMode(raw)
      uni.setNavigationBarTitle({ title: raw.title || '纪念日' })
      this.updateDuration()
    },
    handleMissing() {
      uni.showToast({ title: '纪念日不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 400)
    },
    updateDuration() {
      if (!this.item) return
      if (this.mode === 'yearly') {
        this.durationMs = remainingMsUntilYearly(this.item.date)
        return
      }
      if (this.mode === 'countdown') {
        this.durationMs = remainingMsUntilMemorial(this.item.date)
        return
      }
      this.durationMs = elapsedMsSinceMemorial(this.item.date)
    },
    startTimer() {
      this.stopTimer()
      if (!this.item || this.mode === 'yearly') return
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
      if (this.item && this.item.isDemo) {
        uni.showToast({ title: '示例数据不可编辑，请添加你的纪念日', icon: 'none' })
        return
      }
      uni.navigateTo({ url: `${EDIT_PAGE}?id=${this.itemId}` })
    },
    confirmDelete() {
      if (!this.itemId || !this.item) return
      const name = this.item.title || '这条纪念日'
      uni.showModal({
        title: '删除纪念日',
        content: `确定删除「${name}」吗？`,
        confirmColor: DS.colorPrimary,
        success: (res) => {
          if (!res.confirm) return
          uni.showModal({
            title: '再次确认',
            content: '删除后无法恢复，请再次确认是否删除。',
            confirmText: '确认删除',
            confirmColor: DS.error,
            success: (res2) => {
              if (!res2.confirm) return
              this.doDelete()
            }
          })
        }
      })
    },
    doDelete() {
      deleteMemorialDay(this.itemId)
      this.stopTimer()
      uni.showToast({ title: '已删除', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 400)
    }
  }
}

function resolveDetailMode(item) {
  if (item.repeatYearly) return 'yearly'
  const start = parseDateTime(item.date) || parseDate(item.date)
  if (start && start.isAfter(day())) return 'countdown'
  return 'elapsed'
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
  padding: 32rpx 48rpx 240rpx;
}

.hero-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 28rpx 32rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  box-shadow: var(--shadow-sm);
}

.hero-icon {
  flex-shrink: 0;
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-body {
  flex: 1;
  min-width: 0;
  margin-left: 24rpx;
}

.hero-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 44rpx;
  color: var(--text-primary);
}

.hero-date {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  line-height: 36rpx;
  color: var(--text-secondary);
}

.hero-tag {
  display: inline-flex;
  margin-top: 12rpx;
  padding: 6rpx 20rpx;
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
}

.hero-tag-text {
  font-size: 24rpx;
  line-height: 36rpx;
  color: var(--color-primary);
}

.section {
  margin-top: 32rpx;
}

.section-head {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  line-height: 44rpx;
  color: var(--text-primary);
}

.timer-card {
  padding: 32rpx 32rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-main {
  font-size: 44rpx;
  font-weight: 700;
  line-height: 56rpx;
  letter-spacing: 1rpx;
  text-align: center;
}

.timer-tip {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 36rpx;
  color: var(--text-secondary);
}

.breakdown-card {
  margin-top: 24rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16rpx;
}

.breakdown-item {
  width: calc((100% - 32rpx) / 3);
  min-width: 180rpx;
  padding: 20rpx 12rpx 18rpx;
  background: var(--bg-card);
  border-radius: 20rpx;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
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

.meta-card {
  margin-top: 32rpx;
  padding: 32rpx 40rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  box-shadow: var(--shadow-sm);
}

.meta-row + .meta-row {
  margin-top: 28rpx;
  padding-top: 28rpx;
  border-top: 1rpx solid var(--border-color);
}

.meta-label {
  display: block;
  font-size: 24rpx;
  line-height: 36rpx;
  color: var(--text-secondary);
}

.meta-value {
  display: block;
  margin-top: 8rpx;
  font-size: 28rpx;
  line-height: 44rpx;
  color: var(--text-regular);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5rpx;
  word-break: break-all;
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
