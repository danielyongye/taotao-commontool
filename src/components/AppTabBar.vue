<template>
  <u-tabbar
    :value="active"
    :fixed="true"
    :placeholder="true"
    :safeAreaInsetBottom="true"
    activeColor="#4B8BFF"
    inactiveColor="#B0B8C4"
    :border="true"
    @change="onChange"
  >
    <u-tabbar-item name="home" text="首页" icon="home-fill" />
    <u-tabbar-item name="tools" text="工具" icon="grid" />
    <u-tabbar-item name="wish" text="愿望" icon="star" />
    <u-tabbar-item name="mine" text="我的" icon="account" />
  </u-tabbar>
</template>

<script>
const TAB_PAGES = {
  home: '/pages/index/index',
  tools: '/pages/tab/tools',
  wish: '/pages/tab/wish',
  mine: '/pages/tab/mine'
}

export default {
  name: 'AppTabBar',
  props: {
    active: {
      type: String,
      default: 'home'
    }
  },
  methods: {
    onChange(name) {
      if (name === this.active) return
      const url = TAB_PAGES[name]
      if (url) uni.redirectTo({ url })
    }
  }
}
</script>
