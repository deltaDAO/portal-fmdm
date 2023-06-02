import styles from './Auth.module.css'
import React from 'react'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'

export default function Auth({
  setShow,
  payload,
  setPayload
}: {
  setShow: () => void
  payload: AuthorizationResponsePayload
  setPayload: React.Dispatch<React.SetStateAction<AuthorizationResponsePayload>>
}) {
  if (!payload) {
    return (
      <button
        className={`${styles.button} ${styles.initial}`}
        onClick={setShow}
      >
        Login
      </button>
    )
  } else {
    return (
      <button
        className={`${styles.button} ${styles.initial}`}
        onClick={() => setPayload(undefined)}
      >
        Logout
      </button>
    )
  }
}
