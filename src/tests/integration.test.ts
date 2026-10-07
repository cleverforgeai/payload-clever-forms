import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { buildConfig, getPayload, type CollectionConfig } from 'payload'
import cleverForms from '../index.js'

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [],
}

const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  fields: [],
}

test('Clever Forms installs into Payload and validates real Local API writes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'clever-forms-'))
  const dbPath = join(directory, 'integration.db')

  const config = await buildConfig({
    secret: 'clever-forms-integration-test-secret',
    db: sqliteAdapter({ client: { url: `file:${dbPath}` } }),
    collections: [Users, Media],
    plugins: [cleverForms({ uploadCollections: ['media'] })],
  })

  const payload = await getPayload({ config })
  const sentEmails: Array<Record<string, unknown>> = []
  ;(payload as any).sendEmail = async (message: Record<string, unknown>) => {
    sentEmails.push(message)
    return {}
  }

  try {
    assert.ok(payload.collections['clever-forms'])
    assert.ok(payload.collections['clever-form-submissions'])

    const form = await payload.create({
      collection: 'clever-forms',
      overrideAccess: true,
      data: {
        title: 'Integration Form',
        status: 'published',
        pages: [{
          fields: [
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'role', label: 'Role', type: 'select', defaultValue: 'member', width: '50%', choices: [{ label: 'Member', value: 'member' }] },
            { name: 'state', label: 'State', type: 'state' },
            { name: 'country', label: 'Country', type: 'country' },
            { name: 'notice', label: 'Notice', type: 'message', message: 'Display only.' },
            {
              name: 'resume',
              label: 'Resume',
              type: 'upload',
              uploadCollection: 'media',
              mimeTypes: 'application/pdf',
              maxFileSize: 5000000,
            },
            {
              name: 'household',
              label: 'Household Member',
              type: 'repeater',
              minRows: 1,
              maxRows: 3,
              repeaterFields: [
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'relationship', label: 'Relationship', type: 'text' },
              ],
            },
          ],
        }],
        settings: {
          confirmationType: 'redirect',
          redirectURL: '/thank-you',
          notifications: [{
            enabled: true,
            to: '{{email}}',
            subject: 'Thanks {{email}}',
            body: 'Submission received. {{*}}',
          }],
        },
      },
    })

    const templated = await payload.create({
      collection: 'clever-forms',
      overrideAccess: true,
      data: {
        templateKey: 'contact-form',
        title: 'Website Contact',
        status: 'draft',
      },
    })

    assert.equal(templated.templateKey, 'contact-form')
    assert.equal(templated.salesforcePresetKey, 'contact-form')
    assert.ok(Array.isArray(templated.pages))
    assert.ok((templated.pages?.[0]?.fields?.length ?? 0) >= 4)
    assert.equal(templated.title, 'Website Contact')

    const donation = await payload.create({
      collection: 'clever-forms',
      overrideAccess: true,
      data: {
        templateKey: 'donation-form',
        title: 'Xiente Donation',
        status: 'draft',
      },
    })

    assert.equal(donation.templateKey, 'donation-form')
    assert.ok((donation.pages?.length ?? 0) >= 2)
    assert.ok(donation.pages?.flatMap((page: any) => page.fields ?? []).some((field: any) => field.type === 'state'))

    const submission = await payload.create({
      collection: 'clever-form-submissions',
      data: {
        form: form.id,
        data: {
          email: 'integration@example.org',
          state: 'PA',
          country: 'US',
          notice: 'ignored',
          injected: 'removed',
          household: [{ name: 'Alex', relationship: 'Child' }],
        },
      },
    })

    assert.equal(submission.status, 'submitted')
    assert.deepEqual(submission.data, {
      email: 'integration@example.org',
      role: 'member',
      state: 'PA',
      country: 'US',
      household: [{ name: 'Alex', relationship: 'Child' }],
    })
    assert.ok(submission.submittedAt)
    assert.equal(sentEmails.length, 1)
    assert.deepEqual(sentEmails[0].to, ['integration@example.org'])
    assert.equal(sentEmails[0].subject, 'Thanks integration@example.org')
    assert.equal(submission.submitterEmail, 'integration@example.org')
    assert.match(String(submission.submissionSummary), /Email: integration@example.org/)
    assert.match(String(submission.submissionSummary), /State: PA/)

    await assert.rejects(() => payload.create({
      collection: 'clever-form-submissions',
      data: { form: form.id, data: { email: 'integration@example.org', role: 'administrator' } },
    }))

    await assert.rejects(() => payload.create({
      collection: 'clever-forms',
      overrideAccess: true,
      data: {
        title: 'Invalid Form',
        status: 'draft',
        pages: [{ fields: [
          { name: 'duplicate', label: 'One', type: 'text' },
          { name: 'duplicate', label: 'Two', type: 'text' },
        ] }],
      },
    }))
  } finally {
    await payload.destroy()
    await rm(directory, { recursive: true, force: true })
  }
})
