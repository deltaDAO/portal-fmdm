import { GaiaXTermsAndConditions2210 } from './TermsAndConditions'
import { GaiaXPIIInformation2210 } from './PII'

export interface GaiaXInformation2210 {
  legalName?: string
  termsAndConditions: GaiaXTermsAndConditions2210[]
  containsPII: boolean
  PIIInformation?: GaiaXPIIInformation2210[]
}
