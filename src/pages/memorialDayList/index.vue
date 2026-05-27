<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />
    <view class="page-content">
      <view class="list-card">
        <view
          v-for="(item, idx) in items"
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
            <text class="row-unit" :style="{ color: item.countColor }">{{ item.valueUnit }}</text>
          </view>
          <view v-if="idx < items.length - 1" class="row-line" />
        </view>
        <view v-if="!items.length" class="empty-tip">
          <text>暂无纪念日</text>
          <text class="empty-sub">点击右下角添加</text>
        </view>
      </view>
    </view>

    <view class="fab" @click="openAdd">
      <text class="fab-plus">+</text>
    </view>
  </view>
</template>

<script>
import { getEnrichedMemorialDayList } from '@/utils/memorialDays.js'

const DETAIL_PAGE = '/pages/memorialDayDetail/index'
const EDIT_PAGE = '/pages/memorialDayEdit/index'

export default {
  data() {
    return {
      items: []
    }
  },
  onShow() {
    this.loadList()
  },
  methods: {
    loadList() {
      this.items = getEnrichedMemorialDayList()
    },
    onItemTap(item) {
      uni.navigateTo({ url: `${DETAIL_PAGE}?id=${item.id}` })
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
  background: #f5f6ff;
}

.page-bg {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 360rpx;
  background: linear-gradient(180deg, #f3f0ff 0%, #f5f6ff 100%);
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 24rpx 28rpx 160rpx;
}

.list-card {
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 40rpx rgba(80, 100, 150, 0.08);
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
  color: #1a1d26;
  line-height: 1.4;
}

.row-date {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #9ca3af;
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
  background: #f0f2f5;
}

.empty-tip {
  padding: 80rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 28rpx;
  color: #9ca3af;
}

.empty-sub {
  margin-top: 12rpx;
  font-size: 24rpx;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: calc(48rpx + env(safe-area-inset-bottom));
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #ff6b9d 0%, #ff4d7a 100%);
  box-shadow: 0 12rpx 32rpx rgba(255, 107, 157, 0.45);
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
