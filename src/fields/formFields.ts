import type { Field } from 'payload'
import type { CleverFormsFieldConfig } from '../types.js'

const defaultEnabled = {
  text: true, textarea: true, email: true, number: true, select: true,
  radio: true, checkbox: true, multiselect: true, date: true,
  datetime: true, time: true, url: true, phone: true, range: true,
  state: true, country: true, heading: true, paragraph: true, message: true,
  upload: false,
} as const

export const createFormFields = (
  config: CleverFormsFieldConfig = {},
  uploadCollections: string[] = [],
): Field[] => {
  const enabled = {
    ...defaultEnabled,
    ...(uploadCollections.length ? { upload: true } : {}),
    ...config,
  }
  const typeOptions = Object.entries(enabled)
    .filter(([, value]) => value !== false)
    .map(([value]) => ({ label: value, value }))

  const typeIs = (...types: string[]) => (_data: unknown, siblingData: any) =>
    types.includes(String(siblingData?.type ?? ''))

  const inputTypes = ['text', 'textarea', 'email', 'number', 'select', 'radio', 'checkbox', 'multiselect', 'date', 'datetime', 'time', 'url', 'phone', 'range', 'state', 'country', 'upload']
  const placeholderTypes = ['text', 'textarea', 'email', 'number', 'url', 'phone']
  const choiceTypes = ['select', 'radio', 'checkbox', 'multiselect']
  const numericTypes = ['number', 'range']

  const builderFields: Field[] = [
    { name: 'name', type: 'text', required: true, admin: { description: 'Machine-readable field key. Use letters, numbers, underscores, and hyphens.' } },
    { name: 'label', type: 'text', required: true, localized: true },
    { name: 'type', type: 'select', required: true, options: typeOptions },
    { name: 'description', type: 'textarea', localized: true, admin: { condition: typeIs(...inputTypes) } },
    {
      name: 'message',
      label: 'Message Content',
      type: 'textarea',
      localized: true,
      admin: {
        condition: typeIs('message'),
        description: 'Used by the Message field type to display non-input content inside the form.',
      },
    },
    { name: 'placeholder', type: 'text', localized: true, admin: { condition: typeIs(...placeholderTypes) } },
    {
      name: 'defaultValue',
      label: 'Default Value',
      type: 'text',
      admin: {
        condition: typeIs(...inputTypes.filter((type) => type !== 'upload')),
        description: 'Optional initial value shown before the user enters a response. Numeric and checkbox values are normalized by the runtime.',
      },
    },
    {
      name: 'width',
      label: 'Field Width',
      type: 'text',
      admin: {
        description: 'Optional CSS width such as 100%, 50%, 33.333%, or 24rem.',
      },
    },
    { name: 'required', type: 'checkbox', defaultValue: false, admin: { condition: typeIs(...inputTypes) } },
    {
      name: 'min',
      label: 'Minimum',
      type: 'number',
      admin: { condition: typeIs(...numericTypes) },
    },
    {
      name: 'max',
      label: 'Maximum',
      type: 'number',
      admin: { condition: typeIs(...numericTypes) },
    },
    {
      name: 'step',
      label: 'Step',
      type: 'number',
      admin: { condition: typeIs(...numericTypes), description: 'Optional increment for Number and Range fields.' },
    },
    {
      name: 'uploadCollection',
      label: 'Upload Collection',
      type: 'select',
      options: uploadCollections.map((value) => ({ label: value, value })),
      admin: {
        condition: typeIs('upload'),
        description: 'Required for Upload fields. The target collection must be upload-enabled in Payload.',
      },
    },
    {
      name: 'mimeTypes',
      label: 'Allowed MIME Types',
      type: 'text',
      admin: {
        condition: typeIs('upload'),
        description: 'Optional comma-separated MIME types such as image/*, application/pdf.',
      },
    },
    {
      name: 'maxFileSize',
      label: 'Maximum File Size (bytes)',
      type: 'number',
      min: 1,
      admin: {
        condition: typeIs('upload'),
        description: 'Optional per-file limit in bytes.',
      },
    },
    {
      name: 'multiple',
      label: 'Allow Multiple Files',
      type: 'checkbox',
      defaultValue: false,
      admin: { condition: typeIs('upload') },
    },
    {
      name: 'choices', type: 'array',
      admin: { condition: typeIs(...choiceTypes) },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    {
      name: 'conditionalLogic', type: 'group', admin: { condition: typeIs(...inputTypes) }, fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        { name: 'field', type: 'text' },
        { name: 'operator', type: 'select', defaultValue: 'equals', options: ['equals', 'notEquals', 'contains', 'isEmpty', 'isNotEmpty'] },
        { name: 'value', type: 'text' },
      ],
    },
  ]

  return [{
    name: 'pages', type: 'array', required: true,
    admin: { description: 'Drag to reorder pages. Each page contains reorderable fields.' },
    fields: [
      { name: 'title', type: 'text', localized: true },
      { name: 'description', type: 'textarea', localized: true },
      { name: 'fields', type: 'array', required: true, fields: builderFields },
    ],
  }]
}
