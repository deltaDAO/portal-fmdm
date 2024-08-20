import dynamic from 'next/dynamic'
import React, { ReactElement, useRef, useState } from 'react'
import JobList from './JobList'
import styles from './index.module.css'
import Wallet from '../Header/Wallet'
import { ShipDetectionUseCaseData } from '../../@context/UseCases/models/ShipDetection.model'

export default function RoadDamageMap(): ReactElement {
  const MapWithNoSSR = dynamic(() => import('./Map'), {
    ssr: false
  })

  const scrollToMapRef = useRef<HTMLDivElement>()

  const [mapData, setMapData] = useState<ShipDetectionUseCaseData[]>([])

  return (
    <div>
      <Wallet />
      <JobList setMapData={setMapData} scrollToMapRef={scrollToMapRef} />
      {mapData && mapData.length > 0 && (
        <div ref={scrollToMapRef}>
          <span className={styles.info}>
            Map info calculated from {mapData.length} compute job result
            {mapData.length > 1 && 's'}.
          </span>
          <MapWithNoSSR data={mapData} />
        </div>
      )}
    </div>
  )
}
