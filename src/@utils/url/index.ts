import isUrl from 'is-url-superb'

export function sanitizeUrl(url: string) {
  const u = decodeURI(url).trim().toLowerCase()
  const isAllowedUrlScheme = u.startsWith('http://') || u.startsWith('https://')
  return isAllowedUrlScheme ? url : 'about:blank'
}

export function isDidWeb(value: string): boolean {
  const regex = /^did:web:.*/i
  return regex.test(value)
}

function extractWellKnownValue(did: string): string {
  const didPrefix = 'did:web:'
  if (did.startsWith(didPrefix)) {
    const value = did.slice(didPrefix.length)
    return value
  }
  return ''
}

export function getWellKnownDidUrl(did: string, type?: string): string {
  const wellKnownValue = extractWellKnownValue(did)
  const file = type ?? 'did.json'
  if (wellKnownValue) {
    const wellKnownDidUrl = `https://${wellKnownValue}/.well-known/${file}`
    return wellKnownDidUrl
  }
  return ''
}

// check if the url is a google domain
export const isGoogleUrl = (url: string): boolean => {
  if (!url || !isUrl(url)) return
  const googleUrl = new URL(url)
  return googleUrl.hostname.endsWith('google.com')
}
