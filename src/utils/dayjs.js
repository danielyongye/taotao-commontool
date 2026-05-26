import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/** 存储：仅日期 */
export const DATE_FORMAT = 'YYYY-MM-DD'
/** 存储：日期 + 时间 */
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
/** 展示：2024.06.15 */
export const DISPLAY_DATE_FORMAT = 'YYYY.MM.DD'
/** 展示：2024.06.15 14:30:45 */
export const DISPLAY_DATETIME_FORMAT = 'YYYY.MM.DD HH:mm:ss'
/** 展示：2024年6月15日 */
export const LABEL_DATE_FORMAT = 'YYYY年M月D日'

export default dayjs
