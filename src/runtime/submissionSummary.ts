import type { CleverFormDefinition, CleverFormField } from '../types.js'

const allFields = (form: CleverFormDefinition): CleverFormField[] =>
  form.pages?.flatMap((page) => page.fields ?? []) ?? []

const displayValue = (value: unknown): string => {
  if (value === undefined || value === null || value === '') return ''
  if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export const getSubmissionEmail = (
  form: CleverFormDefinition,
  data: Record<string, unknown>,
): string | undefined => {
  const emailField = allFields(form).find((field) => field.type === 'email' && data[field.name])
  if (!emailField) return undefined
  const email = String(data[emailField.name] ?? '').trim()
  return email || undefined
}

export const formatSubmissionSummary = (
  form: CleverFormDefinition,
  data: Record<string, unknown>,
): string => {
  const lines: string[] = []

  for (const field of allFields(form)) {
    if (['heading', 'paragraph', 'message'].includes(field.type)) continue
    const value = displayValue(data[field.name])
    if (!value) continue
    lines.push(`${field.label}: ${value}`)
  }

  return lines.join('\n')
}
