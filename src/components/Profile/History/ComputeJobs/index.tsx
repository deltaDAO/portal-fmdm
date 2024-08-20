import React, { ReactElement, useEffect, useState } from 'react'
import Time from '@shared/atoms/Time'
import Table, { TableOceanColumn } from '@shared/atoms/Table'
import Button from '@shared/atoms/Button'
import { useWeb3 } from '@context/Web3'
import Details from './Details'
import Refresh from '@images/refresh.svg'
import { useUserPreferences } from '@context/UserPreferences'
import NetworkName from '@shared/NetworkName'
import styles from './index.module.css'
import AssetListTitle from '@shared/AssetListTitle'

export function Status({ children }: { children: string }): ReactElement {
  return <div className={styles.status}>{children}</div>
}

const columns: TableOceanColumn<ComputeJobMetaData>[] = [
  {
    name: 'Dataset',
    selector: (row) => (
      <AssetListTitle did={row.inputDID[0]} title={row.assetName} />
    )
  },
  {
    name: 'Network',
    selector: (row) => <NetworkName networkId={row.networkId} />
  },
  {
    name: 'Created',
    selector: (row) => <Time date={row.dateCreated} isUnix relative />
  },
  {
    name: 'Finished',
    selector: (row) =>
      row.dateFinished ? <Time date={row.dateFinished} isUnix relative /> : ''
  },
  {
    name: 'Status',
    selector: (row) => <Status>{row.statusText}</Status>
  }
]

export type GetCustomActions = (job: ComputeJobMetaData) => {
  label: ReactElement
  onClick: (job: ComputeJobMetaData) => void
}[]

const defaultActionsColumn: TableOceanColumn<ComputeJobMetaData> = {
  name: 'Actions',
  selector: (row) => <Details job={row} />
}

export default function ComputeJobs({
  minimal,
  jobs,
  isLoading,
  getActions,
  hideDetails,
  refetchJobs
}: {
  minimal?: boolean
  jobs?: ComputeJobMetaData[]
  isLoading?: boolean
  getActions?: (job: ComputeJobMetaData) => {
    label: ReactElement
    onClick: (job: ComputeJobMetaData) => void
  }[]
  hideDetails?: boolean
  refetchJobs?: any
}): ReactElement {
  const { accountId } = useWeb3()
  const { chainIds } = useUserPreferences()

  const [actionsColumn, setActionsColumn] =
    useState<TableOceanColumn<ComputeJobMetaData>>(defaultActionsColumn)

  useEffect(() => {
    if (!getActions) return
    setActionsColumn({
      name: defaultActionsColumn.name,
      selector: (row) => (
        <div className={styles.customActios}>
          {getActions(row).map((action, i) => (
            <Button
              key={`compute-job-action-${action.label}-${i}`}
              size="small"
              style="text"
              onClick={() => action.onClick(row)}
              className={styles.customActionButton}
            >
              {action.label}
            </Button>
          ))}
          {!hideDetails && <Details job={row} />}
        </div>
      )
    })
  }, [getActions])

  return accountId ? (
    <>
      {jobs?.length >= 0 && !minimal && (
        <Button
          style="text"
          size="small"
          title="Refresh compute jobs"
          onClick={async () => await refetchJobs(true)}
          disabled={isLoading}
          className={styles.refresh}
        >
          <Refresh />
          Refresh
        </Button>
      )}
      <Table
        columns={
          minimal
            ? // for minimal view, we only want 'Status', actions and 'Finished'
              [columns[5], actionsColumn, columns[4]]
            : [...columns, actionsColumn]
        }
        data={jobs}
        isLoading={isLoading}
        defaultSortFieldId="row.dateCreated"
        defaultSortAsc={false}
        emptyMessage={chainIds.length === 0 ? 'No network selected' : null}
      />
    </>
  ) : (
    <div>Please connect your Web3 wallet.</div>
  )
}
