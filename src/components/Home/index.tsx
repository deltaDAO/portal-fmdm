import { ReactElement } from 'react'
import Container from '@components/@shared/atoms/Container'
import HomeContent from './Content'
import Partners from '@components/@shared/Partners'

export default function HomePage(): ReactElement {
  return (
    <>
      <Container>
        <Partners extended />
      </Container>
      <HomeContent />
    </>
  )
}
