import classNames from 'classnames/bind'
import React, { ReactElement } from 'react'
import VerifiedPatch from '@images/patch_check.svg'
import Cross from '@images/cross.svg'
import styles from './index.module.css'
import Loader from '../atoms/Loader'
import Time from '../atoms/Time'
import {
  ComplianceType,
  ComplianceTypeLookup
} from '../../../@types/ComplianceType'
import Checkmark from '@images/checkmark-green.svg'

const cx = classNames.bind(styles)

export default function VerifiedBadge({
  text,
  complianceTypes,
  className,
  isInvalid,
  isLoading,
  apiVersion,
  timestamp
}: {
  text: string
  complianceTypes?: Array<ComplianceType>
  className?: string
  isInvalid?: boolean
  isLoading?: boolean
  apiVersion?: string
  timestamp?: boolean
}): ReactElement {
  const styleClasses = cx({
    verifiedBadge: true,
    isInvalid,
    [className]: className
  })

  const formattedApiVersion =
    apiVersion && apiVersion.slice(0, 2) + '.' + apiVersion.slice(2, 4)

  return (
    <div className={styles.container}>
      <div className={styleClasses}>
        <div className={styles.mainLabel}>
          {isLoading ? (
            <div className={styles.loader}>
              <Loader />
            </div>
          ) : isInvalid ? (
            <Cross />
          ) : (
            <VerifiedPatch />
          )}
          <span>{text}</span>
        </div>
        <div className={styles.details}>
          {process.env.NEXT_PUBLIC_BADGE_COMPLIANCE_LABELS_ENABLE === 'true' &&
            complianceTypes && (
              <ul>
                {complianceTypes.map((complianceType) => {
                  const complianceCaption =
                    ComplianceTypeLookup.getCaption(complianceType)

                  return (
                    <li key={complianceCaption}>
                      <Checkmark className={styles.checkmark} />
                      <span>{complianceCaption}</span>
                    </li>
                  )
                })}
              </ul>
            )}

          {apiVersion && (
            <span className={styles.apiVersion}>
              version: {formattedApiVersion}
            </span>
          )}
          {timestamp && (
            <span className={styles.lastVerified}>
              last check: <Time date={new Date().toString()} relative />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
