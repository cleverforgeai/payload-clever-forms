import type { CleverFormDefinition, CleverFormField } from '../types.js'

export const normalizeFieldDefaultValue = (field: CleverFormField): unknown => {
  const value = field.defaultValue
  if (value === undefined || value === null || value === '') return undefined

  if (field.type === 'number' || field.type === 'range') {
    const parsed = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  if (field.type === 'checkbox' && !field.choices?.length) {
    if (typeof value === 'boolean') return value
    const normalized = String(value).trim().toLowerCase()
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true
    if (['false', '0', 'no', 'off'].includes(normalized)) return false
    return undefined
  }

  if (field.type === 'multiselect') {
    if (Array.isArray(value)) return value.map(String)
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return value
}

const getFieldDefault = (field: CleverFormField): unknown => {
  if (field.type === 'repeater') {
    const rowCount = Math.max(0, field.minRows ?? (field.required ? 1 : 0))
    if (!rowCount) return undefined

    return Array.from({ length: rowCount }, () => {
      const row: Record<string, unknown> = {}
      for (const child of field.repeaterFields ?? []) {
        const childValue = getFieldDefault(child)
        if (childValue !== undefined) row[child.name] = childValue
      }
      return row
    })
  }

  return normalizeFieldDefaultValue(field)
}

export const getFormDefaultValues = (form: CleverFormDefinition): Record<string, unknown> => {
  const defaults: Record<string, unknown> = {}

  for (const page of form.pages ?? []) {
    for (const field of page.fields ?? []) {
      const value = getFieldDefault(field)
      if (value !== undefined) defaults[field.name] = value
    }
  }

  return defaults
}
