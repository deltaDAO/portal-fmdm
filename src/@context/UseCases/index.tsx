import Dexie, { IndexableType, Table } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { ReactElement, ReactNode, createContext, useContext } from 'react'
import { DATABASE_NAME, DATABASE_VERSION } from './_contants'
import {
  SHIP_DETECTION_TABLE,
  ShipDetectionUseCaseData
} from './models/ShipDetection.model'
import { LoggerInstance } from '@oceanprotocol/lib'

export class UseCaseDB extends Dexie {
  shipDetections!: Table<ShipDetectionUseCaseData>
  constructor() {
    super(DATABASE_NAME)
    this.version(DATABASE_VERSION).stores({
      ...SHIP_DETECTION_TABLE
    })
  }
}

export const database = new UseCaseDB()

interface UseCasesValue {
  createOrUpdateRoadDamage: (
    roadDamage: ShipDetectionUseCaseData
  ) => Promise<IndexableType>
  roadDamageList: ShipDetectionUseCaseData[]
  updateRoadDamages: (
    roadDamages: ShipDetectionUseCaseData[]
  ) => Promise<IndexableType>
  deleteRoadDamage: (id: number) => Promise<void>
  clearRoadDamages: () => Promise<void>
}

const UseCasesContext = createContext({} as UseCasesValue)

function UseCasesProvider({ children }: { children: ReactNode }): ReactElement {
  const roadDamageList = useLiveQuery(() => database.shipDetections.toArray())

  const createOrUpdateRoadDamage = async (
    roadDamage: ShipDetectionUseCaseData
  ) => {
    if (
      !roadDamage.job ||
      !roadDamage.job.jobId ||
      !roadDamage.result ||
      roadDamage.result.length < 1
    ) {
      LoggerInstance.error(
        `[UseCases] cannot insert without job or result data!`
      )
      return
    }

    const exists = roadDamageList.find(
      (row) => roadDamage.job.jobId === row.job.jobId
    )

    const updated = await database.shipDetections.put(
      {
        ...roadDamage
      },
      exists?.id
    )

    LoggerInstance.log(`[UseCases]: create or update shipDetections table`, {
      roadDamage,
      updated
    })

    return updated
  }

  const updateRoadDamages = async (
    roadDamages: ShipDetectionUseCaseData[]
  ): Promise<IndexableType> => {
    const updated = await database.shipDetections.bulkPut(roadDamages)

    LoggerInstance.log(`[UseCases]: update shipDetections table`, {
      roadDamages,
      updated
    })

    return updated
  }

  const deleteRoadDamage = async (id: number) => {
    await database.shipDetections.delete(id)

    LoggerInstance.log(`[UseCases]: deleted #${id} from shipDetections table`)
  }

  const clearRoadDamages = async () => {
    await database.shipDetections.clear()

    LoggerInstance.log(`[UseCases]: cleared shipDetections table`)
  }

  return (
    <UseCasesContext.Provider
      value={{
        createOrUpdateRoadDamage,
        roadDamageList,
        updateRoadDamages,
        deleteRoadDamage,
        clearRoadDamages
      }}
    >
      {children}
    </UseCasesContext.Provider>
  )
}

// Helper hook to access the provider values
const useUseCases = (): UseCasesValue => useContext(UseCasesContext)

export { UseCasesProvider, useUseCases }
