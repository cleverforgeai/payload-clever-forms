# CleverForms vs Payload Form Builder — Parity Audit

Date: 2026-10-06

## Purpose

CleverForms should not provide a weaker administrator or runtime experience than Payload's official Form Builder for common form use cases. This audit compares the current CleverForms Core implementation with the current Payload Form Builder feature set and separates:

- Core parity work that belongs in the public package
- CleverForms differentiators already present
- advanced features that should remain in separate PRO or CleverForge product packages

## Current CleverForms strengths

CleverForms already includes capabilities that are not the main focus of Payload Form Builder:

- multi-page forms
- basic conditional logic
- localized form labels/content
- English, Spanish, and French runtime translations
- form templates
- form publication states
- optional authenticated forms
- server-side allow-list validation
- extensible Forms and Submissions collections
- independent CleverConnect integration metadata

These should remain first-class CleverForms Core features.

## Payload Form Builder capabilities CleverForms Core does not yet match

| Capability | Payload Form Builder | CleverForms Core today | Decision |
| --- | --- | --- | --- |
| Text | Yes | Yes | Keep |
| Textarea | Yes | Yes | Keep |
| Email | Yes | Yes | Keep |
| Number | Yes | Yes | Keep |
| Select | Yes | Yes | Keep |
| Radio | Yes | Yes | Keep |
| Checkbox | Yes | Yes | Keep |
| Date | Supported | Yes | Keep |
| State | Yes | Yes | Implemented in Core |
| Country | Yes | Yes | Implemented in Core |
| Message/content block | Yes | Yes | Implemented in Core |
| Upload | Yes | Yes | Basic Payload-native upload is now in Core; private/secure storage remains PRO |
| Payment field | Optional | No | Do not copy into Core. Provide extension points for CleverPayments |
| Field default value | Yes | Yes | Implemented in Core |
| Field width/layout | Yes | Yes, width metadata | Implemented in Core |
| Confirmation message | Yes | Yes | Keep and improve |
| Redirect after submit | Yes | Yes, URL redirect | Implemented in Core |
| Multiple dynamic notification emails | Yes | Yes | Implemented in Core using Payload email adapter |
| Email field tokens | Yes | Yes | Implemented in Core |
| Wildcard submission output in email | Yes | Yes | Implemented in Core |
| Form collection overrides | Yes | Yes through extension callbacks | Keep |
| Submission collection overrides | Yes | Yes through extension callbacks | Keep |
| Submission authorship | Yes by default | No explicit authorship | Evaluate for Core |
| Payment callback | Yes | No | Expose neutral extension hook; payment implementation belongs to CleverPayments |
| Upload MIME/size restrictions | Yes | Yes | Implemented in Core |
| Custom field extension | Yes | Limited to enable/disable known field types | Expand field-definition extension API |

## Core parity milestone

The next Core milestone should close the gaps administrators notice immediately when comparing CleverForms with Payload Form Builder.

### P0 — Administrator and runtime parity

1. [x] Add field-level default value and width metadata.
2. [x] Add State, Country, and Message/content fields.
3. [x] Add submit confirmation message and URL redirect behavior.
   - relationship-based redirects remain available through collection/application extension rather than Core coupling
4. [x] Add basic notification emails using Payload's configured email adapter:
   - multiple recipients
   - subject/body templates
   - submission field tokens
   - wildcard summary token
   - default recipient fallback and before-send transformation hook
5. [x] Improve submission administration so staff can read submitted values without opening raw JSON.
6. [x] Add basic Payload-native upload field support:
   - configured upload collection
   - MIME restrictions
   - max file size
   - single/multiple file selection

### P1 — Builder usability

1. Improve field labels and field-type descriptions in Payload Admin.
2. Hide settings that do not apply to the selected field type.
3. Improve choice editing for select/radio/checkbox/multiselect.
4. Add duplicate-field and duplicate-page controls where Payload supports safe extension.
5. Add form preview support.
6. Add clearer empty-state guidance and form-building workflow.

## Features that should remain CleverForms differentiators

These should not be removed merely to resemble Payload Form Builder:

- multi-page forms
- conditional logic
- localization
- template catalog
- authenticated-form requirement
- provider-neutral integration metadata
- CleverConnect interoperability

## PRO / separate-product boundary

The following should not be forced into public Core merely for Payload Form Builder parity.

### CleverForms PRO

- secure Save & Continue
- signatures
- branded PDF generation
- advanced branching and conditional workflows
- calculations
- workflow routing
- private/regulated file-storage workflows
- advanced permissions
- advanced anti-bot/rate controls
- white labeling

### CleverPayments

- Stripe
- Square
- PayPal
- payment intent/session lifecycle
- refunds and reconciliation
- payment-specific reporting

Core should expose neutral extension hooks so CleverPayments can add payment fields without coupling Core to a specific payment provider.

### CleverConnect

CRM and external-system integrations remain independent connectors:

- Salesforce
- HubSpot
- Microsoft Dynamics
- other APIs/webhooks

CleverForms may discover and integrate with them when installed, but must not require them.

## Acceptance criteria before CleverForms 1.0

CleverForms Core should not be declared 1.0 until:

- the P0 parity items above are implemented
- installation is tested in a clean Payload 3.x application
- form creation, submission, confirmation, email, upload, localization, conditional logic, and multi-page navigation are covered by integration tests
- accessibility checks cover field labels, keyboard navigation, errors, focus behavior, and multi-page progression
- the submission Admin experience is usable without inspecting raw JSON
- current official Payload Form Builder behavior is re-reviewed before the release candidate

## Recommended implementation order

1. [x] Field metadata parity: default values, width, State, Country, Message
2. [x] Confirmation redirect
3. [x] Basic email notifications
4. [x] Submission Admin improvements
5. [x] Basic upload field
6. [ ] Builder UX improvements
7. [ ] integration/accessibility test expansion

This order improves the day-to-day administrator experience first while preserving the modular CleverForge product architecture.
