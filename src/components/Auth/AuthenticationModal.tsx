import { Col, Container, Modal, Row } from 'react-bootstrap'
import React, { Component } from 'react'
import AuthenticationQR from './AuthenticationQR'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
import './AuthenticationModal.module.css'

/* This is a container dialog for the QR code component. It re emits the onSignInComplete callback.  */

export type AuthenticationModalProps = {
  show?: boolean
  onCloseClicked?: () => void
  onSignInComplete: (payload: AuthorizationResponsePayload) => void
}

interface AuthenticationModalState {
  authRequestRetrieved: boolean
}

export default class AuthenticationModal extends Component<
  AuthenticationModalProps,
  AuthenticationModalState
> {
  private readonly scanText = 'Please scan the QR code with your app.'
  private readonly authText = 'Please approve the request in your app.'

  constructor(props: AuthenticationModalProps) {
    super(props)
    this.state = { authRequestRetrieved: false }
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
            backgroundColor: 'white',
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
                  onAuthRequestRetrieved={() => {
                    this.setState({ authRequestRetrieved: true })
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
          <span>Copy to clipboard</span>
        </Modal.Footer>
      </Modal>
    )
  }

  private handleClose = () => {
    this.props.onCloseClicked?.()
  }
}
