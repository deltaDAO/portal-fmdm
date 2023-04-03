import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import classNames from 'classnames/bind'
import styles from './Header.module.css'
import { animated, useSpringRef, useTransition } from 'react-spring'
import content from '../../../content/pages/home/header.json'
import { useMarketMetadata } from '@context/MarketMetadata'
import Markdown from '@components/@shared/Markdown'
import Button from '@components/@shared/atoms/Button'
import Container from '@components/@shared/atoms/Container'

const cx = classNames.bind(styles)
const CAROUSEL_SCROLL_TIMEOUT = 60000

interface HeaderContent {
  body: string
  cta: {
    label: string
    link: string
  }[]
  carousel: string[]
}

const translateMovements = {
  fromTranslateLeft: 'translate3d(-100%,-50%,0)',
  fromTranslateRight: 'translate3d(100%,-50%,0)',
  leaveTranslateLeft: 'translate3d(50%,-50%,0)',
  leaveTranslateRight: 'translate3d(-50%,-50%,0)',
  startPosition: 'translate3d(0%,-50%,0)'
}

export default function PageHeader(): ReactElement {
  const { body, cta, carousel }: HeaderContent = content
  const { siteContent } = useMarketMetadata()

  const [index, setIndex] = useState(0)

  const { fromTranslateRight, leaveTranslateRight, startPosition } =
    translateMovements

  const scrollImage = useCallback(() => {
    setIndex((state) => (state + 1) % carousel.length)
  }, [carousel])

  useEffect(() => {
    const timer = setTimeout(scrollImage, CAROUSEL_SCROLL_TIMEOUT)
    return () => {
      clearTimeout(timer)
    }
  }, [scrollImage, index])

  const transRef = useSpringRef()
  const moveAndFadeDiv = useTransition(index, {
    ref: transRef,
    keys: null,
    initial: {
      opacity: 1,
      transform: startPosition
    },
    from: {
      opacity: 0,
      transform: fromTranslateRight
    },
    enter: { opacity: 1, transform: startPosition },
    leave: {
      opacity: 0,
      transform: leaveTranslateRight
    },
    config: { mass: 1, tension: 170, friction: 26 }
  })
  useEffect(() => {
    transRef.start()
  }, [index, transRef])

  return (
    <header className={styles.header}>
      {moveAndFadeDiv((style, i) => (
        <animated.div key={carousel[i]} style={style}>
          <div className={styles.carouselImageContainer}>
            <img className={styles.image} src={carousel[i]} loading="eager" />
          </div>
        </animated.div>
      ))}
      <Container className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>{siteContent?.siteTagline}</h1>
          {body && <Markdown text={body} className={styles.body} />}
          <div className={styles.actions}>
            {cta.map((e, i) => (
              <Button
                key={e.label}
                style={i % 2 === 0 ? 'primary' : 'ghost'}
                to={e.link}
              >
                {e.label}
              </Button>
            ))}
          </div>
        </div>
        <div className={styles.carouselIndicators}>
          {carousel.map((e, i) => (
            <div
              key={e}
              className={cx({ indicator: true, active: index === i })}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </Container>
    </header>
  )
}
