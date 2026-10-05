# Clever Forms for Payload CMS

**Clever Forms** is a Payload-native form builder and form runtime by CleverForge. The public Core is licensed under **Apache-2.0** and is designed to provide a genuinely useful foundation for Payload CMS projects while allowing advanced CleverForge products to remain separate commercial modules.

> **Status:** active pre-1.0 development. APIs may change before the first stable release.

## What Clever Forms is

Clever Forms is intended to grow from simple contact and registration forms into a broader workflow platform for applications, intake, surveys, assessments, enrollment, onboarding, authenticated forms, document workflows, CRM-connected processes, payments, analytics, and AI-assisted operations.

The public package focuses on the reusable Core. Premium products such as Forms Pro, Clever AI, Clever Connect, Communications, Analytics, Payments, proprietary connectors, and CleverForge hosted services are separate works and are **not** licensed by this repository merely because they interoperate with Core.

## Core capabilities

The current public Core provides the foundation for:

- Payload `definePlugin` integration
- forms and submissions collections
- multi-page forms
- reorderable pages and fields through Payload arrays
- text, textarea, email, number, select, radio, checkbox, multiselect, date, heading, and paragraph field definitions
- basic conditional logic
- server-side required/email/number validation
- server-side allow-list validation for configured choices
- published/draft/archived form states
- authenticated-form enforcement
- protected submission read access
- localized form content
- English, Spanish, and French runtime translations
- a React renderer for Next.js/Payload applications
- a client submission helper
- extension hooks for the Forms and Submissions collections
- administrator-selectable pre-built form templates

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
| Email automation | | ✓ |
| Webhooks | | ✓ |
| Salesforce and CRM connectors | | ✓ |
| AI features | | ✓ |
| Advanced analytics | | ✓ |
| Payments | | ✓ |
| Advanced MCP tools | | ✓ |

The goal is for Core to remain useful for real Payload websites without requiring a subscription.

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
- [x] tests and CI foundation
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
