import type { CleverFormDefinition, CleverFormField } from '../types.js'

export type CleverFormsClientOptions = {
  baseURL?: string
  submissionsSlug?: string
  fetcher?: typeof fetch
}

export type SubmitFormInput = {
  form: string | number
  data: Record<string, unknown>
  submitterEmail?: string
  sourceURL?: string
}

const jsonRequest = async <T>(fetcher: typeof fetch, url: string, init: RequestInit): Promise<T> => {
  const response = await fetcher(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error((body as { message?: string }).message ?? `Clever Forms request failed (${response.status})`)
  return body as T
}

const uploadFields = (form: CleverFormDefinition): CleverFormField[] =>
  form.pages?.flatMap((page) => page.fields ?? []).filter((field) => field.type === 'upload') ?? []

const filesFromValue = (value: unknown): File[] => {
  if (typeof File === 'undefined') return []
  if (value instanceof File) return [value]
  if (Array.isArray(value)) return value.filter((item): item is File => item instanceof File)
  return []
}

export const createCleverFormsClient = (options: CleverFormsClientOptions = {}) => {
  const baseURL = (options.baseURL ?? '').replace(/\/$/, '')
  const submissionsSlug = options.submissionsSlug ?? 'clever-form-submissions'
  const fetcher = options.fetcher ?? fetch

  const uploadFile = async (collection: string, file: File): Promise<string | number> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('_payload', JSON.stringify({}))

    const response = await fetcher(`${baseURL}/api/${collection}`, {
      method: 'POST',
      body: formData,
    })
    const body = await response.json().catch(() => ({})) as any
    if (!response.ok) throw new Error(body?.message ?? `File upload failed (${response.status})`)

    const id = body?.doc?.id ?? body?.id
    if (id === undefined || id === null) throw new Error('Payload upload response did not include a document ID.')
    return id
  }

  const prepareSubmissionData = async (
    form: CleverFormDefinition,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> => {
    const prepared = { ...data }

    for (const field of uploadFields(form)) {
      const files = filesFromValue(data[field.name])
      if (!files.length) continue
      if (!field.uploadCollection) throw new Error(`${field.label} is missing an upload collection.`)
      if (!field.multiple && files.length > 1) throw new Error(`${field.label} accepts only one file.`)

      const ids: Array<string | number> = []
      for (const file of files) ids.push(await uploadFile(field.uploadCollection, file))
      prepared[field.name] = field.multiple ? ids : ids[0]
    }

    return prepared
  }

  return {
    uploadFile,
    prepareSubmissionData,
    submit: (input: SubmitFormInput) => jsonRequest(fetcher, `${baseURL}/api/${submissionsSlug}`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  }
}
