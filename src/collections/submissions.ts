import type { CollectionConfig } from 'payload'
import type { CleverFormsPluginOptions } from '../types.js'
import { createAfterSubmissionHook, createSubmissionHook } from '../runtime/submissionHook.js'

export const createSubmissionsCollection = (
  slug: string,
  formsSlug: string,
  adminGroup: string,
  options: CleverFormsPluginOptions,
): CollectionConfig => ({
  slug,
  admin: {
    group: adminGroup,
    defaultColumns: ['form', 'submitterEmail', 'status', 'submittedAt'],
    description: 'Review readable submission details here. Raw JSON remains available for troubleshooting and integrations.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [createSubmissionHook(formsSlug, options)],
    afterChange: [createAfterSubmissionHook(formsSlug, options)],
  },
  fields: [
    { name: 'form', type: 'relationship', relationTo: formsSlug, required: true, index: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'submitted', options: ['submitted'], admin: { readOnly: true } },
    {
      name: 'submissionSummary',
      label: 'Submission Details',
      type: 'textarea',
      admin: {
        readOnly: true,
        description: 'Human-readable values generated from the form field labels at submission time.',
      },
    },
    {
      name: 'data',
      label: 'Raw Submission Data',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
        description: 'Canonical validated submission data used by integrations and developers.',
      },
    },
    { name: 'submittedAt', type: 'date', required: true, admin: { readOnly: true } },
    { name: 'submitterEmail', type: 'email', index: true, admin: { readOnly: true } },
    { name: 'sourceURL', type: 'text', admin: { readOnly: true } },
  ],
  timestamps: true,
})
