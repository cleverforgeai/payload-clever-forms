import test from 'node:test'
import assert from 'node:assert/strict'
import { conditionMatches } from '../runtime/logic.js'
import { CleverFormsValidationError, validateSubmission } from '../runtime/validation.js'
import { CleverFormsSchemaError, validateFormSchema } from '../runtime/schemaValidation.js'
import { getFormDefaultValues } from '../runtime/defaults.js'
import { prepareNotificationEmails, renderNotificationTemplate } from '../runtime/email.js'
import { resolveConfirmationRedirect } from '../runtime/confirmation.js'
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
    'donation-form',
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


test('State and Country fields validate known location codes', () => {
  const locationForm: CleverFormDefinition = {
    id: 'locations',
    title: 'Locations',
    pages: [{
      fields: [
        { name: 'state', label: 'State', type: 'state', required: true },
        { name: 'country', label: 'Country', type: 'country', required: true },
        { name: 'note', label: 'Note', type: 'message', message: 'Display only' },
      ],
    }],
  }

  assert.deepEqual(validateSubmission(locationForm, { state: 'PA', country: 'US', note: 'forged' }), {
    state: 'PA',
    country: 'US',
  })

  assert.throws(
    () => validateSubmission(locationForm, { state: 'XX', country: 'US' }),
    CleverFormsValidationError,
  )
  assert.throws(
    () => validateSubmission(locationForm, { state: 'PA', country: 'XX' }),
    CleverFormsValidationError,
  )
})

test('confirmation redirects allow relative and http/https URLs only', () => {
  assert.equal(
    resolveConfirmationRedirect('/thank-you', 'https://example.org/donate'),
    'https://example.org/thank-you',
  )
  assert.equal(
    resolveConfirmationRedirect('https://example.net/thanks', 'https://example.org'),
    'https://example.net/thanks',
  )
  assert.equal(resolveConfirmationRedirect('javascript:alert(1)', 'https://example.org'), undefined)
})

test('notification templates render fields, wildcard output, recipients, and reply-to', () => {
  const emailForm: CleverFormDefinition = {
    id: 'email-form',
    title: 'Email Form',
    pages: [{ fields: [{ name: 'email', label: 'Email', type: 'email' }] }],
    settings: {
      notifications: [{
        enabled: true,
        to: 'team@example.org, {{email}}',
        replyTo: '{{email}}',
        subject: 'Submission from {{name}}',
        body: 'Name: {{name}}\n\n{{*}}',
      }],
    },
  }

  const emails = prepareNotificationEmails(emailForm, {
    email: 'person@example.org',
    name: 'Jane',
  })

  assert.equal(emails.length, 1)
  assert.deepEqual(emails[0].to, ['team@example.org', 'person@example.org'])
  assert.equal(emails[0].replyTo, 'person@example.org')
  assert.equal(emails[0].subject, 'Submission from Jane')
  assert.match(emails[0].text, /email: person@example.org/)
  assert.match(emails[0].text, /name: Jane/)
  assert.equal(renderNotificationTemplate('Hello {{name}}', { name: 'Jane' }), 'Hello Jane')
})

test('Donation Form template includes donation choices, payment placeholder, and donor information', async () => {
  const { getCleverFormTemplate } = await import('../templates/index.js')
  const template = getCleverFormTemplate('donation-form')
  assert.ok(template)

  const fields = template.pages.flatMap((page) => page.fields)
  const byName = new Map(fields.map((field) => [field.name, field]))

  assert.equal(byName.get('donation_frequency')?.required, true)
  assert.equal(byName.get('donation_amount')?.defaultValue, '25')
  assert.equal(byName.get('payment_form')?.type, 'message')
  assert.equal(byName.get('first_name')?.required, true)
  assert.equal(byName.get('last_name')?.required, true)
  assert.equal(byName.get('email')?.required, true)
  assert.equal(byName.get('state')?.type, 'state')
  assert.equal(byName.get('email_opt_in')?.type, 'checkbox')
  assert.equal(byName.get('sms_opt_in')?.type, 'radio')
})
