import { ReactElement } from 'react'
import Page from '@components/@shared/Page'
import About from '../components/About'
import { useRouter } from 'next/router'

export default function PageAbout(): ReactElement {
  const router = useRouter()

  return (
    <Page uri={router.route}>
      <About />
    </Page>
  )
}
