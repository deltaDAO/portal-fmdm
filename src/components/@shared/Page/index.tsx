import { ReactNode, ReactElement } from 'react'
import PageHeader from './PageHeader'
import Seo from './Seo'
import Container from '@shared/atoms/Container'
import SearchBar from '@components/Header/SearchBar'
import { useUserPreferences } from '@context/UserPreferences'
import ExternalContentWarning from '../ExternalContentWarning'
import Header from 'src/components/Home/Header'
import { useSearchBarStatus } from '@context/SearchBarStatus'
import styles from './index.module.css'

export interface PageProps {
  children: ReactNode
  title?: string
  uri: string
  description?: string
  noPageHeader?: boolean
  headerCenter?: boolean
}

export default function Page({
  children,
  title,
  uri,
  description,
  noPageHeader,
  headerCenter
}: PageProps): ReactElement {
  const { allowExternalContent } = useUserPreferences()

  const isHome = uri === '/'
  const isSearchPage = uri.startsWith('/search')
  const isAssetPage = uri.startsWith('/asset')

  return (
    <>
      <Container>
        <SearchBar
          placeholder="Search for service offerings"
          isSearchPage={isSearchPage}
        />
      </Container>
      <Seo title={title} description={description} uri={uri} />
      {title && !noPageHeader && isHome && <Header />}
      <Container className={styles.container}>
        {isAssetPage && !allowExternalContent && <ExternalContentWarning />}
        {children}
      </Container>
    </>
  )
}
