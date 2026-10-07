export const resolveConfirmationRedirect = (
  redirectURL: string | undefined,
  baseURL: string,
): string | undefined => {
  if (!redirectURL?.trim()) return undefined

  try {
    const url = new URL(redirectURL.trim(), baseURL)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    return url.toString()
  } catch {
    return undefined
  }
}
