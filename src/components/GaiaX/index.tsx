import React, { ReactElement } from 'react'
import styles from './index.module.css'
import GaiaXLogo from '@images/gaia-x-logo.svg'
import GearIcon from '@images/gear_icon.svg'
import ShoppingCartIcon from '@images/shopping_cart.svg'
import ODLLogo from '@images/odl-logo.svg'
import content from '../../../content/pages/aboutGaiaX.json'
import Container from '@components/@shared/atoms/Container'
import Markdown from '@components/@shared/Markdown'
import Button from '@components/@shared/atoms/Button'

const icons = {
  gear: <GearIcon />,
  cart: <ShoppingCartIcon />,
  logo: <ODLLogo />
}

interface GaiaXContent {
  title: string
  topSection: {
    text: string
    interactivity: {
      image: string
      link: string
    }
    cta: {
      label: string
      link: string
    }
  }[]
  hero: {
    header: string
    points: string[]
  }
  footer: {
    text: string
    disclaimer: string
    cards: {
      title: string
      body: string
      icon: string
    }[]
  }
  image: string
}

export default function GaiaXPage(): ReactElement {
  const { title, topSection, hero, footer, image }: GaiaXContent = content

  return (
    <div className={styles.wrapper}>
      <div className={styles.media}>
        <img src={image} className={styles.image} />
      </div>
      <Container className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {topSection.map((section, i) => (
          <div key={i} className={styles.section}>
            <a
              className={styles.desktopInteractivity}
              href={section.interactivity.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={section.interactivity.image} />
            </a>
            <div className={styles.sectionText}>
              <Markdown text={section.text} />
              <a
                className={styles.mobileInteractivity}
                href={section.interactivity.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={section.interactivity.image} />
              </a>
              <Button
                style="primary"
                href={section.cta.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {section.cta.label}
              </Button>
            </div>
          </div>
        ))}
      </Container>
      <div className={styles.heroWrapper}>
        <Container className={styles.heroContainer}>
          <Markdown className={styles.heroHeader} text={hero.header} />
          <ul>
            {hero.points.map((point, i) => (
              <li key={i}>
                <Markdown text={point} />
              </li>
            ))}
          </ul>
        </Container>
      </div>
      <Container className={styles.footerContainer}>
        <Markdown text={footer.text} />
        <div className={styles.gaiaXContainer}>
          <a
            href="https://www.gxfs.eu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GaiaXLogo />
          </a>
        </div>
        <div className={styles.cardsContainer}>
          {footer.cards.map((card) => (
            <div key={card.icon} className={styles.card}>
              {icons[card.icon]}
              <h4>{card.title}</h4>
              <Markdown text={card.body} />
            </div>
          ))}
        </div>
        <Markdown className={styles.disclaimer} text={footer.disclaimer} />
      </Container>
    </div>
  )
}
