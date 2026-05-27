<template>
  <view class="page">
    <scroll-view class="scroll" scroll-y :show-scrollbar="false">
      <!-- 顶栏渐变区 -->
      <view class="head" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="head-inner">
          <view class="head-text">
            <text class="head-hi">Hi，欢迎使用</text>
            <text class="head-sub">让生活更有序，让日子更有趣 ✨</text>
          </view>
          <view class="head-deco">
            <view class="deco-base" />
            <view class="deco-dome">
              <view class="deco-leaf deco-leaf-l" />
              <view class="deco-leaf deco-leaf-r" />
              <view class="deco-plant" />
            </view>
          </view>
        </view>
      </view>

      <view class="content">
        <!-- 快捷工具 -->
        <view class="card tools-card">
          <scroll-view class="tools-scroll" scroll-x :show-scrollbar="false">
            <view class="tools-row">
              <view
                v-for="tool in quickTools"
                :key="tool.id"
                class="tool-item"
                @click="openTool(tool)"
              >
                <view class="tool-icon" :style="{ background: tool.gradient }">
                  <u-icon :name="tool.icon" size="24" :color="tool.iconColor || '#ffffff'" />
                </view>
                <text class="tool-name">{{ tool.name }}</text>
                <text class="tool-tag">{{ tool.tag }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 近期重要日子 -->
        <view class="section-head">
          <text class="section-title">近期重要日子</text>
          <text class="section-link" @click="goAllDates">全部 ›</text>
        </view>
        <view class="card dates-card">
          <view
            v-for="(item, idx) in dateItems"
            :key="item.id"
            class="date-row"
            @click="openDate(item)"
          >
            <view class="date-icon" :style="{ background: item.iconBg }">
              <u-icon :name="item.icon" size="18" :color="item.valueColor" />
            </view>
            <view class="date-mid">
              <text class="date-title">{{ item.title }}</text>
              <text class="date-label">{{ item.dateLabel }}</text>
            </view>
            <view class="date-right">
              <text class="date-num" :style="{ color: item.valueColor }">{{ item.value }}</text>
              <text class="date-unit" :style="{ color: item.valueColor }">{{ item.valueUnit }}</text>
            </view>
            <view v-if="idx < dateItems.length - 1" class="date-line" />
          </view>
        </view>

        <!-- 愿望横幅 -->
        <view class="wish-banner" @click="goWishBanner">
          <view class="banner-text">
            <text class="banner-title">许下一个愿望</text>
            <text class="banner-sub">让宇宙听见你的心愿 🌠</text>
          </view>
          <view class="banner-deco">
            <view class="jar-body">
              <text class="jar-star">★</text>
            </view>
          </view>
        </view>

        <!-- 娱乐记账本 -->
        <view class="section-head">
          <text class="section-title">娱乐记账本</text>
          <text class="section-link" @click="onLedgerMore">更多 ›</text>
        </view>
        <scroll-view class="ledger-scroll" scroll-x :show-scrollbar="false">
          <view class="ledger-row">
            <view
              v-for="item in ledgerItems"
              :key="item.id"
              class="ledger-card"
              @click="onLedgerTap(item)"
            >
              <view class="ledger-icon-wrap" :style="{ background: item.bg }">
                <u-icon :name="item.icon" size="28" :color="item.iconColor" />
              </view>
              <text class="ledger-name">{{ item.name }}</text>
              <text class="ledger-tag">{{ item.tag }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="scroll-foot" />
    </scroll-view>

    <app-tab-bar active="home" />
  </view>
</template>

<script>
import { QUICK_TOOLS, LEDGER_ITEMS } from '@/config/home.js'
import { getHomeDateItems } from '@/utils/homeDates.js'
import { recordRecentTool } from '@/utils/recentTools.js'
import { mergeHomeQuickTools } from '@/utils/favoriteTools.js'
import { buildToolsMap } from '@/utils/toolsCatalog.js'
import AppTabBar from '@/components/AppTabBar.vue'

export default {
  components: { AppTabBar },
  data() {
    const sys = uni.getSystemInfoSync()
    return {
      statusBarHeight: sys.statusBarHeight || 20,
      ledgerItems: LEDGER_ITEMS,
      dateItems: [],
      quickTools: QUICK_TOOLS
    }
  },
  onLoad() {
    uni.$on('favoriteToolsChanged', this.refreshQuickTools)
  },
  onUnload() {
    uni.$off('favoriteToolsChanged', this.refreshQuickTools)
  },
  onShow() {
    this.dateItems = getHomeDateItems(3)
    this.refreshQuickTools()
  },
  methods: {
    refreshQuickTools() {
      this.quickTools = mergeHomeQuickTools(QUICK_TOOLS, buildToolsMap(), 5)
    },
    openTool(tool) {
      recordRecentTool(tool.id)
      uni.navigateTo({ url: tool.url })
    },
    openDate(item) {
      if (item.isDemo) {
        uni.showToast({ title: '请先在对应工具中添加', icon: 'none' })
      }
      uni.navigateTo({ url: item.url })
    },
    goAllDates() {
      uni.navigateTo({ url: '/pages/memorialDayList/index' })
    },
    goWishBanner() {
      uni.navigateTo({ url: '/pages/wishRecommend/index' })
    },
    onLedgerTap(item) {
      if (item?.url) {
        recordRecentTool(item.id)
        uni.navigateTo({ url: item.url })
        return
      }
      uni.showToast({ title: '敬请期待', icon: 'none' })
    },
    onLedgerMore() {
      uni.switchTab({ url: '/pages/tab/tools' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f7f8fc;
}

.scroll {
  height: 100vh;
  box-sizing: border-box;
}

.head {
  background: linear-gradient(165deg, #dce8ff 0%, #e8e4ff 42%, #f7f8fc 100%);
  padding-bottom: 16rpx;
}

.head-inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24rpx 36rpx 8rpx;
}

.head-hi {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #1a1d26;
  letter-spacing: -1rpx;
  line-height: 1.25;
}

.head-sub {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.45;
}

.head-deco {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  flex-shrink: 0;
  margin-top: -8rpx;
}

.deco-base {
  position: absolute;
  bottom: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 100rpx;
  height: 28rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(120, 160, 255, 0.35) 0%, transparent 70%);
}

.deco-dome {
  position: absolute;
  top: 12rpx;
  right: 8rpx;
  overflow: visible;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.85) 0%, rgba(220, 230, 255, 0.5) 100%);
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 8rpx 32rpx rgba(100, 130, 200, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.deco-leaf {
  position: absolute;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50% 50% 0 50%;
  background: #8ee889;
}

.deco-leaf-l {
  top: 28rpx;
  left: 24rpx;
  transform: rotate(-30deg);
}

.deco-leaf-r {
  top: 20rpx;
  right: 22rpx;
  transform: rotate(20deg);
  background: #a8f0a4;
}

.deco-plant {
  position: relative;
  z-index: 1;
  width: 36rpx;
  height: 48rpx;
  border-radius: 8rpx 8rpx 4rpx 4rpx;
  background: linear-gradient(180deg, #7dd87a 0%, #4caf6e 100%);
  box-shadow: inset 0 -8rpx 0 #3d9a5c;
}

.content {
  padding: 0 28rpx;
  margin-top: -8rpx;
}

.card {
  background: #ffffff;
  border-radius: 28rpx;
  box-shadow: 0 8rpx 40rpx rgba(80, 100, 150, 0.08);
}

.tools-card {
  padding: 32rpx 16rpx 28rpx;
}

.tools-scroll {
  width: 100%;
  white-space: nowrap;
}

.tools-row {
  display: inline-flex;
  padding: 0 12rpx;
}

.tool-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 148rpx;
  margin: 0 8rpx;
  white-space: normal;
}

.tool-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(75, 139, 255, 0.2);
}

.tool-name {
  margin-top: 16rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1d26;
  text-align: center;
}

.tool-tag {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #9ca3af;
  text-align: center;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 36rpx 8rpx 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1d26;
}

.section-link {
  font-size: 26rpx;
  color: #9ca3af;
}

.dates-card {
  padding: 8rpx 0;
}

.date-row {
  position: relative;
  display: flex;
  align-items: center;
  padding: 28rpx 28rpx;
}

.date-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.date-mid {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.date-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1d26;
}

.date-label {
  display: block;
  font-size: 24rpx;
  color: #9ca3af;
  margin-top: 6rpx;
}

.date-right {
  display: flex;
  align-items: baseline;
  flex-shrink: 0;
}

.date-num {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1;
}

.date-unit {
  font-size: 24rpx;
  font-weight: 500;
  margin-left: 4rpx;
}

.date-line {
  position: absolute;
  left: 120rpx;
  right: 28rpx;
  bottom: 0;
  height: 1rpx;
  background: #f0f2f5;
}

.wish-banner {
  margin-top: 32rpx;
  padding: 36rpx 32rpx;
  border-radius: 28rpx;
  background: linear-gradient(105deg, #b8a0ff 0%, #8b9dff 48%, #7eb3ff 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 12rpx 40rpx rgba(139, 157, 255, 0.35);
}

.banner-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
}

.banner-sub {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.88);
}

.banner-deco {
  width: 120rpx;
  height: 120rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jar-body {
  width: 88rpx;
  height: 100rpx;
  border-radius: 12rpx 12rpx 20rpx 20rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 100%);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.jar-star {
  font-size: 40rpx;
  color: #ffe566;
  text-shadow: 0 0 16rpx rgba(255, 230, 100, 0.9);
}

.ledger-scroll {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.ledger-row {
  display: inline-flex;
  padding: 0 4rpx 24rpx;
  gap: 20rpx;
}

.ledger-card {
  display: inline-flex;
  flex-direction: column;
  width: 200rpx;
  min-height: 240rpx;
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e9ecf3;
  box-sizing: border-box;
  white-space: normal;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.ledger-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ledger-name {
  margin-top: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1d26;
}

.ledger-tag {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #9ca3af;
  line-height: 1.35;
}

.scroll-foot {
  height: 32rpx;
}
</style>
