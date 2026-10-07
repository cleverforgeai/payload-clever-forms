# Reference Review — Advanced Custom Fields PRO and ACF Gravity Forms Add-on

Date: 2026-10-06

## Scope

This review uses the user-supplied Advanced Custom Fields PRO 6.8.10 package and ACF Gravity Forms Add-on 1.3.10 as product and UX references.

The goal is to identify ideas that can improve CleverForms without copying their implementation. ACF PRO and the Gravity Forms add-on are GPL-licensed, while CleverForms Core is Apache-2.0. CleverForge should implement any adopted concepts independently using Payload-native architecture and APIs.

## High-value ideas for CleverForms Core

### 1. Expand the practical field catalog

ACF demonstrates the value of a broad but predictable field palette. CleverForms should prioritize form-oriented equivalents rather than reproducing every CMS field type.

Recommended Core additions after the current parity milestone:

- URL
- phone / telephone
- date-time
- time
- range / slider
- true-false as a distinct semantic field
- richer Message content
- relationship-driven choices where the source is a Payload collection

Password fields should not be added casually to public forms because collecting authentication secrets through generic forms creates avoidable security risk.

### 2. Better field-setting ergonomics

ACF exposes only settings relevant to the selected field type. CleverForms currently presents a flatter schema where choices, upload options, message content, and other settings can appear even when irrelevant.

Core should add conditional Admin visibility so:

- Choices show only for choice fields
- Message Content shows only for Message
- Upload Collection / MIME / size / multiple show only for Upload
- Placeholder shows only on compatible inputs
- Conditional Logic remains available for input fields
- Width remains available where layout applies

This is a high-priority P1 usability improvement.

### 3. Reusable form relationship field

The supplied ACF Gravity Forms Add-on adds an editor field that selects an existing Gravity Form and can return one or more form references.

Payload already has native relationships, so CleverForms does not need a custom database primitive. Core should provide a small helper such as:

```ts
cleverFormRelationship({
  name: 'form',
  hasMany: false,
  required: false,
})
```

This would make it easy for Pages, Events, Programs, Campaigns, and other collections to attach one or more CleverForms without developers repeatedly recreating relationship configuration.

This belongs in Core.

### 4. Reusable field groups

ACF's Group and Clone concepts show the value of defining a field structure once and reusing it.

For CleverForms:

- named reusable field groups can be a Core feature if implemented as immutable/copy-on-use templates
- centrally linked reusable field groups, where later changes propagate into published forms, should be treated more cautiously because they can change live forms unexpectedly

A safe initial Core model is "insert from reusable group, then copy into the form."

### 5. Repeaters

ACF PRO's Repeater is highly relevant to applications, household members, employment history, references, dependents, and line-item style forms.

Recommended boundary:

- Core: basic repeatable group with min/max rows and server-side validation
- PRO: advanced repeaters with nested repeaters, calculated row values, workflow rules, conditional row schemas, import/export, and enterprise limits

### 6. Flexible-content style sections

ACF PRO's Flexible Content field is useful as an authoring pattern, but should not be copied literally.

For CleverForms this maps better to advanced page/section composition:

- choose from predefined section layouts
- insert reusable field-group layouts
- compose multi-page applications from approved building blocks

This is more appropriate for CleverForms PRO or a future advanced builder package.

### 7. Gallery / media patterns

ACF's Image, File, and Gallery fields reinforce three upload lessons:

- files need explicit type restrictions
- permissions must be enforced when files are returned
- multi-file UX should be intentional rather than simply treating uploads as arbitrary JSON

CleverForms Core should support basic Payload-native Upload fields. CleverForms PRO should own private/regulated storage, signed downloads, malware/content inspection hooks, retention controls, and more restrictive permissions.

### 8. Security patterns worth adopting independently

The reviewed ACF release notes emphasize several security themes that are directly relevant to CleverForms:

- validate uploaded file types server-side
- do not rely only on browser validation
- enforce authorization when returning referenced uploads
- validate frontend form submissions consistently
- bind temporary tokens to their intended purpose and lifetime

These align with CleverForms' existing server-side validation model and should guide Save & Continue, private uploads, signatures, and future download links.

## Core vs PRO recommendation

| Capability inspired by the review | Core | PRO / separate package |
| --- | :---: | :---: |
| URL / phone / date-time / time / range | ✓ | |
| Better field-setting conditional UI | ✓ | |
| CleverForm relationship helper | ✓ | |
| Insert-from reusable field groups | ✓ | |
| Basic repeatable groups | ✓ | |
| Nested / workflow-aware repeaters | | ✓ |
| Advanced section/layout composition | | ✓ |
| Basic Payload-native uploads | ✓ | |
| Private / regulated upload workflows | | ✓ |
| Rich relationship/data-source fields | ✓ basic | ✓ advanced |
| Signed downloads / retention / inspection | | ✓ |
| Advanced field-group governance | | ✓ |

## Recommendation

The strongest lessons from ACF are not specific WordPress APIs. They are product patterns:

1. make field creation intuitive,
2. expose settings only when relevant,
3. make complex structures reusable,
4. support repeatable data cleanly,
5. treat media permissions and validation as security boundaries.

CleverForms should implement those ideas in Payload-native TypeScript rather than porting ACF code.
