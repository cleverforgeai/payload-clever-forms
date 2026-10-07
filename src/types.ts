import type { CollectionConfig, PayloadRequest } from 'payload'

export type CleverFormFieldType =
  | 'text' | 'textarea' | 'email' | 'number' | 'select' | 'radio'
  | 'checkbox' | 'multiselect' | 'date' | 'heading' | 'paragraph'

export type CleverFormChoice = { label: string; value: string }

export type CleverFormCondition = {
  enabled?: boolean
  field?: string
  operator?: 'equals' | 'notEquals' | 'contains' | 'isEmpty' | 'isNotEmpty'
  value?: string
}

export type CleverFormField = {
  name: string
  label: string
  type: CleverFormFieldType
  description?: string
  placeholder?: string
  required?: boolean
  defaultValue?: string | number | boolean | string[]
  width?: string
  choices?: CleverFormChoice[]
  conditionalLogic?: CleverFormCondition
}

export type CleverFormPage = {
  title?: string
  description?: string
  fields: CleverFormField[]
}

export type CleverFormDefinition = {
  id: string | number
  title: string
  templateKey?: string
  salesforcePresetKey?: string
  description?: string
  status?: 'draft' | 'published' | 'archived'
  pages?: CleverFormPage[]
  settings?: {
    submitButtonLabel?: string
    successMessage?: string
    requireAuthentication?: boolean
  }
}

export type CleverFormsFieldConfig = Partial<Record<CleverFormFieldType, boolean>>

export type SubmissionHandlerArgs = {
  form: CleverFormDefinition
  data: Record<string, unknown>
  req: PayloadRequest
}

export type SubmissionGuardArgs = SubmissionHandlerArgs & {
  rawData: Record<string, unknown>
}

export type CleverFormsPluginOptions = {
  enabled?: boolean
  formsSlug?: string
  submissionsSlug?: string
  adminGroup?: string
  fields?: CleverFormsFieldConfig
  extendFormsCollection?: (collection: CollectionConfig) => CollectionConfig
  extendSubmissionsCollection?: (collection: CollectionConfig) => CollectionConfig
  beforeSubmission?: (args: SubmissionGuardArgs) => Promise<void> | void
  onSubmission?: (args: SubmissionHandlerArgs) => Promise<void> | void
}
