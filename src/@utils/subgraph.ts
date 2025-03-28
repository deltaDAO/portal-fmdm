import { gql, OperationResult, TypedDocumentNode, OperationContext } from 'urql'
import { LoggerInstance } from '@oceanprotocol/lib'
import { getUrqlClientInstance } from '@context/UrqlProvider'
import { getOceanConfig } from './ocean'
import { OrdersData_orders as OrdersData } from '../@types/subgraph/OrdersData'
import { OpcFeesQuery as OpcFeesData } from '../@types/subgraph/OpcFeesQuery'
import appConfig from '../../app.config'
import { chains } from '../../chains.config'
import { ethers } from 'ethers'

const UserTokenOrders = gql`
  query OrdersData($user: String!) {
    orders(
      orderBy: createdTimestamp
      orderDirection: desc
      where: { consumer: $user }
    ) {
      consumer {
        id
      }
      datatoken {
        id
        address
        symbol
      }
      consumerMarketToken {
        address
        symbol
      }
      createdTimestamp
      tx
    }
  }
`

const OpcFeesQuery = gql`
  query OpcFeesQuery($id: ID!) {
    opc(id: $id) {
      swapOceanFee
      swapNonOceanFee
      orderFee
      providerFee
    }
  }
`

const OpcsApprovedTokensQuery = gql`
  query OpcsApprovedTokensQuery {
    opcs {
      approvedTokens {
        address: id
        symbol
        name
        decimals
      }
    }
  }
`

export const tokenAddressesEUROe = {
  100: '0xe974c4894996e012399dedbda0be7314a73bbff1',
  137: '0x820802Fa8a99901F52e39acD21177b0BE6EE2974',
  32456: '0x8A4826071983655805bF4f29828577Cd6b1aC0cB',
  32457: '0xdd0a0278f6BAF167999ccd8Aa6C11A9e2fA37F0a',
  80001: '0xA089a21902914C3f3325dBE2334E9B466071E5f1'
}

export function getSubgraphUri(chainId: number): string {
  const config = getOceanConfig(chainId)
  return config.subgraphUri
}

export function getQueryContext(chainId: number): OperationContext {
  try {
    if (!appConfig.chainIdsSupported.includes(chainId))
      throw Object.assign(
        new Error('network not supported, query context cancelled')
      )

    const queryContext: OperationContext = {
      url: `${getSubgraphUri(
        Number(chainId)
      )}/subgraphs/name/oceanprotocol/ocean-subgraph`,
      requestPolicy: 'network-only'
    }
    return queryContext
  } catch (error) {
    LoggerInstance.error('Get query context error: ', error.message)
  }
}

export async function fetchData(
  query: TypedDocumentNode,
  variables: any,
  context: OperationContext
): Promise<any> {
  try {
    const client = getUrqlClientInstance()

    const response = await client.query(query, variables, context).toPromise()
    return response
  } catch (error) {
    LoggerInstance.error('Error fetchData: ', error.message)
  }
  return null
}

export async function fetchDataForMultipleChains(
  query: TypedDocumentNode,
  variables: any,
  chainIds: number[]
): Promise<any[]> {
  let datas: any[] = []
  try {
    for (const chainId of chainIds) {
      const context: OperationContext = getQueryContext(chainId)
      const response = await fetchData(query, variables, context)
      if (!response || response.error) continue
      datas = datas.concat(response?.data)
    }
    return datas
  } catch (error) {
    LoggerInstance.error('Error fetchDataForMultipleChains: ', error.message)
  }
}

export async function getOpcFees(chainId: number) {
  let opcFees
  const variables = {
    id: 1
  }
  const context = getQueryContext(chainId)
  try {
    const response: OperationResult<OpcFeesData> = await fetchData(
      OpcFeesQuery,
      variables,
      context
    )
    opcFees = response?.data?.opc
  } catch (error) {
    LoggerInstance.error('Error getOpcFees: ', error.message)
    throw Error(error.message)
  }
  return opcFees
}

export async function getUserTokenOrders(
  accountId: string,
  chainIds: number[]
): Promise<OrdersData[]> {
  const data: OrdersData[] = []
  const variables = { user: accountId?.toLowerCase() }

  try {
    const tokenOrders = await fetchDataForMultipleChains(
      UserTokenOrders,
      variables,
      chainIds
    )
    for (let i = 0; i < tokenOrders?.length; i++) {
      tokenOrders[i].orders.forEach((tokenOrder: OrdersData) => {
        data.push(tokenOrder)
      })
    }

    return data
  } catch (error) {
    LoggerInstance.error('Error getUserTokenOrders', error.message)
  }
}

export async function getOpcsApprovedTokens(
  chainId: number
): Promise<TokenInfo[]> {
  const context = getQueryContext(chainId)

  try {
    const response = await fetchData(OpcsApprovedTokensQuery, null, context)
    if (!response?.data) return

    // TODO: remove the mocked EUROe integration
    const { approvedTokens } = response.data.opcs[0]
    if (!Object.keys(tokenAddressesEUROe).includes(chainId.toString()))
      return approvedTokens

    const oceanTokenAddress = chains.find(
      (chain) => chain.chainId === chainId
    )?.oceanTokenAddress
    const approvedTokensWithoutOcean = approvedTokens.filter(
      (token) =>
        ethers.utils.getAddress(token.address) !==
        ethers.utils.getAddress(oceanTokenAddress)
    )

    return approvedTokensWithoutOcean.includes(
      (token) =>
        ethers.utils.getAddress(token.address) ===
        ethers.utils.getAddress(tokenAddressesEUROe[chainId])
    )
      ? approvedTokensWithoutOcean
      : [
          ...approvedTokensWithoutOcean,
          {
            address: tokenAddressesEUROe[chainId],
            // TODO: revert once decimals changed to 6 on pontus-x
            decimals: chainId === 32456 ? 18 : 6,
            name: 'EUROe',
            symbol: 'EUROe'
          }
        ]
  } catch (error) {
    LoggerInstance.error('Error getOpcsApprovedTokens: ', error.message)
    throw Error(error.message)
  }
}
