import { RoadDamageResultWithImage } from '../../../components/ShipDetection/_types'

/**
 * Table config
 */
export interface ShipDetectionUseCaseData {
  id?: number
  job: ComputeJobMetaData
  result: RoadDamageResultWithImage[]
}

export const SHIP_DETECTION_TABLE = {
  shipDetections: '++id, job, result'
}
