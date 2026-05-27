<template>
  <view class="page">
    <!-- #ifdef H5 -->
    <view
      ref="pageScroll"
      class="page-scroll h5-scroll"
      @scroll="onPageScroll"
    >
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <scroll-view
      ref="pageScroll"
      class="page-scroll"
      scroll-y
      enable-flex
      :scroll-top="pageScrollTop"
      scroll-with-animation
      :show-scrollbar="false"
      @scroll="onPageScroll"
    >
    <!-- #endif -->
      <view class="head" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="head-row">
          <text class="title">全部工具</text>
          <view class="head-actions">
            <view class="head-btn" @click="openFavoriteManager">
              <u-icon :name="normalizeIconName('heart')" size="18" color="#6B7280" />
              <text class="head-btn-text">收藏</text>
            </view>
          </view>
        </view>
        <view class="search-wrap">
          <u-icon name="search" size="16" color="#B0B8C4" />
          <input
            class="search-input"
            v-model="keyword"
            placeholder="搜索工具"
            placeholder-class="search-ph"
            confirm-type="search"
          />
          <view v-if="keyword" class="search-clear" @click="keyword = ''">
            <u-icon :name="normalizeIconName('close-circle')" size="16" color="#D1D5DB" />
          </view>
        </view>
      </view>

      <view class="content-row">
        <view class="sidebar">
          <view
            v-for="cat in sidebar"
            :key="cat.id"
            :class="['side-item', { active: activeCategory === cat.id }]"
            @click="scrollToCategory(cat.id)"
          >
            <text class="side-text">{{ cat.name }}</text>
          </view>
        </view>

        <view class="main-col">
          <view
            v-for="section in displaySections"
            :key="section.id"
            :id="'sec-' + section.id"
            class="section"
          >
            <text class="section-title">{{ section.title }}</text>

            <!-- unified 2-column card grid for all sections -->
            <view v-if="section.tools && section.tools.length" class="grid-unified">
              <view
                v-for="tool in section.tools"
                :key="tool.id"
                class="tool-card"
                hover-class="tool-card-active"
                @click="openTool(tool)"
              >
                <view class="tool-icon" :style="{ background: getToolCardBackground(tool) }">
                  <u-icon :name="normalizeIconName(tool.icon)" size="22" :color="tool.iconColor" />
                </view>
                <view class="tool-text">
                  <text class="tool-name">{{ tool.name }}</text>
                  <text class="tool-desc">{{ tool.desc }}</text>
                </view>
              </view>
            </view>

            <view v-else class="section-empty">
              <text class="empty-tip">更多工具即将上线</text>
            </view>
          </view>
        </view>
      </view>

      <view class="scroll-foot" />
    <!-- #ifdef H5 -->
    </view>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    </scroll-view>
    <!-- #endif -->

    <!-- 收藏管理 -->
    <view v-if="favoriteManagerVisible" class="fav-mask" @click="closeFavoriteManager">
      <view class="fav-panel" @click.stop>
        <view class="fav-head">
          <text class="fav-title">收藏工具</text>
          <text class="fav-sub">收藏后会出现在首页顶部</text>
          <view class="fav-close" @click="closeFavoriteManager">
            <u-icon name="close" size="18" color="#94A3B8" />
          </view>
        </view>

        <scroll-view class="fav-body" scroll-y :show-scrollbar="false">
          <view v-for="sec in favoriteCandidateSections" :key="sec.id" class="fav-sec">
            <text class="fav-sec-title">{{ sec.title }}</text>
            <view class="fav-list">
              <view
                v-for="tool in sec.tools"
                :key="tool.id"
                class="fav-item"
                hover-class="fav-item-active"
                @click="toggleFavoriteById(tool.id)"
              >
                <view class="fav-left">
                  <view class="fav-dot" :style="{ background: getToolCardBackground(tool) }" />
                  <text class="fav-name">{{ tool.name }}</text>
                </view>
                <view class="fav-right">
                  <view
                    :class="['fav-check', { checked: favoriteToolIds.includes(tool.id) }]"
                  >
                    <view class="fav-check-mark" />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <app-tab-bar active="tools" />
  </view>
</template>

<script>
import { TOOLS_SIDEBAR, TOOLS_SECTIONS } from '@/config/toolsPage.js'
import { recordRecentTool } from '@/utils/recentTools.js'
import { getFavoriteToolIds, toggleFavoriteToolId } from '@/utils/favoriteTools.js'
import { getToolCardBackground } from '@/utils/toolsCatalog.js'
import AppTabBar from '@/components/AppTabBar.vue'

export default {
  components: { AppTabBar },
  data() {
    const sys = uni.getSystemInfoSync()
    return {
      isH5: process.env.UNI_PLATFORM === 'h5',
      statusBarHeight: sys.statusBarHeight || 20,
      sections: TOOLS_SECTIONS,
      activeCategory: '',
      pageScrollTop: '',
      keyword: '',
      sectionTops: [],
      scrollLock: false,
      favoriteToolIds: [],
      favoriteManagerVisible: false
    }
  },
  computed: {
    // flat map of all tools by id for fast lookup
    toolMap() {
      return this.sections.reduce((acc, section) => {
        ;(section.tools || []).forEach((tool) => { acc[tool.id] = tool })
        return acc
      }, {})
    },
    favoriteTools() {
      return this.favoriteToolIds.map((id) => this.toolMap[id]).filter(Boolean)
    },
    sidebar() {
      if (!this.favoriteTools.length) return TOOLS_SIDEBAR
      return [{ id: 'favorite', name: '我喜欢的' }, ...TOOLS_SIDEBAR]
    },
    // prepend "我喜欢的" section when favorites exist
    resolvedSections() {
      if (!this.favoriteTools.length) return this.sections
      return [
        { id: 'favorite', title: '我喜欢的', tools: this.favoriteTools },
        ...this.sections
      ]
    },
    favoriteCandidateSections() {
      return this.sections
        .filter((sec) => Array.isArray(sec.tools) && sec.tools.length)
        .map((sec) => ({
          id: sec.id,
          title: sec.title,
          tools: sec.tools
        }))
    },
    displaySections() {
      const kw = this.keyword.trim().toLowerCase()
      if (!kw) return this.resolvedSections
      return this.resolvedSections
        .map((sec) => {
          if (!sec.tools?.length) return null
          const tools = sec.tools.filter((t) =>
            t.name.toLowerCase().includes(kw) ||
            (t.desc && t.desc.toLowerCase().includes(kw))
          )
          if (!tools.length) return null
          return { ...sec, tools }
        })
        .filter(Boolean)
    }
  },
  watch: {
    displaySections() {
      // 搜索/收藏变化后，确保左侧有一个有效的默认选中
      this.ensureActiveCategory()
      this.$nextTick(() => this.measureSections())
    }
  },
  onReady() {
    this.$nextTick(() => this.measureSections())
  },
  onShow() {
    this.favoriteToolIds = getFavoriteToolIds()
    this.ensureActiveCategory()
    this.$nextTick(() => this.measureSections())
  },
  methods: {
    normalizeIconName(name) {
      const icon = String(name || '').trim()
      const map = {
        heart: 'heart-fill',
        'close-circle': 'close-circle-fill',
        calendar: 'calendar-fill',
        grid: 'grid-fill'
      }
      return map[icon] || icon
    },
    ensureActiveCategory() {
      const sidebarIds = (this.sidebar || []).map((s) => s.id)
      const sectionIds = (this.displaySections || []).map((s) => s.id)
      const candidate = sidebarIds.find((id) => sectionIds.includes(id)) || sectionIds[0] || sidebarIds[0] || ''
      if (candidate && candidate !== this.activeCategory) {
        this.activeCategory = candidate
      }
    },
    openFavoriteManager() {
      this.favoriteManagerVisible = true
    },
    closeFavoriteManager() {
      this.favoriteManagerVisible = false
    },
    toggleFavoriteById(toolId) {
      this.favoriteToolIds = toggleFavoriteToolId(toolId)
      this.$nextTick(() => this.measureSections())
    },
    getToolCardBackground,
    scrollToCategory(id) {
      const sectionIds = (this.displaySections || []).map((s) => s.id)
      const targetId = sectionIds.includes(id) ? id : (sectionIds[0] || id)
      this.activeCategory = targetId
      this.scrollLock = true
      this.$nextTick(() => {
        this.measureSections(() => this.applyScrollToSection(targetId))
      })
    },
    applyScrollToSection(targetId) {
      const section = (this.sectionTops || []).find((s) => s.id === targetId)
      if (!section) {
        this.scrollLock = false
        return
      }
      const top = Math.max(0, Math.round(section.top))
      if (this.isH5) {
        const el = this.getScrollEl()
        if (el) el.scrollTop = top
        setTimeout(() => {
          this.scrollLock = false
        }, 400)
        return
      }
      this.pageScrollTop = ''
      this.$nextTick(() => {
        this.pageScrollTop = top
        setTimeout(() => {
          this.pageScrollTop = ''
          this.scrollLock = false
        }, 500)
      })
    },
    getScrollEl() {
      const ref = this.$refs.pageScroll
      if (!ref) return null
      return ref.$el || ref
    },
    onPageScroll(e) {
      if (this.scrollLock || !this.sectionTops.length) return
      const scrollTop = this.isH5
        ? (this.getScrollEl()?.scrollTop || 0)
        : e.detail.scrollTop
      let current = this.sectionTops[0].id
      for (let i = this.sectionTops.length - 1; i >= 0; i--) {
        if (scrollTop >= this.sectionTops[i].top - 24) {
          current = this.sectionTops[i].id
          break
        }
      }
      if (current !== this.activeCategory) {
        this.activeCategory = current
      }
    },
    measureSections(done) {
      const query = uni.createSelectorQuery().in(this)
      query.select('.content-row').boundingClientRect()
      query.selectAll('.section').boundingClientRect()
      query.select('.page-scroll').scrollOffset()
      query.exec((res) => {
        const rowRect = res[0]
        const rects = res[1]
        const scroll = res[2]
        if (!rowRect || !rects || !rects.length) {
          if (typeof done === 'function') done()
          return
        }
        const baseScrollTop = scroll?.scrollTop ?? this.getScrollEl()?.scrollTop ?? 0
        this.sectionTops = rects.map((r, i) => ({
          id: this.displaySections[i]?.id,
          top: baseScrollTop + r.top - rowRect.top
        }))
        if (typeof done === 'function') done()
      })
    },
    openTool(tool) {
      if (!tool.url) {
        uni.showToast({ title: '敬请期待', icon: 'none' })
        return
      }
      recordRecentTool(tool.id)
      uni.navigateTo({ url: tool.url })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  height: 100%;
  background: #ffffff;
  box-sizing: border-box;
}

.page-scroll {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.h5-scroll {
  display: block;
  height: 100%;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
}

.head {
  padding: 16rpx 32rpx 20rpx;
  background: #ffffff;
}

.head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.head-actions {
  display: flex;
  align-items: center;
}

.head-btn {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  border-radius: 999rpx;
  background: #f3f4f6;
}

.head-btn-text {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
  font-weight: 600;
}

.title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #1a1d26;
  letter-spacing: -1rpx;
}

.search-wrap {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding: 0 24rpx;
  height: 72rpx;
  background: #f3f4f6;
  border-radius: 36rpx;
}

.search-input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #1a1d26;
  height: 72rpx;
  line-height: 72rpx;
}

.search-ph {
  color: #b0b8c4;
}

.search-clear {
  padding: 8rpx;
  margin-left: 8rpx;
}

.content-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.sidebar {
  flex-shrink: 0;
  width: 168rpx;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 2;
  align-self: flex-start;
}

.side-item {
  padding: 28rpx 16rpx 28rpx 20rpx;
  margin: 4rpx 0;
}

.side-item.active {
  background: #eef4ff;
  border-radius: 0 20rpx 20rpx 0;
}

.side-text {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.35;
}

.side-item.active .side-text {
  color: #4b8bff;
  font-weight: 600;
}

.main-col {
  flex: 1;
  min-width: 0;
  padding: 0 24rpx 0 8rpx;
  box-sizing: border-box;
}

.section {
  padding-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1d26;
  margin-bottom: 24rpx;
}

/* unified 2-column card grid for all categories */
.grid-unified {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8rpx;
}

.tool-card {
  position: relative;
  width: calc(50% - 16rpx);
  margin: 0 8rpx 16rpx;
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e9ecf3;
  box-sizing: border-box;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.tool-card-active {
  opacity: 0.9;
}

.tool-icon {
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-text {
  flex: 1;
  margin-left: 14rpx;
  min-width: 0;
}

.tool-name {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.35;
  white-space: nowrap;
}

.tool-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8692a6;
  line-height: 1.45;
  word-break: break-all;
  white-space: normal;
}

.section-empty {
  padding: 48rpx 0;
  text-align: center;
}

.empty-tip {
  font-size: 26rpx;
  color: #b0b8c4;
}

.scroll-foot {
  height: 160rpx;
}

.fav-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 99;
  display: flex;
  align-items: flex-end;
}

.fav-panel {
  width: 100%;
  max-height: 78vh;
  background: #ffffff;
  border-radius: 28rpx 28rpx 0 0;
  overflow: hidden;
}

.fav-head {
  position: relative;
  padding: 24rpx 28rpx 16rpx;
  border-bottom: 1rpx solid #eef0f5;
}

.fav-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #1d2129;
}

.fav-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #8692a6;
}

.fav-close {
  position: absolute;
  right: 18rpx;
  top: 18rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-body {
  max-height: calc(78vh - 120rpx);
  padding: 12rpx 28rpx 28rpx;
  box-sizing: border-box;
}

.fav-sec {
  padding-top: 16rpx;
}

.fav-sec-title {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #1d2129;
  margin: 12rpx 0 12rpx;
}

.fav-list {
  background: #ffffff;
  border: 1rpx solid #e9ecf3;
  border-radius: 20rpx;
  overflow: hidden;
}

.fav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 20rpx;
}

.fav-item-active {
  opacity: 0.9;
}

.fav-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.fav-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 9rpx;
  margin-right: 12rpx;
}

.fav-name {
  font-size: 26rpx;
  color: #1d2129;
  font-weight: 600;
  max-width: 480rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 10rpx;
  border: 2rpx solid #c7ccd6;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.fav-check.checked {
  border-color: #6366f1;
  background: #eef0ff;
}

.fav-check-mark {
  width: 16rpx;
  height: 8rpx;
  border-left: 3rpx solid transparent;
  border-bottom: 3rpx solid transparent;
  transform: rotate(-45deg);
  margin-top: -2rpx;
}

.fav-check.checked .fav-check-mark {
  border-left-color: #6366f1;
  border-bottom-color: #6366f1;
}
</style>
