import type { ReactNode } from 'react'
import { Icone } from './Icone'
import type { IconeNome } from './Icone'

export function CampoIcone({ icone, children, multilinha = false }: {
  icone: IconeNome
  children: ReactNode
  multilinha?: boolean
}) {
  return <span className={`aero-campo${multilinha ? ' aero-campo--multilinha' : ''}`}>
    <span className="aero-campo__icone" aria-hidden="true"><Icone nome={icone} tamanho={17} /></span>
    {children}
  </span>
}
