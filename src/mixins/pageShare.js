import { buildShareAppMessage, enablePageShareMenu } from '@/utils/pageShare.js'

/**
 * 全局页面分享：默认分享当前页路径与标题。
 * 页面可定义 getShareAppMessage / getShareTimeline 覆盖，或直接写 onShareAppMessage。
 */
export default {
  onShow() {
    enablePageShareMenu()
  },
  onShareAppMessage() {
    if (typeof this.getShareAppMessage === 'function') {
      return this.getShareAppMessage()
    }
    return buildShareAppMessage()
  },
  onShareTimeline() {
    if (typeof this.getShareTimeline === 'function') {
      return this.getShareTimeline()
    }
    const share = buildShareAppMessage()
    const query = share.path.includes('?') ? share.path.split('?').slice(1).join('?') : ''
    return {
      title: share.title,
      query
    }
  }
}
