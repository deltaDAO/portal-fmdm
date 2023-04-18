export enum ComplianceType {
  Gaia_X = 'gaia-x',
  FMDM = 'fmdm'
}

export class ComplianceTypeLookup {
  public static getCaption(complianceType: ComplianceType): string {
    const lookupTable: Record<ComplianceType, string> = {
      [ComplianceType.Gaia_X]:
        process.env.NEXT_PUBLIC_COMPLIANCE_TYPE_GAIA_X_CAPTION ||
        'Gaia-X compliant',
      [ComplianceType.FMDM]:
        process.env.NEXT_PUBLIC_COMPLIANCE_TYPE_FMDM_CAPTION || 'FMDM compliant'
    }

    return lookupTable[complianceType]
  }

  public static values(): ComplianceType[] {
    return Object.values(ComplianceType)
  }
}
