import type { CollectionConfig, PayloadRequest } from 'payload'

export type CleverFormFieldType =
  | 'text' | 'textarea' | 'email' | 'number' | 'select' | 'radio'
  | 'checkbox' | 'multiselect' | 'date' | 'datetime' | 'time' | 'url' | 'phone'
  | 'range' | 'state' | 'country' | 'upload' | 'repeater'
  | 'heading' | 'paragraph' | 'message'

export type CleverFormFieldTypeName = CleverFormFieldType | (string & Record<never, never>)

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
  type: CleverFormFieldTypeName
  description?: string
  placeholder?: string
  required?: boolean
  defaultValue?: string | number | boolean | string[]
  width?: string
  message?: string
  uploadCollection?: string
  mimeTypes?: string
  maxFileSize?: number
  multiple?: boolean
  min?: number
  max?: number
  step?: number
  choices?: CleverFormChoice[]
  fields?: CleverFormField[]
  minRows?: number
  maxRows?: number
  conditionalLogic?: CleverFormCondition
}

export type CleverFormPage = {
  title?: string
  description?: string
  fields: CleverFormField[]
}

export type CleverFormNotification = {
  enabled?: boolean
  to?: string
  replyTo?: string
  subject?: string
  body?: string
}

export type CleverFormsPreparedEmail = {
  to: string[]
  replyTo?: string
  subject: string
  text: string
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
    confirmationType?: 'message' | 'redirect'
    successMessage?: string
    redirectURL?: string
    requireAuthentication?: boolean
    notifications?: CleverFormNotification[]
  }
}

export type CleverFormsFieldConfig = Partial<Record<CleverFormFieldType, boolean>>

export type CleverFormFieldGroup = {
  key: string
  label: string
  description?: string
  fields: CleverFormField[]
}

export type CleverFormsCustomFieldDefinition = {
  type: string
  label: string
  validate?: (args: {
    field: CleverFormField
    value: unknown
    input: Record<string, unknown>
  }) => string | void
}

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
  uploadCollections?: string[]
  customFieldTypes?: CleverFormsCustomFieldDefinition[]
  defaultToEmail?: string
  emailFailureMode?: 'log' | 'throw'
  beforeEmail?: (
    email: CleverFormsPreparedEmail,
    args: SubmissionHandlerArgs,
  ) => Promise<CleverFormsPreparedEmail | void> | CleverFormsPreparedEmail | void
  extendFormsCollection?: (collection: CollectionConfig) => CollectionConfig
  extendSubmissionsCollection?: (collection: CollectionConfig) => CollectionConfig
  beforeSubmission?: (args: SubmissionGuardArgs) => Promise<void> | void
  onSubmission?: (args: SubmissionHandlerArgs) => Promise<void> | void
}
