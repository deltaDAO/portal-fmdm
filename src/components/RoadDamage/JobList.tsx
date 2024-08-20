import { LoggerInstance, ProviderInstance } from '@oceanprotocol/lib'
import React, {
  MutableRefObject,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react'
import { useUseCases } from '../../@context/UseCases'
import { RoadDamageUseCaseData } from '../../@context/UseCases/models/RoadDamage.model'
import { useUserPreferences } from '../../@context/UserPreferences'
import { useCancelToken } from '../../@hooks/useCancelToken'
import { getAsset } from '../../@utils/aquarius'
import { getComputeJobs } from '../../@utils/compute'
import Accordion from '../@shared/Accordion'
import Button from '../@shared/atoms/Button'
import ComputeJobs, { GetCustomActions } from '../Profile/History/ComputeJobs'
import styles from './JobList.module.css'
import { ROAD_DAMAGE_ALGO_DIDS, ROAD_DAMAGE_RESULT_ZIP } from './_constants'
import {
  getMapColor,
  getResultBinaryData,
  transformBinaryToRoadDamageResult
} from './_utils'
import { useWeb3 } from '../../@context/Web3'
import { toast } from 'react-toastify'

export default function JobList(props: {
  setMapData: (mapData: RoadDamageUseCaseData[]) => void
  scrollToMapRef: MutableRefObject<HTMLDivElement>
}): ReactElement {
  const { chainIds } = useUserPreferences()
  const roadDamageAlgoDids: string[] = Object.values(ROAD_DAMAGE_ALGO_DIDS)

  const { accountId, web3 } = useWeb3()

  const { fileName: resultFileName } = ROAD_DAMAGE_RESULT_ZIP
  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])
  const [refetchJobs, setRefetchJobs] = useState(false)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const newCancelToken = useCancelToken()

  const { setMapData, scrollToMapRef } = props

  const {
    roadDamageList,
    clearRoadDamages,
    createOrUpdateRoadDamage,
    deleteRoadDamage
  } = useUseCases()

  useEffect(() => {
    if (!roadDamageList) {
      setMapData([])
      return
    }

    setMapData(roadDamageList)
  }, [roadDamageList, setMapData])

  const fetchJobs = useCallback(async () => {
    if (!accountId) {
      return
    }

    try {
      setIsLoadingJobs(true)
      // Fetch computeJobs for all selected networks (UserPreferences)
      const computeJobs = await getComputeJobs(
        chainIds,
        accountId,
        null,
        newCancelToken()
      )

      // Filter computeJobs for dids configured in _constants
      const filteredJobs = computeJobs.computeJobs.filter(
        (job) =>
          roadDamageAlgoDids.includes(job.algoDID) &&
          job.status === 70 &&
          job.results.filter((result) => result.filename === resultFileName)
            .length > 0
      )

      LoggerInstance.log(
        `[RoadDamage] Fetched compute jobs. Found ${filteredJobs.length} road damage jobs.`,
        { computeJobs, filteredJobs }
      )

      setJobs(filteredJobs)
      setIsLoadingJobs(!computeJobs.isLoaded)
    } catch (error) {
      LoggerInstance.error(error.message)
      setIsLoadingJobs(false)
    }
  }, [chainIds, roadDamageAlgoDids, accountId, resultFileName, newCancelToken])

  useEffect(() => {
    fetchJobs()
  }, [refetchJobs, chainIds])

  const addComputeResultToUseCaseDB = async (job: ComputeJobMetaData) => {
    if (roadDamageList.find((row) => row.job.jobId === job.jobId)) {
      toast.info('This compute job result already is part of the map view.')
      return
    }

    const dataForSameInputExists =
      roadDamageList.filter(
        (row) =>
          job.inputDID?.filter((did) => row.job.inputDID?.includes(did))
            .length === job.inputDID?.length
      ).length > 0

    if (dataForSameInputExists)
      if (
        !confirm(
          'Compute job results for a job with the same dataset inputs already exists. Add anyways?'
        )
      )
        return

    try {
      const datasetDDO = await getAsset(job.inputDID[0], newCancelToken())

      const jobResult = await ProviderInstance.getComputeResultUrl(
        datasetDDO.services[0].serviceEndpoint,
        web3,
        accountId,
        job.jobId,
        job.results.findIndex((result) => result.filename === resultFileName)
      )

      const binary = await getResultBinaryData(jobResult)
      const resultData = await transformBinaryToRoadDamageResult(binary)

      if (!resultData) return

      const newuseCaseData: RoadDamageUseCaseData = {
        job,
        result: resultData
      }

      await createOrUpdateRoadDamage(newuseCaseData)
      toast.success('Added a new compute result')
    } catch (error) {
      LoggerInstance.error(error)
      toast.error('Could not add compute result')
    }
  }

  const deleteJobResultFromDB = async (job: ComputeJobMetaData) => {
    if (!confirm(`Are you sure you want to delete the result from map view?`))
      return

    const rowToDelete = roadDamageList.find(
      (row) => row.job.jobId === job.jobId
    )
    if (!rowToDelete) return

    await deleteRoadDamage(rowToDelete.id)
    toast.success(`Removed compute job result from map view.`)
  }

  const clearData = async () => {
    if (!confirm('All data will be removed from your cache. Proceed?')) return

    await clearRoadDamages()
    toast.success('Road Damage data was cleared.')
  }

  const getCustomActionsPerComputeJob: GetCustomActions = (
    job: ComputeJobMetaData
  ) => {
    const addAction = {
      label: 'Add',
      onClick: () => {
        addComputeResultToUseCaseDB(job)
      }
    }
    const deleteAction = {
      label: 'Remove',
      onClick: () => {
        deleteJobResultFromDB(job)
      }
    }
    const colorLegend = {
      label: (
        <span
          className={styles.legend}
          style={{ backgroundColor: getMapColor(job.inputDID) }}
        />
      ),
      onClick: () => {
        if (scrollToMapRef?.current) scrollToMapRef.current.scrollIntoView()
      }
    }

    const viewContainsResult = roadDamageList.find(
      (row) => row.job.jobId === job.jobId
    )

    const actionArray = []

    if (viewContainsResult) {
      actionArray.push(deleteAction)
      actionArray.push(colorLegend)
    } else actionArray.push(addAction)

    return actionArray
  }

  return (
    <div className={styles.accordionWrapper}>
      <Accordion title="Compute Jobs" defaultExpanded>
        <ComputeJobs
          jobs={jobs}
          isLoading={isLoadingJobs}
          refetchJobs={() => setRefetchJobs(!refetchJobs)}
          getActions={getCustomActionsPerComputeJob}
          hideDetails
        />

        <div className={styles.actions}>
          <Button onClick={() => clearData()}>Clear Data</Button>
        </div>
      </Accordion>
    </div>
  )
}
