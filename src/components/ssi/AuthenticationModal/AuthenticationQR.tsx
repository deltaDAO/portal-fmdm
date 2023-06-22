import React, { Component } from 'react'
import { BallTriangle } from 'react-loader-spinner'
import {
  AuthorizationResponseStateStatus,
  AuthStatusResponse,
  GenerateAuthRequestURIResponse
} from './auth-model'
import {
  CreateElementArgs,
  QRType,
  URIData,
  ValueResult
} from '@sphereon/ssi-sdk.qr-code-generator'

import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
import agent from '@components/ssi/AuthenticationModal/agent'
import Debug from 'debug'
import { DEFINITION_ID_REQUIRED_ERROR } from '@components/ssi/AuthenticationModal/constants'

const debug = Debug('sphereon:portal:ssi:AuthenticationQR')

export type AuthenticationQRProps = {
  onAuthRequestRetrieved: () => void
  onSignInComplete: (payload: AuthorizationResponsePayload) => void
  setQrCodeData: (text: string) => void
}

export interface AuthenticationQRState {
  authRequestURIResponse?: GenerateAuthRequestURIResponse
  qrCode?: JSX.Element
}

export default class AuthenticationQR extends Component<AuthenticationQRProps> {
  state: AuthenticationQRState = {}

  private registerStateSent = false
  private refreshTimerHandle?: NodeJS.Timeout
  private qrExpirationMs = 0
  private timedOutRequestMappings: Set<AuthenticationQRState> =
    new Set<AuthenticationQRState>()

  private _isMounted = false

  private readonly definitionId =
    process.env.NEXT_PUBLIC_OID4VP_PRESENTATION_DEF_ID

  componentDidMount() {
    this.qrExpirationMs =
      parseInt(process.env.NEXT_PUBLIC_SSI_QR_CODE_EXPIRES_AFTER_SEC ?? '300') *
      750
    // actually since the QR points to a JWT it has its own expiration value as well.

    if (!this.state.qrCode) {
      this.generateNewQRCode()
      this.refreshTimerHandle = setTimeout(
        () => this.refreshQRCode(),
        this.qrExpirationMs
      )
    }
    this._isMounted = true
    if (!this.definitionId) {
      throw new Error(DEFINITION_ID_REQUIRED_ERROR)
    }
  }

  private generateNewQRCode() {
    agent
      .siopClientCreateAuthRequest()
      .then((authRequestURIResponse) => {
        this.props.setQrCodeData(authRequestURIResponse.authRequestURI)
        agent
          .qrURIElement(this.createQRCodeElement(authRequestURIResponse))
          .then((qrCode) => {
            this.registerState(authRequestURIResponse, qrCode)
            // return this.setState({authRequestURIResponse, qrCode})
          })
      })
      .catch(debug)
  }

  createQRCodeElement(
    authRequestURIResponse: GenerateAuthRequestURIResponse
  ): CreateElementArgs<QRType.URI, URIData> {
    const qrProps: CreateElementArgs<QRType.URI, URIData> = {
      data: {
        type: QRType.URI,
        object: authRequestURIResponse.authRequestURI,
        id: authRequestURIResponse.correlationId
      },
      onGenerate: (result: ValueResult<QRType.URI, URIData>) => {
        debug(JSON.stringify(result))
      },
      renderingProps: {
        bgColor: 'white',
        fgColor: '#a6271c',
        level: 'L',
        size: 290,
        title: 'Sign in'
      }
    }
    return qrProps
  }

  componentWillUnmount() {
    if (this.refreshTimerHandle) {
      clearTimeout(this.refreshTimerHandle)
    }
    this._isMounted = false
  }

  render() {
    // Show the loader until we have details on which parameters to load into the QR code
    return this.state.qrCode ? (
      <div>{this.state.qrCode}</div>
    ) : (
      <BallTriangle color="#a6271c" height="100" width="100" />
    )
  }

  /* We don't want to keep used and unused states indefinitely, so expire the QR code after a configured timeout  */
  private refreshQRCode = () => {
    debug('Timeout expired, refreshing QR code...')
    if (this.qrExpirationMs > 0) {
      if (this.state) {
        this.timedOutRequestMappings.add(this.state)
      }
      this.registerStateSent = false
      this.generateNewQRCode()
    }
  }

  private registerState = (
    authRequestURIResponse: GenerateAuthRequestURIResponse,
    qrCode: JSX.Element
  ) => {
    if (
      this.state.authRequestURIResponse?.correlationId ===
      authRequestURIResponse.correlationId
    ) {
      // same correlationId, which we are already polling
      return
    }

    if (!this.timedOutRequestMappings.has({ authRequestURIResponse, qrCode })) {
      this.timedOutRequestMappings.add({ authRequestURIResponse, qrCode })
    }
    this.setState({ qrCode, authRequestURIResponse })
    this.pollAuthStatus(authRequestURIResponse)
  }

  /* Poll the backend until we get a response, abort when the component is unloaded or the QR code expired */
  private pollAuthStatus = async (
    authRequestURIResponse: GenerateAuthRequestURIResponse
  ) => {
    let pollingResponse = await agent.siopClientGetAuthStatus({
      correlationId: authRequestURIResponse?.correlationId,
      definitionId: authRequestURIResponse.definitionId
    })
    const interval = setInterval(async () => {
      const authStatus: AuthStatusResponse = pollingResponse
      if (!this.state.qrCode) {
        clearInterval(interval)
        return this.generateNewQRCode()
      } else if (!authStatus) {
        return
      } else if (this.timedOutRequestMappings.has(this.state)) {
        try {
          debug('Cancelling timed out auth request.')
          await agent.siopClientRemoveAuthRequestState({
            correlationId: this.state?.authRequestURIResponse?.correlationId,
            definitionId: this.state?.authRequestURIResponse?.definitionId
          })
          this.timedOutRequestMappings.delete(this.state) // only delete after deleted remotely
        } catch (error) {
          debug(error)
          clearInterval(interval)
          return Promise.reject(authStatus.error ?? pollingResponse)
        }
      }
      if (authStatus.status === AuthorizationResponseStateStatus.SENT) {
        this.props.onAuthRequestRetrieved()
      } else if (
        authStatus.status === AuthorizationResponseStateStatus.VERIFIED &&
        authStatus.payload
      ) {
        clearInterval(interval)
        return this.props.onSignInComplete(authStatus.payload)
      } else {
        debug(`status during polling: ${JSON.stringify(authStatus)}`)
      }
      // Use the state, as that gets updated by the qr code
      pollingResponse = await agent.siopClientGetAuthStatus({
        correlationId: this.state?.authRequestURIResponse?.correlationId,
        definitionId: this.state?.authRequestURIResponse?.definitionId
      })
      debug(JSON.stringify(pollingResponse))
    }, 2000)
  }
}
