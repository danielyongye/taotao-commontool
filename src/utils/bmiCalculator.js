/**
 * BMI 分级（中国成人 18 岁及以上常用标准）
 * 参考：国家卫健委《体重管理指导原则》、WS/T 428 及《中国居民膳食指南（2022）》
 * - BMI＜18.5：体重过低
 * - 18.5≤BMI＜24：正常
 * - 24≤BMI＜28：超重
 * - BMI≥28：肥胖
 */
export const BMI_LEVELS = [
  {
    max: 18.5,
    label: '体重过低',
    tone: 'warning',
    desc: 'BMI＜18.5 属于体重过低。应先排除疾病因素，再综合评估饮食摄入与身体活动。',
    tip: '可在专业人员指导下逐步增加能量：适量增加谷类、奶蛋、豆类与瘦肉，并配合每天适量运动。'
  },
  {
    max: 24,
    label: '正常',
    tone: 'success',
    desc: '18.5≤BMI＜24 属于正常体重范围（中国成人常用判定标准）。',
    tip: '保持吃动平衡：规律三餐、食不过量，少油少盐少糖；每周至少 150 分钟中等强度有氧运动，并做 2～3 次力量锻炼。'
  },
  {
    max: 28,
    label: '超重',
    tone: 'warning',
    desc: '24≤BMI＜28 属于超重。此阶段高血压、2 型糖尿病等慢性病风险已高于正常体重人群。',
    tip: '建议控制总能量、减少精制主食与高油高糖食品，增加蔬菜与全谷物；减重宜循序渐进，一般可按每月 2～4kg 调整。'
  },
  {
    max: Infinity,
    label: '肥胖',
    tone: 'error',
    desc: 'BMI≥28 属于肥胖症。需重视并坚持生活方式干预，必要时在医疗机构进一步评估。',
    tip: '若合并高血压、高血糖、高血脂，或生活方式干预 3～6 个月仍难有效减重，建议到营养科或体重管理门诊就诊。'
  }
]

/** 页面底部通用说明（BMI 局限性） */
export const BMI_REFERENCE_NOTE =
  'BMI＝体重(kg)÷身高²(m²)，用于筛查胖瘦，不能单独反映体脂、肌肉量与内脏脂肪；儿童青少年、孕妇及老年人适用不同标准，仅供参考。'

export function calcBmi(heightCm, weightKg) {
  const h = Number(heightCm)
  const w = Number(weightKg)
  if (!h || !w || h <= 0 || w <= 0) return null
  const m = h / 100
  const bmi = w / (m * m)
  if (!Number.isFinite(bmi)) return null
  return Math.round(bmi * 10) / 10
}

export function getBmiLevel(bmi) {
  if (bmi == null || !Number.isFinite(bmi)) return BMI_LEVELS[1]
  return BMI_LEVELS.find((lv) => bmi < lv.max) || BMI_LEVELS[BMI_LEVELS.length - 1]
}

/** 刻度条指针位置 0~1（展示区间约 15~35） */
export function getBmiScalePosition(bmi) {
  if (bmi == null) return 0.5
  const min = 15
  const max = 35
  const clamped = Math.min(max, Math.max(min, bmi))
  return (clamped - min) / (max - min)
}
