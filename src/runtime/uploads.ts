import type { PayloadRequest } from 'payload'
import type { CleverFormDefinition, CleverFormField } from '../types.js'
import { CleverFormsValidationError } from './validation.js'

const uploadFields = (form: CleverFormDefinition): CleverFormField[] =>
  form.pages?.flatMap((page) => page.fields ?? []).filter((field) => field.type === 'upload') ?? []

const normalizeIDs = (value: unknown): Array<string | number> => {
  if (Array.isArray(value)) return value.filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
  if (typeof value === 'string' || typeof value === 'number') return [value]
  return []
}

const parseMimeTypes = (value?: string): string[] =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const mimeMatches = (mimeType: string, rule: string): boolean =>
  rule.endsWith('/*')
    ? mimeType.startsWith(rule.slice(0, -1))
    : mimeType === rule

export const validateUploadReferences = async (
  form: CleverFormDefinition,
  data: Record<string, unknown>,
  req: PayloadRequest,
): Promise<void> => {
  const errors: Record<string, string> = {}

  for (const field of uploadFields(form)) {
    const ids = normalizeIDs(data[field.name])
    if (!ids.length) continue

    if (!field.multiple && ids.length > 1) {
      errors[field.name] = `${field.label} accepts only one file.`
      continue
    }

    if (!field.uploadCollection) {
      errors[field.name] = `${field.label} is missing its upload collection configuration.`
      continue
    }

    const allowedMimeTypes = parseMimeTypes(field.mimeTypes)

    for (const id of ids) {
      try {
        const doc = await req.payload.findByID({
          collection: field.uploadCollection,
          id,
          depth: 0,
          overrideAccess: false,
          req,
        }) as any

        const mimeType = String(doc?.mimeType ?? '')
        const filesize = Number(doc?.filesize ?? 0)

        if (allowedMimeTypes.length && (!mimeType || !allowedMimeTypes.some((rule) => mimeMatches(mimeType, rule)))) {
          errors[field.name] = `${field.label} contains a file type that is not allowed.`
          break
        }

        if (field.maxFileSize && (!Number.isFinite(filesize) || filesize > field.maxFileSize)) {
          errors[field.name] = `${field.label} contains a file larger than the configured maximum.`
          break
        }
      } catch {
        errors[field.name] = `${field.label} references a file that is unavailable or not permitted.`
        break
      }
    }
  }

  if (Object.keys(errors).length) throw new CleverFormsValidationError(errors)
}

export const getUploadFields = uploadFields
