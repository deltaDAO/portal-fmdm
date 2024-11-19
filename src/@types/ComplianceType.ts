export enum ComplianceType {
  FMDM = 'fmdm'
}

export class ComplianceTypeLookup {
  public static getCaption(complianceType: ComplianceType): string {
    const lookupTable: Record<ComplianceType, string> = {
      [ComplianceType.FMDM]:
        process.env.NEXT_PUBLIC_COMPLIANCE_TYPE_FMDM_CAPTION || 'FMDM compliant'
    }

    return lookupTable[complianceType]
  }

  public static values(): ComplianceType[] {
    return Object.values(ComplianceType)
  }
}
