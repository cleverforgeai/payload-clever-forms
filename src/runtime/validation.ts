import type { CleverFormDefinition, CleverFormField } from '../types.js'
import { conditionMatches } from './logic.js'
import { normalizeFieldDefaultValue } from './defaults.js'

export class CleverFormsValidationError extends Error {
  constructor(public readonly errors: Record<string, string>) {
    super('Form validation failed')
    this.name = 'CleverFormsValidationError'
  }
}

const allFields = (form: CleverFormDefinition): CleverFormField[] =>
  form.pages?.flatMap((page) => page.fields ?? []) ?? []

const isEmpty = (value: unknown): boolean =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)

export const validateSubmission = (
  form: CleverFormDefinition,
  input: Record<string, unknown>,
): Record<string, unknown> => {
  const output: Record<string, unknown> = {}
  const errors: Record<string, string> = {}

  for (const field of allFields(form)) {
    if (field.type === 'heading' || field.type === 'paragraph') continue
    if (!conditionMatches(field.conditionalLogic, input)) continue

    const suppliedValue = input[field.name]
    const defaultValue = normalizeFieldDefaultValue(field)
    const value = isEmpty(suppliedValue) && defaultValue !== undefined ? defaultValue : suppliedValue
    if (field.required && isEmpty(value)) {
      errors[field.name] = `${field.label} is required.`
      continue
    }
    if (isEmpty(value)) continue

    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      errors[field.name] = `${field.label} must be a valid email address.`
      continue
    }

    if (field.type === 'number' && !Number.isFinite(Number(value))) {
      errors[field.name] = `${field.label} must be a number.`
      continue
    }

    if (['select', 'radio', 'checkbox', 'multiselect'].includes(field.type) && field.choices?.length) {
      const allowed = new Set(field.choices.map((choice) => choice.value))
      const values = Array.isArray(value) ? value.map(String) : [String(value)]
      if (values.some((item) => !allowed.has(item))) {
        errors[field.name] = `${field.label} contains an invalid choice.`
        continue
      }
    }

    output[field.name] = value
  }

  if (Object.keys(errors).length > 0) throw new CleverFormsValidationError(errors)
  return output
}
