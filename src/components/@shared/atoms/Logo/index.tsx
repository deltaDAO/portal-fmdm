import { ReactElement } from 'react'
import LogoAsset from '@images/odl-logo.svg'
import LogoAssetSmall from '@images/odl-logo-small.svg'
import styles from './index.module.css'

export default function Logo(): ReactElement {
  return (
    <div className={styles.logoWrapper}>
      <LogoAsset className={styles.logo} />
      <LogoAssetSmall className={styles.logoSmall} />
    </div>
  )
}
