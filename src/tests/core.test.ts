import test from 'node:test'
import assert from 'node:assert/strict'
import { conditionMatches } from '../runtime/logic.js'
import { CleverFormsValidationError, validateSubmission } from '../runtime/validation.js'
import { CleverFormsSchemaError, validateFormSchema } from '../runtime/schemaValidation.js'
import { getFormDefaultValues } from '../runtime/defaults.js'
import type { CleverFormDefinition } from '../types.js'

const form: CleverFormDefinition = {
  id: 'test',
  title: 'Test Form',
  status: 'published',
  pages: [{
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'role', label: 'Role', type: 'select', choices: [{ label: 'Member', value: 'member' }] },
      { name: 'detail', label: 'Detail', type: 'text', required: true, conditionalLogic: { enabled: true, field: 'role', operator: 'equals', value: 'member' } },
    ],
  }],
}

test('conditional logic evaluates expected values', () => {
  assert.equal(conditionMatches({ enabled: true, field: 'status', operator: 'equals', value: 'yes' }, { status: 'yes' }), true)
  assert.equal(conditionMatches({ enabled: true, field: 'status', operator: 'equals', value: 'yes' }, { status: 'no' }), false)
})

test('validation accepts valid input and strips unknown keys', () => {
  const output = validateSubmission(form, { email: 'person@example.org', role: 'member', detail: 'hello', injected: 'nope' })
  assert.deepEqual(output, { email: 'person@example.org', role: 'member', detail: 'hello' })
})

test('validation rejects forged choices', () => {
  assert.throws(
    () => validateSubmission(form, { email: 'person@example.org', role: 'admin' }),
    CleverFormsValidationError,
  )
})

test('schema validation accepts a coherent form', () => {
  assert.doesNotThrow(() => validateFormSchema(form))
})

test('schema validation rejects duplicate names and missing references', () => {
  const invalid: CleverFormDefinition = {
    id: 'invalid',
    title: 'Invalid',
    pages: [{ fields: [
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'email', label: 'Duplicate', type: 'text' },
      { name: 'detail', label: 'Detail', type: 'text', conditionalLogic: { enabled: true, field: 'missing', operator: 'equals', value: 'yes' } },
    ] }],
  }
  assert.throws(() => validateFormSchema(invalid), CleverFormsSchemaError)
})

test('schema validation rejects choice fields without valid unique choices', () => {
  const invalid: CleverFormDefinition = {
    id: 'choices',
    title: 'Choices',
    pages: [{ fields: [{
      name: 'role', label: 'Role', type: 'select', choices: [
        { label: 'One', value: 'same' },
        { label: 'Two', value: 'same' },
      ],
    }] }],
  }
  assert.throws(() => validateFormSchema(invalid), CleverFormsSchemaError)
})


test('pre-built template catalog includes administrator starter forms without third-party service references', async () => {
  const { cleverFormTemplates } = await import('../templates/index.js')
  const keys = cleverFormTemplates.map(template => template.key)

  for (const key of [
    'newsletter-signup',
    'contact-form',
    'quote-request',
    'book-appointment',
    'bug-report',
    'sponsorship-request',
    'photo-media-consent',
    'free-consultation',
    'feedback',
    'customer-support',
    'support-request',
    'volunteer-application',
  ]) {
    assert.ok(keys.includes(key), `missing template ${key}`)
  }

  for (const template of cleverFormTemplates) {
    assert.ok(template.pages.length > 0)
    assert.ok(template.pages.every(page => page.fields.length > 0))
    assert.equal(JSON.stringify(template).toLowerCase().includes('splitforms'), false)
    assert.equal(JSON.stringify(template).toLowerCase().includes('formkoi'), false)
    assert.equal(JSON.stringify(template).toLowerCase().includes('access_key'), false)
  }
})


test('field defaults are normalized and merged across pages', () => {
  const defaultsForm: CleverFormDefinition = {
    id: 'defaults',
    title: 'Defaults',
    pages: [{
      fields: [
        { name: 'name', label: 'Name', type: 'text', defaultValue: 'Jane' },
        { name: 'count', label: 'Count', type: 'number', defaultValue: '3' },
        { name: 'consent', label: 'Consent', type: 'checkbox', defaultValue: 'true' },
        { name: 'topics', label: 'Topics', type: 'multiselect', defaultValue: 'one, two', choices: [
          { label: 'One', value: 'one' },
          { label: 'Two', value: 'two' },
        ] },
      ],
    }],
  }

  assert.deepEqual(getFormDefaultValues(defaultsForm), {
    name: 'Jane',
    count: 3,
    consent: true,
    topics: ['one', 'two'],
  })
})

test('server validation applies configured defaults when a value is omitted', () => {
  const defaultsForm: CleverFormDefinition = {
    id: 'defaults-submit',
    title: 'Defaults Submit',
    pages: [{
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true, defaultValue: 'Jane' },
        { name: 'count', label: 'Count', type: 'number', defaultValue: '3' },
      ],
    }],
  }

  assert.deepEqual(validateSubmission(defaultsForm, {}), { name: 'Jane', count: 3 })
})
