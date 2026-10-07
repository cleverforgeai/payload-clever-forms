import type { CleverFormPage } from '../types.js'

export type CleverFormTemplate = {
  key: string
  title: string
  description: string
  category: 'marketing' | 'sales' | 'service' | 'nonprofit' | 'operations'
  salesforcePresetKey?: string
  pages: CleverFormPage[]
  settings?: {
    submitButtonLabel?: string
    confirmationType?: 'message' | 'redirect'
    successMessage?: string
    redirectURL?: string
    requireAuthentication?: boolean
  }
}

const page = (fields: CleverFormPage['fields'], title = 'Form'): CleverFormPage => ({ title, fields })
const choice = (label: string, value = label) => ({ label, value })

export const cleverFormTemplates: CleverFormTemplate[] = [
  {
    key: 'newsletter-signup',
    title: 'Newsletter Signup',
    description: 'Simple email signup for newsletters and mailing lists.',
    category: 'marketing',
    salesforcePresetKey: 'newsletter-signup',
    pages: [page([{ name: 'email', label: 'Your email', type: 'email', placeholder: 'you@example.com', required: true }], 'Newsletter Signup')],
    settings: { submitButtonLabel: 'Subscribe', successMessage: 'Thank you for subscribing.' },
  },
  {
    key: 'contact-form',
    title: 'Contact Form',
    description: 'General website contact form.',
    category: 'marketing',
    salesforcePresetKey: 'contact-form',
    pages: [page([
      { name: 'name', label: 'Full name', type: 'text', placeholder: 'Jane Builder', required: true },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com', required: true },
      { name: 'phone', label: 'Phone', type: 'text', placeholder: '+1 415 555 0142', required: true },
      { name: 'message', label: 'Message', type: 'textarea', placeholder: 'How can we help?', required: true },
    ], 'Contact Us')],
    settings: { submitButtonLabel: 'Send', successMessage: 'Thank you. Your message has been received.' },
  },
  {
    key: 'quote-request',
    title: 'Quote Request',
    description: 'Collect project details and budget range for a quote.',
    category: 'sales',
    salesforcePresetKey: 'quote-request',
    pages: [page([
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'text', required: true },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'budget', label: 'Budget', type: 'select', required: true, choices: [
        choice('Under $5,000', 'under-5000'),
        choice('$5,000–$15,000', '5000-15000'),
        choice('$15,000–$50,000', '15000-50000'),
        choice('$50,000+', '50000-plus'),
      ] },
      { name: 'project', label: 'Tell us about the project', type: 'textarea', required: true },
    ], 'Request a Quote')],
    settings: { submitButtonLabel: 'Request Quote', successMessage: 'Thank you. We will review your request and follow up.' },
  },
  {
    key: 'book-appointment',
    title: 'Book an Appointment',
    description: 'Collect appointment requests and preferred dates.',
    category: 'service',
    salesforcePresetKey: 'book-appointment',
    pages: [page([
      { name: 'name', label: 'Full name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'text', required: true },
      { name: 'service', label: 'Service', type: 'select', required: true, choices: [
        choice('Consultation'), choice('Standard appointment'), choice('Premium / extended'),
      ] },
      { name: 'preferred_date', label: 'Preferred date', type: 'date', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ], 'Book an Appointment')],
    settings: { submitButtonLabel: 'Request Appointment', successMessage: 'Thank you. We will contact you to confirm the appointment.' },
  },
  {
    key: 'bug-report',
    title: 'Bug Report',
    description: 'Structured software or website bug report.',
    category: 'operations',
    salesforcePresetKey: 'bug-report',
    pages: [page([
      { name: 'title', label: 'Short summary', type: 'text', required: true },
      { name: 'severity', label: 'Severity', type: 'select', required: true, choices: [choice('Critical'), choice('High'), choice('Medium'), choice('Low')] },
      { name: 'browser', label: 'Browser & OS', type: 'text', placeholder: 'Chrome / macOS' },
      { name: 'steps', label: 'Steps to reproduce', type: 'textarea', required: true },
      { name: 'email', label: 'Your email', type: 'email', required: true },
    ], 'Bug Report')],
    settings: { submitButtonLabel: 'Submit Bug Report', successMessage: 'Thank you. Your bug report has been submitted.' },
  },
  {
    key: 'sponsorship-request',
    title: 'Sponsorship Request',
    description: 'Collect sponsorship inquiries for events and programs.',
    category: 'nonprofit',
    salesforcePresetKey: 'sponsorship-request',
    pages: [page([
      { name: 'organization', label: 'Organization / company', type: 'text', required: true },
      { name: 'contact_name', label: 'Contact name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'event_name', label: 'Event / program to sponsor', type: 'text', required: true },
      { name: 'event_date', label: 'Event date', type: 'date' },
      { name: 'level', label: 'Sponsorship level of interest', type: 'select', required: true, choices: [
        choice('Title sponsor'), choice('Gold'), choice('Silver'), choice('Bronze'), choice('In-kind / products'), choice('Not sure yet'),
      ] },
      { name: 'message', label: 'Tell us about the opportunity', type: 'textarea' },
    ], 'Sponsorship Request')],
    settings: { submitButtonLabel: 'Submit Request', successMessage: 'Thank you. We will review the sponsorship request and follow up.' },
  },
  {
    key: 'photo-media-consent',
    title: 'Photo / Media Consent',
    description: 'Capture participant and guardian media consent.',
    category: 'nonprofit',
    salesforcePresetKey: 'photo-media-consent',
    pages: [page([
      { name: 'participant_name', label: 'Participant name', type: 'text', required: true },
      { name: 'guardian_name', label: 'Parent / guardian name (if under 18)', type: 'text' },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'event', label: 'Event / program', type: 'text', required: true },
      { name: 'consent', label: 'Photo / video consent', type: 'select', required: true, choices: [
        choice('Yes — photos and video', 'photos-video'), choice('Photos only', 'photos-only'), choice('No', 'no'),
      ] },
      { name: 'signed_date', label: 'Date', type: 'date', required: true },
    ], 'Photo / Media Consent')],
    settings: { submitButtonLabel: 'Submit Consent', successMessage: 'Thank you. Your consent response has been recorded.' },
  },
  {
    key: 'free-consultation',
    title: 'Free Consultation',
    description: 'Collect consultation requests and areas of interest.',
    category: 'sales',
    salesforcePresetKey: 'free-consultation',
    pages: [page([
      { name: 'name', label: 'Full name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'text', required: true },
      { name: 'topic', label: 'Topic', type: 'select', required: true, choices: [
        choice('General inquiry'), choice('Strategy'), choice('Financial planning'), choice('Legal advice'), choice('Other'),
      ] },
      { name: 'details', label: 'What do you need help with?', type: 'textarea', required: true },
    ], 'Free Consultation')],
    settings: { submitButtonLabel: 'Request Consultation', successMessage: 'Thank you. We will contact you about your consultation.' },
  },
  {
    key: 'feedback',
    title: 'Feedback',
    description: 'Collect a satisfaction rating and written feedback.',
    category: 'service',
    salesforcePresetKey: 'feedback',
    pages: [page([
      { name: 'rating', label: 'How would you rate your experience?', type: 'select', required: true, choices: [
        choice('5 — Excellent', '5'), choice('4 — Very good', '4'), choice('3 — Good', '3'), choice('2 — Fair', '2'), choice('1 — Poor', '1'),
      ] },
      { name: 'feedback', label: 'What can we do better?', type: 'textarea', required: true },
      { name: 'email', label: 'Email (optional, for follow-up)', type: 'email' },
    ], 'Feedback')],
    settings: { submitButtonLabel: 'Send Feedback', successMessage: 'Thank you for your feedback.' },
  },
  {
    key: 'customer-support',
    title: 'Customer Support',
    description: 'Structured support request with severity and account reference.',
    category: 'service',
    salesforcePresetKey: 'customer-support',
    pages: [page([
      { name: 'name', label: 'Your name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone (for urgent issues)', type: 'text' },
      { name: 'order_id', label: 'Order / account ID', type: 'text' },
      { name: 'severity', label: 'How urgent is this?', type: 'select', required: true, choices: [
        choice('Critical — blocking us', 'Critical'), choice('High — losing time', 'High'), choice('Medium — annoying', 'Medium'), choice('Low — heads-up', 'Low'),
      ] },
      { name: 'description', label: "What's wrong?", type: 'textarea', required: true },
    ], 'Customer Support')],
    settings: { submitButtonLabel: 'Submit Support Request', successMessage: 'Thank you. Your support request has been submitted.' },
  },
  {
    key: 'support-request',
    title: 'Support Request',
    description: 'General support intake form.',
    category: 'service',
    salesforcePresetKey: 'support-request',
    pages: [page([
      { name: 'name', label: 'Your name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'severity', label: 'Priority', type: 'select', required: true, choices: [choice('Critical'), choice('High'), choice('Medium'), choice('Low')] },
      { name: 'description', label: 'How can we help?', type: 'textarea', required: true },
    ], 'Support Request')],
    settings: { submitButtonLabel: 'Submit Request', successMessage: 'Thank you. Your request has been submitted.' },
  },
  {
    key: 'volunteer-application',
    title: 'Volunteer Application',
    description: 'Collect volunteer contact information, availability, interests, and experience.',
    category: 'nonprofit',
    salesforcePresetKey: 'volunteer-application',
    pages: [page([
      { name: 'name', label: 'Your name', type: 'text', required: true },
      { name: 'email', label: 'Email address', type: 'email', required: true },
      { name: 'phone', label: 'Phone number', type: 'text' },
      { name: 'area', label: 'City or area', type: 'text' },
      { name: 'availability', label: 'Availability', type: 'multiselect', choices: [choice('Weekday mornings'), choice('Weekday evenings'), choice('Weekends')] },
      { name: 'interests', label: "I'd like to help with", type: 'multiselect', choices: [choice('Events'), choice('Fundraising'), choice('Mentoring'), choice('Admin')] },
      { name: 'message', label: 'Relevant experience', type: 'textarea' },
    ], 'Volunteer Application')],
    settings: { submitButtonLabel: 'Send Application', successMessage: 'Thanks! A coordinator will be in touch.' },
  },
,
  {
    key: 'donation-form',
    title: 'Donation Form',
    description: 'Donation intake with recurring or one-time giving, donor information, address, dedication, and communications preferences.',
    category: 'nonprofit',
    pages: [
      page([
        {
          name: 'donation_frequency',
          label: 'Make this donation',
          type: 'radio',
          required: true,
          choices: [choice('Monthly', 'monthly'), choice('One-Time', 'one-time')],
        },
        {
          name: 'donation_amount',
          label: 'Choose donation amount',
          type: 'radio',
          description: 'Choose how much you would like to donate.',
          required: true,
          defaultValue: '25',
          choices: [
            choice('$25 USD', '25'),
            choice('$50 USD', '50'),
            choice('$100 USD', '100'),
            choice('$500 USD', '500'),
            choice('Other amount', 'other'),
          ],
        },
        {
          name: 'other_amount',
          label: 'Other amount',
          type: 'number',
          conditionalLogic: {
            enabled: true,
            field: 'donation_amount',
            operator: 'equals',
            value: 'other',
          },
        },
        {
          name: 'donation_total',
          label: 'Total',
          type: 'message',
          message: 'The final donation total is calculated from the selected amount by the configured CleverPayments integration.',
        },
        {
          name: 'organization_gift',
          label: 'I would like to give on behalf of an organization.',
          type: 'radio',
          required: true,
          choices: [choice('Yes', 'yes'), choice('No', 'no')],
        },
        {
          name: 'organization_name',
          label: 'Organization name',
          type: 'text',
          conditionalLogic: {
            enabled: true,
            field: 'organization_gift',
            operator: 'equals',
            value: 'yes',
          },
        },
        {
          name: 'dedication',
          label: 'Would you like to dedicate your gift in honor or memory of someone?',
          type: 'radio',
          required: true,
          choices: [choice('Yes', 'yes'), choice('No', 'no')],
        },
        {
          name: 'dedication_name',
          label: 'Honoree name',
          type: 'text',
          conditionalLogic: {
            enabled: true,
            field: 'dedication',
            operator: 'equals',
            value: 'yes',
          },
        },
        {
          name: 'payment_method_heading',
          label: 'Payment Method',
          type: 'heading',
        },
        {
          name: 'payment_form',
          label: 'Payment Form (Required)',
          type: 'message',
          message: 'Secure payment fields are supplied by CleverPayments. Configure a payment provider before publishing this donation form. CleverForms Core does not collect card numbers or banking credentials.',
        },
      ], 'Donation'),
      page([
        {
          name: 'your_information_heading',
          label: 'Your Information',
          type: 'heading',
        },
        { name: 'first_name', label: 'First Name', type: 'text', required: true, width: '50%' },
        { name: 'last_name', label: 'Last Name', type: 'text', required: true, width: '50%' },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'text' },
        {
          name: 'address_heading',
          label: 'Address',
          type: 'heading',
        },
        { name: 'street_address', label: 'Street Address', type: 'text' },
        { name: 'city', label: 'City', type: 'text', width: '50%' },
        { name: 'state', label: 'State', type: 'state', width: '25%' },
        { name: 'zip_code', label: 'ZIP Code', type: 'text', width: '25%' },
        {
          name: 'email_opt_in',
          label: "I'd like to receive emails from Xiente",
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'sms_opt_in',
          label: 'Would you like to receive text messages from Xiente?',
          type: 'radio',
          choices: [choice('Yes', 'yes'), choice('No', 'no')],
        },
      ], 'Your Information'),
    ],
    settings: {
      submitButtonLabel: 'Donate',
      confirmationType: 'message',
      successMessage: 'Thank you for your generosity.',
    },
  }
]

export const getCleverFormTemplate = (key?: string | null) =>
  cleverFormTemplates.find(template => template.key === key)

export const cloneCleverFormTemplate = (key: string) => {
  const template = getCleverFormTemplate(key)
  if (!template) return undefined
  return {
    title: template.title,
    description: template.description,
    pages: structuredClone(template.pages),
    settings: structuredClone(template.settings ?? {}),
    templateKey: template.key,
    salesforcePresetKey: template.salesforcePresetKey,
  }
}
