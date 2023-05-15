import { Col, Container, Modal, Row } from 'react-bootstrap'
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
        onHide={this.handleClose}
      >
        <Modal.Header
          style={{
            display: 'flex',
            justifyContent: 'center',
            color: '#00205C',
            alignItems: 'center'
          }}
        >
          <Modal.Title>Authentication</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container>
            <Row>
              <Col
                className="d-flex justify-content-center"
                style={{
                  color: '#AEAEAE'
                }}
              >
                <h6>
                  {this.state.authRequestRetrieved
                    ? this.authText
                    : this.scanText}
                </h6>
              </Col>
            </Row>
            <Row>
              <Col
                className="d-flex justify-content-center"
                style={{ paddingTop: '10px' }}
              >
                <AuthenticationQR
                  setQrCodeData={this.copyQRCode}
                  onAuthRequestRetrieved={() => {
                    this.setState({ ...this.state, authRequestRetrieved: true })
                  }}
                  onSignInComplete={(payload) =>
                    this.props.onSignInComplete(payload)
                  }
                />
              </Col>
            </Row>
          </Container>
        </Modal.Body>

        <Modal.Footer
          style={{
            fontSize: '15px',
            fontWeight: '400',
            lineHeight: '30px',
            alignSelf: 'center',
            borderColor: 'white'
          }}
        >
          <a
            id="copyToClipboard"
            href="#"
            onClick={() => this.handleCopyClick()}
          >
            {this.state.isCopied ? 'Copied!' : 'Copy to clipboard'}
          </a>
        </Modal.Footer>
      </Modal>
    )
  }

  private copyTextToClipboard = async (
    text: string
  ): Promise<boolean | void> => {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text)
    } else {
      return document.execCommand('copy', true, text)
    }
  }

  private handleCopyClick = (): void => {
    this.copyTextToClipboard(this.state.qrCodeData)
      .then(() => {
        this.setState({ ...this.state, isCopied: true })
        setTimeout(() => {
          this.setState({ ...this.state, isCopied: false })
        }, 1500)
      })
      .catch(console.error)
  }

  private copyQRCode = (text: string): void => {
    this.setState({ ...this.state, qrCodeData: text })
  }

  private handleClose = () => {
    this.props.onCloseClicked?.()
  }
}
