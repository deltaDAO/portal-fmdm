import React, { ReactElement } from 'react'
import styles from './index.module.css'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export default function Partners({
  extended,
  className
}: {
  extended?: boolean
  className?: string
}): ReactElement {
  const partners = require
    .context('../../../../public/images/partners', false, /\.(png|jpe?g)$/)
    .keys()
    .filter((e) => e.startsWith('./'))
    .map((x) => x.replace('./', ''))
  const extra = require
    .context('../../../../public/images/extra-logos', false, /\.(png|jpe?g)$/)
    .keys()
    .filter((e) => e.startsWith('./'))
    .map((x) => x.replace('./', ''))

  return (
    <div
      className={cx({
        container: true,
        [className]: className
      })}
    >
      {partners?.map((logo) => (
        <img
          key={logo}
          className={styles.logo}
          src={`/images/partners/${logo}`}
        />
      ))}
      {extended &&
        extra?.map((logo) => (
          <img
            key={logo}
            className={styles.logo}
            src={`/images/extra-logos/${logo}`}
          />
        ))}
    </div>
  )
}
