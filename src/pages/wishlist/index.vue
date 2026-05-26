<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />

    <view class="page-content">
      <view class="hero-card">
        <view class="hero-top">
          <view class="hero-icon-wrap">
            <u-icon name="star-fill" size="22" :color="ds.textWhite" />
          </view>
          <view class="hero-text">
            <text class="hero-title">我的愿望清单</text>
            <text class="hero-desc">记录想做的事，一步步实现它们</text>
          </view>
        </view>
        <view class="hero-stats">
          <view class="stat-item">
            <text class="stat-num">{{ todoCount }}</text>
            <text class="stat-label">待完成</text>
          </view>
          <view class="stat-divider" />
          <view class="stat-item">
            <text class="stat-num">{{ doneCount }}</text>
            <text class="stat-label">已完成</text>
          </view>
        </view>
      </view>

      <view class="tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab', { 'tab--active': activeTab === tab.key }]"
          hover-class="tab--press"
          :hover-stay-time="100"
          @click="switchTab(tab.key)"
        >
          <text class="tab-text">{{ tab.label }}</text>
          <text
            v-if="tab.count"
            :class="['tab-badge', { 'tab-badge--muted': activeTab !== tab.key }]"
          >
            {{ tab.count }}
          </text>
        </view>
      </view>

      <view :class="['add-bar', { 'add-bar--focus': inputFocused }]">
        <input
          v-model="inputText"
          class="add-input"
          type="text"
          placeholder="写下你的愿望..."
          placeholder-class="add-ph"
          confirm-type="done"
          @focus="inputFocused = true"
          @blur="inputFocused = false"
          @confirm="addWish"
        />
        <view
          class="add-btn"
          :class="{ 'add-btn--disabled': !inputText.trim() }"
          hover-class="add-btn--press"
          :hover-stay-time="100"
          @click="addWish"
        >
          <u-icon name="plus" size="20" :color="ds.textWhite" />
        </view>
      </view>

      <view
        v-if="activeTab === 'todo'"
        class="link-card"
        hover-class="link-card--press"
        :hover-stay-time="100"
        @click="goRecommend"
      >
        <view class="link-icon-wrap">
          <u-icon name="gift-fill" size="22" :color="ds.colorPrimary" />
        </view>
        <view class="link-body">
          <text class="link-title">浏览愿望推荐</text>
          <text class="link-desc">100+ 人生目标灵感，一键加入</text>
        </view>
        <u-icon name="arrow-right" size="14" :color="ds.textSecondary" />
      </view>

      <view class="wish-list">
        <view
          v-for="wish in displayList"
          :key="wish.id"
          :class="['wish-card', { 'wish-card--done': wish.done }]"
          hover-class="wish-card--press"
          :hover-stay-time="100"
        >
          <view
            class="wish-check"
            :class="{ 'wish-check--done': wish.done }"
            hover-class="wish-check--press"
            :hover-stay-time="80"
            @click="toggleWish(wish)"
          >
            <u-icon
              v-if="wish.done"
              name="checkmark"
              size="14"
              :color="ds.textWhite"
            />
          </view>

          <view class="wish-body" @click="toggleWish(wish)">
            <view class="wish-title-row">
              <text :class="['wish-title', { 'wish-title--done': wish.done }]">
                {{ wish.title }}
              </text>
              <view v-if="wish.tagLabel" class="wish-tag">
                <text class="wish-tag-text">{{ wish.tagLabel }}</text>
              </view>
            </view>
            <text v-if="wish.desc" class="wish-desc">{{ wish.desc }}</text>
            <text class="wish-time">{{ wish.timeLabel }}</text>
          </view>

          <view class="wish-actions">
            <view
              v-if="wish.done"
              class="action-btn"
              hover-class="action-btn--press"
              :hover-stay-time="100"
              @click.stop="undoWish(wish)"
            >
              <u-icon name="reload" size="18" :color="ds.colorPrimary" />
            </view>
            <view
              class="action-btn action-btn--danger"
              hover-class="action-btn--danger-press"
              :hover-stay-time="100"
              @click.stop="confirmDelete(wish)"
            >
              <u-icon name="trash" size="18" :color="ds.error" />
            </view>
          </view>
        </view>

        <view v-if="!displayList.length" class="empty-block">
          <view class="empty-icon-wrap">
            <u-icon
              :name="activeTab === 'todo' ? 'star' : 'checkmark-circle'"
              size="36"
              :color="ds.colorPrimary"
            />
          </view>
          <text class="empty-title">{{ emptyTitle }}</text>
          <text class="empty-desc">{{ emptyDesc }}</text>
          <view
            v-if="activeTab === 'todo'"
            class="empty-btn"
            hover-class="empty-btn--press"
            :hover-stay-time="100"
            @click="goRecommend"
          >
            <text class="empty-btn-text">去发现灵感</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { DS } from '@/constants/designSystem.js'
import { getCategoryMeta } from '@/constants/lifeGoals.js'
import { getWishList, setWishList, removeWish } from '@/utils/wishlist.js'
import { formatRelativeTime, formatFullDateTime } from '@/utils/dateHelpers.js'

const LEGACY_STORAGE_KEY = 'wishlist_items'
const CATEGORY_LABELS = {
  do: '想做',
  go: '想去',
  have: '想拥有',
  learn: '想学会'
}

function normalizeWish(raw) {
  const category = raw.category || ''
  const meta = category ? getCategoryMeta(category) : null
  const tagLabel = meta?.label || CATEGORY_LABELS[category] || ''
  const title = raw.title || raw.text || '未命名愿望'
  const done = !!raw.done
  const timeLabel = done && raw.finishedAt
    ? `完成于 ${formatFullDateTime(raw.finishedAt)}`
    : raw.createdAt
      ? formatRelativeTime(raw.createdAt)
      : ''
  return {
    id: raw.id,
    title,
    desc: raw.desc || '',
    done,
    category,
    tagLabel,
    createdAt: raw.createdAt,
    finishedAt: raw.finishedAt,
    timeLabel
  }
}

function migrateLegacyWishlist() {
  try {
    const legacy = uni.getStorageSync(LEGACY_STORAGE_KEY)
    if (!legacy) return
    const current = getWishList()
    if (current.length) return
    const parsed = JSON.parse(legacy)
    if (!Array.isArray(parsed) || !parsed.length) return
    setWishList(
      parsed.map((w) => ({
        ...w,
        title: w.title || w.text || '未命名愿望'
      }))
    )
  } catch (e) {
    console.warn('[wishlist] legacy migrate failed', e)
  }
}

export default {
  data() {
    return {
      ds: DS,
      wishes: [],
      inputText: '',
      inputFocused: false,
      activeTab: 'todo'
    }
  },
  computed: {
    todoList() {
      return this.wishes.filter((w) => !w.done)
    },
    doneList() {
      return this.wishes.filter((w) => w.done)
    },
    todoCount() {
      return this.todoList.length
    },
    doneCount() {
      return this.doneList.length
    },
    tabs() {
      return [
        { key: 'todo', label: '待完成', count: this.todoCount },
        { key: 'done', label: '已完成', count: this.doneCount }
      ]
    },
    displayList() {
      return this.activeTab === 'todo' ? this.todoList : this.doneList
    },
    emptyTitle() {
      return this.activeTab === 'todo' ? '还没有愿望' : '暂无已完成'
    },
    emptyDesc() {
      return this.activeTab === 'todo'
        ? '写下第一个愿望，或从推荐里挑选灵感'
        : '完成愿望后会出现在这里'
    }
  },
  onLoad() {
    migrateLegacyWishlist()
    this.loadWishes()
  },
  onShow() {
    this.loadWishes()
  },
  methods: {
    loadWishes() {
      const raw = getWishList()
      this.wishes = (Array.isArray(raw) ? raw : []).map(normalizeWish)
    },
    switchTab(key) {
      if (this.activeTab === key) return
      this.activeTab = key
    },
    addWish() {
      const title = this.inputText.trim()
      if (!title) return
      const list = getWishList()
      list.unshift({
        id: Date.now(),
        title,
        desc: '',
        done: false,
        createdAt: Date.now(),
        finishedAt: null
      })
      setWishList(list)
      this.inputText = ''
      this.loadWishes()
      uni.showToast({ title: '已添加', icon: 'success' })
    },
    toggleWish(wish) {
      const list = getWishList()
      const item = list.find((w) => w.id === wish.id)
      if (!item) return
      const wasDone = item.done
      item.done = !item.done
      item.finishedAt = item.done ? Date.now() : null
      setWishList(list)
      this.loadWishes()
      if (item.done && !wasDone) {
        uni.showToast({ title: '愿望已完成', icon: 'success' })
      }
    },
    undoWish(wish) {
      const list = getWishList()
      const item = list.find((w) => w.id === wish.id)
      if (!item) return
      item.done = false
      item.finishedAt = null
      setWishList(list)
      this.loadWishes()
    },
    confirmDelete(wish) {
      uni.showModal({
        title: '删除愿望',
        content: `确定删除「${wish.title}」吗？`,
        confirmColor: DS.colorPrimary,
        success: (res) => {
          if (res.confirm) {
            removeWish(wish.id)
            this.loadWishes()
            uni.showToast({ title: '已删除', icon: 'none' })
          }
        }
      })
    },
    goRecommend() {
      uni.navigateTo({ url: '/pages/wishRecommend/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  position: relative;
  background: var(--bg-page);
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.page-bg {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 480rpx;
  background: var(--gradient-page-top);
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 24rpx 28rpx 48rpx;
}

.hero-card {
  padding: 36rpx 32rpx 32rpx;
  background: var(--gradient-primary);
  border-radius: 24rpx;
  box-shadow: var(--shadow-md);
}

.hero-top {
  display: flex;
  align-items: flex-start;
}

.hero-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-text {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
}

.hero-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 50rpx;
  color: var(--text-white);
}

.hero-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  line-height: 40rpx;
  color: rgba(255, 255, 255, 0.88);
}

.hero-stats {
  display: flex;
  align-items: center;
  margin-top: 32rpx;
  padding-top: 28rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 48rpx;
  color: var(--text-white);
}

.stat-label {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.75);
}

.stat-divider {
  width: 1rpx;
  height: 56rpx;
  background: rgba(255, 255, 255, 0.25);
}

.tabs {
  display: flex;
  margin-top: 28rpx;
  padding: 8rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  border: 1rpx solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 0;
  border-radius: 12rpx;
  transition: background 0.3s ease, transform 0.3s ease;
}

.tab--press {
  opacity: 0.88;
  transform: scale(0.98);
}

.tab--active {
  background: var(--color-primary-light);
  box-shadow: var(--shadow-sm);
}

.tab-text {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.tab--active .tab-text {
  color: var(--color-primary);
  font-weight: 500;
}

.tab-badge {
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 10rpx;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  font-size: 20rpx;
  line-height: 32rpx;
  text-align: center;
  color: var(--text-white);
  transition: background 0.3s ease, color 0.3s ease;
}

.tab-badge--muted {
  background: var(--neutral-light);
  color: var(--text-secondary);
}

.add-bar {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding: 8rpx 8rpx 8rpx 24rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  border: 1rpx solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.add-bar--focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4rpx rgba(99, 102, 241, 0.1);
}

.add-input {
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
  color: var(--text-primary);
}

.add-ph {
  color: var(--text-placeholder);
}

.add-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.add-btn--disabled {
  opacity: 0.45;
}

.add-btn--press {
  transform: scale(0.96);
  opacity: 0.9;
}

.link-card {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding: 24rpx 28rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  border: 1rpx solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

.link-card--press {
  background: var(--bg-hover);
  box-shadow: var(--shadow-md);
  transform: scale(0.99);
}

.link-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.link-body {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.link-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-primary);
}

.link-desc {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
}

.wish-list {
  margin-top: 24rpx;
}

.wish-card {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
  padding: 28rpx 24rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  border: 2rpx solid transparent;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.wish-card--done {
  background: var(--success-light);
  border-color: rgba(34, 197, 94, 0.15);
}

.wish-card--press {
  box-shadow: var(--shadow-md);
}

.wish-check {
  width: 44rpx;
  height: 44rpx;
  margin-top: 4rpx;
  border-radius: 50%;
  border: 2rpx solid var(--border-color);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.wish-check--press {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.wish-check--done {
  background: var(--success);
  border-color: var(--success);
}

.wish-body {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.wish-title-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12rpx;
}

.wish-title {
  font-size: 30rpx;
  font-weight: 600;
  line-height: 44rpx;
  color: var(--text-primary);
}

.wish-title--done {
  color: var(--text-disabled);
  text-decoration: line-through;
}

.wish-tag {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: var(--color-primary-light);
}

.wish-tag-text {
  font-size: 22rpx;
  color: var(--color-primary);
}

.wish-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  line-height: 40rpx;
  color: var(--text-secondary);
}

.wish-time {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: var(--text-placeholder);
}

.wish-actions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-left: 12rpx;
  flex-shrink: 0;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  transition: background 0.3s ease;
}

.action-btn--press {
  background: var(--bg-hover);
}

.action-btn--danger-press {
  background: var(--error-light);
}

.empty-block {
  padding: 80rpx 32rpx;
  text-align: center;
}

.empty-icon-wrap {
  width: 112rpx;
  height: 112rpx;
  margin: 0 auto 24rpx;
  border-radius: 16rpx;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-title {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: var(--text-regular);
}

.empty-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--text-secondary);
}

.empty-btn {
  display: inline-flex;
  margin-top: 32rpx;
  padding: 0 40rpx;
  height: 88rpx;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.empty-btn--press {
  opacity: 0.92;
  transform: scale(0.98);
}

.empty-btn-text {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-white);
}
</style>
