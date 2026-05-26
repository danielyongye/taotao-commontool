<template>
  <view class="page">
    <view class="page-bg" aria-hidden="true" />
    <view class="page-content">
    <view class="card-wrap">
      <view class="tab-bar">
        <view
          :class="['tab-item', activeTab === 0 ? 'active' : '']"
          @click="activeTab = 0"
        >
          <text class="tab-text">按人数分摊</text>
        </view>
        <view
          :class="['tab-item', activeTab === 1 ? 'active' : '']"
          @click="activeTab = 1"
        >
          <text class="tab-text">按比例分摊</text>
        </view>
        <view
          :class="['tab-item', activeTab === 2 ? 'active' : '']"
          @click="activeTab = 2"
        >
          <text class="tab-text">按面积分摊</text>
        </view>
      </view>

      <view class="card-body">
        <!-- 按人数分摊 -->
        <template v-if="activeTab === 0">
          <view class="field">
            <text class="field-label">总金额（元）</text>
            <input
              v-model="totalAmount"
              class="field-input line-input"
              type="digit"
              placeholder="请输入金额"
              placeholder-class="ph"
            />
          </view>
          <view class="field">
            <text class="field-label">备注（可选）</text>
            <input
              v-model="remark"
              class="field-input box-input"
              placeholder="如：房租，水电费等"
              placeholder-class="ph"
            />
          </view>
          <view class="field row-between">
            <text class="field-label inline">参与人数</text>
            <view class="stepper">
              <view class="stepper-btn" @click="changeCount(-1)">
                <text class="stepper-symbol">−</text>
              </view>
              <text class="stepper-value">{{ participantCount }}</text>
              <view class="stepper-btn" @click="changeCount(1)">
                <text class="stepper-symbol">+</text>
              </view>
            </view>
          </view>
          <view class="result-row">
            <text class="result-label">人均金额</text>
            <text class="result-value">¥ {{ perPersonDisplay }}</text>
          </view>
        </template>

        <!-- 按比例分摊 -->
        <template v-else-if="activeTab === 1">
          <view class="field">
            <text class="field-label">总金额（元）</text>
            <input
              v-model="totalAmount"
              class="field-input line-input"
              type="digit"
              placeholder="请输入金额"
              placeholder-class="ph"
            />
          </view>
          <view class="field">
            <text class="field-label">备注（可选）</text>
            <input
              v-model="remark"
              class="field-input box-input"
              placeholder="如：房租，水电费等"
              placeholder-class="ph"
            />
          </view>
          <view
            v-for="(p, idx) in proportionList"
            :key="p.id"
            class="field row-between ratio-row"
          >
            <text class="field-label inline">参与人{{ idx + 1 }} 比例</text>
            <input
              v-model="p.ratio"
              class="ratio-input"
              type="digit"
              placeholder="1"
              placeholder-class="ph"
            />
          </view>
          <view class="ratio-actions">
            <text
              v-if="proportionList.length > 2"
              class="ratio-link"
              @click="removeProportionParticipant"
            >减少一人</text>
            <text class="ratio-link" @click="addProportionParticipant">增加一人</text>
          </view>
          <view
            v-for="(item, idx) in proportionResult"
            :key="idx"
            class="result-row sub"
          >
            <text class="result-label">参与人{{ idx + 1 }}</text>
            <text class="result-value sm">¥ {{ item }}</text>
          </view>
          <view v-if="!proportionResult.length" class="result-row">
            <text class="result-label">分摊结果</text>
            <text class="result-value muted">点击计算</text>
          </view>
        </template>

        <!-- 按面积分摊 -->
        <template v-else>
          <view class="area-form-item area-form-row">
            <text class="area-input-label">总价</text>
            <u--input
              v-model="totalPrice"
              placeholder="总价"
              type="number"
              class="area-input-main"
            />
          </view>
          <view class="area-form-item area-form-row">
            <text class="area-input-label">总面积</text>
            <u--input
              v-model="totalArea"
              placeholder="总面积"
              type="number"
              class="area-input-main"
            />
          </view>
          <view class="area-form-item area-form-row">
            <text class="area-input-label">公摊面积</text>
            <u--input
              v-model="sharedArea"
              placeholder="公摊面积"
              type="number"
              class="area-input-main"
            />
          </view>
          <view
            v-for="(room, idx) in rooms"
            :key="room.id"
            class="area-form-item area-form-row"
          >
            <text class="area-input-label">房间{{ idx + 1 }}</text>
            <u--input
              v-model="room.area"
              :placeholder="`房间${idx + 1}面积`"
              type="number"
              class="area-input-main"
            />
            <u-button
              v-if="rooms.length > 1"
              text="删除"
              type="error"
              size="mini"
              custom-style="margin-left:16rpx;width:80rpx;height:56rpx;font-size:28rpx;line-height:56rpx;padding:0 8rpx;box-sizing:border-box;"
              @click="removeRoom(idx)"
            />
          </view>
          <view class="area-add-room">
            <u-button
              text="添加房间"
              type="primary"
              size="mini"
              custom-style="width:140rpx;padding:0 16rpx;font-size:28rpx;height:56rpx;line-height:56rpx;margin:0 auto;"
              @click="addRoom"
            />
          </view>
          <view
            v-for="(r, idx) in areaResult"
            :key="idx"
            class="area-result-card"
          >
            <view class="area-result-title">房间{{ idx + 1 }}</view>
            <view class="area-result-row">
              面积：<text class="area-result-value">{{ r.area }}㎡</text>
            </view>
            <view class="area-result-row">
              计费面积：<text class="area-result-value">{{ r.chargeArea }}㎡</text>
            </view>
            <view class="area-result-row">
              房租：<text class="area-result-value">{{ r.rent }}元</text>
            </view>
          </view>
        </template>
      </view>
    </view>

    <view class="calc-btn" hover-class="calc-btn-hover" @click="calc">
      <text class="calc-btn-text">计算</text>
    </view>
    </view>
  </view>
</template>

<script>
function createProportionItem() {
  return { id: Date.now() + Math.random(), ratio: '' }
}

function createRoomItem() {
  return { id: Date.now() + Math.random(), area: '' }
}

export default {
  data() {
    return {
      activeTab: 0,
      totalAmount: '',
      remark: '',
      participantCount: 2,
      perPersonAmount: '0.00',
      proportionList: [
        createProportionItem(),
        createProportionItem()
      ],
      proportionResult: [],
      totalPrice: '',
      totalArea: '',
      sharedArea: '',
      rooms: [createRoomItem(), createRoomItem()],
      areaResult: []
    }
  },
  computed: {
    perPersonDisplay() {
      return this.perPersonAmount
    }
  },
  onShow() {
    uni.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#F3F0FF'
    })
  },
  methods: {
    changeCount(delta) {
      const next = this.participantCount + delta
      if (next < 1) return
      if (next > 99) return
      this.participantCount = next
    },
    addProportionParticipant() {
      if (this.proportionList.length >= 20) return
      this.proportionList.push(createProportionItem())
    },
    removeProportionParticipant() {
      if (this.proportionList.length <= 2) return
      this.proportionList.pop()
      this.proportionResult = []
    },
    calcByPeople() {
      const total = Number(this.totalAmount)
      const count = this.participantCount
      if (!total || total <= 0) {
        uni.showToast({ title: '请输入有效金额', icon: 'none' })
        return
      }
      if (!count || count < 1) {
        uni.showToast({ title: '参与人数至少为 1', icon: 'none' })
        return
      }
      this.perPersonAmount = (total / count).toFixed(2)
    },
    calcByProportion() {
      const total = Number(this.totalAmount)
      if (!total || total <= 0) {
        uni.showToast({ title: '请输入有效金额', icon: 'none' })
        return
      }
      const ratios = this.proportionList.map((p) => {
        const n = Number(p.ratio)
        return Number.isFinite(n) && n > 0 ? n : 0
      })
      const sum = ratios.reduce((a, b) => a + b, 0)
      if (!sum) {
        uni.showToast({ title: '请填写有效比例', icon: 'none' })
        return
      }
      this.proportionResult = ratios.map((r) =>
        ((total * r) / sum).toFixed(2)
      )
    },
    addRoom() {
      this.rooms.push(createRoomItem())
    },
    removeRoom(idx) {
      this.rooms.splice(idx, 1)
      this.areaResult = []
    },
    calcByArea() {
      const totalPrice = Number(this.totalPrice)
      const totalArea = Number(this.totalArea)
      const sharedArea = Number(this.sharedArea)
      const roomCount = this.rooms.length
      if (!totalPrice || !totalArea || !roomCount) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      const pricePerSqm = totalPrice / totalArea
      const sharedPerRoom = sharedArea / roomCount
      this.areaResult = this.rooms.map((room) => {
        const area = Number(room.area)
        const chargeArea = area + sharedPerRoom
        const rent = chargeArea * pricePerSqm
        return {
          area: area || 0,
          chargeArea: chargeArea ? chargeArea.toFixed(2) : '0.00',
          rent: rent ? rent.toFixed(2) : '0.00'
        }
      })
    },
    calc() {
      if (this.activeTab === 0) {
        this.calcByPeople()
      } else if (this.activeTab === 1) {
        this.calcByProportion()
      } else {
        this.calcByArea()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background: linear-gradient(
    180deg,
    #f3f0ff 0%,
    #f5f6ff 32%,
    #f8f9fc 58%,
    #ffffff 100%
  );
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 24rpx 32rpx 48rpx;
  box-sizing: border-box;
}

.card-wrap {
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(91, 120, 255, 0.1);
}

.tab-bar {
  display: flex;
  background: #e6e9f5;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28rpx 12rpx 24rpx;
  background: #e6e9f5;
  border-radius: 24rpx 24rpx 0 0;
  transition: background 0.2s;
}

.tab-item.active {
  background: #ffffff;
}

.tab-text {
  font-size: 28rpx;
  color: #8a94a8;
  font-weight: 500;
}

.tab-item.active .tab-text {
  color: #5b78ff;
  font-weight: 600;
}

.card-body {
  background: #ffffff;
  padding: 8rpx 32rpx 32rpx;
}

.field {
  padding: 28rpx 0 8rpx;
}

.field-label {
  display: block;
  font-size: 24rpx;
  color: #9aa3b5;
  margin-bottom: 16rpx;
}

.field-label.inline {
  display: inline;
  margin-bottom: 0;
  font-size: 28rpx;
  color: #333333;
}

.row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0 24rpx;
}

.field-input {
  width: 100%;
  font-size: 32rpx;
  color: #1a1a1a;
}

.line-input {
  height: 72rpx;
  border-bottom: 1rpx solid #e5e8ef;
  padding: 8rpx 0;
  box-sizing: border-box;
}

.box-input {
  height: 80rpx;
  padding: 0 24rpx;
  background: #f7f8fa;
  border: 1rpx solid #ebeef5;
  border-radius: 16rpx;
  box-sizing: border-box;
}

.ph {
  color: #c5cad6;
  font-size: 28rpx;
}

.stepper {
  display: flex;
  align-items: center;
  background: #f0f2f8;
  border-radius: 40rpx;
  padding: 8rpx 12rpx;
  border: 1rpx solid #ebeef5;
}

.stepper-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper-symbol {
  font-size: 36rpx;
  color: #6b7280;
  line-height: 1;
  font-weight: 300;
}

.stepper-value {
  min-width: 48rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  padding: 0 16rpx;
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #eef1f6;
}

.result-row.sub {
  margin-top: 0;
  padding-top: 20rpx;
  border-top: none;
}

.result-label {
  font-size: 28rpx;
  color: #333333;
}

.result-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 0.5rpx;
}

.result-value.sm {
  font-size: 32rpx;
}

.result-value.muted {
  font-size: 28rpx;
  font-weight: 500;
  color: #9aa3b5;
}

.ratio-row {
  padding: 20rpx 0 8rpx;
}

.ratio-input {
  width: 160rpx;
  height: 64rpx;
  text-align: right;
  font-size: 30rpx;
  color: #1a1a1a;
  background: #f0f2f8;
  border-radius: 12rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.ratio-actions {
  display: flex;
  justify-content: flex-end;
  gap: 32rpx;
  padding: 8rpx 0 16rpx;
}

.ratio-link {
  font-size: 26rpx;
  color: #5b78ff;
}

.calc-btn {
  margin-top: 48rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(90deg, #5e72ff 0%, #4b5fff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 28rpx rgba(91, 114, 255, 0.32);
}

.calc-btn-hover {
  opacity: 0.92;
}

.calc-btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 4rpx;
}

.tab-item .tab-text {
  font-size: 26rpx;
}

.area-form-item {
  margin-bottom: 24rpx;
}

.area-form-row {
  display: flex;
  align-items: center;
}

.area-input-label {
  font-size: 28rpx;
  color: #666;
  width: 120rpx;
  text-align: right;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.area-input-main {
  flex: 1;
  min-width: 0;
}

.area-add-room {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.area-result-card {
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 28rpx 32rpx 20rpx;
  margin-bottom: 24rpx;
}

.area-result-title {
  font-weight: bold;
  font-size: 32rpx;
  margin-bottom: 16rpx;
  color: #5b78ff;
}

.area-result-row {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.area-result-value {
  font-weight: bold;
  color: #fa541c;
  margin-left: 8rpx;
}
</style>
