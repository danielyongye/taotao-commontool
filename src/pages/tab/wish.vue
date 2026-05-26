<template>
  <view class="page">
    <scroll-view class="scroll" scroll-y :show-scrollbar="false">
      <!-- 顶栏 -->
      <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
        <text class="header-title">愿望</text>
        <view class="header-actions">
          <view class="header-icon" @click="onSearch">
            <u-icon name="search" size="22" color="#1a1d26" />
          </view>
          <view class="header-icon" @click="onNotify">
            <u-icon name="bell" size="22" color="#1a1d26" />
          </view>
        </view>
      </view>

      <!-- 横幅 -->
      <view class="hero" @click="goRecommend">
        <view class="hero-wave" />
        <view class="hero-inner">
          <view class="hero-text">
            <text class="hero-title">心怀梦想，步履不停</text>
            <text class="hero-sub">去发现更多可能 ✨</text>
          </view>
          <view class="hero-jar">
            <view class="jar-glass">
              <text class="jar-star">★</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 主 Tab -->
      <view class="main-tabs">
        <view
          v-for="tab in mainTabs"
          :key="tab.key"
          :class="['main-tab', activeMainTab === tab.key ? 'active' : '']"
          @click="activeMainTab = tab.key"
        >
          <text class="main-tab-text">{{ tab.label }}</text>
          <view v-if="activeMainTab === tab.key" class="main-tab-line" />
        </view>
      </view>

      <!-- 分类筛选（清单 / 已实现） -->
      <scroll-view
        v-if="activeMainTab !== 'recommend'"
        class="chip-scroll"
        scroll-x
        :show-scrollbar="false"
      >
        <view class="chip-row">
          <view
            v-for="chip in filterChips"
            :key="chip.value"
            :class="['chip', activeFilter === chip.value ? 'active' : '']"
            @click="activeFilter = chip.value"
          >
            <text class="chip-text">{{ chip.label }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 推荐 -->
      <view v-if="activeMainTab === 'recommend'" class="recommend-block">
        <view class="recommend-card" @click="goRecommend">
          <u-icon name="gift-fill" size="28" color="#4A6FFF" />
          <view class="recommend-info">
            <text class="recommend-title">浏览愿望推荐</text>
            <text class="recommend-desc">100+ 人生目标灵感，一键加入清单</text>
          </view>
          <u-icon name="arrow-right" size="14" color="#C5CAD3" />
        </view>
      </view>

      <!-- 愿望列表 -->
      <view v-else class="wish-list">
        <view
          v-for="item in displayList"
          :key="item.id"
          class="wish-item"
          @click="openItem(item)"
        >
          <view class="thumb" :style="{ background: item.thumbBg }">
            <text v-if="item.thumbEmoji" class="thumb-emoji">{{ item.thumbEmoji }}</text>
          </view>
          <view class="wish-body">
            <view class="wish-title-row">
              <text class="wish-title">{{ item.title }}</text>
              <view class="tag" :class="'tag-' + item.category">
                <text class="tag-text">{{ item.tagLabel }}</text>
              </view>
            </view>
            <text v-if="!item.progress" class="wish-desc">{{ item.desc }}</text>
            <view v-else class="progress-wrap">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: item.progressPercent + '%' }" />
              </view>
              <view class="progress-meta">
                <text class="progress-amount">¥{{ formatMoney(item.current) }} / ¥{{ formatMoney(item.target) }}</text>
                <text class="progress-pct">{{ item.progressPercent }}%</text>
              </view>
            </view>
          </view>
        </view>
        <view v-if="!displayList.length" class="empty">
          <text class="empty-text">暂无愿望，点击右下角添加</text>
        </view>
      </view>

      <view class="scroll-foot" />
    </scroll-view>

    <!-- 添加按钮 -->
    <view class="fab" @click="onAdd">
      <u-icon name="plus" size="24" color="#ffffff" />
    </view>

    <app-tab-bar active="wish" />
  </view>
</template>

<script>
import AppTabBar from '@/components/AppTabBar.vue'
import { getWishList } from '@/utils/wishlist.js'

const DEMO_ITEMS = [
  {
    id: 'demo-1',
    title: '去看一场极光',
    tagLabel: '想去',
    category: 'go',
    desc: '在冰岛看一场极光...',
    thumbBg: 'linear-gradient(135deg, #1e3a5f 0%, #5b9bd5 55%, #a8d4f5 100%)',
    thumbEmoji: '🌌',
    done: false
  },
  {
    id: 'demo-2',
    title: '学会一门乐器',
    tagLabel: '想学会',
    category: 'learn',
    desc: '自学一门乐器...',
    thumbBg: 'linear-gradient(135deg, #2d5016 0%, #6b8e4e 100%)',
    thumbEmoji: '🎸',
    done: false
  },
  {
    id: 'demo-3',
    title: '存够 10 万元',
    tagLabel: '想做',
    category: 'do',
    desc: '',
    thumbBg: 'linear-gradient(135deg, #0d9488 0%, #5eead4 100%)',
    thumbEmoji: '💰',
    done: false,
    progress: true,
    current: 58200,
    target: 100000
  },
  {
    id: 'demo-4',
    title: '拥有自己的相机',
    tagLabel: '想拥有',
    category: 'have',
    desc: '记录生活中的美好瞬间',
    thumbBg: 'linear-gradient(135deg, #374151 0%, #9ca3af 100%)',
    thumbEmoji: '📷',
    done: false
  },
  {
    id: 'demo-5',
    title: '环游世界',
    tagLabel: '想去',
    category: 'go',
    desc: '去看看这个美丽的世界',
    thumbBg: 'linear-gradient(135deg, #c2410c 0%, #fb923c 50%, #38bdf8 100%)',
    thumbEmoji: '🌍',
    done: false
  }
]

const CATEGORY_MAP = {
  do: '想做',
  go: '想去',
  have: '想拥有',
  learn: '想学会'
}

function normalizeStored(wish) {
  const category = wish.category || 'do'
  return {
    id: wish.id,
    title: wish.title || wish.text || '未命名愿望',
    tagLabel: CATEGORY_MAP[category] || wish.tagLabel || '想做',
    category,
    desc: wish.desc || '',
    thumbBg: wish.thumbBg || 'linear-gradient(135deg, #dce8ff 0%, #8b9dff 100%)',
    thumbEmoji: wish.thumbEmoji || '✨',
    done: !!wish.done,
    progress: wish.progress,
    current: wish.current,
    target: wish.target,
    progressPercent: wish.progress && wish.target
      ? Math.min(100, Math.round((wish.current / wish.target) * 100))
      : 0
  }
}

export default {
  components: { AppTabBar },
  data() {
    const sys = uni.getSystemInfoSync()
    return {
      statusBarHeight: sys.statusBarHeight || 20,
      activeMainTab: 'list',
      activeFilter: 'all',
      storedWishes: [],
      mainTabs: [
        { key: 'recommend', label: '推荐' },
        { key: 'list', label: '清单' },
        { key: 'done', label: '已实现' }
      ],
      filterChips: [
        { label: '全部', value: 'all' },
        { label: '想做', value: 'do' },
        { label: '想去', value: 'go' },
        { label: '想拥有', value: 'have' },
        { label: '想学会', value: 'learn' }
      ]
    }
  },
  computed: {
    allItems() {
      const stored = this.storedWishes.map(normalizeStored)
      if (stored.length) return stored
      return DEMO_ITEMS.map(item => ({
        ...item,
        progressPercent: item.progress
          ? Math.min(100, Math.round((item.current / item.target) * 100))
          : 0
      }))
    },
    displayList() {
      let list = this.allItems
      if (this.activeMainTab === 'done') {
        list = list.filter(w => w.done)
      } else {
        list = list.filter(w => !w.done)
      }
      if (this.activeFilter !== 'all') {
        list = list.filter(w => w.category === this.activeFilter)
      }
      return list
    }
  },
  onShow() {
    this.loadWishes()
  },
  methods: {
    loadWishes() {
      const raw = getWishList()
      this.storedWishes = Array.isArray(raw) ? raw : []
    },
    formatMoney(n) {
      if (n == null) return '0'
      return Number(n).toLocaleString('zh-CN')
    },
    onSearch() {
      uni.showToast({ title: '搜索功能开发中', icon: 'none' })
    },
    onNotify() {
      uni.showToast({ title: '暂无新通知', icon: 'none' })
    },
    goRecommend() {
      uni.navigateTo({ url: '/pages/wishRecommend/index' })
    },
    onAdd() {
      uni.navigateTo({ url: '/pages/wishlist/index' })
    },
    openItem(item) {
      uni.navigateTo({ url: '/pages/wishlist/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
}

.scroll {
  height: 100vh;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 32rpx 8rpx;
}

.header-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #000000;
  letter-spacing: -1rpx;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.header-icon {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero {
  position: relative;
  margin: 16rpx 28rpx 0;
  border-radius: 40rpx;
  overflow: hidden;
  background: linear-gradient(115deg, #6b8cff 0%, #8b7cf8 42%, #a78bfa 100%);
  box-shadow: 0 16rpx 48rpx rgba(107, 140, 255, 0.28);
}

.hero-wave {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 80rpx;
  background: radial-gradient(ellipse 120% 100% at 50% 100%, rgba(255, 255, 255, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.hero-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 36rpx;
}

.hero-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.35;
}

.hero-sub {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.hero-jar {
  flex-shrink: 0;
  width: 140rpx;
  height: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jar-glass {
  width: 100rpx;
  height: 116rpx;
  border-radius: 16rpx 16rpx 28rpx 28rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.18) 100%);
  border: 2rpx solid rgba(255, 255, 255, 0.55);
  box-shadow: inset 0 -8rpx 24rpx rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.jar-star {
  font-size: 48rpx;
  color: #ffe566;
  text-shadow: 0 0 20rpx rgba(255, 230, 100, 0.95);
}

.main-tabs {
  display: flex;
  margin-top: 36rpx;
  padding: 0 28rpx;
  border-bottom: 1rpx solid #f0f2f5;
}

.main-tab {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20rpx;
}

.main-tab-text {
  font-size: 30rpx;
  color: #8e8e93;
}

.main-tab.active .main-tab-text {
  color: #4a6fff;
  font-weight: 600;
}

.main-tab-line {
  position: absolute;
  bottom: 0;
  width: 48rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: #4a6fff;
}

.chip-scroll {
  width: 100%;
  margin-top: 24rpx;
  white-space: nowrap;
}

.chip-row {
  display: inline-flex;
  padding: 0 28rpx 8rpx;
  gap: 16rpx;
}

.chip {
  display: inline-flex;
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  background: #f2f3f5;
}

.chip.active {
  background: #e8eeff;
}

.chip-text {
  font-size: 26rpx;
  color: #8e8e93;
}

.chip.active .chip-text {
  color: #4a6fff;
  font-weight: 500;
}

.recommend-block {
  padding: 28rpx;
}

.recommend-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx 28rpx;
  background: #f7f8fc;
  border-radius: 24rpx;
}

.recommend-info {
  flex: 1;
}

.recommend-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1d26;
}

.recommend-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #8e8e93;
}

.wish-list {
  padding: 8rpx 28rpx 0;
}

.wish-item {
  display: flex;
  align-items: flex-start;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f5f5f7;
}

.wish-item:last-child {
  border-bottom: none;
}

.thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumb-emoji {
  font-size: 48rpx;
}

.wish-body {
  flex: 1;
  margin-left: 24rpx;
  min-width: 0;
}

.wish-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.wish-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #000000;
}

.tag {
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
}

.tag-text {
  font-size: 22rpx;
}

.tag-go {
  background: #f0e8ff;
}
.tag-go .tag-text {
  color: #8b5cf6;
}

.tag-learn {
  background: #e6f7ed;
}
.tag-learn .tag-text {
  color: #22a06b;
}

.tag-do {
  background: #e8eeff;
}
.tag-do .tag-text {
  color: #4a6fff;
}

.tag-have {
  background: #fff4e6;
}
.tag-have .tag-text {
  color: #e67e22;
}

.wish-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #8e8e93;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-wrap {
  margin-top: 16rpx;
}

.progress-bar {
  height: 12rpx;
  border-radius: 6rpx;
  background: #e8f4f2;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6rpx;
  background: linear-gradient(90deg, #2dd4bf 0%, #14b8a6 100%);
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
}

.progress-amount {
  font-size: 24rpx;
  color: #8e8e93;
}

.progress-pct {
  font-size: 24rpx;
  color: #14b8a6;
  font-weight: 500;
}

.empty {
  padding: 80rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #c5cad3;
}

.scroll-foot {
  height: 200rpx;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 200rpx;
  z-index: 10;
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: #4a6fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(74, 111, 255, 0.4);
}
</style>
