import { INDEX_PAGE as POKER_LEDGER_PAGE } from '@/constants/pokerLedger.js'
import { INDEX_PAGE as GAME_ROOM_PAGE } from '@/constants/gameRoom.js'
import { INDEX_PAGE as MAHJONG_LEDGER_PAGE } from '@/constants/mahjongLedger.js'
import { INDEX_PAGE as PAOHUZI_LEDGER_PAGE } from '@/constants/paohuziLedger.js'
import {
  DATE_CALCULATOR_PAGE,
  BMI_CALCULATOR_PAGE,
  RANDOM_NUMBER_PAGE,
  UNIT_CONVERTER_PAGE
} from '@/constants/lifeTools.js'

/** 工具页配置（对齐设计稿） */
export const TOOLS_SIDEBAR = [
  { id: 'common', name: '常用工具' },
  { id: 'life', name: '生活工具' },
  { id: 'ledger', name: '记账本' },
  { id: 'game', name: '娱乐游戏' },
  { id: 'calc', name: '计算工具' },
  { id: 'other', name: '其他工具' }
]

export const TOOLS_SECTIONS = [
  {
    id: 'common',
    title: '常用工具',
    layout: 'grid',
    tools: [
      {
        id: 'rentCalculator',
        name: '合租计算器',
        desc: '人数、比例、面积分摊',
        icon: 'grid-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #7EB3FF 0%, #4B8BFF 100%)',
        url: '/pages/rentCalculator/index'
      },
      {
        id: 'memorialDay',
        name: '纪念日',
        desc: '记录重要日子与提醒',
        icon: 'heart-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #FF9EC8 0%, #FF6B9D 100%)',
        url: '/pages/memorialDayList/index'
      },
      {
        id: 'countdownTime',
        name: '倒数日',
        desc: '目标日期倒计时提醒',
        icon: 'calendar-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #FFC56E 0%, #FF9F43 100%)',
        url: '/pages/countdownList/index'
      },
      {
        id: 'wishlist',
        name: '愿望清单',
        desc: '收集心愿并跟踪完成',
        icon: 'checkmark-circle-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #7EE0B8 0%, #4CD4A0 100%)',
        url: '/pages/wishlist/index'
      },
      {
        id: 'poker',
        name: '德扑账本',
        desc: '德扑牌局输赢记账',
        icon: 'grid-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #34D399 0%, #22C55E 100%)',
        url: POKER_LEDGER_PAGE
      },
      {
        id: 'wishRecommend',
        name: '愿望推荐',
        desc: '发现热门愿望灵感',
        icon: 'gift-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #6ED4C8 0%, #3BB8A8 100%)',
        url: '/pages/wishRecommend/index'
      }
    ]
  },
  {
    id: 'life',
    title: '生活工具',
    layout: 'outline',
    tools: [
      {
        id: 'dateCalc',
        name: '日期计算器',
        desc: '计算日期间隔与星期',
        icon: 'calendar-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #FDBA74 0%, #F97316 100%)',
        url: DATE_CALCULATOR_PAGE
      },
      {
        id: 'bmi',
        name: 'BMI计算器',
        desc: '根据身高体重算指数',
        icon: 'heart-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #7EE0B8 0%, #4CD4A0 100%)',
        url: BMI_CALCULATOR_PAGE
      },
      {
        id: 'random',
        name: '随机数',
        desc: '指定范围随机生成数',
        icon: 'reload',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #C4A8FF 0%, #9B7EDE 100%)',
        url: RANDOM_NUMBER_PAGE
      },
      {
        id: 'unit',
        name: '单位换算',
        desc: '常用计量单位换算',
        icon: 'grid-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #7EB3FF 0%, #4B8BFF 100%)',
        url: UNIT_CONVERTER_PAGE
      }
    ]
  },
  {
    id: 'ledger',
    title: '记账本',
    layout: 'ledger',
    tools: [
      {
        id: 'pokerLedger',
        name: '德扑账本',
        desc: '记录每一局',
        icon: 'grid-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #34D399 0%, #22C55E 100%)',
        url: POKER_LEDGER_PAGE
      },
      {
        id: 'mahjongLedger',
        name: '麻将账本',
        desc: '收支一目了然',
        icon: 'grid-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #FCD34D 0%, #F59E0B 100%)',
        url: MAHJONG_LEDGER_PAGE
      },
      {
        id: 'cardsLedger',
        name: '跑胡子账本',
        desc: '轻松记分不迷糊',
        icon: 'list',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #60A5FA 0%, #3B82F6 100%)',
        url: PAOHUZI_LEDGER_PAGE
      },
      {
        id: 'gameRoom',
        name: '牌局记分',
        desc: '邀请好友零和记账',
        icon: 'account-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #A78BFA 0%, #6366F1 100%)',
        url: GAME_ROOM_PAGE
      },
      {
        id: 'pokerScore',
        name: '德扑记分',
        desc: '码量盈亏实时记录',
        icon: 'star-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #60A5FA 0%, #3B82F6 100%)',
        url: '/pages/pokerScore/index'
      }
    ]
  },
  {
    id: 'game',
    title: '娱乐游戏',
    layout: 'grid',
    tools: [
      {
        id: 'gameRoom',
        name: '牌局记分',
        desc: '麻将跑胡子零和记账',
        icon: 'account-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #A78BFA 0%, #6366F1 100%)',
        url: GAME_ROOM_PAGE
      },
      {
        id: 'pokerScore',
        name: '德扑记分',
        desc: '码量盈亏一键记录',
        icon: 'star-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #60A5FA 0%, #3B82F6 100%)',
        url: '/pages/pokerScore/index'
      }
    ]
  },
  {
    id: 'calc',
    title: '计算工具',
    layout: 'placeholder',
    tools: []
  },
  {
    id: 'other',
    title: '其他工具',
    layout: 'placeholder',
    tools: []
  }
]
