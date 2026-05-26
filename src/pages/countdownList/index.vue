<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />
    <view class="page-content">
      <view
        v-if="featured"
        class="hero-card"
        hover-class="hero-card--press"
        :hover-stay-time="100"
        @click="onItemTap(featured)"
      >
        <text class="hero-title">{{ featured.title }}</text>
        <text class="hero-date">{{ featured.dateFullLabel }}</text>
        <text class="hero-num">{{ featured.value }}</text>
        <text class="hero-unit">天后</text>
      </view>

      <view v-if="listItems.length" class="list-card">
        <view
          v-for="(item, idx) in listItems"
          :key="item.id"
          class="list-row"
          @click="onItemTap(item)"
        >
          <view class="row-icon" :style="{ background: item.iconBg }">
            <u-icon :name="item.icon" size="20" :color="item.countColor" />
          </view>
          <view class="row-mid">
            <text class="row-title">{{ item.title }}</text>
            <text class="row-date">{{ item.dateLabel }}</text>
          </view>
          <view class="row-right">
            <text class="row-num" :style="{ color: item.countColor }">{{ item.value }}</text>
            <text class="row-unit" :style="{ color: item.countColor }">天后</text>
          </view>
          <view v-if="idx < listItems.length - 1" class="row-line" />
        </view>
      </view>

      <view v-if="!featured && !listItems.length" class="empty-card">
        <text class="empty-tip">暂无倒数日</text>
        <text class="empty-sub">点击右下角添加</text>
      </view>
    </view>

    <view class="fab" @click="openAdd">
      <text class="fab-plus">+</text>
    </view>
  </view>
</template>

<script>
import {
  getEnrichedCountdownList,
  formatCountdownHeroDateLabel,
  DETAIL_PAGE,
  EDIT_PAGE
} from '@/utils/countdownDays.js'

export default {
  data() {
    return {
      featured: null,
      listItems: []
    }
  },
  onShow() {
    this.loadList()
  },
  methods: {
    loadList() {
      const sorted = getEnrichedCountdownList()
      if (!sorted.length) {
        this.featured = null
        this.listItems = []
        return
      }
      const first = sorted[0]
      this.featured = {
        ...first,
        dateFullLabel: formatCountdownHeroDateLabel(first)
      }
      this.listItems = sorted.slice(1)
    },
    onItemTap(item) {
      uni.navigateTo({
        url: `${DETAIL_PAGE}?id=${encodeURIComponent(item.id)}`
      })
    },
    openAdd() {
      uni.navigateTo({ url: EDIT_PAGE })
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
  height: 360rpx;
  background: linear-gradient(180deg, #f3f0ff 0%, var(--bg-page) 100%);
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 24rpx 28rpx 160rpx;
}

.hero-card {
  margin-bottom: 24rpx;
  padding: 48rpx 32rpx 56rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #fce7f3 0%, #e0e7ff 100%);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.hero-card--press {
  opacity: 0.92;
  transform: scale(0.99);
}

.hero-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1e3a5f;
  line-height: 1.4;
}

.hero-date {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.4;
}

.hero-num {
  margin-top: 32rpx;
  font-size: 120rpx;
  font-weight: 700;
  line-height: 1;
  color: #3b82f6;
  letter-spacing: -2rpx;
}

.hero-unit {
  margin-top: 8rpx;
  font-size: 28rpx;
  color: #64748b;
  font-weight: 500;
}

.list-card {
  background: var(--bg-card);
  border-radius: 32rpx;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.list-row {
  position: relative;
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;
}

.row-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.row-mid {
  flex: 1;
  margin-left: 24rpx;
  min-width: 0;
}

.row-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.row-date {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.row-right {
  display: flex;
  align-items: baseline;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.row-num {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1;
}

.row-unit {
  margin-left: 6rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.row-line {
  position: absolute;
  left: 28rpx;
  right: 28rpx;
  bottom: 0;
  height: 1rpx;
  background: var(--border-color);
}

.empty-card {
  margin-top: 24rpx;
  padding: 80rpx 40rpx;
  background: var(--bg-card);
  border-radius: 32rpx;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-tip {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.empty-sub {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: calc(48rpx + env(safe-area-inset-bottom));
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #60a5fa 0%, #6366f1 100%);
  box-shadow: 0 12rpx 32rpx rgba(99, 102, 241, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.fab-plus {
  font-size: 64rpx;
  font-weight: 300;
  color: #ffffff;
  line-height: 1;
  margin-top: -4rpx;
}
</style>
