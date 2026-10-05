import { definePlugin } from 'payload'
import { createFormsCollection } from './collections/forms.js'
import { createSubmissionsCollection } from './collections/submissions.js'
import type { CleverFormsPluginOptions } from './types.js'

export type {
  CleverFormChoice,
  CleverFormCondition,
  CleverFormDefinition,
  CleverFormField,
  CleverFormFieldType,
  CleverFormPage,
  CleverFormsFieldConfig,
  CleverFormsPluginOptions,
  SubmissionGuardArgs,
  SubmissionHandlerArgs,
} from './types.js'

export { conditionMatches, evaluateCondition } from './runtime/logic.js'
export { CleverFormsValidationError, validateSubmission } from './runtime/validation.js'
export { CleverFormsSchemaError, validateFormSchema } from './runtime/schemaValidation.js'
export { createCleverFormsClient } from './runtime/client.js'
export { cleverFormsTranslations } from './i18n/index.js'
export { cleverFormTemplates, getCleverFormTemplate, cloneCleverFormTemplate } from './templates/index.js'
export type { CleverFormTemplate } from './templates/index.js'

export const cleverForms = definePlugin<CleverFormsPluginOptions>({
  slug: '@cleverforge/payload-clever-forms',
  plugin: ({ config, plugins: _plugins, ...options }) => {
    if (options.enabled === false) return config

    const formsSlug = options.formsSlug ?? 'clever-forms'
    const submissionsSlug = options.submissionsSlug ?? 'clever-form-submissions'
    const adminGroup = options.adminGroup ?? 'Clever Forms'

    let forms = createFormsCollection(formsSlug, adminGroup, options.fields)
    let submissions = createSubmissionsCollection(submissionsSlug, formsSlug, adminGroup, options)

    if (options.extendFormsCollection) forms = options.extendFormsCollection(forms)
    if (options.extendSubmissionsCollection) submissions = options.extendSubmissionsCollection(submissions)

    return {
      ...config,
      collections: [...(config.collections ?? []), forms, submissions],
    }
  },
})

export default cleverForms
