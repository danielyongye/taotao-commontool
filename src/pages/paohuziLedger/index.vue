<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />

    <view class="page-content" :class="{ 'page-content--tab': bottomTab !== 'stats' }">
      <template v-if="bottomTab === 'stats'">
        <view class="stats-card">
          <view class="stats-head">
            <text class="stats-title">{{ statPeriodLabel }}</text>
            <view class="period-tabs">
              <view
                v-for="tab in periodTabs"
                :key="tab.key"
                :class="['period-tab', { 'period-tab--active': statPeriod === tab.key }]"
                hover-class="period-tab--press"
                :hover-stay-time="80"
                @click="switchPeriod(tab.key)"
              >
                <text class="period-tab-text">{{ tab.label }}</text>
              </view>
            </view>
          </view>
          <scroll-view
            v-if="statPeriod === STAT_PERIOD.year && availableYears.length"
            class="year-scroll"
            scroll-x
            :show-scrollbar="false"
          >
            <view class="year-chips">
              <view
                v-for="y in availableYears"
                :key="y"
                :class="['year-chip', { 'year-chip--active': selectedYear === y }]"
                hover-class="year-chip--press"
                :hover-stay-time="80"
                @click="selectYear(y)"
              >
                <text class="year-chip-text">{{ y }}年</text>
              </view>
            </view>
          </scroll-view>
          <view class="stats-grid">
            <view class="stat-col stat-col--profit">
              <text class="stat-label">总盈亏 (元)</text>
              <view
                class="stat-profit-wrap"
                :class="totalProfitClass"
              >
                <text class="stat-value stat-value--profit">
                  {{ formatProfit(stats.totalProfit) }}
                </text>
              </view>
            </view>
            <view class="stat-divider" />
            <view class="stat-col">
              <text class="stat-label">总场次</text>
              <text class="stat-value">{{ stats.totalSessions }}</text>
            </view>
            <view class="stat-divider" />
            <view class="stat-col">
              <text class="stat-label">胜率</text>
              <text class="stat-value">{{ formatWinRate(stats.winRate) }}</text>
            </view>
          </view>
        </view>

        <view class="section-head">
          <text class="section-title">最近记录</text>
          <text v-if="recentList.length" class="section-count">{{ recentList.length }} 条</text>
        </view>

        <view v-if="recentList.length" class="record-list">
          <view
            v-for="item in recentList"
            :key="item.id"
            class="record-card"
            hover-class="record-card--press"
            :hover-stay-time="100"
            @click="openEdit(item)"
          >
            <view class="record-head">
              <view class="record-head-left">
                <view class="type-badge">
                  <text class="type-badge-text">{{ item.venueLabel }}</text>
                </view>
                <text class="record-date">{{ item.dateTimeLabel }}</text>
              </view>
              <text
                class="record-profit"
                :class="{
                  'record-profit--win': item.isWin,
                  'record-profit--loss': item.isLoss
                }"
              >
                {{ item.profitText }}
              </text>
            </view>

            <view v-if="item.hasPlayers" class="record-players">
              <view
                v-for="(name, pIdx) in item.players"
                :key="pIdx"
                class="player-chip"
              >
                <text class="player-chip-text">{{ name }}</text>
              </view>
            </view>

            <view v-if="item.hasDuration" class="record-meta">
              <u-icon name="clock" size="13" color="#A1A8B8" />
              <text class="record-meta-text">{{ item.durationText }}</text>
            </view>

            <view v-if="!item.hasPlayers && !item.hasDuration" class="record-meta">
              <text class="record-meta-text record-meta-text--muted">暂无牌友与时长</text>
            </view>
          </view>
        </view>

        <view v-else class="empty-card">
          <view class="empty-icon-wrap">
            <u-icon name="list" size="32" color="#4B7CFF" />
          </view>
          <text class="empty-title">还没有牌局记录</text>
          <text class="empty-desc">记下每一局盈亏，牌友与时长一目了然</text>
          <view
            class="empty-btn"
            hover-class="empty-btn--press"
            :hover-stay-time="100"
            @click="openCreate"
          >
            <text class="empty-btn-text">记第一局</text>
          </view>
        </view>
      </template>

      <template v-else-if="bottomTab === 'trends'">
        <view class="panel-card">
          <text class="panel-title">近 6 个月盈亏</text>
          <view
            v-for="(row, idx) in monthlyTrends"
            :key="row.month"
            class="trend-row"
          >
            <view class="trend-left">
              <text class="trend-month">{{ row.monthLabel }}</text>
              <text class="trend-count">{{ row.count }} 场</text>
            </view>
            <text class="trend-profit" :class="row.profitClassName">
              {{ row.profitText }}
            </text>
            <view v-if="idx < monthlyTrends.length - 1" class="trend-line" />
          </view>
          <view v-if="!monthlyTrends.length" class="empty-card empty-card--compact">
            <text class="empty-title">暂无趋势数据</text>
            <text class="empty-desc">多记几局后查看月度汇总</text>
          </view>
        </view>
      </template>

      <template v-else>
        <view class="panel-card">
          <view
            class="settings-row"
            hover-class="settings-row--press"
            :hover-stay-time="100"
            @click="confirmClearAll"
          >
            <view class="settings-left">
              <view class="settings-icon-wrap">
                <u-icon name="trash" size="18" color="#EF4444" />
              </view>
              <text class="settings-label">清空全部记录</text>
            </view>
            <u-icon name="arrow-right" size="14" color="#8692A6" />
          </view>
        </view>
        <text class="settings-hint">数据仅保存在本机，卸载小程序后将丢失</text>
      </template>
    </view>

    <view
      v-if="bottomTab === 'stats'"
      class="fab"
      hover-class="fab--press"
      :hover-stay-time="100"
      @click="openCreate"
    >
      <text class="fab-plus">+</text>
    </view>

    <view class="bottom-nav">
      <view
        v-for="tab in bottomTabs"
        :key="tab.key"
        class="nav-item"
        hover-class="nav-item--press"
        :hover-stay-time="80"
        @click="bottomTab = tab.key"
      >
        <view :class="['nav-icon-wrap', { 'nav-icon-wrap--active': bottomTab === tab.key }]">
          <u-icon
            :name="tab.icon"
            size="22"
            :color="bottomTab === tab.key ? '#6366F1' : '#8692A6'"
          />
        </view>
        <text
          class="nav-label"
          :class="{ 'nav-label--active': bottomTab === tab.key }"
        >
          {{ tab.label }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import {
  STAT_PERIOD,
  STAT_PERIOD_TABS,
  EDIT_PAGE
} from '@/constants/paohuziLedger.js'
import {
  getEnrichedSessionList,
  filterSessionsByPeriod,
  getAvailableYears,
  getStatPeriodLabel,
  computeSessionStats,
  formatProfit,
  formatWinRate,
  getMonthlyTrends,
  clearAllSessions
} from '@/utils/paohuziLedger.js'
import day from '@/utils/dayjs.js'

export default {
  data() {
    return {
      STAT_PERIOD,
      statPeriod: STAT_PERIOD.month,
      selectedYear: day().year(),
      periodTabs: STAT_PERIOD_TABS,
      bottomTab: 'stats',
      sessions: [],
      bottomTabs: [
        { key: 'stats', label: '统计', icon: 'grid-fill' },
        { key: 'trends', label: '趋势', icon: 'order' },
        { key: 'settings', label: '设置', icon: 'setting' }
      ]
    }
  },
  computed: {
    statPeriodLabel() {
      return getStatPeriodLabel(this.statPeriod, this.selectedYear)
    },
    availableYears() {
      return getAvailableYears(this.sessions)
    },
    filteredSessions() {
      return filterSessionsByPeriod(this.sessions, this.statPeriod, {
        year: this.selectedYear
      })
    },
    stats() {
      return computeSessionStats(this.filteredSessions)
    },
    recentList() {
      return this.sessions.slice(0, 50)
    },
    totalProfitClass() {
      return this.profitClass(this.stats.totalProfit)
    },
    monthlyTrends() {
      return getMonthlyTrends(this.sessions).map((row) => ({
        ...row,
        profitClassName: this.profitClass(row.profit)
      }))
    }
  },
  onShow() {
    this.loadSessions()
  },
  methods: {
    formatProfit,
    formatWinRate,
    loadSessions() {
      this.sessions = getEnrichedSessionList()
    },
    switchPeriod(key) {
      if (this.statPeriod === key) return
      this.statPeriod = key
      if (key === STAT_PERIOD.year) {
        const years = getAvailableYears(this.sessions)
        if (!years.includes(this.selectedYear)) {
          this.selectedYear = years[0] || day().year()
        }
      }
    },
    selectYear(year) {
      if (this.selectedYear === year) return
      this.selectedYear = year
    },
    profitClass(value) {
      const n = Number(value) || 0
      if (n > 0) return 'profit--win'
      if (n < 0) return 'profit--loss'
      return 'profit--neutral'
    },
    openCreate() {
      uni.navigateTo({ url: EDIT_PAGE })
    },
    openEdit(item) {
      uni.navigateTo({
        url: `${EDIT_PAGE}?id=${encodeURIComponent(item.id)}`
      })
    },
    confirmClearAll() {
      if (!this.sessions.length) {
        uni.showToast({ title: '暂无数据', icon: 'none' })
        return
      }
      uni.showModal({
        title: '清空记录',
        content: '确定删除全部跑胡子账本记录？此操作不可恢复。',
        confirmColor: '#EF4444',
        success: (res) => {
          if (!res.confirm) return
          clearAllSessions()
          this.loadSessions()
          uni.showToast({ title: '已清空', icon: 'success' })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  position: relative;
  background: #f7f8fc;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.page-bg {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 420rpx;
  background: linear-gradient(180deg, #f0f6ff 0%, #e3eeff 42%, #f7f8fc 100%);
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 24rpx 28rpx 32rpx;
}

.page-content--tab {
  padding-top: 32rpx;
}

.stats-card {
  padding: 32rpx 28rpx 36rpx;
  border-radius: 24rpx;
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.stats-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
  gap: 16rpx;
}

.stats-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
}

.period-tabs {
  display: flex;
  gap: 4rpx;
  padding: 4rpx;
  border-radius: 999rpx;
  background: var(--bg-hover);
  flex-shrink: 0;
}

.period-tab {
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  transition: all 0.3s ease;
}

.period-tab--active {
  background: var(--bg-card);
  box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.12);
}

.period-tab--press {
  opacity: 0.88;
}

.period-tab-text {
  font-size: 22rpx;
  color: var(--text-secondary);
}

.period-tab--active .period-tab-text {
  color: var(--color-primary);
  font-weight: 600;
}

.year-scroll {
  width: 100%;
  margin-bottom: 24rpx;
  white-space: nowrap;
}

.year-chips {
  display: inline-flex;
  gap: 12rpx;
  padding: 4rpx 0;
}

.year-chip {
  display: inline-flex;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: var(--bg-hover);
  transition: all 0.3s ease;
}

.year-chip--active {
  background: var(--color-primary-light);
}

.year-chip--press {
  opacity: 0.88;
}

.year-chip-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.year-chip--active .year-chip-text {
  color: var(--color-primary);
  font-weight: 600;
}

.stats-grid {
  display: flex;
  align-items: stretch;
}

.stat-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;
}

.stat-divider {
  width: 1rpx;
  margin: 8rpx 0;
  background: var(--border-color);
  flex-shrink: 0;
}

.stat-label {
  font-size: 22rpx;
  color: var(--text-secondary);
  line-height: 1.4;
}

.stat-value {
  margin-top: 14rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.15;
}

.stat-profit-wrap {
  margin-top: 12rpx;
  padding: 8rpx 20rpx;
  border-radius: 12rpx;
  background: var(--neutral-light, #f2f4f7);
}

.stat-profit-wrap.profit--win {
  background: var(--success-light);
}

.stat-profit-wrap.profit--loss {
  background: var(--error-light);
}

.stat-value--profit {
  font-size: 34rpx;
}

.stat-profit-wrap.profit--win .stat-value--profit {
  color: var(--success);
}

.stat-profit-wrap.profit--loss .stat-value--profit {
  color: var(--error);
}

.section-head {
  margin-top: 36rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.section-count {
  font-size: 24rpx;
  color: var(--text-placeholder);
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-card {
  padding: 28rpx;
  border-radius: 24rpx;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  border: 1rpx solid var(--border-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.record-card--press {
  transform: scale(0.99);
  box-shadow: var(--shadow-md);
}

.record-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.record-head-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12rpx;
}

.type-badge {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  background: var(--color-primary-light);
}

.type-badge-text {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--color-primary);
}

.record-date {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.record-profit {
  flex-shrink: 0;
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.record-profit--win {
  color: var(--success);
}

.record-profit--loss {
  color: var(--error);
}

.record-players {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 20rpx;
}

.player-chip {
  max-width: 100%;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: var(--bg-hover);
}

.player-chip-text {
  font-size: 24rpx;
  color: var(--text-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid var(--border-color);
}

.record-meta-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.record-meta-text--muted {
  color: var(--text-placeholder);
}

.empty-card {
  padding: 72rpx 40rpx;
  border-radius: 24rpx;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-card--compact {
  padding: 48rpx 32rpx;
  box-shadow: none;
  border-radius: 0;
}

.empty-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-desc {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--text-secondary);
  line-height: 1.5;
}

.empty-btn {
  margin-top: 32rpx;
  padding: 0 48rpx;
  height: 80rpx;
  border-radius: 999rpx;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(99, 102, 241, 0.28);
}

.empty-btn--press {
  opacity: 0.92;
  transform: scale(0.98);
}

.empty-btn-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #fff;
}

.panel-card {
  border-radius: 24rpx;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.panel-title {
  display: block;
  padding: 28rpx 28rpx 12rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.trend-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
}

.trend-left {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.trend-month {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-primary);
}

.trend-count {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.trend-profit {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.trend-profit.profit--win {
  color: var(--success);
}

.trend-profit.profit--loss {
  color: var(--error);
}

.trend-line {
  position: absolute;
  left: 28rpx;
  right: 28rpx;
  bottom: 0;
  height: 1rpx;
  background: var(--border-color);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx;
}

.settings-row--press {
  background: var(--bg-hover);
}

.settings-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.settings-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: var(--error-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-label {
  font-size: 28rpx;
  color: var(--text-primary);
}

.settings-hint {
  display: block;
  margin-top: 20rpx;
  padding: 0 8rpx;
  font-size: 24rpx;
  color: var(--text-placeholder);
  line-height: 1.5;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(128rpx + env(safe-area-inset-bottom));
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: var(--gradient-primary);
  box-shadow: 0 12rpx 32rpx rgba(99, 102, 241, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

.fab--press {
  transform: scale(0.94);
  opacity: 0.95;
}

.fab-plus {
  font-size: 56rpx;
  font-weight: 300;
  color: #fff;
  line-height: 1;
  margin-top: -4rpx;
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  padding: 8rpx 0 calc(8rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  border-top: 1rpx solid var(--border-color);
  backdrop-filter: blur(12px);
  z-index: 20;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 0;
}

.nav-icon-wrap {
  width: 56rpx;
  height: 44rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon-wrap--active {
  background: var(--color-primary-light);
}

.nav-label {
  font-size: 22rpx;
  color: var(--text-secondary);
}

.nav-label--active {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
