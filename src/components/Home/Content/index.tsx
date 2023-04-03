import React, { ReactElement } from 'react'
import styles from './index.module.css'
import Checkmark from '@images/checkmark.svg'
import HighlightBox from './HighlightBox'
import content from '../../../../content/pages/home/content.json'
import Container from '@components/@shared/atoms/Container'
import Markdown from '@components/@shared/Markdown'

interface HomeContentData {
  teaser: {
    title: string
    text: string
  }
  points: {
    text: string
  }[]
  firstTimeVisiting: {
    title: string
    text: string
    buttonLabel: string
    link: string
  }
}

export default function HomeContent(): ReactElement {
  const { teaser, points, firstTimeVisiting }: HomeContentData = content

  return (
    <Container className={styles.wrapper}>
      <h2>{teaser.title}</h2>
      <div className={styles.container}>
        <div className={styles.teaser}>
          <Markdown text={teaser.text} />
        </div>
        <div className={styles.secondarySection}>
          <div className={styles.points}>
            {points.map((point, i) => (
              <span key={i}>
                <Checkmark className={styles.checkmark} />
                <Markdown className={styles.pointText} text={point.text} />
              </span>
            ))}
          </div>
          <HighlightBox
            icon="eye"
            title={firstTimeVisiting.title}
            body={firstTimeVisiting.text}
            buttonLabel={firstTimeVisiting.buttonLabel}
            link={firstTimeVisiting.link}
          />
        </div>
      </div>
    </Container>
  )
}
