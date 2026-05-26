import { INDEX_PAGE as POKER_LEDGER_PAGE } from '@/constants/pokerLedger.js'
import { INDEX_PAGE as MAHJONG_LEDGER_PAGE } from '@/constants/mahjongLedger.js'
import { INDEX_PAGE as PAOHUZI_LEDGER_PAGE } from '@/constants/paohuziLedger.js'

/** 首页展示配置（对齐设计稿） */
export const QUICK_TOOLS = [
  {
    id: 'rentCalculator',
    name: '合租计算器',
    tag: '人数·比例·面积',
    icon: 'grid-fill',
    gradient: 'linear-gradient(145deg, #7EB3FF 0%, #4B8BFF 100%)',
    url: '/pages/rentCalculator/index'
  },
  {
    id: 'memorialDay',
    name: '纪念日',
    tag: '陪伴有数',
    icon: 'heart-fill',
    gradient: 'linear-gradient(145deg, #FF9EC8 0%, #FF6B9D 100%)',
    url: '/pages/memorialDayList/index'
  },
  {
    id: 'countdownTime',
    name: '倒数日',
    tag: '重要不错过',
    icon: 'calendar-fill',
    gradient: 'linear-gradient(145deg, #FFC56E 0%, #FF9F43 100%)',
    url: '/pages/countdownList/index'
  },
  {
    id: 'wishRecommend',
    name: '愿望推荐',
    tag: '灵感不空缺',
    icon: 'star-fill',
    gradient: 'linear-gradient(145deg, #C4A8FF 0%, #9B7EDE 100%)',
    url: '/pages/wishRecommend/index'
  },
  {
    id: 'wishlist',
    name: '愿望清单',
    tag: '想法有进度',
    icon: 'checkmark-circle-fill',
    gradient: 'linear-gradient(145deg, #7EE0B8 0%, #4CD4A0 100%)',
    url: '/pages/wishlist/index'
  }
]

export const LEDGER_ITEMS = [
  {
    id: 'poker',
    name: '德扑账本',
    tag: '手牌流水记录',
    bg: 'linear-gradient(180deg, #F0FAF5 0%, #E2F5EC 100%)',
    icon: 'grid-fill',
    iconColor: '#3D9A6E',
    url: POKER_LEDGER_PAGE
  },
  {
    id: 'mahjong',
    name: '麻将账本',
    tag: '输赢一目了然',
    bg: 'linear-gradient(180deg, #FFF8F0 0%, #FFEFE0 100%)',
    icon: 'grid',
    iconColor: '#D48806',
    url: MAHJONG_LEDGER_PAGE
  },
  {
    id: 'cards',
    name: '跑胡子账本',
    tag: '局数随时记',
    bg: 'linear-gradient(180deg, #F0F6FF 0%, #E3EEFF 100%)',
    icon: 'list',
    iconColor: '#4B7CFF',
    url: PAOHUZI_LEDGER_PAGE
  },
  {
    id: 'more',
    name: '更多账本',
    tag: '敬请期待',
    bg: 'linear-gradient(180deg, #F6F2FF 0%, #EDE6FF 100%)',
    icon: 'plus-circle-fill',
    iconColor: '#9B7EDE'
  }
]
