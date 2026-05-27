<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />
    <view class="page-content">
      <text class="page-tip">创建房间后邀请好友，点击头像记分，每局合计须为 0</text>

      <view
        class="create-card"
        hover-class="create-card--press"
        :hover-stay-time="100"
        @click="onCreateRoom"
      >
        <view class="create-icon-wrap">
          <u-icon name="plus" size="22" color="#ffffff" />
        </view>
        <view class="create-text">
          <text class="create-title">新建牌局房间</text>
          <text class="create-desc">支持麻将、跑胡子等零和记账</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#8692A6" />
      </view>

      <view v-if="rooms.length" class="section-head">
        <text class="section-title">我的房间</text>
        <text class="section-count">{{ rooms.length }} 个</text>
      </view>

      <view v-if="rooms.length" class="room-list">
        <view
          v-for="room in rooms"
          :key="room.id"
          class="room-card"
          hover-class="room-card--press"
          :hover-stay-time="100"
          @click="openRoom(room.id)"
        >
          <view class="room-card-main">
            <text class="room-title">{{ room.title }}</text>
            <text class="room-meta">{{ room.memberCount }} 人 · {{ room.updatedLabel }}</text>
          </view>
          <view class="room-card-right">
            <text
              v-if="room.myBalance != null"
              class="room-balance"
              :class="room.balanceClass"
            >
              {{ room.myBalanceText }}
            </text>
            <u-icon name="arrow-right" size="14" color="#8692A6" />
          </view>
        </view>
      </view>

      <view v-else class="empty-block">
        <u-icon name="grid" size="48" color="#C7CCD6" />
        <text class="empty-text">暂无房间，点击上方创建</text>
      </view>
    </view>
  </view>
</template>

<script>
import day from '@/utils/dayjs.js'
import { ROOM_PAGE } from '@/constants/gameRoom.js'
import { createRoom, getRoomList, formatBalance } from '@/utils/gameRoom.js'
import { getOrCreateUserId } from '@/utils/deviceUser.js'

export default {
  data() {
    return {
      rooms: []
    }
  },
  onShow() {
    this.refreshList()
  },
  methods: {
    refreshList() {
      const userId = getOrCreateUserId()
      this.rooms = getRoomList().map((room) => {
        const members = room.members || []
        const me = members.find((m) => m.userId === userId)
        const balance = me ? Number(me.balance) || 0 : null
        return {
          id: room.id,
          title: room.title || '牌局房间',
          memberCount: members.length,
          updatedLabel: room.updatedAt
            ? day(room.updatedAt).format('MM-DD HH:mm')
            : '',
          myBalance: balance,
          myBalanceText: balance != null ? formatBalance(balance) : '',
          balanceClass:
            balance != null
              ? balance > 0
                ? 'room-balance--win'
                : balance < 0
                  ? 'room-balance--loss'
                  : ''
              : ''
        }
      })
    },
    onCreateRoom() {
      try {
        const room = createRoom({ title: '牌局房间' })
        uni.navigateTo({ url: `${ROOM_PAGE}?roomId=${room.id}` })
      } catch (e) {
        console.error('[gameRoom] create failed', e)
        uni.showToast({ title: '创建失败', icon: 'none' })
      }
    },
    openRoom(roomId) {
      uni.navigateTo({ url: `${ROOM_PAGE}?roomId=${roomId}` })
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
  background: var(--gradient-page-top);
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 24rpx 28rpx 48rpx;
}

.page-tip {
  display: block;
  margin-bottom: 24rpx;
  font-size: 26rpx;
  color: var(--text-secondary);
  line-height: 1.5;
}

.create-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx;
  margin-bottom: 32rpx;
  border-radius: 24rpx;
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  border: 1rpx solid var(--border-color);
}

.create-card--press {
  opacity: 0.92;
}

.create-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
}

.create-text {
  flex: 1;
  min-width: 0;
}

.create-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.create-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.section-count {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.room-card {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  border-radius: 20rpx;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  border: 1rpx solid var(--border-color);
}

.room-card--press {
  background: var(--bg-hover);
}

.room-card-main {
  flex: 1;
  min-width: 0;
}

.room-title {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: var(--text-primary);
}

.room-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.room-card-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.room-balance {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-regular);
}

.room-balance--win {
  color: var(--success);
}

.room-balance--loss {
  color: var(--error);
}

.empty-block {
  padding: 80rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.empty-text {
  font-size: 26rpx;
  color: var(--text-placeholder);
}
</style>
