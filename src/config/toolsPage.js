import { INDEX_PAGE as POKER_LEDGER_PAGE } from '@/constants/pokerLedger.js'
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
        icon: 'heart-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #FF9EC8 0%, #FF6B9D 100%)',
        url: '/pages/memorialDayList/index'
      },
      {
        id: 'countdownTime',
        name: '倒数日',
        icon: 'calendar-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #FFC56E 0%, #FF9F43 100%)',
        url: '/pages/countdownList/index'
      },
      {
        id: 'wishlist',
        name: '愿望清单',
        icon: 'checkmark-circle-fill',
        iconColor: '#ffffff',
        gradient: 'linear-gradient(145deg, #7EE0B8 0%, #4CD4A0 100%)',
        url: '/pages/wishlist/index'
      },
      {
        id: 'poker',
        name: '德扑账本',
        icon: 'grid-fill',
        iconColor: '#1a1d26',
        gradient: 'linear-gradient(145deg, #F8F9FB 0%, #ECEEF2 100%)',
        url: POKER_LEDGER_PAGE
      },
      {
        id: 'wishRecommend',
        name: '愿望推荐',
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
        icon: 'calendar',
        iconColor: '#4B8BFF',
        bg: '#EEF4FF',
        url: DATE_CALCULATOR_PAGE
      },
      {
        id: 'bmi',
        name: 'BMI计算器',
        icon: 'level',
        iconColor: '#4B8BFF',
        bg: '#EEF4FF',
        url: BMI_CALCULATOR_PAGE
      },
      {
        id: 'random',
        name: '随机数',
        icon: 'reload',
        iconColor: '#4B8BFF',
        bg: '#EEF4FF',
        url: RANDOM_NUMBER_PAGE
      },
      {
        id: 'unit',
        name: '单位换算',
        icon: 'grid',
        iconColor: '#4B8BFF',
        bg: '#EEF4FF',
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
        iconColor: '#3D9A6E',
        bg: 'linear-gradient(180deg, #F0FAF5 0%, #E2F5EC 100%)',
        url: POKER_LEDGER_PAGE
      },
      {
        id: 'mahjongLedger',
        name: '麻将账本',
        desc: '收支一目了然',
        icon: 'grid',
        iconColor: '#D48806',
        bg: 'linear-gradient(180deg, #FFF8F0 0%, #FFEFE0 100%)',
        url: MAHJONG_LEDGER_PAGE
      },
      {
        id: 'cardsLedger',
        name: '跑胡子账本',
        desc: '轻松记分不迷糊',
        icon: 'list',
        iconColor: '#4B7CFF',
        bg: 'linear-gradient(180deg, #F0F6FF 0%, #E3EEFF 100%)',
        url: PAOHUZI_LEDGER_PAGE
      },
      {
        id: 'moreLedger',
        name: '更多账本',
        desc: '敬请期待',
        icon: 'plus-circle-fill',
        iconColor: '#9B7EDE',
        bg: 'linear-gradient(180deg, #F6F2FF 0%, #EDE6FF 100%)',
        url: null
      }
    ]
  },
  {
    id: 'game',
    title: '娱乐游戏',
    layout: 'placeholder',
    tools: []
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
