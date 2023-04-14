import React, { ReactElement, useMemo } from 'react'
import Copy from '../atoms/Copy'
import Markdown from '../Markdown'
import VerifiedBadge from '../VerifiedBadge'
import styles from './index.module.css'
import { ComplianceType } from '../../../@types/ComplianceType'

export default function Visualizer({
  text,
  title,
  displayBadge,
  badgeLabel,
  invalidBadge,
  apiVersion,
  copyText,
  complianceTypes
}: {
  text: string
  title: string
  displayBadge?: boolean
  badgeLabel?: string
  invalidBadge?: boolean
  apiVersion?: string
  copyText?: string
  complianceTypes?: Array<ComplianceType>
}): ReactElement {
  const titleId = useMemo(
    () => `title-${Math.random().toString(36).substr(2, 9)}`,
    []
  )

  return (
    <div>
      <input type="checkbox" id={titleId} className={styles.check} />
      <label htmlFor={titleId} className={styles.title}>
        <h4>{title}</h4>
      </label>
      {displayBadge && (
        <VerifiedBadge
          text={badgeLabel}
          complianceTypes={complianceTypes}
          isInvalid={invalidBadge}
          apiVersion={apiVersion}
          timestamp
        />
      )}
      <div className={styles.markdownContainer}>
        <Markdown text={text} />
        {copyText && (
          <div className={styles.copyContainer}>
            <Copy text={copyText} />
          </div>
        )}
      </div>
    </div>
  )
}
