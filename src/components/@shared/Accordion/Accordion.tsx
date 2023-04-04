import React from 'react'
import classNames from 'classnames/bind'
import styles from './Accordion.module.css'
import Markdown from '@shared/Markdown'

const cx = classNames.bind(styles)
export default function Accordion({
  className,
  content,
  title
}: {
  className?: string
  content: any
  title: string
}) {
  const styleClasses = cx({
    accordion: true,
    [className]: className
  })
  return (
    <div className={styleClasses}>
      <div className={styles.accordion__item}>
        <input type="checkbox" id="title1" />
        <label htmlFor="title1" className={styles.accordion__item__title}>
          <h4>{title}</h4>
        </label>
        <div className={styles.accordion__item__content}>
          <Markdown text={content} className={styleClasses.description} />
        </div>
      </div>
    </div>
  )
}
