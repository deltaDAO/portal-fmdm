import {
  Config,
  DatatokenCreateParams,
  DDO,
  DispenserCreationParams,
  FreCreationParams,
  generateDid,
  getHash,
  LoggerInstance,
  Metadata,
  NftCreateData,
  NftFactory,
  Service,
  ZERO_ADDRESS
} from '@oceanprotocol/lib'
import { mapTimeoutStringToSeconds } from '@utils/ddo'
import { generateNftCreateData } from '@utils/nft'
import { getEncryptedFiles } from '@utils/provider'
import slugify from 'slugify'
import Web3 from 'web3'
import { algorithmContainerPresets } from './_constants'
import { FormPublishData, MetadataAlgorithmContainer } from './_types'
import {
  complianceApiVersion,
  complianceUri,
  defaultAccessTerms,
  defaultDatatokenTemplateIndex,
  marketFeeAddress,
  publisherMarketFixedSwapFee,
  publisherMarketOrderFee
} from '../../../app.config'
import { getWellKnownDidUrl, isDidWeb, sanitizeUrl } from '@utils/url'
import { getContainerChecksum } from '@utils/docker'
import axios from 'axios'
import { ServiceSD } from 'src/@types/gaia-x/2210/ServiceSD'
import { ComplianceType } from '../../@types/ComplianceType'
import {
  ICredentialSubject,
  IVerifiableCredential,
  IVerifiablePresentation
} from '../../@types/VerifyableCredentials'

function getUrlFileExtension(fileUrl: string): string {
  const splittedFileUrl = fileUrl.split('.')
  return splittedFileUrl[splittedFileUrl.length - 1]
}

async function getAlgorithmContainerPreset(
  dockerImage: string
): Promise<MetadataAlgorithmContainer> {
  if (dockerImage === '') return

  const preset = algorithmContainerPresets.find(
    (preset) => `${preset.image}:${preset.tag}` === dockerImage
  )
  preset.checksum = await (
    await getContainerChecksum(preset.image, preset.tag)
  ).checksum
  return preset
}

function dateToStringNoMS(date: Date): string {
  return date.toISOString().replace(/\.[0-9]{3}Z/, 'Z')
}

function transformTags(originalTags: string[]): string[] {
  const transformedTags = originalTags?.map((tag) => slugify(tag).toLowerCase())
  return transformedTags
}

export async function createTokensAndPricing(
  values: FormPublishData,
  accountId: string,
  config: Config,
  nftFactory: NftFactory,
  web3: Web3
) {
  const nftCreateData: NftCreateData = generateNftCreateData(
    values.metadata.nft,
    accountId,
    values.metadata.transferable
  )
  LoggerInstance.log('[publish] Creating NFT with metadata', nftCreateData)

  // TODO: cap is hardcoded for now to 1000, this needs to be discussed at some point
  const ercParams: DatatokenCreateParams = {
    templateIndex: defaultDatatokenTemplateIndex,
    minter: accountId,
    paymentCollector: accountId,
    mpFeeAddress: marketFeeAddress,
    feeToken: values.pricing.baseToken.address,
    feeAmount: publisherMarketOrderFee,
    // max number
    cap: '115792089237316195423570985008687907853269984665640564039457',
    name: values.services[0].dataTokenOptions.name,
    symbol: values.services[0].dataTokenOptions.symbol
  }

  LoggerInstance.log('[publish] Creating datatoken with ercParams', ercParams)

  let erc721Address, datatokenAddress, txHash

  switch (values.pricing.type) {
    case 'fixed': {
      const freParams: FreCreationParams = {
        fixedRateAddress: config.fixedRateExchangeAddress,
        baseTokenAddress: values.pricing.baseToken.address,
        owner: accountId,
        marketFeeCollector: marketFeeAddress,
        baseTokenDecimals: values.pricing.baseToken.decimals,
        datatokenDecimals: 18,
        fixedRate: values.pricing.price.toString(),
        marketFee: publisherMarketFixedSwapFee,
        withMint: true
      }

      LoggerInstance.log(
        '[publish] Creating fixed pricing with freParams',
        freParams
      )

      const result = await nftFactory.createNftWithDatatokenWithFixedRate(
        accountId,
        nftCreateData,
        ercParams,
        freParams
      )

      erc721Address = result.events.NFTCreated.returnValues[0]
      datatokenAddress = result.events.TokenCreated.returnValues[0]
      txHash = result.transactionHash

      LoggerInstance.log('[publish] createNftErcWithFixedRate tx', txHash)

      break
    }
    case 'free': {
      // maxTokens -  how many tokens cand be dispensed when someone requests . If maxTokens=2 then someone can't request 3 in one tx
      // maxBalance - how many dt the user has in it's wallet before the dispenser will not dispense dt
      // both will be just 1 for the market
      const dispenserParams: DispenserCreationParams = {
        dispenserAddress: config.dispenserAddress,
        maxTokens: web3.utils.toWei('1'),
        maxBalance: web3.utils.toWei('1'),
        withMint: true,
        allowedSwapper: ZERO_ADDRESS
      }

      LoggerInstance.log(
        '[publish] Creating free pricing with dispenserParams',
        dispenserParams
      )

      const result = await nftFactory.createNftWithDatatokenWithDispenser(
        accountId,
        nftCreateData,
        ercParams,
        dispenserParams
      )
      erc721Address = result.events.NFTCreated.returnValues[0]
      datatokenAddress = result.events.TokenCreated.returnValues[0]
      txHash = result.transactionHash

      LoggerInstance.log('[publish] createNftErcWithDispenser tx', txHash)

      break
    }
  }

  return { erc721Address, datatokenAddress, txHash }
}

export function getComplianceApiVersion(context?: string[]): string {
  const latest = complianceApiVersion

  const allowedRegistryDomains = [
    'https://registry.gaia-x.eu/v2206',
    'https://registry.lab.gaia-x.eu/v2206'
  ]
  if (
    !context ||
    !context.length ||
    context.some(
      (e) => allowedRegistryDomains.findIndex((x) => e.startsWith(x)) !== -1
    )
  )
    return latest

  return '2204'
}

export async function getServiceSD(url: string): Promise<string> {
  if (!url) return

  try {
    const serviceSD = await axios.get(url)
    return JSON.stringify(serviceSD.data, null, 2)
  } catch (error) {
    LoggerInstance.error(error.message)
  }
}

export async function signServiceSD(rawServiceSD: any): Promise<any> {
  if (!rawServiceSD) return
  try {
    const response = await axios.post(
      `${complianceUri}/api/eco/credential-offers`,
      rawServiceSD
    )
    const signedServiceSD = {
      selfDescriptionCredential: { ...rawServiceSD },
      ...response.data
    }

    return signedServiceSD
  } catch (error) {
    LoggerInstance.error(error.message)
  }
}

export async function storeRawServiceSD(signedSD: {
  complianceCredentials: any
  selfDescriptionCredential: any
}): Promise<{
  verified: boolean
  storedSdUrl: string | undefined
}> {
  if (!signedSD) return { verified: false, storedSdUrl: undefined }

  const baseUrl = `${complianceUri}/api/eco/verify`
  try {
    const response = await axios.post(baseUrl, signedSD)
    if (response?.status === 409) {
      return {
        verified: false,
        storedSdUrl: undefined
      }
    }
    if (response?.status === 200) {
      return { verified: true, storedSdUrl: response.data.storedSdUrl }
    }

    return { verified: false, storedSdUrl: undefined }
  } catch (error) {
    LoggerInstance.error(error.message)
    return { verified: false, storedSdUrl: undefined }
  }
}

function selectBaseUrl(parsedServiceSD) {
  let baseUrl
  if (
    parsedServiceSD.type &&
    Array.isArray(parsedServiceSD.type) &&
    (parsedServiceSD.type as string[]).indexOf('VerifiablePresentation') !== -1
  ) {
    return `${complianceUri}/api/eco/credential-offers`
  } else {
    return `${complianceUri}/api/eco/verify`
  }
}

export async function verifyRawServiceSD(rawServiceSD: string): Promise<{
  verified: boolean
  complianceApiVersion?: string
  responseBody?: any
}> {
  if (!rawServiceSD) return { verified: false }

  const parsedServiceSD = JSON.parse(rawServiceSD)

  // TODO: put back the compliance API version check
  // const complianceApiVersion = getComplianceApiVersion(
  //   parsedServiceSD?.selfDescriptionCredential?.['@context']
  // )
  try {
    const baseUrl = selectBaseUrl(parsedServiceSD)
    const response = await axios.post(baseUrl, parsedServiceSD)
    if (response?.status === 409) {
      return {
        verified: false,
        responseBody: response.data.body ? response.data.body : response.data
      }
    }
    if (response?.status < 400) {
      return {
        verified: true,
        complianceApiVersion
      }
    }

    return { verified: false }
  } catch (error) {
    LoggerInstance.error(error.message)
    return { verified: false }
  }
}

async function getPublisherFromCredentialSubject(
  credentialSubject: ICredentialSubject
): Promise<string | undefined> {
  // todo: remove support for gx-service-offering:providedBy which is v2210
  if (
    'gx:legalName' in credentialSubject &&
    typeof credentialSubject['gx:legalName'] === 'string'
  ) {
    return credentialSubject['gx:legalName']
  } else if ('gax-trust-framework:legalName' in credentialSubject) {
    const legalName = credentialSubject['gax-trust-framework:legalName']
    if (
      typeof legalName === 'object' &&
      legalName !== null &&
      '@value' in legalName
    ) {
      return legalName['@value'] as string
    }
  } else if (
    'gx-service-offering:providedBy' in credentialSubject ||
    'gx:providedBy' in credentialSubject
  ) {
    const providedBy =
      credentialSubject['gx:providedBy'] ??
      credentialSubject['gx-service-offering:providedBy']

    let providedByUrl = typeof providedBy === 'string' ? providedBy : undefined
    if (!providedByUrl && typeof providedBy === 'object') {
      if ('id' in providedBy && typeof providedBy.id === 'string') {
        providedByUrl = providedBy.id
      } else if (
        '@value' in providedBy &&
        typeof providedBy['@value'] === 'string'
      ) {
        providedByUrl = providedBy['@value']
      }
    }

    let didWeb: string | undefined
    if (isDidWeb(providedByUrl)) {
      didWeb = providedByUrl
      providedByUrl = getWellKnownDidUrl(providedByUrl, 'participant.json')
    }
    const response = await axios.get(sanitizeUrl(providedByUrl))
    if (!response || response.status >= 300 || !response?.data) {
      return
    }

    if (didWeb) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return getPublisherFromVP(response.data) ?? didWeb
    }
    const legalName =
      response.data?.credentialSubject?.['gx:legalName'] ??
      response.data?.selfDescriptionCredential?.credentialSubject?.[
        'gx-participant:legalName'
      ] ??
      providedByUrl
    return typeof legalName === 'string' ? legalName : legalName?.['@value']
  }
  return undefined
}

export async function getPublisherFromVP(vp: any): Promise<string> {
  if (!vp) {
    return
  }

  let serviceOfferingSubject: ICredentialSubject | undefined
  try {
    const parsedVP = typeof vp === 'string' ? JSON.parse(vp) : vp
    if ('verifiableCredential' in parsedVP) {
      const vp = parsedVP as IVerifiablePresentation
      const verifiableCredentials: IVerifiableCredential[] = Array.isArray(
        vp?.verifiableCredential
      )
        ? vp.verifiableCredential
        : [vp.verifiableCredential]
      if (!verifiableCredentials) {
        return undefined
      }

      let publisher
      for (const credential of verifiableCredentials) {
        const credentialSubject = credential?.credentialSubject
        if (typeof credentialSubject !== 'object' || !credentialSubject) {
          continue
        }
        if (
          credentialSubject.type &&
          credentialSubject.type === 'gx:LegalParticipant' &&
          typeof credentialSubject['gx:legalName'] === 'string'
        ) {
          return credentialSubject['gx:legalName']
        }

        if (Array.isArray(credentialSubject)) {
          for (const subject of credentialSubject) {
            if (subject.type && subject.type === 'gx:ServiceOffering') {
              publisher = await getPublisherFromCredentialSubject(
                credentialSubject
              )
              break
            }
          }
        } else if (
          credentialSubject.type &&
          credentialSubject.type === 'gx:ServiceOffering'
        ) {
          serviceOfferingSubject = credentialSubject
        }
        if (publisher) {
          return publisher
        }
      }
      if (!publisher && serviceOfferingSubject) {
        publisher = await getPublisherFromCredentialSubject(
          serviceOfferingSubject
        )
        return publisher
      }
    } else {
      const credentialSubject =
        parsedVP?.selfDescriptionCredential?.credentialSubject
      return await getPublisherFromCredentialSubject(credentialSubject)
    }
    return undefined
  } catch (error) {
    LoggerInstance.error(error.message)
  }
}

export async function transformPublishFormToDdo(
  values: FormPublishData,
  // Those 2 are only passed during actual publishing process
  // so we can always assume if they are not passed, we are on preview.
  datatokenAddress?: string,
  nftAddress?: string
): Promise<DDO> {
  const { metadata, services, user } = values
  const { chainId, accountId } = user
  const {
    type,
    name,
    description,
    tags,
    author,
    termsAndConditions,
    dockerImage,
    dockerImageCustom,
    dockerImageCustomTag,
    dockerImageCustomEntrypoint,
    dockerImageCustomChecksum,
    gaiaXInformation
  } = metadata
  const { access, files, links, providerUrl, timeout } = services[0]
  const did = nftAddress ? generateDid(nftAddress, chainId) : '0x...'
  const currentTime = dateToStringNoMS(new Date())
  const isPreview = !datatokenAddress && !nftAddress

  const algorithmContainerPresets =
    type === 'algorithm' && dockerImage !== '' && dockerImage !== 'custom'
      ? await getAlgorithmContainerPreset(dockerImage)
      : null

  // Transform from files[0].url to string[] assuming only 1 file
  if (files.length && files[0].url && !gaiaXInformation.serviceSD.url) {
    gaiaXInformation.serviceSD.url = files[0].url
  }
  const filesTransformed = files?.length &&
    files[0].valid && [sanitizeUrl(files[0].url)]
  const linksTransformed = links?.length &&
    links[0].valid && [sanitizeUrl(links[0].url)]

  const accessTermsFileInfo = gaiaXInformation.termsAndConditions
  const accessTermsUrlTransformed = accessTermsFileInfo?.length &&
    accessTermsFileInfo[0].valid && [sanitizeUrl(accessTermsFileInfo[0].url)]
  const serviceSD = gaiaXInformation?.serviceSD
  const serviceSDContent = serviceSD?.url
    ? await getServiceSD(serviceSD?.url)
    : serviceSD?.raw
  const verifiedPublisherName = await getPublisherFromVP(serviceSDContent)
  serviceSD.verifiedPublisherName = verifiedPublisherName
  const complianceTypes: Array<ComplianceType> = []
  if (gaiaXInformation.serviceSD) {
    const { verified } = await verifyRawServiceSD(serviceSDContent)
    // When the compliance service passes, and we were able to extract a legalName, we assume the SD is GX compliant for now
    if (
      verified &&
      typeof serviceSD.verifiedPublisherName === 'string' &&
      serviceSD.verifiedPublisherName.length > 0
    ) {
      process.env.NEXT_PUBLIC_SERVICE_SD_COMPLIANCE_FMDM_ENABLE === 'true' &&
        complianceTypes.push(ComplianceType.FMDM)
      //  TODO we may need to do an extra verification before adding the ComplianceType.Gaia_X label
      process.env.NEXT_PUBLIC_SERVICE_SD_COMPLIANCE_GAIA_X_ENABLE === 'true' &&
        complianceTypes.push(ComplianceType.Gaia_X)
    }
  }

  const newMetadata: Metadata = {
    created: currentTime,
    updated: currentTime,
    type,
    name,
    description,
    tags: transformTags(tags),
    author,
    license:
      values.metadata.license || 'https://market.oceanprotocol.com/terms',
    links: linksTransformed,
    additionalInformation: {
      termsAndConditions,
      gaiaXInformation: {
        termsAndConditions: [
          { url: accessTermsUrlTransformed || defaultAccessTerms }
        ],
        ...(type === 'dataset' && {
          containsPII: gaiaXInformation.containsPII,
          PIIInformation: gaiaXInformation.PIIInformation
        }),
        serviceSD
      },
      compliance: complianceTypes
    },
    ...(type === 'algorithm' &&
      dockerImage !== '' && {
        algorithm: {
          language: filesTransformed?.length
            ? getUrlFileExtension(filesTransformed[0])
            : '',
          version: '0.1',
          container: {
            entrypoint:
              dockerImage === 'custom'
                ? dockerImageCustomEntrypoint
                : algorithmContainerPresets.entrypoint,
            image:
              dockerImage === 'custom'
                ? dockerImageCustom
                : algorithmContainerPresets.image,
            tag:
              dockerImage === 'custom'
                ? dockerImageCustomTag
                : algorithmContainerPresets.tag,
            checksum:
              dockerImage === 'custom'
                ? dockerImageCustomChecksum
                : algorithmContainerPresets.checksum
          }
        }
      })
  }

  // this is the default format hardcoded

  const file = {
    nftAddress,
    datatokenAddress,
    files: [
      {
        type: files[0].type,
        index: 0,
        [files[0].type === 'ipfs'
          ? 'hash'
          : files[0].type === 'arweave'
          ? 'transactionId'
          : 'url']: files[0].url,
        method: 'GET'
      }
    ]
  }

  const filesEncrypted =
    !isPreview &&
    files?.length &&
    files[0].valid &&
    (await getEncryptedFiles(file, providerUrl.url))

  const newService: Service = {
    id: getHash(datatokenAddress + filesEncrypted),
    type: access,
    files: filesEncrypted || '',
    datatokenAddress,
    serviceEndpoint: providerUrl.url,
    timeout: mapTimeoutStringToSeconds(timeout),
    ...(access === 'compute' && {
      compute: values.services[0].computeOptions
    })
  }

  const newDdo: DDO = {
    '@context': ['https://w3id.org/did/v1'],
    id: did,
    nftAddress,
    version: '4.1.0',
    chainId,
    metadata: newMetadata,
    services: [newService],
    // Only added for DDO preview, reflecting Asset response,
    // again, we can assume if `datatokenAddress` is not passed,
    // we are on preview.
    ...(!datatokenAddress && {
      datatokens: [
        {
          name: values.services[0].dataTokenOptions.name,
          symbol: values.services[0].dataTokenOptions.symbol
        }
      ],
      nft: {
        ...generateNftCreateData(values?.metadata.nft, accountId)
      }
    })
  }
  return newDdo
}

export function getFormattedCodeString(parsedCodeBlock: any): string {
  const formattedString = JSON.stringify(parsedCodeBlock, null, 2)
  return `\`\`\`\n${formattedString}\n\`\`\``
}

export function updateServiceSelfDescription(
  ddo: DDO,
  serviceSelfDescription: ServiceSD
): DDO {
  const { raw, url } = serviceSelfDescription
  ddo.metadata.additionalInformation.gaiaXInformation.serviceSelfDescription = {
    raw,
    url
  }

  return ddo
}
