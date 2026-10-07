import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import type { CleverFormDefinition, CleverFormsPluginOptions } from '../types.js'
import { validateSubmission } from './validation.js'
import { sendFormNotifications } from './email.js'

export const createSubmissionHook = (
  formsSlug: string,
  options: CleverFormsPluginOptions,
): CollectionBeforeChangeHook => async ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const formID = typeof data.form === 'object' && data.form !== null ? data.form.id : data.form
  if (!formID) throw new Error('A form is required.')

  const form = await req.payload.findByID({ collection: formsSlug, id: formID, depth: 0, req }) as unknown as CleverFormDefinition
  if (form.status !== 'published') throw new Error('This form is not accepting submissions.')
  if (form.settings?.requireAuthentication && !req.user) throw new Error('Authentication is required to submit this form.')

  const rawData = (data.data ?? {}) as Record<string, unknown>
  if (options.beforeSubmission) await options.beforeSubmission({ form, data: rawData, rawData, req })

  const validated = validateSubmission(form, rawData)
  data.data = validated
  data.status = 'submitted'
  data.submittedAt = new Date().toISOString()

  return data
}

export const createAfterSubmissionHook = (
  formsSlug: string,
  options: CleverFormsPluginOptions,
): CollectionAfterChangeHook => async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const formID = typeof doc.form === 'object' && doc.form !== null ? doc.form.id : doc.form
  const form = await req.payload.findByID({ collection: formsSlug, id: formID, depth: 0, req }) as unknown as CleverFormDefinition
  const data = (doc.data ?? {}) as Record<string, unknown>
  const args = { form, data, req }

  await sendFormNotifications(form, data, args, options)
  if (options.onSubmission) await options.onSubmission(args)

  return doc
}
