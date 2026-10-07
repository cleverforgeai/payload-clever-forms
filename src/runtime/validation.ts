import type {
  CleverFormDefinition,
  CleverFormField,
  CleverFormsCustomFieldDefinition,
} from '../types.js'
import { conditionMatches } from './logic.js'
import { normalizeFieldDefaultValue } from './defaults.js'
import { COUNTRY_CODE_SET, US_STATE_CODES } from './locations.js'

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

const validateFields = (
  fields: CleverFormField[],
  input: Record<string, unknown>,
  errors: Record<string, string>,
  customFieldTypes: CleverFormsCustomFieldDefinition[],
  pathPrefix = '',
): Record<string, unknown> => {
  const output: Record<string, unknown> = {}
  const customByType = new Map(customFieldTypes.map((definition) => [definition.type, definition]))

  for (const field of fields) {
    const path = pathPrefix ? `${pathPrefix}.${field.name}` : field.name

    if (field.type === 'heading' || field.type === 'paragraph' || field.type === 'message') continue
    if (!conditionMatches(field.conditionalLogic, input)) continue

    const suppliedValue = input[field.name]
    const defaultValue = normalizeFieldDefaultValue(field)
    const value = isEmpty(suppliedValue) && defaultValue !== undefined ? defaultValue : suppliedValue

    if (field.required && isEmpty(value)) {
      errors[path] = `${field.label} is required.`
      continue
    }
    if (isEmpty(value)) continue

    if (field.type === 'repeater') {
      if (!Array.isArray(value)) {
        errors[path] = `${field.label} must contain repeatable rows.`
        continue
      }

      const minRows = field.minRows ?? (field.required ? 1 : 0)
      const maxRows = field.maxRows
      if (value.length < minRows) {
        errors[path] = `${field.label} requires at least ${minRows} row${minRows === 1 ? '' : 's'}.`
        continue
      }
      if (maxRows !== undefined && value.length > maxRows) {
        errors[path] = `${field.label} allows at most ${maxRows} rows.`
        continue
      }

      const rows: Record<string, unknown>[] = []
      for (const [index, row] of value.entries()) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) {
          errors[`${path}.${index}`] = `${field.label} row ${index + 1} is invalid.`
          continue
        }
        rows.push(validateFields(
          field.fields ?? [],
          row as Record<string, unknown>,
          errors,
          customFieldTypes,
          `${path}.${index}`,
        ))
      }
      output[field.name] = rows
      continue
    }

    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      errors[path] = `${field.label} must be a valid email address.`
      continue
    }

    if ((field.type === 'number' || field.type === 'range') && !Number.isFinite(Number(value))) {
      errors[path] = `${field.label} must be a number.`
      continue
    }

    if (field.type === 'url') {
      try {
        const url = new URL(String(value))
        if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('invalid protocol')
      } catch {
        errors[path] = `${field.label} must be a valid http or https URL.`
        continue
      }
    }

    if ((field.type === 'number' || field.type === 'range') && field.min !== undefined && Number(value) < field.min) {
      errors[path] = `${field.label} must be at least ${field.min}.`
      continue
    }

    if ((field.type === 'number' || field.type === 'range') && field.max !== undefined && Number(value) > field.max) {
      errors[path] = `${field.label} must be at most ${field.max}.`
      continue
    }

    if (field.type === 'state' && !US_STATE_CODES.has(String(value))) {
      errors[path] = `${field.label} must be a valid US state.`
      continue
    }

    if (field.type === 'country' && !COUNTRY_CODE_SET.has(String(value))) {
      errors[path] = `${field.label} must be a valid country.`
      continue
    }

    if (['select', 'radio', 'checkbox', 'multiselect'].includes(field.type) && field.choices?.length) {
      const allowed = new Set(field.choices.map((choice) => choice.value))
      const values = Array.isArray(value) ? value.map(String) : [String(value)]
      if (values.some((item) => !allowed.has(item))) {
        errors[path] = `${field.label} contains an invalid choice.`
        continue
      }
    }

    const custom = customByType.get(String(field.type))
    if (custom?.validate) {
      const message = custom.validate({ field, value, input })
      if (message) {
        errors[path] = message
        continue
      }
    }

    output[field.name] = value
  }

  return output
}

export const validateSubmission = (
  form: CleverFormDefinition,
  input: Record<string, unknown>,
  customFieldTypes: CleverFormsCustomFieldDefinition[] = [],
): Record<string, unknown> => {
  const errors: Record<string, string> = {}
  const output = validateFields(allFields(form), input, errors, customFieldTypes)

  if (Object.keys(errors).length > 0) throw new CleverFormsValidationError(errors)
  return output
}
