import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Icone } from './Icone'

export function Modal({ titulo, fechar, children }: { titulo: string; fechar: () => void; children: ReactNode }) {
  useEffect(() => {
    function tecla(evento: KeyboardEvent) { if (evento.key === 'Escape') fechar() }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [fechar])
  return <div className="sobreposicao-modal" onMouseDown={evento => { if (evento.target === evento.currentTarget) fechar() }}>
    <section className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
      <header className="modal-cabecalho"><div><span className="sobretitulo">CAREBYGABI</span><h2>{titulo}</h2></div>
        <button className="botao-iconico" onClick={fechar} aria-label="Fechar janela"><Icone nome="fechar" /></button></header>
      {children}
    </section>
  </div>
}
