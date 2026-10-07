import type { CleverFormDefinition, CleverFormField } from '../types.js'

const choiceFieldTypes = new Set(['select', 'radio', 'multiselect'])

export class CleverFormsSchemaError extends Error {
  issues: string[]

  constructor(issues: string[]) {
    super(issues.join(' '))
    this.name = 'CleverFormsSchemaError'
    this.issues = issues
  }
}

export const validateFormSchema = (
  form: Pick<CleverFormDefinition, 'pages'>,
  options: { uploadCollections?: string[] } = {},
): void => {
  const pages = form.pages ?? []
  const issues: string[] = []
  const fields = pages.flatMap((page) => page.fields ?? [])
  const names = new Set<string>()

  if (!pages.length) issues.push('A form must contain at least one page.')

  for (const [index, page] of pages.entries()) {
    if (!page.fields?.length) issues.push(`Page ${index + 1} must contain at least one field.`)
  }

  for (const field of fields) {
    validateField(field, names, issues, options.uploadCollections ?? [])
  }

  const allNames = new Set(fields.map((field) => field.name))
  for (const field of fields) {
    const condition = field.conditionalLogic
    if (condition?.enabled) {
      if (!condition.field) issues.push(`Conditional logic for "${field.name}" must reference a field.`)
      else if (condition.field === field.name) issues.push(`Field "${field.name}" cannot depend on itself.`)
      else if (!allNames.has(condition.field)) issues.push(`Field "${field.name}" references missing field "${condition.field}".`)
    }
  }

  if (issues.length) throw new CleverFormsSchemaError(issues)
}

const validateField = (
  field: CleverFormField,
  names: Set<string>,
  issues: string[],
  uploadCollections: string[],
) => {
  const name = field.name?.trim()
  if (!name) {
    issues.push('Every field must have a name.')
    return
  }

  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(name)) {
    issues.push(`Field name "${name}" must start with a letter and contain only letters, numbers, underscores, or hyphens.`)
  }

  if (names.has(name)) issues.push(`Field name "${name}" is duplicated.`)
  names.add(name)

  if (field.type === 'repeater') {
    if (!field.fields?.length) {
      issues.push(`Repeater field "${name}" requires at least one nested field.`)
    }
    if (field.minRows !== undefined && (!Number.isFinite(Number(field.minRows)) || Number(field.minRows) < 0)) {
      issues.push(`Repeater field "${name}" must use a non-negative minimum row count.`)
    }
    if (field.maxRows !== undefined && (!Number.isFinite(Number(field.maxRows)) || Number(field.maxRows) < 1)) {
      issues.push(`Repeater field "${name}" must use a positive maximum row count.`)
    }
    if (
      field.minRows !== undefined &&
      field.maxRows !== undefined &&
      Number(field.minRows) > Number(field.maxRows)
    ) {
      issues.push(`Repeater field "${name}" cannot have minimum rows greater than maximum rows.`)
    }

    const childNames = new Set<string>()
    for (const child of field.repeaterFields ?? []) {
      if (child.type === 'repeater') {
        issues.push(`Repeater field "${name}" cannot contain nested repeaters in Core.`)
        continue
      }
      if (child.type === 'upload') {
        issues.push(`Repeater field "${name}" cannot contain Upload fields in Core.`)
        continue
      }
      validateField(child, childNames, issues, uploadCollections)
    }
  }

  if (field.type === 'upload') {
    if (!field.uploadCollection?.trim()) {
      issues.push(`Upload field "${name}" requires an upload collection.`)
    } else if (!uploadCollections.includes(field.uploadCollection)) {
      issues.push(`Upload field "${name}" references upload collection "${field.uploadCollection}" that is not enabled in CleverForms.`)
    }
    if (field.maxFileSize !== undefined && (!Number.isFinite(Number(field.maxFileSize)) || Number(field.maxFileSize) <= 0)) {
      issues.push(`Upload field "${name}" must use a positive maximum file size.`)
    }
  }

  if (choiceFieldTypes.has(field.type)) {
    if (!field.choices?.length) issues.push(`Field "${name}" requires at least one choice.`)
    const values = new Set<string>()
    for (const choice of field.choices ?? []) {
      if (!choice.value?.trim()) issues.push(`Field "${name}" contains a choice without a value.`)
      else if (values.has(choice.value)) issues.push(`Field "${name}" contains duplicate choice value "${choice.value}".`)
      else values.add(choice.value)
    }
  }
}
