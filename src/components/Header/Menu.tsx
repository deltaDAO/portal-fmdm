import MenuDropdown from '@components/@shared/MenuDropdown'
import Button from '@components/@shared/atoms/Button'
import Container from '@components/@shared/atoms/Container'
import { useMarketMetadata } from '@context/MarketMetadata'
import loadable from '@loadable/component'
import Logo from '@shared/atoms/Logo'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
import classNames from 'classnames/bind'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactElement } from 'react'
import styles from './Menu.module.css'
import SearchButton from './SearchButton'
import Networks from './UserPreferences/Networks'

const Wallet = loadable(() => import('./Wallet'))

const cx = classNames.bind(styles)

declare type MenuItem = {
  name: string
  link?: string
  subItems?: MenuItem[]
  className?: string
}

export function MenuLink({ name, link, className }: MenuItem) {
  const router = useRouter()

  const basePath = router?.pathname.split(/[/?]/)[1]
  const baseLink = link.split(/[/?]/)[1]

  const classes = cx({
    link: true,
    active: link.startsWith('/') && basePath === baseLink,
    [className]: className
  })

  return (
    <Button
      className={classes}
      {...(link.startsWith('/') ? { to: link } : { href: link })}
    >
      {name}
    </Button>
  )
}

export default function Menu({
  setShow,
  payload,
  setPayload
}: {
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  payload: AuthorizationResponsePayload
  setPayload: React.Dispatch<React.SetStateAction<AuthorizationResponsePayload>>
}): ReactElement {
  const { appConfig, siteContent } = useMarketMetadata()

  return (
    <Container>
      <nav className={styles.menu}>
        <Link href="/" className={styles.logo}>
          <Logo />
        </Link>

        <ul className={styles.navigation}>
          {siteContent?.menu.map((item: MenuItem) => (
            <li key={item.name}>
              {item?.subItems ? (
                <MenuDropdown label={item.name} items={item.subItems} />
              ) : (
                <MenuLink {...item} />
              )}
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <SearchButton />
          {appConfig.chainIdsSupported.length > 1 && <Networks />}
          <Wallet />
        </div>
      </nav>
    </Container>
  )
}
