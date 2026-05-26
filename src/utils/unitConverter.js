/** 单位换算：各分类基准单位为第一项 */
export const UNIT_CATEGORIES = [
  {
    id: 'length',
    name: '长度',
    units: [
      { id: 'm', name: '米', factor: 1 },
      { id: 'km', name: '千米', factor: 1000 },
      { id: 'cm', name: '厘米', factor: 0.01 },
      { id: 'mm', name: '毫米', factor: 0.001 },
      { id: 'mi', name: '英里', factor: 1609.344 },
      { id: 'ft', name: '英尺', factor: 0.3048 },
      { id: 'in', name: '英寸', factor: 0.0254 }
    ]
  },
  {
    id: 'weight',
    name: '重量',
    units: [
      { id: 'kg', name: '千克', factor: 1 },
      { id: 'g', name: '克', factor: 0.001 },
      { id: 't', name: '吨', factor: 1000 },
      { id: 'lb', name: '磅', factor: 0.45359237 },
      { id: 'oz', name: '盎司', factor: 0.028349523125 }
    ]
  },
  {
    id: 'area',
    name: '面积',
    units: [
      { id: 'm2', name: '平方米', factor: 1 },
      { id: 'km2', name: '平方千米', factor: 1e6 },
      { id: 'ha', name: '公顷', factor: 10000 },
      { id: 'mu', name: '亩', factor: 666.6666667 },
      { id: 'ft2', name: '平方英尺', factor: 0.09290304 }
    ]
  },
  {
    id: 'volume',
    name: '体积',
    units: [
      { id: 'm3', name: '立方米', factor: 1 },
      { id: 'l', name: '升', factor: 0.001 },
      { id: 'ml', name: '毫升', factor: 0.000001 },
      { id: 'gal', name: '加仑(美)', factor: 0.003785411784 }
    ]
  }
]

export function convertUnit(value, fromFactor, toFactor) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  if (!fromFactor || !toFactor) return ''
  const base = n * fromFactor
  const result = base / toFactor
  if (!Number.isFinite(result)) return ''
  if (Math.abs(result) >= 1e9 || (Math.abs(result) > 0 && Math.abs(result) < 1e-8)) {
    return result.toExponential(4)
  }
  const rounded = Math.round(result * 1e6) / 1e6
  return String(rounded)
}

/** 摄氏度 ↔ 其他温标 */
export function convertTemperature(value, fromId, toId) {
  const n = Number(value)
  if (!Number.isFinite(n) || fromId === toId) return String(n)

  let celsius = n
  if (fromId === 'f') celsius = ((n - 32) * 5) / 9
  else if (fromId === 'k') celsius = n - 273.15

  let out = celsius
  if (toId === 'f') out = (celsius * 9) / 5 + 32
  else if (toId === 'k') out = celsius + 273.15

  const rounded = Math.round(out * 100) / 100
  return String(rounded)
}

export const TEMPERATURE_CATEGORY = {
  id: 'temperature',
  name: '温度',
  units: [
    { id: 'c', name: '摄氏度', factor: null },
    { id: 'f', name: '华氏度', factor: null },
    { id: 'k', name: '开尔文', factor: null }
  ]
}

export function getAllUnitCategories() {
  return [...UNIT_CATEGORIES, TEMPERATURE_CATEGORY]
}
