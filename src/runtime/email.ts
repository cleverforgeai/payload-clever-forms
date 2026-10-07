import type {
  CleverFormDefinition,
  CleverFormsPluginOptions,
  CleverFormsPreparedEmail,
  SubmissionHandlerArgs,
} from '../types.js'

const TOKEN = /{{\s*([^{}]+?)\s*}}/g

const printable = (value: unknown): string => {
  if (value === undefined || value === null) return ''
  if (Array.isArray(value)) return value.map(printable).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const allFieldsText = (data: Record<string, unknown>): string =>
  Object.entries(data)
    .map(([key, value]) => `${key}: ${printable(value)}`)
    .join('\n')

const headerSafe = (value: string): string => value.replace(/[\r\n]+/g, ' ').trim()

export const renderNotificationTemplate = (
  template: string,
  data: Record<string, unknown>,
): string => template.replace(TOKEN, (_match, token: string) => {
  const key = token.trim()
  if (key === '*' || key === '*:table') return allFieldsText(data)
  if (!Object.prototype.hasOwnProperty.call(data, key)) return ''
  return printable(data[key])
})

export const parseEmailRecipients = (value?: string): string[] =>
  String(value ?? '')
    .split(/[;,]/)
    .map((item) => headerSafe(item))
    .filter(Boolean)

export const prepareNotificationEmails = (
  form: CleverFormDefinition,
  data: Record<string, unknown>,
  defaultToEmail?: string,
): CleverFormsPreparedEmail[] => {
  const notifications = form.settings?.notifications ?? []

  return notifications
    .filter((notification) => notification.enabled !== false)
    .map((notification) => {
      const renderedTo = renderNotificationTemplate(notification.to ?? '', data)
      const to = parseEmailRecipients(renderedTo || defaultToEmail)
      const replyTo = headerSafe(renderNotificationTemplate(notification.replyTo ?? '', data)) || undefined

      return {
        to,
        replyTo,
        subject: headerSafe(renderNotificationTemplate(notification.subject ?? 'New form submission', data)),
        text: renderNotificationTemplate(notification.body ?? '{{*}}', data),
      }
    })
    .filter((email) => email.to.length > 0)
}

export const sendFormNotifications = async (
  form: CleverFormDefinition,
  data: Record<string, unknown>,
  args: SubmissionHandlerArgs,
  options: CleverFormsPluginOptions,
): Promise<void> => {
  const emails = prepareNotificationEmails(form, data, options.defaultToEmail)

  for (const prepared of emails) {
    const transformed = await options.beforeEmail?.(prepared, args)
    const email = transformed ?? prepared

    try {
      await args.req.payload.sendEmail({
        to: email.to,
        subject: email.subject,
        text: email.text,
        ...(email.replyTo ? { replyTo: email.replyTo } : {}),
      })
    } catch (error) {
      if (options.emailFailureMode === 'throw') throw error
      args.req.payload.logger.error({
        err: error,
        msg: `CleverForms email notification failed for form ${String(form.id)}`,
      })
    }
  }
}
