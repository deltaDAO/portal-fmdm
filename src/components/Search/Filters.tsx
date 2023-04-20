import React, { ReactElement, useState } from 'react'
import classNames from 'classnames/bind'
import { addExistingParamsToUrl } from './utils'
import Button from '@shared/atoms/Button'
import {
  FilterByAccessOptions,
  FilterByTypeOptions
} from '../../@types/aquarius/SearchQuery'
import { useRouter } from 'next/router'
import styles from './Filters.module.css'
import {
  ComplianceType,
  ComplianceTypeLookup
} from '../../@types/ComplianceType'

const cx = classNames.bind(styles)

const clearFilters = [{ display: 'Clear', value: '' }]

const serviceFilterItems = [
  { display: 'datasets', value: FilterByTypeOptions.Data },
  { display: 'algorithms', value: FilterByTypeOptions.Algorithm }
]

const accessFilterItems = [
  { display: 'download', value: FilterByAccessOptions.Download },
  { display: 'compute', value: FilterByAccessOptions.Compute }
]

const purgatoryFilterItem = { display: 'purgatory ', value: 'purgatory' }

const complianceFilterItems = ComplianceTypeLookup.values().map(
  (complianceType) => {
    return {
      display: ComplianceTypeLookup.getCaption(complianceType),
      value: complianceType
    }
  }
)

function complianceOptionsFilter() {
  return (complianceOptions) =>
    (complianceOptions.value === ComplianceType.Gaia_X &&
      process.env.NEXT_PUBLIC_CATALOG_FILTER_COMPLIANCE_GAIA_X_ENABLE ===
        'true') ||
    (complianceOptions.value === ComplianceType.FMDM &&
      process.env.NEXT_PUBLIC_CATALOG_FILTER_COMPLIANCE_FMDM_ENABLE === 'true')
}

export default function FilterPrice({
  serviceType,
  accessType,
  complianceType,
  setServiceType,
  setAccessType,
  setComplianceType,
  addFiltersToUrl,
  ignorePurgatory,
  setIgnorePurgatory,
  className
}: {
  serviceType: string
  accessType: string
  complianceType: string
  setServiceType: React.Dispatch<React.SetStateAction<string>>
  setAccessType: React.Dispatch<React.SetStateAction<string>>
  setComplianceType: React.Dispatch<React.SetStateAction<string>>
  addFiltersToUrl?: boolean
  ignorePurgatory?: boolean
  setIgnorePurgatory?: (value: boolean) => void
  className?: string
}): ReactElement {
  const router = useRouter()
  const [serviceSelections, setServiceSelections] = useState<string[]>([])
  const [accessSelections, setAccessSelections] = useState<string[]>([])
  const [complianceSelections, setComplianceSelections] = useState<string[]>([])

  async function applyFilter(filter: string, filterType: string) {
    switch (filterType) {
      case 'accessType':
        setAccessType(filter)
        break
      case 'serviceType':
        setServiceType(filter)
        break
      case 'complianceType':
        setComplianceType(filter)
        break
    }

    if (addFiltersToUrl) {
      let urlLocation = ''
      if (filterType.localeCompare('accessType') === 0) {
        urlLocation = await addExistingParamsToUrl(location, ['accessType'])
      } else if (filterType.localeCompare('serviceType') === 0) {
        urlLocation = await addExistingParamsToUrl(location, ['serviceType'])
      } else if (filterType.localeCompare('complianceType') === 0) {
        urlLocation = await addExistingParamsToUrl(location, ['complianceType'])
      }

      if (filter && location.search.indexOf(filterType) === -1) {
        switch (filterType) {
          case 'accessType':
            urlLocation = `${urlLocation}&accessType=${filter}`
            break
          case 'serviceType':
            urlLocation = `${urlLocation}&serviceType=${filter}`
            break
          case 'complianceType':
            urlLocation = `${urlLocation}&complianceType=${filter}`
            break
        }
      }

      router.push(urlLocation)
    }
  }

  async function handleSelectedFilter(isSelected: boolean, value: string) {
    if (
      value === FilterByAccessOptions.Download ||
      value === FilterByAccessOptions.Compute
    ) {
      if (isSelected) {
        if (accessSelections.length > 1) {
          // both selected -> select the other one
          const otherValue = accessFilterItems.find(
            (p) => p.value !== value
          ).value
          await applyFilter(otherValue, 'accessType')
          setAccessSelections([otherValue])
        } else {
          // only the current one selected -> deselect it
          await applyFilter(undefined, 'accessType')
          setAccessSelections([])
        }
      } else {
        if (accessSelections.length) {
          // one already selected -> both selected
          await applyFilter(undefined, 'accessType')
          setAccessSelections(accessFilterItems.map((p) => p.value))
        } else {
          // none selected -> select
          await applyFilter(value, 'accessType')
          setAccessSelections([value])
        }
      }
    } else if (
      value === FilterByTypeOptions.Data ||
      value === FilterByTypeOptions.Algorithm
    ) {
      if (isSelected) {
        if (serviceSelections.length > 1) {
          const otherValue = serviceFilterItems.find(
            (p) => p.value !== value
          ).value
          await applyFilter(otherValue, 'serviceType')
          setServiceSelections([otherValue])
        } else {
          await applyFilter(undefined, 'serviceType')
          setServiceSelections([])
        }
      } else {
        if (serviceSelections.length) {
          await applyFilter(undefined, 'serviceType')
          setServiceSelections(serviceFilterItems.map((p) => p.value))
        } else {
          await applyFilter(value, 'serviceType')
          setServiceSelections([value])
        }
      }
    } else {
      if (ComplianceTypeLookup.values().includes(value as ComplianceType)) {
        if (isSelected) {
          if (complianceSelections.length > 1) {
            const otherValue = complianceFilterItems.find(
              (p) => p.value !== value
            ).value
            await applyFilter(otherValue, 'complianceType')
            setComplianceSelections([otherValue])
          } else {
            await applyFilter(undefined, 'complianceType')
            setComplianceSelections([])
          }
        } else {
          if (complianceSelections.length) {
            await applyFilter(undefined, 'complianceType')
            setComplianceSelections(complianceFilterItems.map((p) => p.value))
          } else {
            await applyFilter(value, 'complianceType')
            setComplianceSelections([value])
          }
        }
      }
    }
  }

  async function applyClearFilter(addFiltersToUrl: boolean) {
    setServiceSelections([])
    setAccessSelections([])
    setComplianceSelections([])
    setServiceType(undefined)
    setAccessType(undefined)
    if (ignorePurgatory !== undefined && setIgnorePurgatory !== undefined)
      setIgnorePurgatory(true)
    setComplianceType(undefined)

    if (addFiltersToUrl) {
      let urlLocation = await addExistingParamsToUrl(location, [
        'accessType',
        'serviceType',
        'complianceType'
      ])
      urlLocation = `${urlLocation}`
      router.push(urlLocation)
    }
  }

  const styleClasses = cx({
    filterList: true,
    [className]: className
  })

  return (
    <div className={styleClasses}>
      <div>
        {serviceFilterItems.map((e, index) => {
          const isServiceSelected =
            e.value === serviceType || serviceSelections.includes(e.value)
          const selectFilter = cx({
            [styles.selected]: isServiceSelected,
            [styles.filter]: true
          })
          return (
            <Button
              size="small"
              style="text"
              key={index}
              className={selectFilter}
              onClick={async () => {
                handleSelectedFilter(isServiceSelected, e.value)
              }}
            >
              {e.display}
            </Button>
          )
        })}
      </div>
      <div>
        {accessFilterItems.map((e, index) => {
          const isAccessSelected =
            e.value === accessType || accessSelections.includes(e.value)
          const selectFilter = cx({
            [styles.selected]: isAccessSelected,
            [styles.filter]: true
          })
          return (
            <Button
              size="small"
              style="text"
              key={index}
              className={selectFilter}
              onClick={async () => {
                handleSelectedFilter(isAccessSelected, e.value)
              }}
            >
              {e.display}
            </Button>
          )
        })}
      </div>
      {complianceFilterItems && (
        <div>
          {complianceFilterItems
            .filter(complianceOptionsFilter())
            .map((complianceOptions, index) => {
              const isInComplianceSelected =
                complianceOptions.value === complianceType ||
                complianceSelections.includes(complianceOptions.value)
              const selectFilter = cx({
                [styles.selected]: isInComplianceSelected,
                [styles.filter]: true
              })

              return (
                <Button
                  size="small"
                  style="text"
                  key={index}
                  className={selectFilter}
                  onClick={async () => {
                    handleSelectedFilter(
                      isInComplianceSelected,
                      complianceOptions.value
                    )
                  }}
                >
                  {complianceOptions.display}
                </Button>
              )
            })}
        </div>
      )}
      <div>
        {ignorePurgatory !== undefined && setIgnorePurgatory !== undefined && (
          <Button
            size="small"
            style="text"
            className={cx({
              [styles.selected]: ignorePurgatory,
              [styles.filter]: true
            })}
            onClick={() => setIgnorePurgatory(!ignorePurgatory)}
          >
            {purgatoryFilterItem.display}
          </Button>
        )}
        {clearFilters.map((e, index) => {
          const showClear =
            accessSelections.length > 0 ||
            serviceSelections.length > 0 ||
            complianceSelections.length > 0 ||
            serviceType ||
            accessType ||
            complianceType

          return (
            <Button
              size="small"
              style="text"
              key={index}
              className={showClear ? styles.showClear : styles.hideClear}
              onClick={async () => {
                applyClearFilter(addFiltersToUrl)
              }}
            >
              {e.display}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
