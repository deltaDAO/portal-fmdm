import React, { ReactElement } from 'react'
import Link from 'next/link'
import Dotdotdot from 'react-dotdotdot'
import Price from '@shared/Price'
import removeMarkdown from 'remove-markdown'
import Publisher from '@shared/Publisher'
import AssetType from '@shared/AssetType'
import NetworkName from '@shared/NetworkName'
import styles from './index.module.css'
import { getServiceByName, getPublisherNameOrOwner } from '@utils/ddo'
import { useUserPreferences } from '@context/UserPreferences'
import { formatNumber } from '@utils/numbers'
import classNames from 'classnames/bind'
import { accountTruncate } from '@utils/web3'

const cx = classNames.bind(styles)

export declare type AssetTeaserProps = {
  asset: AssetExtended
  noPublisher?: boolean
  noDescription?: boolean
  noPrice?: boolean
}

export default function AssetTeaser({
  asset,
  noPublisher,
  noDescription,
  noPrice
}: AssetTeaserProps): ReactElement {
  const { name, type, description } = asset.metadata
  const { datatokens } = asset
  const isCompute = Boolean(getServiceByName(asset, 'compute'))
  const accessType = isCompute ? 'compute' : 'access'
  const { owner } = asset.nft
  const complianceTypes = asset.metadata.additionalInformation?.compliance || []
  const isCompliant = !!complianceTypes?.length
  const { orders, allocated } = asset.stats
  const publisherNameOrOwner = getPublisherNameOrOwner(asset)
  const isUnsupportedPricing = asset?.accessDetails?.type === 'NOT_SUPPORTED'
  const { locale } = useUserPreferences()

  return (
    <article className={`${styles.teaser} ${styles[type]}`}>
      <Link href={`/asset/${asset.id}`} className={styles.link}>
        <aside className={styles.detailLine}>
          <span className={styles.typeLabel}>
            {datatokens[0]?.symbol.substring(0, 9)}
          </span>
        </aside>
        <AssetType
          className={cx({
            typeDetails: true,
            algo: type === 'algorithm',
            dataset: type === 'dataset'
          })}
          type={type}
          accessType={accessType}
        />
        <header className={styles.header}>
          <Dotdotdot tagName="h1" clamp={3} className={styles.title}>
            {name.slice(0, 200)}
          </Dotdotdot>
          {!noPublisher && (
            <Publisher
              account={owner}
              verifiedServiceProviderName={
                isCompliant
                  ? publisherNameOrOwner
                  : `${accountTruncate(publisherNameOrOwner)} (unverified)`
              }
              minimal
            />
          )}
        </header>
        {!noDescription && (
          <div className={styles.content}>
            <Dotdotdot tagName="p" clamp={3}>
              {removeMarkdown(description?.substring(0, 300) || '')}
            </Dotdotdot>
          </div>
        )}
        {!noPrice && (
          <div className={styles.price}>
            {isUnsupportedPricing || !asset.services.length ? (
              <strong>No pricing schema available</strong>
            ) : (
              <Price accessDetails={asset.accessDetails} size="small" />
            )}
          </div>
        )}
        <div className={styles.network}>
          <NetworkName networkId={asset.chainId} className={styles.typeLabel} />
        </div>
        <footer className={styles.footer}>
          {allocated && allocated > 0 ? (
            <span className={styles.typeLabel}>
              {allocated < 0 ? (
                ''
              ) : (
                <>
                  <strong>{formatNumber(allocated, locale, '0')}</strong>{' '}
                  veOCEAN
                </>
              )}
            </span>
          ) : null}
          {orders && orders > 0 ? (
            <span className={styles.typeLabel}>
              {orders < 0 ? (
                'N/A'
              ) : (
                <>
                  <strong>{orders}</strong> {orders === 1 ? 'sale' : 'sales'}
                </>
              )}
            </span>
          ) : null}
          {asset.views && asset.views > 0 ? (
            <span className={styles.typeLabel}>
              {asset.views < 0 ? (
                'N/A'
              ) : (
                <>
                  <strong>{asset.views}</strong>{' '}
                  {asset.views === 1 ? 'view' : 'views'}
                </>
              )}
            </span>
          ) : null}
        </footer>
      </Link>
    </article>
  )
}
