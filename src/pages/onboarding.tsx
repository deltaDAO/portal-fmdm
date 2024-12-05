import { ReactElement } from 'react'
import Page from '@components/@shared/Page'
import OnboardingSection from '@components/@shared/Onboarding'
import { useRouter } from 'next/router'

export default function PageOnboarding(): ReactElement {
  const router = useRouter()

  return (
    <Page uri={router.route}>
      <OnboardingSection />
    </Page>
  )
}
