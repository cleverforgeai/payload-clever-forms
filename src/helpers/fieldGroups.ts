import type { CleverFormField, CleverFormFieldGroup } from '../types.js'

export const defineCleverFormFieldGroup = (
  group: CleverFormFieldGroup,
): CleverFormFieldGroup => structuredClone(group)

export const insertCleverFormFieldGroup = (
  fields: CleverFormField[],
  group: CleverFormFieldGroup,
  index = fields.length,
): CleverFormField[] => {
  const safeIndex = Math.max(0, Math.min(index, fields.length))
  const cloned = structuredClone(group.fields)
  return [
    ...fields.slice(0, safeIndex),
    ...cloned,
    ...fields.slice(safeIndex),
  ]
}
