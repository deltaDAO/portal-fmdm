import React, { ReactElement, useState } from 'react'
import Alert from '@shared/atoms/Alert'
import Footer from '../Footer/Footer'
import Header from '../Header'
import { useWeb3 } from '@context/Web3'
import { useAccountPurgatory } from '@hooks/useAccountPurgatory'
import AnnouncementBanner from '@shared/AnnouncementBanner'
import PrivacyPreferenceCenter from '../Privacy/PrivacyPreferenceCenter'
import styles from './index.module.css'
import { ToastContainer } from 'react-toastify'
import contentPurgatory from '../../../content/purgatory.json'
import { useMarketMetadata } from '@context/MarketMetadata'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
import AuthenticationModal from '@components/ssi/AuthenticationModal/AuthenticationModal'

export default function App({
  children
}: {
  children: ReactElement
}): ReactElement {
  const { siteContent, appConfig } = useMarketMetadata()
  const { accountId } = useWeb3()
  const { isInPurgatory, purgatoryData } = useAccountPurgatory(accountId)
  const [show, setShow] = useState(false)
  const [payload, setPayload] = useState<AuthorizationResponsePayload>()

  function onSignInComplete(payload: AuthorizationResponsePayload): void {
    setShow(false)
    setPayload(payload)
  }

  return (
    <div className={styles.app}>
      {siteContent?.announcement !== '' && (
        <AnnouncementBanner text={siteContent?.announcement} />
      )}
      <Header setShow={setShow} payload={payload} setPayload={setPayload} />
      {isInPurgatory && (
        <Alert
          title={contentPurgatory.account.title}
          badge={`Reason: ${purgatoryData?.reason}`}
          text={contentPurgatory.account.description}
          state="error"
        />
      )}
      <main className={styles.main}>{children}</main>
      <Footer />

      {appConfig?.privacyPreferenceCenter === 'true' && (
        <PrivacyPreferenceCenter style="small" />
      )}

      <ToastContainer position="bottom-right" newestOnTop />
      <AuthenticationModal
        show={show}
        onCloseClicked={() => setShow(false)}
        onSignInComplete={onSignInComplete}
      />
    </div>
  )
}
