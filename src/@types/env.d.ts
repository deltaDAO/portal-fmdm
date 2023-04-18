declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_INFURA_PROJECT_ID: string | undefined
    readonly NEXT_PUBLIC_CATALOG_FILTER_COMPLIANCE_ENABLE: string | undefined
    readonly NEXT_PUBLIC_CATALOG_FILTER_COMPLIANCE_GAIA_X_LABEL:
      | string
      | undefined
    readonly NEXT_PUBLIC_BADGE_COMPLIANCE_LABELS_ENABLE: string | undefined
  }
}
