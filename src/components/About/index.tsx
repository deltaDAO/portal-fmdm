import React, { ReactElement } from 'react'
import styles from './index.module.css'
import content from '../../../content/pages/aboutDemo.json'
import Container from '@components/@shared/atoms/Container'
import Markdown from '@components/@shared/Markdown'
import Partners from '@components/@shared/Partners'

interface AboutContent {
  header: {
    title: string
    body: string
  }
  footer: {
    title: string
    body: string
    contacts: {
      name: string
      image: string
      text: string
      cta: {
        label: string
        link: string
      }
    }[]
  }
  image: string
}

export default function AboutPage(): ReactElement {
  const { header, footer, image }: AboutContent = content

  return (
    <div className={styles.wrapper}>
      <Container className={styles.mainContainer}>
        <div className={styles.main}>
          <div className={styles.content}>
            <h2 className={styles.title}>{header.title}</h2>
            <Markdown className={styles.body} text={header.body} />
          </div>
          <div className={styles.media}>
            <img src={image} className={styles.image} />
          </div>
        </div>
      </Container>
      <div className={styles.partnersWrapper}>
        <Container className={styles.partnersContainer}>
          <h2 className={styles.partnersTitle}>Founding Partners:</h2>
          <Partners className={styles.partners} />
        </Container>
      </div>
      <Container className={styles.contactsContainer}>
        <h2 className={styles.title}>{footer.title}</h2>
        <Markdown className={styles.body} text={footer.body} />
        <div className={styles.contacts}>
          {footer.contacts.map((e, i) => (
            <div className={styles.contact} key={i}>
              <img src={e.image} />
              <div className={styles.contactDetails}>
                <h4>{e.name}</h4>
                <Markdown className={styles.contactText} text={e.text} />
                <a href={e.cta.link}>{e.cta.label}</a>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
