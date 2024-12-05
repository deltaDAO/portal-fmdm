import { ReactElement, useEffect } from 'react'
import { addExistingParamsToUrl } from './utils'
import styles from './sort.module.css'
import {
  SortDirectionOptions,
  SortTermOptions
} from '../../@types/aquarius/SearchQuery'
import { useRouter } from 'next/router'
import { Sort as SortInterface, useFilter } from '@context/Filter'
import queryString from 'query-string'
import Button from '@components/@shared/atoms/Button'
import classNames from 'classnames/bind'

const sortItems = [
  { display: 'Relevance', value: SortTermOptions.Relevance },
  { display: 'Published', value: SortTermOptions.Created },
  { display: 'Sales', value: SortTermOptions.Orders },
  { display: 'Price', value: SortTermOptions.Price }
]

const sortDirections = [
  { display: '\u2191 Ascending', value: SortDirectionOptions.Ascending },
  { display: '\u2193 Descending', value: SortDirectionOptions.Descending }
]

function getInitialFilters(
  parsedUrlParams: queryString.ParsedQuery<string>,
  filterIds: (keyof SortInterface)[]
): SortInterface {
  if (!parsedUrlParams || !filterIds) return

  const initialFilters = {}
  filterIds.forEach((id) => (initialFilters[id] = parsedUrlParams?.[id]))

  return initialFilters as SortInterface
}

export default function Sort({
  expanded
}: {
  expanded?: boolean
}): ReactElement {
  const { sort, setSort } = useFilter()

  const router = useRouter()

  const parsedUrl = queryString.parse(location.search, {
    arrayFormat: 'separator'
  })

  useEffect(() => {
    const initialFilters = getInitialFilters(
      parsedUrl,
      Object.keys(sort) as (keyof SortInterface)[]
    )
    setSort(initialFilters)
  }, [])

  const directionArrow = String.fromCharCode(
    sort.sortOrder === SortDirectionOptions.Ascending ? 9650 : 9660
  )

  async function sortResults(
    sortBy?: SortTermOptions,
    direction?: SortDirectionOptions
  ) {
    let urlLocation: string
    if (sortBy) {
      urlLocation = await addExistingParamsToUrl(location, ['sort'])
      urlLocation = `${urlLocation}&sort=${sortBy}`
      setSort({ ...sort, sort: sortBy })
    } else if (direction) {
      urlLocation = await addExistingParamsToUrl(location, ['sortOrder'])
      urlLocation = `${urlLocation}&sortOrder=${direction}`
      setSort({ ...sort, sortOrder: direction })
    }
    router.push(urlLocation)
  }

  function handleSortButtonClick(value: SortTermOptions) {
    if (value === sort.sort) {
      if (sort.sortOrder === SortDirectionOptions.Descending) {
        sortResults(null, SortDirectionOptions.Ascending)
      } else {
        sortResults(null, SortDirectionOptions.Descending)
      }
    } else {
      sortResults(value, null)
    }
  }
  const cx = classNames.bind(styles)

  return (
    <>
      <div className={styles.topPositioning}>
        <div className={styles.sort}>
          <div className={styles.sortList}>
            <h5 className={styles.sortTypeLabel}>SORT</h5>
            {sortItems.map((item) => {
              const sorted = cx({
                [styles.selected]: item.value === sort.sort,
                [styles.sorted]: true
              })
              return (
                <Button
                  key={item.value}
                  className={sorted}
                  name="sortTypeCompact"
                  size="small"
                  onClick={() => handleSortButtonClick(item.value)}
                >
                  {item.display}
                  {item.value === sort.sort && (
                    <span className={styles.direction}>{directionArrow}</span>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
