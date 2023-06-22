import { Col, Modal, Row } from 'react-bootstrap'
import React, { Component } from 'react'
import AuthenticationQR from './AuthenticationQR'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
/* This is a container dialog for the QR code component. It re emits the onSignInComplete callback.  */

export type AuthenticationModalProps = {
  show?: boolean
  onCloseClicked?: () => void
  onSignInComplete: (payload: AuthorizationResponsePayload) => void
}

interface AuthenticationModalState {
  authRequestRetrieved: boolean
  isCopied: boolean
  qrCodeData: string
}

export default class AuthenticationModal extends Component<
  AuthenticationModalProps,
  AuthenticationModalState
> {
  private readonly scanText = 'Please scan the QR code with your app.'
  private readonly authText = 'Please approve the request in your app.'

  constructor(props: AuthenticationModalProps) {
    super(props)
    this.state = {
      authRequestRetrieved: false,
      isCopied: false,
      qrCodeData: ''
    }
  }

  render() {
    return (
      <Modal
        aria-labelledby="contained-modal-title-vcenter"
        centered
        fullscreen="true"
        show={this.props.show}
        dialogClassName="modal-dialog" // TODO
      >
        <div className="walletconnect-modal__header">
          <p
            style={{
              fontSize: '28px',
              fontWeight: '600',
              alignItems: 'flex-start',
              display: 'flex',
              flex: '1 1 0%',
              marginLeft: '5px',
              color: '#303030'
            }}
          >
            Login
          </p>
          <div
            className="walletconnect-modal__close__wrapper"
            onClick={this.handleClose}
          >
            <div className="walletconnect-modal__close__icon">
              <div className="walletconnect-modal__close__line1"></div>
              <div className="walletconnect-modal__close__line2"></div>
            </div>
          </div>
        </div>
        <Modal.Body>
          <div>
            <Row>
              <Col
                className="left-column"
                style={{ width: '540px', backgroundColor: '#EBEBEB' }}
              >
                <h5
                  style={{
                    marginTop: 60,
                    marginBottom: 25,
                    color: '#303030'
                  }}
                >
                  For the first time access
                </h5>
                <h5
                  style={{
                    marginBottom: 6,
                    fontWeight: 'bold',
                    color: '#303030'
                  }}
                >
                  Step 1. Have a wallet
                </h5>
                <h6
                  style={{ marginBottom: 25, fontSize: 12, color: '#303030' }}
                >
                  Install a compliant{' '}
                  <a
                    href={process.env.NEXT_PUBLIC_DOWNLOAD_SSI_WALLET_LINK}
                    rel="noreferrer"
                    target="_blank"
                    className={'modal-link'}
                  >
                    SSI wallet
                  </a>
                </h6>
                <h5
                  style={{
                    marginBottom: 6,
                    fontWeight: 'bold',
                    color: '#303030'
                  }}
                >
                  Step 2. Get the Guest credential
                </h5>
                <h6
                  style={{ marginBottom: 25, color: '#303030', fontSize: 12 }}
                >
                  Request a Guest credential via{' '}
                  <a
                    href={process.env.NEXT_PUBLIC_OID4VCI_ISSSUE_FORM_LINK}
                    rel="noreferrer"
                    target="_blank"
                    className={'modal-link'}
                  >
                    this form
                  </a>{' '}
                  and store it in your wallet*
                </h6>
                <h5
                  style={{
                    marginBottom: 6,
                    fontWeight: 'bold',
                    color: '#303030'
                  }}
                >
                  Step 3. Scan the QR code
                </h5>
                <h6
                  style={{ marginBottom: 260, color: '#303030', fontSize: 12 }}
                >
                  Scan the QR code on the right & share the credential form your
                  wallet
                </h6>
                <h6 style={{ color: '#303030', fontSize: 12, maxWidth: 407 }}>
                  *In the near future you will be able to choose to login with
                  other types of credentials
                </h6>
              </Col>
              <Col
                style={{ width: '540px' }}
                className="d-flex justify-content-center align-items-center"
              >
                <div style={{ padding: 10, border: '4px solid #a6271c' }}>
                  <AuthenticationQR
                    setQrCodeData={this.copyQRCode}
                    onAuthRequestRetrieved={() => {
                      this.setState({
                        ...this.state,
                        authRequestRetrieved: true
                      })
                    }}
                    onSignInComplete={this.props.onSignInComplete}
                  />
                </div>
              </Col>
            </Row>
          </div>
        </Modal.Body>
      </Modal>
    )
  }

  private copyQRCode = (text: string): void => {
    this.setState({ ...this.state, qrCodeData: text })
  }

  private handleClose = () => {
    this.props.onCloseClicked?.()
  }
}
