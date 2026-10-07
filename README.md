# Clever Forms for Payload CMS

**Clever Forms** is a Payload-native form builder and form runtime by CleverForge. The public Core is licensed under **Apache-2.0** and is designed to provide a genuinely useful foundation for Payload CMS projects while allowing advanced CleverForge products to remain separate commercial modules.

> **Status:** active pre-1.0 development. APIs may change before the first stable release.

## What Clever Forms is

Clever Forms is intended to grow from simple contact and registration forms into a broader workflow platform for applications, intake, surveys, assessments, enrollment, onboarding, authenticated forms, document workflows, CRM-connected processes, payments, analytics, and AI-assisted operations.

The public package focuses on the reusable Core. Premium products such as Forms Pro, Clever AI, Clever Connect, Communications, Analytics, Payments, proprietary connectors, and CleverForge hosted services are separate works and are **not** licensed by this repository merely because they interoperate with Core.

## Core capabilities

The current public Core includes:

### Form authoring

- Payload `definePlugin` integration
- native Forms and Submissions collections
- multi-page forms with reorderable pages and fields
- administrator-selectable starter templates
- editable form title, description, submit-button label, and success message
- draft, published, and archived form states
- optional per-form authentication requirement
- localized form content through Payload localization

### Field types

| Field type | Current Core |
| --- | :---: |
| Text | ✓ |
| Textarea | ✓ |
| Email | ✓ |
| Number | ✓ |
| Select | ✓ |
| Radio | ✓ |
| Checkbox | ✓ |
| Multiselect | ✓ |
| Date | ✓ |
| Date & Time | ✓ |
| Time | ✓ |
| URL | ✓ |
| Phone | ✓ |
| Range | ✓ |
| Heading | ✓ |
| Paragraph | ✓ |
| State | ✓ |
| Country | ✓ |
| Message/display content | ✓ |
| Upload | ✓ basic Payload-native uploads |
| Repeater | ✓ basic one-level repeaters |
| Payment | Separate CleverPayments product |

Choice fields support configurable labels and values. Number and Range fields support minimum, maximum, and step metadata. Field names are schema-validated for uniqueness and allowed characters.

The Payload Admin builder now hides field settings that do not apply to the selected field type—for example, Upload settings only appear for Upload fields and Choices only appear for choice fields.

Basic Repeaters support one level of nested fields with minimum and maximum row limits. Nested repeaters and Upload fields inside repeaters are intentionally excluded from Core's first repeater implementation.

### Conditional logic

Core supports field visibility rules with these operators:

- equals
- not equals
- contains
- is empty
- is not empty

Conditional rules are evaluated in both the runtime and server-side submission validation so hidden fields do not become a validation bypass.

### Validation and security

- required-field validation
- email-format validation
- numeric validation
- choice allow-list enforcement
- duplicate field-name detection
- duplicate choice-value detection
- invalid conditional-reference detection
- form publication checks
- authenticated-form enforcement
- protected submission reads
- server-side validation as the security boundary rather than browser validation

### Runtime and frontend

- bundled React renderer for Next.js/Payload applications
- multi-page Previous / Next navigation
- runtime conditional visibility
- State and Country select rendering
- display-only Message fields
- custom confirmation messages
- safe confirmation redirects to relative or http/https URLs
- client submission helper
- configurable API base URL and submission collection slug
- success and error callbacks
- initial values support
- English, Spanish, and French runtime translations

### Submissions

Each submission stores:

- the related CleverForm
- validated submission data
- a human-readable Submission Details summary
- submission timestamp
- detected submitter email when the form contains an email field
- optional source URL
- submission status

The Submission Admin list includes the form, submitter email, status, and submission time. The edit view presents readable field labels and values before the canonical raw JSON, so staff do not need to interpret raw submission objects during normal review.

The Forms and Submissions collections can both be extended through plugin callbacks.

### Custom fields and reusable field groups

Custom field types can be registered through `customFieldTypes` with server-side validators, while the React renderer accepts a `renderCustomField` callback for application-specific UI.

Reusable field structures can be defined with `defineCleverFormFieldGroup()` and copied into forms with `insertCleverFormFieldGroup()`. This is intentionally copy-on-insert: changing the source group later does not silently mutate existing or published forms.

### Email notifications

Forms can define multiple post-submission email notifications using Payload's configured email adapter.

- multiple recipients
- configurable Reply-To
- dynamic subject and body templates
- field tokens such as `{{email}}`
- wildcard `{{*}}` submission summaries
- plugin-level `defaultToEmail` fallback
- plugin-level `beforeEmail` transformation hook
- configurable log-or-throw behavior for delivery failures

Basic form notifications are part of Core. Broader campaign, SMS, workflow, and provider automation remain separate CleverForge products.

### Templates and integration metadata

Core currently includes 13 editable starter templates:

- Newsletter Signup
- Contact Form
- Quote Request
- Book an Appointment
- Bug Report
- Sponsorship Request
- Photo / Media Consent
- Free Consultation
- Feedback
- Customer Support
- Support Request
- Volunteer Application
- Donation Form

Templates are provider-neutral. They may expose optional metadata such as a CleverConnect Salesforce preset key, but CleverForms does not require Salesforce or CleverConnect.

The Donation Form template includes donation frequency and amount choices, conditional organization and dedication details, donor contact/address fields, and communications preferences. It intentionally does **not** collect card or bank credentials in Core. The payment area is a secure placeholder for a separate CleverPayments integration.

## Installation

The intended package name is:

```bash
npm install @cleverforge/payload-clever-forms
```

or:

```bash
pnpm add @cleverforge/payload-clever-forms
```

The package is not considered production-stable until a public release is explicitly published.

## Payload configuration

```ts
import { buildConfig } from 'payload'
import { cleverForms } from '@cleverforge/payload-clever-forms'

export default buildConfig({
  plugins: [
    cleverForms({
      enabled: true,
    }),
  ],
})
```

Default collection slugs are `clever-forms` and `clever-form-submissions`. They can be changed through plugin options.

### Reusing a CleverForm from another collection

Use the exported relationship helper when a Page, Event, Program, Campaign, or other Payload collection should select one or more CleverForms:

```ts
import { cleverFormRelationship } from '@cleverforge/payload-clever-forms'

export const Programs = {
  slug: 'programs',
  fields: [
    cleverFormRelationship({
      name: 'registrationForm',
      required: false,
    }),
  ],
}
```

Set `hasMany: true` when the document may reference multiple forms.

### Upload fields

Upload fields are disabled unless one or more Payload upload-enabled collections are explicitly allow-listed:

```ts
cleverForms({
  uploadCollections: ['media', 'documents'],
})
```

An Upload field can then configure:

- target upload collection
- allowed MIME types such as `image/*, application/pdf`
- maximum file size in bytes
- single or multiple files
- required / optional behavior

The bundled React runtime uploads selected files to the configured Payload upload collection first, then stores the resulting Payload document ID or IDs in the CleverForms submission. The server re-validates file references, access, MIME type, file size, and multiplicity before accepting the submission.

For private or regulated documents, use a separate secure storage design with tighter Payload access controls. Signed downloads, content inspection, retention rules, and private-storage workflows remain CleverForms PRO concerns.

## Pre-built templates

CleverForms includes optional administrator starter templates. When creating a form in Payload Admin, choose **Start From Template** or leave it blank to build from scratch.

Included templates:

- Newsletter Signup
- Contact Form
- Quote Request
- Book an Appointment
- Bug Report
- Sponsorship Request
- Photo / Media Consent
- Free Consultation
- Feedback
- Customer Support
- Support Request
- Volunteer Application

The selected template is copied into the new form. Pages, labels, choices, required settings, descriptions, success messages, and submit-button labels remain fully editable after creation.

Templates are provider-neutral and contain no third-party submission URLs, access keys, scripts, credentials, analytics snippets, or external-service attribution.

Templates can also expose optional integration metadata such as a matching CleverConnect Salesforce preset key. CleverForms itself remains independent of Salesforce and CleverConnect.

## React renderer

```tsx
import { CleverForm } from '@cleverforge/payload-clever-forms/react'

export function ContactPage({ form }) {
  return <CleverForm form={form} />
}
```

The renderer is intentionally lightweight so applications can evolve toward their own design systems instead of being permanently locked to a CleverForge theme.

## Architecture

```text
Payload CMS
    |
    +-- Clever Forms Core (Apache-2.0)
    |     +-- Forms
    |     +-- Pages and Fields
    |     +-- Conditional Logic
    |     +-- Validation
    |     +-- Submissions
    |     +-- React Runtime
    |     +-- Localization
    |     +-- Extension APIs
    |
    +-- Optional commercial CleverForge products
          +-- Forms Pro
          +-- Clever AI
          +-- Clever Connect
          +-- Clever Communications
          +-- Clever Analytics
          +-- Clever Payments
```

Core is provider-neutral. Advanced capabilities should connect through clear interfaces rather than embedding Salesforce, AI, payment, email, or storage credentials into the public form engine.

## Security model

Public forms receive untrusted input, so Clever Forms does not treat browser validation as a security boundary. Core validates submissions on the Payload server, verifies configured choice values, protects submission reads, and enforces form publication/authentication requirements.

The commercial roadmap adds controls such as secure Save & Continue, private file storage, content-signature inspection, signed downloads, electronic signatures, rate limiting, bot protection, webhook verification, and integration credential isolation.

Security vulnerabilities should not be disclosed with exploit details in public issues. See [SECURITY.md](SECURITY.md).

## Forms Pro

Forms Pro is planned for advanced workflows that go beyond the free Core. Potential capabilities include secure Save & Continue, private uploads, signatures, branded PDF generation, advanced conditional rules, calculations, branching, workflow routing, email automation, and webhooks.

These capabilities may be distributed as commercial packages and/or backed by CleverForge services. Their source code is not automatically covered by the Apache-2.0 license used for Core.

## Clever AI

Clever AI is planned around a **Bring Your Own AI Provider** model. Potential providers include OpenAI, Anthropic, Google Gemini, OpenRouter, Mistral, Groq, Azure OpenAI, AWS Bedrock, Ollama, LM Studio, and OpenAI-compatible endpoints.

Potential AI capabilities include natural-language form generation, translation, document extraction, submission summaries, classification, missing-information detection, and workflow routing. API credentials must remain server-side, and sensitive submission data should never be sent to an AI provider silently.

## Clever Connect

Clever Connect is the planned integration layer. Salesforce is expected to be an early major connector, followed by systems such as HubSpot, Microsoft Dynamics, Airtable, generic REST APIs, and webhooks.

A Salesforce connector may support create/update/upsert operations, configurable object and field mappings, relationship mapping, duplicate handling, sandbox/production environments, retries, and integration logs. Long-running synchronization should use background jobs rather than block a form submission.

## Communications, Analytics, and Payments

Clever Communications may provide provider-neutral email and SMS automation using services such as SMTP, Resend, SendGrid, Mailgun, Postmark, Amazon SES, and Twilio.

Clever Analytics may provide views, starts, submissions, conversion, abandonment, completion time, field drop-off, workflow activity, and integration health.

Clever Payments may provide payment workflows through providers such as Stripe, Square, and PayPal for donations, registrations, memberships, application fees, and other transactions.

## MCP and AI agents

Future authorized MCP tools could expose operations such as `list_forms`, `get_form`, `get_form_schema`, `create_form`, `search_submissions`, `get_submission`, and `get_form_metrics`. Any agent access must respect Payload access control and configured authorization policies.

## Free vs commercial direction

| Capability | Core | Commercial |
| --- | :---: | :---: |
| Form builder | ✓ | |
| Multi-page forms | ✓ | |
| Basic conditional logic | ✓ | |
| React renderer | ✓ | |
| Server-side validation | ✓ | |
| Submission storage | ✓ | |
| Localization | ✓ | |
| Extension APIs | ✓ | |
| Save & Continue | | ✓ |
| Secure uploads | | ✓ |
| Signatures | | ✓ |
| PDF generation | | ✓ |
| Advanced conditional logic | | ✓ |
| Basic submission email notifications | ✓ | |
| Advanced email/SMS automation | | ✓ |
| Webhooks | | ✓ |
| Salesforce and CRM connectors | | ✓ |
| AI features | | ✓ |
| Advanced analytics | | ✓ |
| Payments | | ✓ |
| Advanced MCP tools | | ✓ |

The goal is for Core to remain useful for real Payload websites without requiring a subscription.

## Comparison with Payload's official Form Builder

CleverForms is intentionally Payload-native, but it is a separate product from Payload's official `@payloadcms/plugin-form-builder`.

The comparison below reflects the current CleverForms Core implementation and the capabilities documented by Payload for the official Form Builder plugin. Official Payload behavior should be re-checked before every stable CleverForms release.

| Capability | CleverForms Core | Official Payload Form Builder |
| --- | --- | --- |
| Dynamic form authoring in Payload Admin | ✓ | ✓ |
| Forms collection | ✓ | ✓ |
| Submissions collection | ✓ | ✓ |
| Text / textarea / email / number | ✓ | ✓ |
| Select / radio / checkbox | ✓ | ✓ |
| Date | ✓ | ✓ |
| Multiselect | ✓ | Not listed as a default field |
| Heading / paragraph display fields | ✓ | Message field instead |
| State field | ✓ | ✓ |
| Country field | ✓ | ✓ |
| Message/content field | ✓ plain-text display | ✓ rich text |
| Native multi-page page model | ✓ | Not documented as a dedicated page primitive |
| General field conditional visibility | ✓ basic rules | Not documented as a general built-in field-visibility feature |
| Field default values | ✓ | ✓ |
| Field width/layout setting | ✓ width metadata | ✓ |
| Custom confirmation message | ✓ | ✓ |
| Redirect after submission | ✓ URL | ✓ URL / configured relationship |
| Dynamic submission emails | ✓ text templates | ✓ rich-text templates |
| Multiple email recipients | ✓ | ✓ |
| Email field tokens / wildcard output | ✓ `{{field}}`, `{{*}}` | ✓ `{{field}}`, `{{*}}`, `{{*:table}}` |
| Upload field | ✓ | ✓ |
| Upload MIME / size controls | ✓ | ✓ |
| Payment field / payment callback | Separate CleverPayments product | ✓ optional |
| Bundled React renderer | ✓ | Frontend renderer is application-defined |
| Client submission helper | ✓ | No equivalent helper documented |
| Localized form content | ✓ | Can be composed with Payload localization; not documented as a Form Builder-specific feature |
| English / Spanish / French runtime strings | ✓ | Not documented as a bundled frontend runtime |
| Starter template catalog | ✓, 13 templates | No built-in template catalog documented |
| Per-form authentication toggle | ✓ | Can be implemented with collection/access customization |
| Collection extension hooks | ✓ | ✓ via form and submission overrides |
| Server-side allow-list validation for choices | ✓ | Submission validation is handled by the plugin |
| Provider-neutral Salesforce preset metadata | ✓ | Not applicable |
| Salesforce integration dependency | None | None |

Official Payload Form Builder also documents:

- redirect relationships for confirmation pages
- `beforeEmail` customization
- fallback `defaultToEmail`
- form and form-submission collection overrides
- a `handlePayment` extension point
- configurable upload collections
- field/block overrides for custom field definitions

CleverForms will close the baseline parity gaps in Core without copying Payload's implementation. Features that are clearly separate products—such as payment-provider integrations, CRM connectors, advanced workflow automation, signatures, and secure document workflows—remain modular CleverForge packages.

See [docs/payload-form-builder-parity.md](docs/payload-form-builder-parity.md) for the implementation plan and Core/PRO boundaries.

The product-pattern review of Advanced Custom Fields PRO and the ACF Gravity Forms Add-on is documented in [docs/reference-review-acf.md](docs/reference-review-acf.md). The review is conceptual only; CleverForms uses an independent Payload-native implementation.

Official reference: [Payload Form Builder Plugin documentation](https://payloadcms.com/docs/plugins/form-builder).

## Roadmap

### Phase 1 — Public Core

- [x] Payload plugin architecture
- [x] Forms and Submissions collections
- [x] multi-page schema
- [x] core field definitions
- [x] basic conditional logic
- [x] server-side validation
- [x] choice allow-list enforcement
- [x] React renderer foundation
- [x] client helper
- [x] localization foundation
- [x] starter template catalog
- [x] tests and CI foundation
- [x] field default values and width/layout controls
- [x] State, Country, and Message fields
- [x] confirmation redirects
- [x] basic dynamic email notifications
- [x] improved Submission Admin presentation
- [x] basic Payload-native upload field
- [x] richer custom-field extension API
- [x] practical URL, Phone, Date & Time, Time, and Range fields
- [x] conditional Admin visibility for field-specific settings
- [x] reusable CleverForm relationship helper
- [x] reusable copy-on-insert field groups
- [x] basic one-level repeaters
- [ ] full integration test application
- [ ] accessibility test suite
- [ ] documented theming API
- [ ] stable 1.0 API

### Phase 2 — Forms Pro

- [x] Save & Continue architecture in private development
- [x] private storage abstraction in private development
- [x] secure token architecture in private development
- [x] signature-provider abstraction in private development
- [ ] secure upload/download runtime
- [ ] signature UI
- [ ] PDF generation
- [ ] rate limiting and bot controls

### Phase 3 — Integrations

- [ ] webhooks
- [ ] Salesforce
- [ ] email/SMS providers
- [ ] retry and integration monitoring

### Phase 4 — Clever AI

- [ ] OpenAI-compatible provider
- [ ] Anthropic provider
- [ ] Gemini provider
- [ ] local-model provider
- [ ] AI form generation
- [ ] AI translation
- [ ] document extraction
- [ ] submission analysis

### Phase 5 — Platform modules

- [ ] analytics
- [ ] payments
- [ ] workflow automation
- [ ] MCP
- [ ] generated SDKs

## Public and private repository model

This repository contains the public Clever Forms Core, documentation, examples, tests, compatibility information, issues, and contribution surface.

CleverForge may maintain commercial backend infrastructure, license services, premium modules, hosted services, proprietary connectors, and other products in private repositories. Keeping those products separate is the primary IP boundary; compiling or obscuring JavaScript is not treated as an effective substitute for that boundary.

## Development

```bash
npm install
npm run typecheck
npm test
```

Pull requests should explain what changed, why it changed, and how it was tested. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Compatibility

The current development target is Payload CMS 3.x. Exact minimum supported versions will be established and tested before stable release.

## License

Clever Forms Core in this repository is licensed under the **Apache License, Version 2.0**. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

Apache-2.0 permits use, modification, and redistribution of the public Core subject to its terms. It does **not** grant unrestricted rights to CleverForge trademarks, branding, or separately distributed commercial software and services.

## About CleverForge

CleverForge builds practical technology, integration, and automation tools designed to remain flexible across organizations, providers, and workflows.

Watch this repository for development updates and public releases.
