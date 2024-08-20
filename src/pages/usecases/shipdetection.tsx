import React, { ReactElement } from 'react'
import Page from '@shared/Page'
import { useRouter } from 'next/router'
import content from '../../../content/pages/shipdetection.json'
import ShipDetection from '../../components/ShipDetection'

export default function PageRoadDamage(): ReactElement {
  const router = useRouter()

  const { title, description } = content

  return (
    <Page title={title} description={description} uri={router.route}>
      <ShipDetection />
    </Page>
  )
}
