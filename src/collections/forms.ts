import type { CollectionConfig } from 'payload'
import { createFormFields } from '../fields/formFields.js'
import type { CleverFormDefinition, CleverFormsCustomFieldDefinition, CleverFormsFieldConfig } from '../types.js'
import { validateFormSchema } from '../runtime/schemaValidation.js'
import { cleverFormTemplates, cloneCleverFormTemplate } from '../templates/index.js'

export const createFormsCollection = (
  slug: string,
  adminGroup: string,
  fields?: CleverFormsFieldConfig,
  uploadCollections: string[] = [],
  customFieldTypes: CleverFormsCustomFieldDefinition[] = [],
): CollectionConfig => ({
  slug,
  admin: {
    group: adminGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'updatedAt'],
  },
  access: {
    read: ({ req }) => req.user ? true : { status: { equals: 'published' } },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (!data || operation !== 'create' || !data.templateKey) return data
        const template = cloneCleverFormTemplate(String(data.templateKey))
        if (!template) return data

        return {
          ...template,
          ...data,
          title: data.title || template.title,
          description: data.description || template.description,
          pages: Array.isArray(data.pages) && data.pages.length ? data.pages : template.pages,
          settings: {
            ...(template.settings ?? {}),
            ...(data.settings ?? {}),
          },
          salesforcePresetKey: data.salesforcePresetKey || template.salesforcePresetKey,
        }
      },
      ({ data }) => {
        if (data) validateFormSchema(
          data as unknown as CleverFormDefinition,
          { uploadCollections },
        )
        return data
      },
    ],
  },
  fields: [
    {
      name: 'templateKey',
      label: 'Start From Template',
      type: 'select',
      options: cleverFormTemplates.map(template => ({
        label: `${template.title} — ${template.description}`,
        value: template.key,
      })),
      admin: {
        description: 'Optional. Choose a pre-built form when creating a new CleverForm. The template is copied into the form and remains fully editable.',
      },
    },
    { name: 'salesforcePresetKey', type: 'text', admin: { hidden: true, readOnly: true } },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: ['draft', 'published', 'archived'], index: true },
    ...createFormFields(fields, uploadCollections, customFieldTypes),
    {
      name: 'settings', type: 'group', fields: [
        { name: 'submitButtonLabel', type: 'text', defaultValue: 'Submit', localized: true },
        {
          name: 'confirmationType',
          label: 'After Submission',
          type: 'select',
          defaultValue: 'message',
          options: [
            { label: 'Show confirmation message', value: 'message' },
            { label: 'Redirect to URL', value: 'redirect' },
          ],
        },
        { name: 'successMessage', type: 'textarea', defaultValue: 'Thank you. Your form has been submitted.', localized: true },
        {
          name: 'redirectURL',
          label: 'Confirmation Redirect URL',
          type: 'text',
          admin: { description: 'Used when After Submission is set to Redirect to URL. Relative paths and http/https URLs are supported.' },
        },
        { name: 'requireAuthentication', type: 'checkbox', defaultValue: false },
        {
          name: 'notifications',
          label: 'Email Notifications',
          type: 'array',
          admin: {
            description: 'Send one or more emails after a successful submission using Payload\'s configured email adapter. Templates support {{field_name}} and {{*}}.',
          },
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: true },
            { name: 'to', label: 'To', type: 'text', admin: { description: 'Comma-separated addresses. Submission tokens such as {{email}} are supported.' } },
            { name: 'replyTo', label: 'Reply-To', type: 'text', admin: { description: 'Optional. Submission tokens are supported.' } },
            { name: 'subject', type: 'text', defaultValue: 'New form submission' },
            { name: 'body', type: 'textarea', defaultValue: '{{*}}' },
          ],
        },
      ],
    },
  ],
  timestamps: true,
})
