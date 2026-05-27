<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />

    <view class="page-content">
      <!-- 每手买入设置 -->
      <view class="section-card">
        <view class="top-row">
          <view class="buy-in-block" @click="showBuyInEdit = true">
            <text class="buy-in-label">每手码量<text class="buy-in-edit-hint">（点击编辑）</text></text>
            <text class="buy-in-value">{{ buyIn }}</text>
          </view>
          <view class="btn-primary" @click="openAddPlayer">
            <text class="btn-primary-text">新人上桌</text>
          </view>
        </view>
        <text class="hint-text">点击昵称和码量可以进行修改，牌局结束后输入每人剩余码量将自动计算盈亏。</text>
      </view>

      <!-- 玩家列表 -->
      <view v-if="players.length" class="section-card player-table-card">
        <view class="table-header">
          <text class="th th-name">昵称</text>
          <text class="th th-hands">手数</text>
          <text class="th th-chips">码量</text>
          <text class="th th-profit">盈亏</text>
        </view>
        <view
          v-for="(player, idx) in players"
          :key="player.id"
          class="table-row"
        >
          <view class="td td-name" @click="openEditNickname(idx)">
            <text class="player-name">{{ player.nickname }}</text>
          </view>
          <view class="td td-hands">
            <view class="hands-ctrl">
              <view class="ctrl-btn ctrl-btn--minus" @click="decreaseHands(idx)">
                <u-icon name="minus" size="16" color="#4B5563" />
              </view>
              <text class="hands-num">{{ player.hands }}</text>
              <view class="ctrl-btn ctrl-btn--plus" @click="increaseHands(idx)">
                <u-icon name="plus" size="16" color="#ffffff" />
              </view>
            </view>
          </view>
          <view class="td td-chips" @click="openEditChips(idx)">
            <text class="chips-value">{{ player.chips }}</text>
          </view>
          <view class="td td-profit">
            <text
              class="profit-value"
              :class="{
                'profit-pos': calcProfit(player) > 0,
                'profit-neg': calcProfit(player) < 0,
                'profit-zero': calcProfit(player) === 0
              }"
            >{{ formatProfit(calcProfit(player)) }}</text>
          </view>
        </view>
      </view>

      <!-- 底部汇总 -->
      <view v-if="players.length" class="summary-card">
        <view class="summary-row">
          <text class="summary-item">总水上 <text class="summary-val summary-val--up">{{ totalUp }}</text></text>
          <text class="summary-item">总水下 <text class="summary-val summary-val--down">{{ totalDown }}</text></text>
          <text class="summary-item">水上-水下 <text class="summary-val" :class="balanceDiff === 0 ? 'summary-val--zero' : 'summary-val--diff'">{{ balanceDiff }}</text></text>
        </view>
        <view class="balance-status" :class="balanceDiff === 0 ? 'balance-ok' : 'balance-warn'">
          <text class="balance-status-text">{{ balanceLabel }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view v-if="players.length" class="action-row">
        <view class="btn-danger" @click="confirmClear">
          <text class="btn-danger-text">清除数据</text>
        </view>
      </view>

      <view v-if="!players.length" class="empty-wrap">
        <text class="empty-icon">♠</text>
        <text class="empty-text">还没有玩家，点击「新人上桌」开始记分</text>
      </view>
    </view>

    <!-- 弹窗：编辑每手买入 -->
    <view v-if="showBuyInEdit" class="modal-mask" @click.self="showBuyInEdit = false">
      <view class="modal-box">
        <text class="modal-title">设置每手码量</text>
        <input
          class="modal-input"
          type="number"
          v-model="buyInDraft"
          placeholder="请输入码量"
          focus
        />
        <view class="modal-actions">
          <view class="modal-btn modal-btn--cancel" @click="showBuyInEdit = false">
            <text>取消</text>
          </view>
          <view class="modal-btn modal-btn--confirm" @click="confirmBuyIn">
            <text>确定</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 弹窗：新增玩家 -->
    <view v-if="showAddPlayer" class="modal-mask" @click.self="showAddPlayer = false">
      <view class="modal-box">
        <text class="modal-title">新人上桌</text>
        <view class="modal-field">
          <text class="modal-label">昵称</text>
          <input
            class="modal-input"
            type="text"
            v-model="newPlayerNickname"
            placeholder="请输入昵称"
            focus
          />
        </view>
        <view class="modal-field">
          <text class="modal-label">手数</text>
          <input
            class="modal-input"
            type="number"
            v-model="newPlayerHands"
            placeholder="默认 1"
          />
        </view>
        <view class="modal-field">
          <text class="modal-label">初始码量</text>
          <input
            class="modal-input"
            type="number"
            v-model="newPlayerChips"
            :placeholder="`默认 ${buyIn}`"
          />
        </view>
        <view class="modal-actions">
          <view class="modal-btn modal-btn--cancel" @click="showAddPlayer = false">
            <text>取消</text>
          </view>
          <view class="modal-btn modal-btn--confirm" @click="confirmAddPlayer">
            <text>确定</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 弹窗：编辑昵称 -->
    <view v-if="showEditNickname" class="modal-mask" @click.self="showEditNickname = false">
      <view class="modal-box">
        <text class="modal-title">修改昵称</text>
        <input
          class="modal-input"
          type="text"
          v-model="editNicknameDraft"
          placeholder="请输入昵称"
          focus
        />
        <view class="modal-actions">
          <view class="modal-btn modal-btn--cancel" @click="showEditNickname = false">
            <text>取消</text>
          </view>
          <view class="modal-btn modal-btn--confirm" @click="confirmEditNickname">
            <text>确定</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 弹窗：编辑码量 -->
    <view v-if="showEditChips" class="modal-mask" @click.self="showEditChips = false">
      <view class="modal-box">
        <text class="modal-title">修改码量</text>
        <text class="modal-sub">{{ editChipsPlayer ? editChipsPlayer.nickname : '' }}</text>
        <input
          class="modal-input"
          type="number"
          v-model="editChipsDraft"
          placeholder="请输入剩余码量"
          focus
        />
        <view class="modal-actions">
          <view class="modal-btn modal-btn--cancel" @click="showEditChips = false">
            <text>取消</text>
          </view>
          <view class="modal-btn modal-btn--confirm" @click="confirmEditChips">
            <text>确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
const STORAGE_KEY = 'poker_score_data'

export default {
  data() {
    return {
      buyIn: 2000,
      players: [],

      showBuyInEdit: false,
      buyInDraft: '',

      showAddPlayer: false,
      newPlayerNickname: '',
      newPlayerHands: '1',
      newPlayerChips: '',

      showEditNickname: false,
      editNicknameIdx: -1,
      editNicknameDraft: '',

      showEditChips: false,
      editChipsIdx: -1,
      editChipsDraft: ''
    }
  },

  computed: {
    editChipsPlayer() {
      if (this.editChipsIdx < 0) return null
      return this.players[this.editChipsIdx] || null
    },
    totalUp() {
      return this.players.reduce((sum, p) => {
        const profit = this.calcProfit(p)
        return profit > 0 ? sum + profit : sum
      }, 0)
    },
    totalDown() {
      return this.players.reduce((sum, p) => {
        const profit = this.calcProfit(p)
        return profit < 0 ? sum + Math.abs(profit) : sum
      }, 0)
    },
    balanceDiff() {
      return this.totalUp - this.totalDown
    },
    balanceLabel() {
      if (this.balanceDiff === 0) return '账平'
      if (this.balanceDiff > 0) {
        return `水上多了 ${this.balanceDiff}，还差 ${this.balanceDiff} 账平`
      }
      return `水下多了 ${Math.abs(this.balanceDiff)}，还差 ${Math.abs(this.balanceDiff)} 账平`
    }
  },

  onLoad() {
    this.loadData()
  },

  methods: {
    loadData() {
      try {
        const raw = uni.getStorageSync(STORAGE_KEY)
        if (raw) {
          const saved = JSON.parse(raw)
          this.buyIn = saved.buyIn || 2000
          this.players = saved.players || []
        }
      } catch (e) {}
    },

    saveData() {
      try {
        uni.setStorageSync(STORAGE_KEY, JSON.stringify({
          buyIn: this.buyIn,
          players: this.players
        }))
      } catch (e) {}
    },

    calcProfit(player) {
      return player.chips - player.hands * this.buyIn
    },

    formatProfit(val) {
      if (val > 0) return `+${val}`
      return String(val)
    },

    // 每手买入
    confirmBuyIn() {
      const val = parseInt(this.buyInDraft)
      if (!isNaN(val) && val > 0) {
        this.buyIn = val
        this.saveData()
      }
      this.showBuyInEdit = false
    },

    // 新增玩家
    openAddPlayer() {
      this.newPlayerNickname = ''
      this.newPlayerHands = '1'
      this.newPlayerChips = ''
      this.showAddPlayer = true
    },

    confirmAddPlayer() {
      const nickname = this.newPlayerNickname.trim()
      if (!nickname) {
        uni.showToast({ title: '请输入昵称', icon: 'none' })
        return
      }
      const hands = parseInt(this.newPlayerHands) || 1
      const chips = parseInt(this.newPlayerChips) || hands * this.buyIn
      this.players.push({
        id: Date.now(),
        nickname,
        hands,
        chips
      })
      this.saveData()
      this.showAddPlayer = false
    },

    // 手数增减
    increaseHands(idx) {
      const p = this.players[idx]
      p.hands += 1
      p.chips += this.buyIn
      this.saveData()
    },

    decreaseHands(idx) {
      const p = this.players[idx]
      if (p.hands <= 1) return
      p.hands -= 1
      p.chips -= this.buyIn
      this.saveData()
    },

    // 编辑昵称
    openEditNickname(idx) {
      this.editNicknameIdx = idx
      this.editNicknameDraft = this.players[idx].nickname
      this.showEditNickname = true
    },

    confirmEditNickname() {
      const val = this.editNicknameDraft.trim()
      if (!val) {
        uni.showToast({ title: '昵称不能为空', icon: 'none' })
        return
      }
      this.players[this.editNicknameIdx].nickname = val
      this.saveData()
      this.showEditNickname = false
    },

    // 编辑码量
    openEditChips(idx) {
      this.editChipsIdx = idx
      this.editChipsDraft = String(this.players[idx].chips)
      this.showEditChips = true
    },

    confirmEditChips() {
      const val = parseInt(this.editChipsDraft)
      if (isNaN(val) || val < 0) {
        uni.showToast({ title: '请输入有效码量', icon: 'none' })
        return
      }
      this.players[this.editChipsIdx].chips = val
      this.saveData()
      this.showEditChips = false
    },

    // 清除数据
    confirmClear() {
      uni.showModal({
        title: '确认清除',
        content: '将清除所有玩家数据，不可恢复',
        success: (res) => {
          if (res.confirm) {
            this.players = []
            this.saveData()
          }
        }
      })
    },

  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  position: relative;
  background: #F6F7FB;
}

.page-bg {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 360rpx;
  background: linear-gradient(180deg, #DCE8FF 0%, #F6F7FB 100%);
  pointer-events: none;
  z-index: 0;
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 24rpx 28rpx 80rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.section-card,
.player-table-card,
.summary-card {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
  padding: 32rpx 28rpx;
}

/* 买入区 */
.top-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.buy-in-block {
  flex: 1;
  background: #EEF0FF;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.buy-in-label {
  font-size: 24rpx;
  color: #8692A6;
  font-weight: 400;
}

.buy-in-edit-hint {
  font-size: 22rpx;
  color: #6366F1;
}

.buy-in-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #6366F1;
  line-height: 1.2;
}

.btn-primary {
  background: linear-gradient(135deg, #6366F1 0%, #A78BFA 100%);
  border-radius: 16rpx;
  width: 180rpx;
  height: 100%;
  min-height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
}

.btn-primary-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
}

.hint-text {
  font-size: 22rpx;
  color: #A1A8B8;
  line-height: 1.6;
}

/* 表格 */
.table-header {
  display: flex;
  align-items: center;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #E9ECF3;
  margin-bottom: 4rpx;
}

.th {
  font-size: 24rpx;
  color: #8692A6;
  font-weight: 500;
}

.table-row {
  display: flex;
  align-items: center;
  min-height: 88rpx;
  border-bottom: 1rpx solid #F3F4F8;

  &:last-child {
    border-bottom: none;
  }
}

/* 列宽：昵称 flex:2 | 手数 flex:3 | 码量 flex:2 | 盈亏 flex:2 */
.th-name, .td-name {
  flex: 2;
  display: flex;
  align-items: center;
}
.th-hands, .td-hands {
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}
.th-hands {
  text-align: center;
}
.th-chips, .td-chips {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.th-chips {
  text-align: center;
}
.th-profit, .td-profit {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.th-profit {
  text-align: right;
}

.player-name {
  font-size: 28rpx;
  color: #6366F1;
  font-weight: 500;
  text-decoration: underline;
  text-decoration-color: rgba(99, 102, 241, 0.3);
}

.hands-ctrl {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.ctrl-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ctrl-btn--minus {
  background: #F3F4F8;
}

.ctrl-btn--plus {
  background: #6366F1;
}

.hands-num {
  font-size: 28rpx;
  font-weight: 600;
  color: #1D2129;
  min-width: 36rpx;
  text-align: center;
}

.chips-value {
  font-size: 28rpx;
  color: #6366F1;
  font-weight: 500;
  text-decoration: underline;
  text-decoration-color: rgba(99, 102, 241, 0.3);
}

.profit-value {
  font-size: 28rpx;
  font-weight: 600;
}

.profit-pos { color: #22C55E; }
.profit-neg { color: #EF4444; }
.profit-zero { color: #8692A6; }

/* 汇总 */
.summary-card {
  padding: 24rpx 28rpx;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.summary-item {
  font-size: 24rpx;
  color: #8692A6;
}

.summary-val {
  font-size: 26rpx;
  font-weight: 600;
}

.summary-val--up { color: #22C55E; }
.summary-val--down { color: #EF4444; }
.summary-val--zero { color: #22C55E; }
.summary-val--diff { color: #F59E0B; }

.balance-status {
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  text-align: center;
}

.balance-ok {
  background: #E8FBEF;
}

.balance-warn {
  background: #FFF6E5;
}

.balance-status-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #22C55E;

  .balance-warn & {
    color: #F59E0B;
  }
}

/* 操作按钮行 */
.action-row {
  display: flex;
  gap: 20rpx;
}

.btn-danger {
  flex: 1;
  height: 80rpx;
  border-radius: 999rpx;
  border: 2rpx solid #EF4444;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-danger-text {
  font-size: 28rpx;
  color: #EF4444;
  font-weight: 500;
}


/* 空状态 */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  gap: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  color: #C7CCD6;
}

.empty-text {
  font-size: 26rpx;
  color: #A1A8B8;
  text-align: center;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 36rpx 32rpx;
  width: 620rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
}

.modal-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1D2129;
  text-align: center;
  margin-bottom: 8rpx;
}

.modal-sub {
  display: block;
  font-size: 24rpx;
  color: #8692A6;
  text-align: center;
  margin-bottom: 24rpx;
}

.modal-field {
  margin-bottom: 20rpx;
}

.modal-label {
  display: block;
  font-size: 24rpx;
  color: #8692A6;
  margin-bottom: 8rpx;
}

.modal-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #E9ECF3;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #1D2129;
  background: #F6F7FB;
  box-sizing: border-box;
  margin-top: 8rpx;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 500;
}

.modal-btn--cancel {
  background: #F3F4F8;
  color: #4B5563;
}

.modal-btn--confirm {
  background: linear-gradient(135deg, #6366F1 0%, #A78BFA 100%);
  color: #fff;
}
</style>
