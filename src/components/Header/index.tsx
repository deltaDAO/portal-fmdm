import React, { ReactElement } from 'react'
import Menu from './Menu'

export default function Header({
  setShow
}: {
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}): ReactElement {
  return (
    <header>
      <Menu setShow={setShow} />
    </header>
  )
}
