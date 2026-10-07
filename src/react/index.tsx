'use client'

import React, { type FormEvent, useMemo, useState } from 'react'
import type { CleverFormDefinition, CleverFormField } from '../types.js'
import { conditionMatches } from '../runtime/logic.js'
import { createCleverFormsClient } from '../runtime/client.js'
import { getFormDefaultValues } from '../runtime/defaults.js'
import { COUNTRIES, US_STATES } from '../runtime/locations.js'
import { resolveConfirmationRedirect } from '../runtime/confirmation.js'

export type CleverFormProps = {
  form: CleverFormDefinition
  apiURL?: string
  submissionsSlug?: string
  className?: string
  initialValues?: Record<string, unknown>
  onSuccess?: (result: unknown) => void
  onError?: (error: Error) => void
}

const scalar = (value: unknown): string | number =>
  typeof value === 'string' || typeof value === 'number' ? value : ''

const Field = ({ field, value, onChange }: { field: CleverFormField; value: unknown; onChange: (value: unknown) => void }) => {
  if (field.type === 'heading') return <h3>{field.label}</h3>
  if (field.type === 'paragraph') return <p>{field.description ?? field.label}</p>
  if (field.type === 'message') return <div role="note">{field.message ?? field.description ?? field.label}</div>

  if (field.type === 'textarea') return <textarea id={field.name} name={field.name} value={scalar(value)} placeholder={field.placeholder} required={field.required} onChange={(e) => onChange(e.currentTarget.value)} />

  if (field.type === 'select') {
    return <select id={field.name} name={field.name} value={scalar(value)} required={field.required} onChange={(e) => onChange(e.currentTarget.value)}><option value="">Select...</option>{field.choices?.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select>
  }

  if (field.type === 'state' || field.type === 'country') {
    const options = field.type === 'state' ? US_STATES : COUNTRIES
    return <select id={field.name} name={field.name} value={scalar(value)} required={field.required} onChange={(e) => onChange(e.currentTarget.value)}><option value="">Select...</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
  }

  if (field.type === 'radio') return <div>{field.choices?.map((choice) => <label key={choice.value}><input type="radio" name={field.name} value={choice.value} checked={value === choice.value} required={field.required} onChange={() => onChange(choice.value)} />{choice.label}</label>)}</div>
  if (field.type === 'checkbox' && field.choices?.length) {
    const values = Array.isArray(value) ? value.map(String) : []
    return <div>{field.choices.map((choice) => <label key={choice.value}><input type="checkbox" name={field.name} value={choice.value} checked={values.includes(choice.value)} onChange={(e) => onChange(e.currentTarget.checked ? [...values, choice.value] : values.filter((item) => item !== choice.value))} />{choice.label}</label>)}</div>
  }
  if (field.type === 'checkbox') return <input id={field.name} type="checkbox" name={field.name} checked={Boolean(value)} required={field.required} onChange={(e) => onChange(e.currentTarget.checked)} />
  if (field.type === 'multiselect') return <select id={field.name} multiple name={field.name} value={Array.isArray(value) ? value.map(String) : []} required={field.required} onChange={(e) => onChange(Array.from(e.currentTarget.selectedOptions).map((option) => option.value))}>{field.choices?.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select>
  return <input id={field.name} type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} name={field.name} value={scalar(value)} placeholder={field.placeholder} required={field.required} onChange={(e) => onChange(field.type === 'number' ? e.currentTarget.valueAsNumber : e.currentTarget.value)} />
}

export const CleverForm = ({ form, apiURL, submissionsSlug, className, initialValues = {}, onSuccess, onError }: CleverFormProps) => {
  const pages = useMemo(() => form.pages ?? [], [form.pages])
  const [pageIndex, setPageIndex] = useState(0)
  const [values, setValues] = useState<Record<string, unknown>>(() => ({
    ...getFormDefaultValues(form),
    ...initialValues,
  }))
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>()

  const page = pages[pageIndex]
  if (!page) return null

  const visibleFields = page.fields.filter((field) => conditionMatches(field.conditionalLogic, values))

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pageIndex < pages.length - 1) {
      setPageIndex((current) => current + 1)
      return
    }

    setSubmitting(true)
    setError(undefined)
    try {
      const result = await createCleverFormsClient({ baseURL: apiURL, submissionsSlug }).submit({
        form: form.id,
        data: values,
        sourceURL: typeof window !== 'undefined' ? window.location.href : undefined,
      })
      onSuccess?.(result)

      if (form.settings?.confirmationType === 'redirect' && typeof window !== 'undefined') {
        const redirect = resolveConfirmationRedirect(form.settings.redirectURL, window.location.href)
        if (redirect) {
          window.location.assign(redirect)
          return
        }
      }

      setSuccess(true)
    } catch (cause) {
      const err = cause instanceof Error ? cause : new Error('Form submission failed')
      setError(err.message)
      onError?.(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) return <div role="status" className={className}>{form.settings?.successMessage ?? 'Thank you. Your form has been submitted.'}</div>

  return <form className={className} onSubmit={submit}>
    {page.title ? <h2>{page.title}</h2> : null}
    {page.description ? <p>{page.description}</p> : null}
    {visibleFields.map((field) => <div key={field.name} style={field.width ? { width: field.width } : undefined}>
      {!['heading', 'paragraph', 'message', 'radio'].includes(field.type) ? <label htmlFor={field.name}>{field.label}</label> : null}
      {field.type === 'radio' ? <div>{field.label}</div> : null}
      {field.description && !['paragraph', 'message'].includes(field.type) ? <p>{field.description}</p> : null}
      <Field field={field} value={values[field.name]} onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))} />
    </div>)}
    {error ? <p role="alert">{error}</p> : null}
    <div>
      {pageIndex > 0 ? <button type="button" onClick={() => setPageIndex((current) => current - 1)}>Previous</button> : null}
      <button type="submit" disabled={submitting}>{pageIndex < pages.length - 1 ? 'Next' : submitting ? 'Submitting...' : form.settings?.submitButtonLabel ?? 'Submit'}</button>
    </div>
  </form>
}

export default CleverForm
