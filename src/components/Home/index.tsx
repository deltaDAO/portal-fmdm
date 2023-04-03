import React, { ReactElement } from 'react'
import Header from './Header'
import Partners from '@components/@shared/Partners'
import Container from '@components/@shared/atoms/Container'
import HomeContent from './Content'

export default function HomePage(): ReactElement {
  return (
    <>
      <Header />
      <Container>
        <Partners extended />
      </Container>
      <HomeContent />
    </>
  )
}
