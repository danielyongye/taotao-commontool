/** 首页工具配置 */
export const TOOL_CATEGORIES = [
  {
    id: 'life',
    name: '生活',
    tools: [
      {
        id: 'rentCalculator',
        name: '合租计算器',
        desc: '人数、比例、面积分摊',
        icon: 'grid-fill',
        iconColor: '#3D4F6F',
        gradient: 'linear-gradient(155deg, #E8ECF4 0%, #D4DCE8 100%)',
        size: 'full',
        url: '/pages/rentCalculator/index'
      }
    ]
  },
  {
    id: 'date',
    name: '日期',
    tools: [
      {
        id: 'memorialDay',
        name: '纪念日',
        desc: '已过去多久',
        icon: 'heart-fill',
        iconColor: '#7A4A55',
        gradient: 'linear-gradient(155deg, #F3E8EC 0%, #E8D4DC 100%)',
        size: 'half',
        url: '/pages/memorialDayList/index'
      },
      {
        id: 'countdownTime',
        name: '倒数日',
        desc: '剩余天数',
        icon: 'calendar-fill',
        iconColor: '#6B5A42',
        gradient: 'linear-gradient(155deg, #F2EDE4 0%, #E5DAC8 100%)',
        size: 'half',
        url: '/pages/countdownList/index'
      }
    ]
  },
  {
    id: 'wish',
    name: '清单',
    tools: [
      {
        id: 'wishRecommend',
        name: '愿望推荐',
        desc: '灵感参考',
        icon: 'gift-fill',
        iconColor: '#5C4D72',
        gradient: 'linear-gradient(155deg, #EDE8F4 0%, #DDD4EA 100%)',
        size: 'half',
        url: '/pages/wishRecommend/index'
      },
      {
        id: 'wishlist',
        name: '愿望清单',
        desc: '记录与管理',
        icon: 'star-fill',
        iconColor: '#3D5C4F',
        gradient: 'linear-gradient(155deg, #E6F0EB 0%, #D4E6DC 100%)',
        size: 'half',
        url: '/pages/wishlist/index'
      }
    ]
  }
]

export function getAllTools() {
  return TOOL_CATEGORIES.flatMap((c) => c.tools)
}

export function getToolCount() {
  return getAllTools().length
}

const LEGACY_TOOL_IDS = {
  timeTransfer: 'rentCalculator',
  lifewishlist: 'wishRecommend'
}

export function getToolById(id) {
  const resolved = LEGACY_TOOL_IDS[id] || id
  return getAllTools().find((t) => t.id === resolved)
}
