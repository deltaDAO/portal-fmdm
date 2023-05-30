import React, { ReactElement } from 'react'
import Menu from './Menu'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'

export default function Header({
  setShow,
  payload,
  setPayload
}: {
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  payload: AuthorizationResponsePayload
  setPayload: React.Dispatch<React.SetStateAction<AuthorizationResponsePayload>>
}): ReactElement {
  return (
    <header>
      <Menu setShow={setShow} payload={payload} setPayload={setPayload} />
    </header>
  )
}
