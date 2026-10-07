import type { Field } from 'payload'

export type CleverFormRelationshipOptions = {
  name: string
  formsSlug?: string
  label?: string
  hasMany?: boolean
  required?: boolean
  admin?: Record<string, unknown>
}

export const cleverFormRelationship = (
  options: CleverFormRelationshipOptions,
): Field => ({
  name: options.name,
  type: 'relationship',
  relationTo: (options.formsSlug ?? 'clever-forms') as any,
  label: options.label,
  hasMany: options.hasMany ?? false,
  required: options.required ?? false,
  admin: {
    description: 'Select an existing CleverForm.',
    ...(options.admin ?? {}),
  },
})
