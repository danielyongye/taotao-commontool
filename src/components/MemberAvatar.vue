<template>
  <view
    class="member-avatar"
    :class="[`member-avatar--${size}`, { 'member-avatar--colored': !showImage && bgColor }]"
    :style="rootStyle"
  >
    <image
      v-if="showImage"
      class="member-avatar__img"
      :src="src"
      mode="aspectFill"
      @error="onImageError"
    />
    <view v-else class="member-avatar__placeholder" :style="placeholderInnerStyle">
      <text class="member-avatar__initial" :style="initialStyle">{{ label }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MemberAvatar',
  props: {
    src: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md',
      validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v)
    },
    bgColor: {
      type: String,
      default: ''
    },
    textColor: {
      type: String,
      default: '#FFFFFF'
    },
    label: {
      type: String,
      default: '?'
    }
  },
  data() {
    return {
      imageBroken: false
    }
  },
  computed: {
    showImage() {
      const url = (this.src || '').trim()
      return Boolean(url) && !this.imageBroken
    },
    resolvedBg() {
      return this.bgColor || '#6366F1'
    },
    rootStyle() {
      if (this.showImage) return {}
      return {
        backgroundColor: this.resolvedBg,
        borderColor: this.resolvedBg
      }
    },
    placeholderInnerStyle() {
      if (this.showImage) return {}
      return {
        backgroundColor: this.resolvedBg
      }
    },
    initialStyle() {
      return { color: this.textColor || '#FFFFFF' }
    }
  },
  watch: {
    src() {
      this.imageBroken = false
    },
    bgColor() {
      this.imageBroken = false
    }
  },
  methods: {
    onImageError() {
      this.imageBroken = true
    }
  }
}
</script>

<style lang="scss" scoped>
.member-avatar {
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid var(--border-color);
  box-sizing: border-box;
  box-shadow: var(--shadow-sm);
}

.member-avatar--colored {
  border-color: transparent;
}

.member-avatar--sm {
  width: 72rpx;
  height: 72rpx;
}

.member-avatar--md {
  width: 96rpx;
  height: 96rpx;
}

.member-avatar--lg {
  width: 128rpx;
  height: 128rpx;
}

.member-avatar--xl {
  width: 152rpx;
  height: 152rpx;
}

.member-avatar__img {
  width: 100%;
  height: 100%;
  display: block;
}

.member-avatar__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-avatar__initial {
  font-weight: 600;
  line-height: 1;
}

.member-avatar--sm .member-avatar__initial {
  font-size: 30rpx;
}

.member-avatar--md .member-avatar__initial {
  font-size: 38rpx;
}

.member-avatar--lg .member-avatar__initial {
  font-size: 48rpx;
}

.member-avatar--xl .member-avatar__initial {
  font-size: 56rpx;
}
</style>
