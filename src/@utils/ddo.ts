import { Asset, DDO, Service } from '@oceanprotocol/lib'
import { IVerifiablePresentation } from '../@types/VerifyableCredentials'

export function isValidDid(did: string): boolean {
  const regex = /^did:op:[A-Za-z0-9]{64}$/
  return regex.test(did)
}

export function getServiceByName(
  ddo: Asset | DDO,
  name: 'access' | 'compute'
): Service {
  if (!ddo) return

  const service = ddo.services.filter((service) => service.type === name)[0]
  return service
}

export function getServiceById(ddo: Asset | DDO, serviceId: string): Service {
  if (!ddo) return

  const service = ddo.services.find((s) => s.id === serviceId)
  return service
}

export function getPublisherNameOrOwner(ddo: Asset | DDO): string {
  const { additionalInformation } = ddo.metadata
  if (
    additionalInformation?.gaiaXInformation?.serviceSD?.verifiedPublisherName
  ) {
    return additionalInformation.gaiaXInformation.serviceSD
      .verifiedPublisherName
  }
  return 'nft' in ddo ? ddo.nft.owner : ddo.event.from
}

export function mapTimeoutStringToSeconds(timeout: string): number {
  switch (timeout) {
    case 'Forever':
      return 0
    case '1 day':
      return 86400
    case '1 week':
      return 604800
    case '1 month':
      return 2630000
    case '1 year':
      return 31556952
    default:
      return 0
  }
}

function numberEnding(number: number): string {
  return number > 1 ? 's' : ''
}

export function secondsToString(numberOfSeconds: number): string {
  if (numberOfSeconds === 0) return 'Forever'

  const years = Math.floor(numberOfSeconds / 31536000)
  const months = Math.floor((numberOfSeconds %= 31536000) / 2630000)
  const weeks = Math.floor((numberOfSeconds %= 31536000) / 604800)
  const days = Math.floor((numberOfSeconds %= 604800) / 86400)
  const hours = Math.floor((numberOfSeconds %= 86400) / 3600)
  const minutes = Math.floor((numberOfSeconds %= 3600) / 60)
  const seconds = numberOfSeconds % 60

  return years
    ? `${years} year${numberEnding(years)}`
    : months
    ? `${months} month${numberEnding(months)}`
    : weeks
    ? `${weeks} week${numberEnding(weeks)}`
    : days
    ? `${days} day${numberEnding(days)}`
    : hours
    ? `${hours} hour${numberEnding(hours)}`
    : minutes
    ? `${minutes} minute${numberEnding(minutes)}`
    : seconds
    ? `${seconds} second${numberEnding(seconds)}`
    : 'less than a second'
}
