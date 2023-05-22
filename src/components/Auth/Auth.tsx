import styles from './Auth.module.css'
import React from 'react'

export default function Auth({ setShow }: { setShow: () => void }) {
  return (
    <button className={`${styles.button} ${styles.initial}`} onClick={setShow}>
      Sign In
    </button>
  )
}
