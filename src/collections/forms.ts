import type { CollectionConfig } from 'payload'
import { createFormFields } from '../fields/formFields.js'
import type { CleverFormDefinition, CleverFormsFieldConfig } from '../types.js'
import { validateFormSchema } from '../runtime/schemaValidation.js'
import { cleverFormTemplates, cloneCleverFormTemplate } from '../templates/index.js'

export const createFormsCollection = (
  slug: string,
  adminGroup: string,
  fields?: CleverFormsFieldConfig,
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
        if (data) validateFormSchema(data as unknown as CleverFormDefinition)
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
    ...createFormFields(fields),
    {
      name: 'settings', type: 'group', fields: [
        { name: 'submitButtonLabel', type: 'text', defaultValue: 'Submit', localized: true },
        { name: 'successMessage', type: 'textarea', defaultValue: 'Thank you. Your form has been submitted.', localized: true },
        { name: 'requireAuthentication', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
  timestamps: true,
})
