import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import { getErrorMessage } from '@utils/onboarding'
import { addCustomNetwork } from '@utils/web3'
import StepBody from '../StepBody'
import StepHeader from '../StepHeader'
import content from '../../../../../content/onboarding/steps/connectNetwork.json'
import { useWeb3 } from '@context/Web3'
import { GEN_X_NETWORK_ID } from 'chains.config'

export default function ConnectNetwork(): ReactElement {
  const {
    title,
    subtitle,
    body,
    image,
    buttonLabel,
    buttonSuccess
  }: OnboardingStep = content

  const { accountId, networkId, web3Provider } = useWeb3()
  const { networksList } = useNetworkMetadata()
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (accountId && !!web3Provider && networkId === GEN_X_NETWORK_ID) {
      setCompleted(true)
    } else {
      setCompleted(false)
    }
  }, [accountId, web3Provider, networkId])

  const connectNetwork = async () => {
    setLoading(true)
    try {
      const networkNode = await networksList.find(
        (data) => data.chainId === GEN_X_NETWORK_ID
      )
      addCustomNetwork(web3Provider, networkNode)
    } catch (error) {
      toast.error(
        getErrorMessage({
          accountId,
          web3Provider: !!web3Provider,
          networkId
        })
      )
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const actions = [
    {
      buttonLabel,
      buttonAction: async () => await connectNetwork(),
      successMessage: buttonSuccess,
      loading,
      completed
    }
  ]

  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image} actions={actions} />
    </div>
  )
}
