# Changelog

## 0.3.0-beta.2 - 2026-10-06

### Core parity

- add dedicated State and Country fields with server-side code validation
- add display-only Message fields
- add confirmation redirects with safe http/https URL resolution
- add multiple dynamic email notifications through Payload's configured email adapter
- support submission tokens such as `{{email}}` and wildcard `{{*}}`
- add `defaultToEmail`, `beforeEmail`, and configurable email failure behavior
- add the Donation Form starter template
- expand unit and Payload integration coverage

### Donation template

- recurring or one-time donation selection
- preset donation amounts with conditional Other amount
- organization-gift and dedication questions
- donor name, email, phone, and address fields
- email and SMS communication preferences
- secure payment placeholder for the separate CleverPayments integration

## 0.3.0-beta.1 - 2026-10-06

### Core parity

- add configurable field default values
- add optional field width metadata
- initialize the React runtime from configured defaults
- apply configured defaults during server-side validation
- normalize numeric, boolean checkbox, and comma-separated multiselect defaults
- add regression and Payload integration coverage

## 0.3.0-beta.0 - 2026-10-05

### Added

- administrator-selectable pre-built form templates
- template catalog for newsletter signup, contact, quote request, appointment booking, bug reports, sponsorship requests, photo/media consent, free consultation, feedback, customer support, support requests, and volunteer applications
- Salesforce preset metadata on templates for optional CleverConnect integration
- template cloning so administrators can customize every generated field after creation
- tests covering template catalog integrity and real Payload form creation from a template

### Security and independence

- templates contain no third-party form-service URLs, access keys, scripts, credentials, tracking code, or attribution
- template selection is optional; blank forms remain supported
- templates do not require CleverConnect or Salesforce

All notable changes to Clever Forms will be documented here.

## 0.2.0-beta.1 - 2026-09-23

### Changed

- prepared npm Trusted Publishing through GitHub Actions OIDC
- moved CI and publishing workflows to Node.js 24
- enabled npm provenance for automated releases
- retained beta releases on the `beta` dist-tag

### Release

- first release intended to validate end-to-end GitHub Actions trusted publishing after the manual `0.2.0-beta.0` bootstrap

## 0.1.0 - 2026-09-09

Initial public core implementation.

### Added

- Payload `definePlugin` integration
- forms collection
- submissions collection
- multi-page forms
- configurable core field types
- conditional logic
- localized form content
- server-side submission validation
- choice allow-list enforcement
- React renderer
- client submission helper
- English, Spanish, and French translation tables
- automated tests
- GitHub Actions CI
- Apache-2.0 license and NOTICE
