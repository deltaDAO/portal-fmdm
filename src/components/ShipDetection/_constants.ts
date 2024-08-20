/**
 * Mapping of { chainId: useCaseAlgorithmDID }
 */
export const ROAD_DAMAGE_ALGO_DIDS = {
  32456:
    'did:op:ffd2c2cd80ded25d37476dd619f6368dd3373070264747a16c8e9d16469727bc'
}

export const ROAD_DAMAGE_USECASE_NAME = 'shipdetection'

export const ROAD_DAMAGE_RESULT_ZIP = {
  fileName: 'result.zip',
  metadataFileName: 'metadata.json',
  detectionsFileName: 'detections.json',
  imagesFolderName: 'images'
}

export const CONFIDENCE_COLOR_MAP = [
  {
    threshold: 0.85,
    color: 'blue'
  },
  {
    threshold: 0.66,
    color: 'green'
  },
  {
    threshold: 0.5,
    color: 'orange'
  },
  {
    threshold: 0.33,
    color: 'firebrick'
  },
  {
    threshold: 0,
    color: 'grey'
  }
]
