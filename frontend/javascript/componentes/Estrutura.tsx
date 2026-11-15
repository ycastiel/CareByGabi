import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Tela } from '../paginas/pacientes/Modelos'
import { Icone } from './Icone'

type IconeNome = Parameters<typeof Icone>[0]['nome']
const navegacao: { tela?: Tela; nome: string; icone: IconeNome }[] = [
  { tela: 'inicio', nome: 'Visão geral', icone: 'inicio' },
  { tela: 'pacientes', nome: 'Pacientes', icone: 'pacientes' },
  { tela: 'agenda', nome: 'Agenda clínica', icone: 'agenda' },
  { nome: 'Prontuários', icone: 'prontuarios' },
  { nome: 'Avaliações', icone: 'avaliacoes' },
  { nome: 'Atendimento IA', icone: 'ia' },
  { nome: 'Financeiro', icone: 'financeiro' },
  { tela: 'servicos', nome: 'Serviços e valores', icone: 'servicos' },
  { nome: 'Documentos', icone: 'documentos' },
]

export function Estrutura({ tela, mudarTela, sair, aoAtualizar, usuario, children }: {
  tela: Tela; mudarTela: (tela: Tela) => void; sair: () => void
  aoAtualizar: () => void; usuario: string; children: ReactNode
}) {
  const [menuAberto, setMenuAberto] = useState(false)
  const titulos: Record<Tela, string> = {
    inicio: 'Visão geral', pacientes: 'Pacientes', agenda: 'Agenda clínica', servicos: 'Serviços e valores',
  }
  return <div className="app-shell">
    <aside className={`sidebar ${menuAberto ? 'sidebar-aberta' : ''}`}>
      <div className="identidade">
        <div className="marca-simbolo"><img src="/logo-gabriela.jpg" className="logo-profissional" alt="Identidade visual Gabriela" /></div>
        <div className="marca-texto"><strong>Gabriela Souza</strong><small>Psicologia & cuidado</small></div>
        <button className="botao-iconico fechar-menu" onClick={() => setMenuAberto(false)} aria-label="Fechar menu"><Icone nome="fechar" /></button>
      </div>
      <div className="navegacao-titulo">ÁREA DE TRABALHO</div>
      <nav aria-label="Navegação principal" className="navegacao">
        {navegacao.map(item => <button key={item.nome} type="button"
          className={`item-navegacao ${tela === item.tela ? 'selecionado' : ''} ${!item.tela ? 'pendente' : ''}`}
          disabled={!item.tela} title={!item.tela ? 'Módulo em desenvolvimento' : undefined}
          onClick={() => { if (item.tela) { mudarTela(item.tela); setMenuAberto(false) } }}>
          <Icone nome={item.icone} tamanho={19} /><span>{item.nome}</span>
          {!item.tela && <span className="em-breve">em breve</span>}
        </button>)}
      </nav>
      <div className="sidebar-rodape"><div className="rodape-icon"><Icone nome="escudo" /></div>
        <p><b>Ambiente demonstrativo</b><span>Use apenas registros fictícios. Persistência local, sem dados clínicos reais.</span></p>
      </div>
    </aside>
    {menuAberto && <button type="button" className="menu-sombra" aria-label="Fechar navegação" onClick={() => setMenuAberto(false)} />}
    <section className="area-principal">
      <header className="barra-superior">
        <div className="breadcrumb"><button className="botao-iconico abrir-menu" onClick={() => setMenuAberto(true)} aria-label="Abrir menu"><Icone nome="menu" /></button>
          <span>Consultório</span><b>/</b><strong>{titulos[tela]}</strong></div>
        <div className="acoes-superiores"><span className="indicador-local"><span /> Demonstração local</span>
          <button className="botao-iconico" type="button" title="Atualizar dados" aria-label="Atualizar dados" onClick={aoAtualizar}><Icone nome="atualizar" tamanho={18} /></button>
          <div className="usuario"><div className="avatar">{usuario.slice(0, 1).toUpperCase()}</div><span>{usuario}</span></div>
          <button className="botao-iconico" type="button" title="Encerrar sessão" aria-label="Encerrar sessão" onClick={sair}><Icone nome="sair" tamanho={18} /></button>
        </div>
      </header>
      <main className="conteudo-principal">{children}</main>
    </section>
  </div>
}
