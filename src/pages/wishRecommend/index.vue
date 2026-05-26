<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />

    <view class="page-content">
      <view class="hero-card">
        <text class="hero-title">发现你的下一个愿望</text>
        <text class="hero-desc">100 个值得完成的人生目标，挑选灵感加入愿望清单</text>
        <view class="hero-stats">
          <view class="stat-item">
            <text class="stat-num">{{ goals.length }}</text>
            <text class="stat-label">推荐目标</text>
          </view>
          <view class="stat-divider" />
          <view class="stat-item">
            <text class="stat-num">{{ filteredGoals.length }}</text>
            <text class="stat-label">当前展示</text>
          </view>
        </view>
      </view>

      <scroll-view class="filters-scroll" scroll-x :show-scrollbar="false">
        <view class="filters">
          <view
            v-for="f in categories"
            :key="f.value"
            :class="['filter-chip', { 'filter-chip--active': filter === f.value }]"
            @click="filter = f.value"
          >
            <text v-if="f.icon" class="filter-icon">{{ f.icon }}</text>
            <text class="filter-label">{{ f.label }}</text>
          </view>
        </view>
      </scroll-view>

      <view class="search-wrap">
        <u-icon name="search" size="18" :color="ds.textSecondary" />
        <input
          v-model="search"
          class="search-input"
          type="text"
          placeholder="搜索目标或描述..."
          placeholder-class="search-ph"
          confirm-type="search"
        />
        <view v-if="search" class="search-clear" @click="search = ''">
          <u-icon name="close-circle-fill" size="16" :color="ds.textPlaceholder" />
        </view>
      </view>

      <view class="goal-list">
        <view
          v-for="goal in filteredGoals"
          :key="goal.id"
          :class="['goal-card', goal.cardStateClass]"
          :style="goal.cardStyle"
          hover-class="goal-card--press"
          :hover-stay-time="100"
          @click="toggleSelect(goal.id)"
        >
          <view class="goal-head">
            <view class="goal-index">
              <text class="goal-index-text">{{ goal.id }}</text>
            </view>
            <view class="goal-category">
              <text v-if="goal.categoryIcon" class="goal-cat-icon">{{ goal.categoryIcon }}</text>
              <text class="goal-cat-label">{{ goal.categoryLabel }}</text>
            </view>
            <view :class="['goal-check', { 'goal-check--on': goal.selected }]">
              <u-icon
                v-if="goal.selected"
                name="checkmark"
                size="14"
                color="#ffffff"
              />
            </view>
          </view>

          <text class="goal-title">{{ goal.title }}</text>
          <text class="goal-desc">{{ goal.desc }}</text>

          <view class="goal-meta">
            <text :class="['meta-tag', goal.difficultyClass]">{{ goal.difficulty }}</text>
            <text class="meta-tag meta-tag--neutral">约 {{ goal.days }} 天</text>
          </view>

          <view v-if="goal.inWishList" class="goal-added">
            <text class="goal-added-text">已在愿望清单</text>
          </view>
        </view>

        <view v-if="!filteredGoals.length" class="empty-block">
          <text class="empty-title">没有找到匹配的目标</text>
          <text class="empty-desc">试试换个关键词或分类</text>
        </view>
      </view>
    </view>

    <view v-if="selectedGoals.length" class="footer-bar">
      <view class="footer-inner">
        <view class="footer-info">
          <text class="footer-count">{{ selectedGoals.length }}</text>
          <text class="footer-label">个目标待添加</text>
        </view>
        <view class="footer-actions">
          <view
            class="btn-ghost"
            hover-class="btn-ghost--press"
            :hover-stay-time="100"
            @click="clearSelection"
          >
            <text class="btn-ghost-text">清空</text>
          </view>
          <view
            class="btn-primary"
            hover-class="btn-primary--press"
            :hover-stay-time="100"
            @click="addToWishlist"
          >
            <text class="btn-primary-text">加入愿望清单</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { DS } from '@/constants/designSystem.js'
import {
  LIFE_GOAL_CATEGORIES,
  getLifeGoals,
  getCategoryMeta,
  getDifficultyClass
} from '@/constants/lifeGoals.js'
import { getWishList, addWishes } from '@/utils/wishlist.js'

export default {
  data() {
    return {
      ds: DS,
      goals: getLifeGoals(),
      categories: LIFE_GOAL_CATEGORIES,
      selectedGoals: [],
      wishListIds: [],
      search: '',
      filter: 'all'
    }
  },
  computed: {
    filteredGoals() {
      let list = this.goals
      if (this.filter !== 'all') {
        list = list.filter((g) => g.category === this.filter)
      }
      const q = this.search.trim()
      if (q) {
        list = list.filter(
          (g) => g.title.includes(q) || g.desc.includes(q)
        )
      }
      return list.map((goal) => {
        const inWishList = this.wishListIds.includes(goal.id)
        const selected = this.selectedGoals.includes(goal.id)
        const meta = getCategoryMeta(goal.category)
        return {
          ...goal,
          categoryIcon: meta ? meta.icon : '',
          categoryLabel: meta ? meta.label : '',
          difficultyClass: getDifficultyClass(goal.difficulty),
          cardStateClass: inWishList
            ? 'goal-card--added'
            : selected
              ? 'goal-card--selected'
              : '',
          cardStyle: inWishList ? { opacity: 0.65, pointerEvents: 'none' } : {},
          inWishList,
          selected
        }
      })
    }
  },
  onShow() {
    this.refreshWishList()
  },
  methods: {
    refreshWishList() {
      this.wishListIds = getWishList().map((w) => w.id)
    },
    isInWishList(id) {
      return this.wishListIds.includes(id)
    },
    isSelected(id) {
      return this.selectedGoals.includes(id)
    },
    toggleSelect(id) {
      if (this.isInWishList(id)) return
      const idx = this.selectedGoals.indexOf(id)
      if (idx > -1) {
        this.selectedGoals.splice(idx, 1)
      } else {
        this.selectedGoals.push(id)
      }
    },
    clearSelection() {
      this.selectedGoals = []
    },
    addToWishlist() {
      if (!this.selectedGoals.length) return
      const now = Date.now()
      const newGoals = this.goals
        .filter((goal) => this.selectedGoals.includes(goal.id))
        .map((goal) => ({ ...goal, status: '未完成', createdAt: now }))
      addWishes(newGoals)
      this.selectedGoals = []
      this.refreshWishList()
      uni.showToast({ title: '已加入愿望清单', icon: 'success' })
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
  height: 420rpx;
  background: linear-gradient(180deg, #f3f0ff 0%, var(--bg-page) 100%);
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 24rpx 28rpx 200rpx;
}

.hero-card {
  padding: 40rpx 36rpx 36rpx;
  background: linear-gradient(135deg, var(--color-primary) 0%, #a78bfa 100%);
  border-radius: 24rpx;
  box-shadow: var(--shadow-md);
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
  margin-top: 12rpx;
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

.filters-scroll {
  margin-top: 28rpx;
  white-space: nowrap;
}

.filters {
  display: inline-flex;
  gap: 16rpx;
  padding: 4rpx 0;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 28rpx;
  background: var(--bg-card);
  border-radius: var(--radius-full);
  border: 1rpx solid var(--border-color);
  transition: all 0.3s ease;
}

.filter-chip--active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.filter-icon {
  margin-right: 8rpx;
  font-size: 24rpx;
}

.filter-label {
  font-size: 26rpx;
  color: var(--text-regular);
}

.filter-chip--active .filter-label {
  color: var(--color-primary);
  font-weight: 500;
}

.search-wrap {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding: 0 24rpx;
  height: 80rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  border: 1rpx solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.search-input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: var(--text-primary);
}

.search-ph {
  color: var(--text-placeholder);
}

.search-clear {
  padding: 8rpx;
  margin-left: 8rpx;
}

.goal-list {
  margin-top: 24rpx;
}

.goal-card {
  position: relative;
  margin-bottom: 20rpx;
  padding: 28rpx 28rpx 24rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  border: 2rpx solid transparent;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.goal-card--press {
  opacity: 0.96;
}

.goal-card--selected {
  border-color: var(--color-primary);
  background: var(--bg-emphasis);
  box-shadow: var(--shadow-md);
}

.goal-card--added {
  background: var(--neutral-light);
}

.goal-head {
  display: flex;
  align-items: center;
}

.goal-index {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.goal-index-text {
  font-size: 22rpx;
  font-weight: 600;
  color: var(--text-white);
}

.goal-category {
  flex: 1;
  display: flex;
  align-items: center;
  margin-left: 16rpx;
  min-width: 0;
}

.goal-cat-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.goal-cat-label {
  font-size: 24rpx;
  color: var(--color-primary);
  font-weight: 500;
}

.goal-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid var(--border-color);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.goal-check--on {
  background: var(--success);
  border-color: var(--success);
}

.goal-title {
  display: block;
  margin-top: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 44rpx;
  color: var(--text-primary);
}

.goal-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  line-height: 40rpx;
  color: var(--text-secondary);
}

.goal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.meta-tag {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  line-height: 32rpx;
}

.difficulty--easy {
  background: var(--success-light);
  color: var(--success);
}

.difficulty--medium {
  background: var(--warning-light);
  color: var(--warning);
}

.difficulty--hard {
  background: var(--error-light);
  color: var(--error);
}

.meta-tag--neutral {
  background: var(--neutral-light);
  color: var(--text-secondary);
}

.goal-added {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
}

.goal-added-text {
  font-size: 22rpx;
  color: var(--text-placeholder);
}

.empty-block {
  padding: 80rpx 32rpx;
  text-align: center;
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

.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: 20rpx 28rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: linear-gradient(
    180deg,
    rgba(246, 247, 251, 0) 0%,
    var(--bg-page) 28%
  );
}

.footer-inner {
  padding: 24rpx 28rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  box-shadow: var(--shadow-lg);
}

.footer-info {
  display: flex;
  align-items: baseline;
  margin-bottom: 20rpx;
}

.footer-count {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--color-primary);
  margin-right: 8rpx;
}

.footer-label {
  font-size: 28rpx;
  color: var(--text-regular);
}

.footer-actions {
  display: flex;
  gap: 16rpx;
}

.btn-ghost {
  flex-shrink: 0;
  height: 80rpx;
  padding: 0 32rpx;
  border-radius: var(--radius-full);
  border: 1rpx solid var(--border-color);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

.btn-ghost--press {
  opacity: 0.85;
  background: var(--bg-hover);
}

.btn-ghost-text {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.btn-primary {
  flex: 1;
  height: 80rpx;
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
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-white);
}
</style>
