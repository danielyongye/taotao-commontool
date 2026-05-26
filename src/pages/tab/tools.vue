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
      :scroll-into-view="scrollIntoView"
      scroll-with-animation
      :show-scrollbar="false"
      @scroll="onPageScroll"
    >
    <!-- #endif -->
      <view class="head" :style="{ paddingTop: statusBarHeight + 'px' }">
        <text class="title">全部工具</text>
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
            <u-icon name="close-circle-fill" size="16" color="#D1D5DB" />
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

            <view v-if="section.layout === 'grid'" class="grid-common">
              <view
                v-for="tool in section.tools"
                :key="tool.id"
                class="grid-item"
                hover-class="grid-item-active"
                @click="openTool(tool)"
              >
                <view class="grid-icon" :style="{ background: tool.gradient }">
                  <u-icon :name="tool.icon" size="22" :color="tool.iconColor" />
                </view>
                <text class="grid-label">{{ tool.name }}</text>
              </view>
            </view>

            <view v-else-if="section.layout === 'outline'" class="grid-life">
              <view
                v-for="tool in section.tools"
                :key="tool.id"
                class="life-item"
                hover-class="grid-item-active"
                @click="openTool(tool)"
              >
                <view class="life-icon" :style="{ background: tool.bg }">
                  <u-icon :name="tool.icon" size="20" :color="tool.iconColor" />
                </view>
                <text class="life-label">{{ tool.name }}</text>
              </view>
            </view>

            <view v-else-if="section.layout === 'ledger'" class="grid-ledger">
              <view
                v-for="tool in section.tools"
                :key="tool.id"
                class="ledger-item"
                :style="{ background: tool.bg }"
                hover-class="grid-item-active"
                @click="openTool(tool)"
              >
                <view class="ledger-icon-wrap">
                  <u-icon :name="tool.icon" size="26" :color="tool.iconColor" />
                </view>
                <view class="ledger-text">
                  <text class="ledger-name">{{ tool.name }}</text>
                  <text class="ledger-desc">{{ tool.desc }}</text>
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

    <app-tab-bar active="tools" />
  </view>
</template>

<script>
import { TOOLS_SIDEBAR, TOOLS_SECTIONS } from '@/config/toolsPage.js'
import { recordRecentTool } from '@/utils/recentTools.js'
import AppTabBar from '@/components/AppTabBar.vue'

export default {
  components: { AppTabBar },
  data() {
    const sys = uni.getSystemInfoSync()
    return {
      isH5: process.env.UNI_PLATFORM === 'h5',
      statusBarHeight: sys.statusBarHeight || 20,
      sidebar: TOOLS_SIDEBAR,
      sections: TOOLS_SECTIONS,
      activeCategory: 'common',
      scrollIntoView: '',
      keyword: '',
      sectionTops: [],
      scrollLock: false
    }
  },
  computed: {
    displaySections() {
      const kw = this.keyword.trim().toLowerCase()
      if (!kw) return this.sections
      return this.sections
        .map((sec) => {
          if (sec.layout === 'placeholder') return null
          const tools = (sec.tools || []).filter((t) =>
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
      this.$nextTick(() => this.measureSections())
    }
  },
  onReady() {
    this.$nextTick(() => this.measureSections())
  },
  onShow() {
    this.$nextTick(() => this.measureSections())
  },
  methods: {
    scrollToCategory(id) {
      this.activeCategory = id
      this.scrollLock = true
      if (this.isH5) {
        this.scrollToSectionH5(id)
        return
      }
      this.scrollIntoView = 'sec-' + id
      setTimeout(() => {
        this.scrollIntoView = ''
        this.scrollLock = false
      }, 400)
    },
    scrollToSectionH5(id) {
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this)
        query.select('#sec-' + id).boundingClientRect()
        query.select('.page-scroll').boundingClientRect()
        query.select('.page-scroll').scrollOffset()
        query.exec((res) => {
          const target = res[0]
          const box = res[1]
          const offset = res[2]
          if (!target || !box) {
            this.scrollLock = false
            return
          }
          const top = (offset?.scrollTop || 0) + target.top - box.top
          const el = this.getScrollEl()
          if (el) el.scrollTop = Math.max(0, top)
          setTimeout(() => {
            this.scrollLock = false
          }, 400)
        })
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
    measureSections() {
      const query = uni.createSelectorQuery().in(this)
      query.select('.content-row').boundingClientRect()
      query.selectAll('.section').boundingClientRect()
      query.select('.page-scroll').scrollOffset()
      query.exec((res) => {
        const rowRect = res[0]
        const rects = res[1]
        const scroll = res[2]
        if (!rowRect || !rects || !rects.length) return
        const baseScrollTop = scroll?.scrollTop || 0
        this.sectionTops = rects.map((r, i) => ({
          id: this.displaySections[i]?.id,
          top: baseScrollTop + r.top - rowRect.top
        }))
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

.grid-common {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8rpx;
}

.grid-item {
  width: 33.33%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 8rpx 20rpx;
  box-sizing: border-box;
}

.grid-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(75, 139, 255, 0.12);
}

.grid-label {
  margin-top: 14rpx;
  font-size: 24rpx;
  color: #374151;
  text-align: center;
  line-height: 1.3;
}

.grid-life {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -6rpx;
}

.life-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 6rpx 16rpx;
  box-sizing: border-box;
}

.life-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.life-label {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #374151;
  text-align: center;
  line-height: 1.3;
}

.grid-ledger {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10rpx;
}

.ledger-item {
  width: calc(50% - 20rpx);
  margin: 0 10rpx 20rpx;
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  border-radius: 20rpx;
  box-sizing: border-box;
  box-shadow: 0 4rpx 20rpx rgba(80, 100, 150, 0.06);
}

.ledger-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ledger-text {
  flex: 1;
  margin-left: 12rpx;
  min-width: 0;
}

.ledger-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1d26;
  line-height: 1.3;
}

.ledger-desc {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #9ca3af;
  line-height: 1.35;
}

.section-empty {
  padding: 48rpx 0;
  text-align: center;
}

.empty-tip {
  font-size: 26rpx;
  color: #b0b8c4;
}

.grid-item-active {
  opacity: 0.85;
}

.scroll-foot {
  height: 160rpx;
}
</style>
