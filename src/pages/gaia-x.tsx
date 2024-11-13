import React, { ReactElement } from 'react'
import Page from '@components/@shared/Page'
import GaiaX from '../components/GaiaX'
import { useRouter } from 'next/router'

export default function PageGaiaX(): ReactElement {
  const router = useRouter()

  return (
    <Page uri={router.route}>
      <GaiaX />
    </Page>
  )
}
