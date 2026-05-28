import { APP_SHARE_DESC, APP_SHARE_NAME } from '@/constants/share.js'

export function getCurrentPageInstance() {
  const pages = getCurrentPages()
  return pages.length ? pages[pages.length - 1] : null
}

/** 当前页完整分享路径（含 query） */
export function buildSharePath(pageInstance) {
  const page = pageInstance || getCurrentPageInstance()
  if (!page?.route) return '/pages/index/index'

  const route = `/${page.route}`
  const options = page.options || {}
  const query = Object.keys(options)
    .filter((key) => options[key] != null && options[key] !== '')
    .map((key) => `${key}=${encodeURIComponent(String(options[key]))}`)
    .join('&')

  return query ? `${route}?${query}` : route
}

export function getNavigationBarTitle() {
  // #ifdef MP-WEIXIN
  try {
    if (typeof __wxConfig !== 'undefined' && __wxConfig?.page?.navigationBarTitleText) {
      return __wxConfig.page.navigationBarTitleText
    }
  } catch (e) {
    // ignore
  }
  // #endif

  const page = getCurrentPageInstance()
  const vm = page?.$vm
  if (vm?.shareTitle) return vm.shareTitle

  return APP_SHARE_NAME
}

export function buildShareTitle() {
  const pageTitle = getNavigationBarTitle()
  if (pageTitle && pageTitle !== APP_SHARE_NAME) {
    return `${pageTitle} · ${APP_SHARE_NAME}`
  }
  return `${APP_SHARE_NAME} - ${APP_SHARE_DESC}`
}

export function buildShareAppMessage(overrides = {}) {
  return {
    title: overrides.title || buildShareTitle(),
    path: overrides.path || buildSharePath(),
    ...overrides
  }
}

/** 开启右上角「转发给朋友 / 分享到朋友圈」 */
export function enablePageShareMenu() {
  // #ifdef MP-WEIXIN
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
  // #endif
}
