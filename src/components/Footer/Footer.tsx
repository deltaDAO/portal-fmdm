import Button from '@components/@shared/atoms/Button'
import Container from '@components/@shared/atoms/Container'
import Logo from '@components/@shared/atoms/Logo'
import Markdown from '@components/@shared/Markdown'
import { useMarketMetadata } from '@context/MarketMetadata'
import { useUserPreferences } from '@context/UserPreferences'
import { useGdprMetadata } from '@hooks/useGdprMetadata'
import React, { ReactElement } from 'react'
import styles from './Footer.module.css'

export default function Footer(): ReactElement {
  const { appConfig, siteContent } = useMarketMetadata()
  const { copyright, footer } = siteContent
  const { setShowPPC } = useUserPreferences()

  const cookies = useGdprMetadata()

  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <Container className={styles.container}>
        <div className={styles.logo}>
          <Logo inverted />
        </div>
        <div className={styles.content}>
          <div className={styles.links}>
            {footer.links.map((e) => (
              <Button
                key={e.label}
                style="text"
                className={styles.link}
                to={e.link}
              >
                {e.label}
              </Button>
            ))}
          </div>
          <div className={styles.copyrightContainer}>
            <div className={styles.copyright}>
              <span>
                <Markdown text={footer.designedBy} />
              </span>
              <span>
                <Markdown text={`&copy; ${year} ${copyright}`} />
              </span>
            </div>
            <div className={styles.legal}>
              <Button
                className={styles.linkButton}
                style="text"
                href="https://v4.portal.minimal-gaia-x.eu/imprint"
              >
                Imprint
              </Button>
              {' — '}
              <Button
                className={styles.linkButton}
                style="text"
                href="https://www.minimal-gaia-x.eu/privacy/en"
              >
                Privacy
              </Button>
              {appConfig.privacyPreferenceCenter === 'true' && (
                <>
                  {' — '}
                  <Button
                    style="text"
                    size="small"
                    className="link"
                    onClick={() => {
                      setShowPPC(true)
                    }}
                  >
                    {cookies.optionalCookies?.length > 0
                      ? 'Cookie Settings'
                      : 'Cookies'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
