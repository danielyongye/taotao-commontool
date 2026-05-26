<template>
  <view class="page">
    <scroll-view class="scroll" scroll-y :show-scrollbar="false">
      <view class="top" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="top-actions">
          <view class="top-icon" @click="onSettings">
            <u-icon name="setting" size="22" color="#2C3E50" />
          </view>
          <view class="top-icon" @click="onNotify">
            <u-icon name="bell" size="22" color="#2C3E50" />
          </view>
        </view>

        <view class="profile" @click="onProfile">
          <view class="avatar-wrap">
            <view class="avatar-cat">
              <view class="cat-ear cat-ear-l" />
              <view class="cat-ear cat-ear-r" />
              <view class="cat-face">
                <view class="cat-eye cat-eye-l" />
                <view class="cat-eye cat-eye-r" />
                <view class="cat-nose" />
                <view class="cat-mouth" />
              </view>
            </view>
          </view>
          <view class="profile-info">
            <view class="profile-name-row">
              <text class="profile-name">小星星</text>
              <text class="profile-spark">✨</text>
            </view>
            <text class="profile-bio">愿你每天都有小确幸</text>
          </view>
          <u-icon name="arrow-right" size="14" color="#C5CAD3" />
        </view>
      </view>

      <view class="body">
        <!-- 会员 -->
        <view class="vip-card">
          <view class="vip-left">
            <text class="vip-crown">👑</text>
            <view class="vip-text">
              <text class="vip-title">工具会员</text>
              <text class="vip-sub">解锁全部功能，享受纯净体验</text>
            </view>
          </view>
          <view class="vip-btn" @click.stop="onVip">
            <text class="vip-btn-text">立即开通</text>
          </view>
        </view>

        <!-- 我的内容 -->
        <view class="card">
          <text class="card-title">我的内容</text>
          <view class="content-grid">
            <view
              v-for="item in contentItems"
              :key="item.id"
              class="content-item"
              @click="go(item.path)"
            >
              <view class="content-icon-wrap">
                <u-icon :name="item.icon" size="26" color="#2C3E50" />
              </view>
              <text class="content-label">{{ item.label }}</text>
            </view>
          </view>
        </view>

        <!-- 我的数据 -->
        <view class="card">
          <text class="card-title">我的数据</text>
          <view class="stats-row">
            <view v-for="(stat, idx) in stats" :key="stat.key" class="stat-col">
              <text class="stat-num">{{ stat.value }}</text>
              <text class="stat-label">{{ stat.label }}</text>
              <view v-if="idx < stats.length - 1" class="stat-divider" />
            </view>
          </view>
        </view>

        <!-- 功能列表 -->
        <view class="card menu-card">
          <view
            v-for="(item, idx) in menuItems"
            :key="item.id"
            class="menu-row"
            @click="onMenu(item)"
          >
            <u-icon :name="item.icon" size="22" color="#2C3E50" />
            <text class="menu-label">{{ item.label }}</text>
            <u-icon name="arrow-right" size="14" color="#C5CAD3" />
            <view v-if="idx < menuItems.length - 1" class="menu-line" />
          </view>
        </view>
      </view>

      <view class="scroll-foot" />
    </scroll-view>

    <app-tab-bar active="mine" />
  </view>
</template>

<script>
import AppTabBar from '@/components/AppTabBar.vue'
import day from '@/utils/dayjs.js'
import { recordDaysSince } from '@/utils/dateHelpers.js'
import { getWishList } from '@/utils/wishlist.js'
import { getRecentToolIds } from '@/utils/recentTools.js'

const RECORD_DAYS_KEY = 'mine_record_days_base'

export default {
  components: { AppTabBar },
  data() {
    const sys = uni.getSystemInfoSync()
    return {
      statusBarHeight: sys.statusBarHeight || 20,
      contentItems: [
        { id: 'memorial', label: '我的纪念日', icon: 'calendar', path: '/pages/memorialDayList/index' },
        { id: 'list', label: '我的清单', icon: 'list', path: '/pages/wishRecommend/index' },
        { id: 'ledger', label: '我的账本', icon: 'order', path: '' },
        { id: 'wish', label: '我的愿望', icon: 'bookmark', path: '/pages/wishlist/index' }
      ],
      menuItems: [
        { id: 'trash', label: '回收站', icon: 'trash' },
        { id: 'backup', label: '数据备份', icon: 'reload' },
        { id: 'theme', label: '主题换肤', icon: 'photo' },
        { id: 'feedback', label: '意见反馈', icon: 'edit-pen' },
        { id: 'about', label: '关于我们', icon: 'info-circle' }
      ],
      stats: [
        { key: 'days', label: '记录天数', value: 0 },
        { key: 'tools', label: '创建工具', value: 0 },
        { key: 'wishes', label: '完成愿望', value: 0 }
      ]
    }
  },
  onShow() {
    this.refreshStats()
  },
  methods: {
    refreshStats() {
      const wishes = getWishList()
      const doneCount = wishes.filter((w) => w.done).length
      const toolCount = getRecentToolIds().length
      let recordDays = 0
      try {
        const base = uni.getStorageSync(RECORD_DAYS_KEY)
        if (base && base.startAt) {
          recordDays = recordDaysSince(base.startAt)
        } else if (wishes.length || toolCount) {
          uni.setStorageSync(RECORD_DAYS_KEY, { startAt: day().valueOf() })
          recordDays = 1
        }
      } catch (e) {
        recordDays = wishes.length ? 1 : 0
      }

      this.stats = [
        { key: 'days', label: '记录天数', value: recordDays > 0 ? recordDays : 12 },
        { key: 'tools', label: '创建工具', value: toolCount > 0 ? toolCount : 8 },
        {
          key: 'wishes',
          label: '完成愿望',
          value: wishes.length ? doneCount : 36
        }
      ]
    },
    go(url) {
      if (!url) {
        uni.showToast({ title: '功能开发中', icon: 'none' })
        return
      }
      uni.navigateTo({ url })
    },
    onProfile() {
      uni.showToast({ title: '个人资料', icon: 'none' })
    },
    onSettings() {
      uni.showToast({ title: '设置', icon: 'none' })
    },
    onNotify() {
      uni.showToast({ title: '消息通知', icon: 'none' })
    },
    onVip() {
      uni.showToast({ title: '会员开通', icon: 'none' })
    },
    onMenu(item) {
      uni.showToast({ title: item.label, icon: 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef1fb 0%, #f8f9fe 28%, #f8f9fe 100%);
}

.scroll {
  height: 100vh;
  box-sizing: border-box;
}

.top {
  padding: 12rpx 32rpx 8rpx;
}

.top-actions {
  display: flex;
  justify-content: flex-end;
  gap: 24rpx;
  margin-bottom: 28rpx;
}

.top-icon {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile {
  display: flex;
  align-items: center;
  padding: 8rpx 0 24rpx;
}

.avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 8rpx 28rpx rgba(44, 62, 80, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-cat {
  position: relative;
  width: 88rpx;
  height: 88rpx;
}

.cat-ear {
  position: absolute;
  top: 4rpx;
  width: 28rpx;
  height: 32rpx;
  background: #f4a261;
  border-radius: 50% 50% 0 0;
}
.cat-ear-l {
  left: 8rpx;
  transform: rotate(-18deg);
}
.cat-ear-r {
  right: 8rpx;
  transform: rotate(18deg);
}

.cat-face {
  position: absolute;
  left: 50%;
  top: 22rpx;
  transform: translateX(-50%);
  width: 72rpx;
  height: 58rpx;
  background: #f4a261;
  border-radius: 50%;
}

.cat-eye {
  position: absolute;
  top: 18rpx;
  width: 8rpx;
  height: 8rpx;
  background: #2c3e50;
  border-radius: 50%;
}
.cat-eye-l {
  left: 18rpx;
}
.cat-eye-r {
  right: 18rpx;
}

.cat-nose {
  position: absolute;
  left: 50%;
  top: 30rpx;
  transform: translateX(-50%);
  width: 10rpx;
  height: 8rpx;
  background: #e76f51;
  border-radius: 0 0 50% 50%;
}

.cat-mouth {
  position: absolute;
  left: 50%;
  top: 36rpx;
  transform: translateX(-50%);
  width: 20rpx;
  height: 10rpx;
  border-bottom: 3rpx solid #2c3e50;
  border-radius: 0 0 50% 50%;
}

.profile-info {
  flex: 1;
  margin-left: 24rpx;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.profile-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1d26;
}

.profile-spark {
  font-size: 28rpx;
}

.profile-bio {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #9ca3af;
}

.body {
  padding: 0 28rpx;
}

.vip-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 28rpx;
  margin-bottom: 24rpx;
  background: linear-gradient(135deg, #2b3452 0%, #1e2638 100%);
  border-radius: 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(30, 38, 56, 0.25);
}

.vip-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.vip-crown {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.vip-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.vip-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #f3d9a9;
}

.vip-sub {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: rgba(243, 217, 169, 0.75);
}

.vip-btn {
  flex-shrink: 0;
  margin-left: 16rpx;
  padding: 14rpx 28rpx;
  background: #f3d9a9;
  border-radius: 999rpx;
}

.vip-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #2b3452;
}

.card {
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx 28rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 40rpx rgba(80, 100, 150, 0.08);
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1d26;
  margin-bottom: 28rpx;
}

.content-grid {
  display: flex;
  justify-content: space-between;
}

.content-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-label {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #4b5563;
  text-align: center;
}

.stats-row {
  display: flex;
  align-items: stretch;
}

.stat-col {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 0;
}

.stat-num {
  font-size: 44rpx;
  font-weight: 700;
  color: #1a1d26;
  line-height: 1.2;
}

.stat-label {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #9ca3af;
}

.stat-divider {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1rpx;
  height: 56rpx;
  background: #e8ecf2;
}

.menu-card {
  padding: 8rpx 0;
}

.menu-row {
  position: relative;
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;
}

.menu-label {
  flex: 1;
  margin-left: 20rpx;
  font-size: 30rpx;
  color: #1a1d26;
}

.menu-line {
  position: absolute;
  left: 28rpx;
  right: 28rpx;
  bottom: 0;
  height: 1rpx;
  background: #f0f2f5;
}

.scroll-foot {
  height: 140rpx;
}
</style>
