declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_INFURA_PROJECT_ID: string | undefined
    readonly NEXT_PUBLIC_BADGE_COMPLIANCE_LABELS_ENABLE: string | undefined
    readonly NEXT_PUBLIC_SERVICE_SD_COMPLIANCE_FMDM_ENABLE: string | undefined
    readonly NEXT_PUBLIC_SERVICE_SD_COMPLIANCE_GAIA_X_ENABLE: string | undefined
    readonly NEXT_PUBLIC_CATALOG_FILTER_COMPLIANCE_GAIA_X_ENABLE:
      | string
      | undefined
    readonly NEXT_PUBLIC_CATALOG_FILTER_COMPLIANCE_FMDM_ENABLE:
      | string
      | undefined
    readonly NEXT_PUBLIC_COMPLIANCE_TYPE_GAIA_X_CAPTION: string | undefined
    readonly NEXT_PUBLIC_COMPLIANCE_TYPE_FMDM_CAPTION: string | undefined
  }
}
