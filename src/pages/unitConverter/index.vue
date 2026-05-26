<template>
  <view class="life-tool-page">
    <view class="life-tool-page__bg" aria-hidden="true" />
    <view class="life-tool-page__content">
      <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
        <view class="category-list">
          <view
            v-for="cat in categories"
            :key="cat.id"
            :class="['category-chip', activeCategoryId === cat.id ? 'category-chip--active' : '']"
            @click="selectCategory(cat.id)"
          >
            <text class="category-chip__text">{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>

      <view class="life-tool-card convert-card">
        <view class="convert-block">
          <text class="convert-block__label">从</text>
          <view class="convert-block__row">
            <input
              v-model="fromValue"
              class="convert-input"
              type="digit"
              placeholder="0"
              placeholder-class="convert-ph"
              @input="onFromInput"
            />
            <picker
              mode="selector"
              :range="unitNames"
              :value="fromUnitIndex"
              @change="onFromUnitChange"
            >
              <view class="unit-picker">
                <text class="unit-picker__text">{{ fromUnit.name }}</text>
                <u-icon name="arrow-down" size="14" color="#8692A6" />
              </view>
            </picker>
          </view>
        </view>

        <view class="swap-row" @click="swapUnits">
          <view class="swap-btn">
            <u-icon name="reload" size="20" color="#6366F1" />
          </view>
        </view>

        <view class="convert-block">
          <text class="convert-block__label">到</text>
          <view class="convert-block__row">
            <text class="convert-output">{{ toDisplay }}</text>
            <picker
              mode="selector"
              :range="unitNames"
              :value="toUnitIndex"
              @change="onToUnitChange"
            >
              <view class="unit-picker">
                <text class="unit-picker__text">{{ toUnit.name }}</text>
                <u-icon name="arrow-down" size="14" color="#8692A6" />
              </view>
            </picker>
          </view>
        </view>
      </view>

      <view class="life-tool-card quick-card">
        <text class="quick-card__title">常用换算</text>
        <view class="quick-list">
          <view
            v-for="item in quickPresets"
            :key="item.label"
            class="quick-item"
            @click="applyQuick(item)"
          >
            <text class="quick-item__label">{{ item.label }}</text>
            <text class="quick-item__value">{{ item.hint }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="life-tool-footer">
      <view
        class="life-tool-footer__btn"
        hover-class="life-tool-footer__btn--press"
        :hover-stay-time="100"
        @click="onReset"
      >
        <text class="life-tool-footer__btn-text">清空</text>
      </view>
    </view>
  </view>
</template>

<script>
import {
  getAllUnitCategories,
  convertUnit,
  convertTemperature
} from '@/utils/unitConverter.js'

export default {
  data() {
    const categories = getAllUnitCategories()
    return {
      categories,
      activeCategoryId: categories[0].id,
      fromValue: '1',
      fromUnitIndex: 0,
      toUnitIndex: 1,
      toDisplay: ''
    }
  },
  computed: {
    activeCategory() {
      return this.categories.find((c) => c.id === this.activeCategoryId) || this.categories[0]
    },
    units() {
      return this.activeCategory.units || []
    },
    unitNames() {
      return this.units.map((u) => u.name)
    },
    fromUnit() {
      return this.units[this.fromUnitIndex] || this.units[0] || { name: '', factor: 1, id: '' }
    },
    toUnit() {
      return this.units[this.toUnitIndex] || this.units[1] || this.units[0] || { name: '', factor: 1, id: '' }
    },
    quickPresets() {
      const id = this.activeCategoryId
      if (id === 'length') {
        return [
          { label: '1 千米', value: '1', from: 1, to: 0, hint: '→ 米' },
          { label: '1 英里', value: '1', from: 4, to: 0, hint: '→ 米' }
        ]
      }
      if (id === 'weight') {
        return [
          { label: '1 千克', value: '1', from: 0, to: 1, hint: '→ 克' },
          { label: '1 磅', value: '1', from: 3, to: 0, hint: '→ 千克' }
        ]
      }
      if (id === 'temperature') {
        return [
          { label: '0 ℃', value: '0', from: 0, to: 1, hint: '→ ℉' },
          { label: '100 ℃', value: '100', from: 0, to: 1, hint: '→ ℉' }
        ]
      }
      return [
        { label: '1', value: '1', from: 0, to: 1, hint: '快速试算' }
      ]
    }
  },
  watch: {
    activeCategoryId() {
      this.fromUnitIndex = 0
      this.toUnitIndex = Math.min(1, this.units.length - 1)
      this.recalc()
    },
    fromUnitIndex() {
      this.recalc()
    },
    toUnitIndex() {
      this.recalc()
    }
  },
  mounted() {
    this.recalc()
  },
  methods: {
    selectCategory(id) {
      this.activeCategoryId = id
    },
    onFromInput() {
      this.recalc()
    },
    onFromUnitChange(e) {
      this.fromUnitIndex = Number(e.detail.value)
    },
    onToUnitChange(e) {
      this.toUnitIndex = Number(e.detail.value)
    },
    swapUnits() {
      const fi = this.fromUnitIndex
      this.fromUnitIndex = this.toUnitIndex
      this.toUnitIndex = fi
      this.recalc()
    },
    recalc() {
      const val = this.fromValue
      if (val === '' || val === '-') {
        this.toDisplay = ''
        return
      }
      if (this.activeCategoryId === 'temperature') {
        this.toDisplay = convertTemperature(val, this.fromUnit.id, this.toUnit.id)
        return
      }
      this.toDisplay = convertUnit(val, this.fromUnit.factor, this.toUnit.factor)
    },
    applyQuick(item) {
      this.fromValue = item.value
      this.fromUnitIndex = item.from
      this.toUnitIndex = item.to
      this.recalc()
    },
    onReset() {
      this.fromValue = ''
      this.toDisplay = ''
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/style/life-tool-page.scss';

.category-scroll {
  width: 100%;
  margin-bottom: 24rpx;
  white-space: nowrap;
}

.category-list {
  display: inline-flex;
  gap: 16rpx;
  padding: 4rpx 0;
}

.category-chip {
  display: inline-flex;
  padding: 16rpx 32rpx;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1rpx solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.category-chip--active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.category-chip__text {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.category-chip--active .category-chip__text {
  color: var(--color-primary);
  font-weight: 600;
}

.convert-card {
  padding: 32rpx;
}

.convert-block__label {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 16rpx;
}

.convert-block__row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.convert-input {
  flex: 1;
  min-width: 0;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--text-primary);
  height: 80rpx;
}

.convert-output {
  flex: 1;
  min-width: 0;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 80rpx;
  word-break: break-all;
}

.convert-ph {
  color: var(--text-placeholder);
  font-weight: 400;
}

.unit-picker {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: var(--bg-hover);
  border-radius: 16rpx;
  border: 1rpx solid var(--border-color);
  flex-shrink: 0;
}

.unit-picker__text {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: 500;
}

.swap-row {
  display: flex;
  justify-content: center;
  padding: 24rpx 0;
}

.swap-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(99, 102, 241, 0.2);
}

.quick-card {
  padding: 28rpx 32rpx 32rpx;
}

.quick-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20rpx;
}

.quick-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.quick-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  background: var(--bg-hover);
  border-radius: 16rpx;
  border: 1rpx solid var(--border-color);
}

.quick-item__label {
  font-size: 28rpx;
  color: var(--text-primary);
}

.quick-item__value {
  font-size: 24rpx;
  color: var(--text-secondary);
}
</style>
