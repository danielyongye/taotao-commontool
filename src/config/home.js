import { getDefaultQuickTools, getLedgerDisplayItems } from '@/utils/toolsCatalog.js'

/** 首页快捷入口（数据来自工具页配置，与工具页 icon/背景/说明一致） */
export const QUICK_TOOLS = getDefaultQuickTools()

/** 首页娱乐记账本横滑（数据来自工具页记账本分类） */
export const LEDGER_ITEMS = getLedgerDisplayItems()
