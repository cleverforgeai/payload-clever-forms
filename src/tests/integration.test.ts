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

test('Clever Forms installs into Payload and validates real Local API writes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'clever-forms-'))
  const dbPath = join(directory, 'integration.db')

  const config = await buildConfig({
    secret: 'clever-forms-integration-test-secret',
    db: sqliteAdapter({ client: { url: `file:${dbPath}` } }),
    collections: [Users],
    plugins: [cleverForms({})],
  })

  const payload = await getPayload({ config })

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
          ],
        }],
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

    const submission = await payload.create({
      collection: 'clever-form-submissions',
      data: {
        form: form.id,
        data: { email: 'integration@example.org', injected: 'removed' },
      },
    })

    assert.equal(submission.status, 'submitted')
    assert.deepEqual(submission.data, { email: 'integration@example.org', role: 'member' })
    assert.ok(submission.submittedAt)

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
