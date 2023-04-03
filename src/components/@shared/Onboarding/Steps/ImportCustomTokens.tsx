import React, { ReactElement, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import StepBody from '../StepBody'
import StepHeader from '../StepHeader'
import content from '../../../../../content/onboarding/steps/importCustomTokens.json'
import { useWeb3 } from '@context/Web3'
import { GEN_X_NETWORK_ID } from 'chains.config'
import { addTokenToWallet } from '@utils/web3'
import { getErrorMessage } from '@utils/onboarding'
import { tokenLogos } from '@components/Header/Wallet/AddTokenList'

export default function ImportCustomTokens(): ReactElement {
  const { title, subtitle, body, image }: OnboardingStep = content

  const { accountId, approvedBaseTokens, web3Provider, networkId } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const importCustomToken = async (
    web3Provider: any,
    tokenAddress: string,
    tokenSymbol: string,
    tokenDecimals: number,
    tokenLogo?: string
  ) => {
    setLoading(true)
    try {
      if (networkId !== GEN_X_NETWORK_ID) throw new Error()

      await addTokenToWallet(
        web3Provider,
        tokenAddress,
        tokenSymbol,
        tokenDecimals,
        tokenLogo
      )
      setCompleted(true)
    } catch (error) {
      toast.error(
        getErrorMessage({
          accountId,
          web3Provider: !!web3Provider,
          networkId
        })
      )
      if (error.message) console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const actions = approvedBaseTokens?.map((token) => ({
    buttonLabel: `Import ${token.symbol} Token`,
    buttonAction: async () => {
      await importCustomToken(
        web3Provider,
        token.address,
        token.symbol,
        token.decimals,
        tokenLogos?.[token.symbol]?.url
      )
    },
    successMessage: `Successfully imported ${token.symbol} test token`,
    loading,
    completed
  }))

  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image} actions={actions} />
    </div>
  )
}
