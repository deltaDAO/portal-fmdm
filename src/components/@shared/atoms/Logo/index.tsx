import { ReactElement } from 'react'
import LogoAsset from '@images/fmdm-logo.svg'
import LogoAssetSmall from '@images/fmdm-logo-small.svg'
import styles from './index.module.css'

export default function Logo(): ReactElement {
  return (
    <div className={styles.logoWrapper}>
      <LogoAsset className={styles.logo} />
      <LogoAssetSmall className={styles.logoSmall} />
    </div>
  )
}
