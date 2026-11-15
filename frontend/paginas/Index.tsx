import type { DadosClinica, Tela } from '../javascript/paginas/pacientes/Modelos'
import { Icone } from '../javascript/componentes/Icone'
import { dataHoraBR, horaBR, moeda, rotuloSituacao } from '../javascript/helpers/Formatacao'

export function InicioPagina({ dados, mudarTela }: { dados: DadosClinica; mudarTela: (t: Tela) => void }) {
  const hoje = new Date().toDateString()
  const futuros = dados.agendamentos.filter(a => new Date(a.inicioEm) >= new Date() &&
    a.situacao !== 'CANCELADO' && a.situacao !== 'NAO_COMPARECEU')
  const hojeAgendados = dados.agendamentos.filter(a => new Date(a.inicioEm).toDateString() === hoje && a.situacao !== 'CANCELADO')
  const proximos = [...futuros].sort((a, b) => a.inicioEm.localeCompare(b.inicioEm)).slice(0, 5)
  const ativos = dados.pacientes.filter(p => p.situacao === 'ATIVO').length
  const valorReferencia = futuros.reduce((total, a) => total + (dados.servicos.find(s => s.id === a.servicoId)?.valorPadrao ?? 0), 0)

  return <>
    <div className="boas-vindas"><div><span className="sobretitulo">SEU ESPAÇO DE CUIDADO</span><h1>Olá, seja bem-vinda <span>✳</span></h1>
      <p>Organização e acolhimento em cada detalhe da rotina clínica.</p></div>
      <button className="botao primario" onClick={() => mudarTela('agenda')}><Icone nome="adicionar" tamanho={18} /> Novo agendamento</button>
    </div>
    <section className="grade-estatisticas" aria-label="Indicadores principais">
      <div className="estatistica"><div className="estatistica-topo"><span>Pacientes ativos</span><span className="icone-suave"><Icone nome="pacientes" /></span></div><strong>{ativos}</strong><small>Cadastros em acompanhamento</small></div>
      <div className="estatistica"><div className="estatistica-topo"><span>Consultas hoje</span><span className="icone-suave"><Icone nome="calendario" /></span></div><strong>{hojeAgendados.length}</strong><small>Compromissos do dia</small></div>
      <div className="estatistica"><div className="estatistica-topo"><span>Próximas consultas</span><span className="icone-suave"><Icone nome="relogio" /></span></div><strong>{futuros.length}</strong><small>Agendadas ou confirmadas</small></div>
      <div className="estatistica"><div className="estatistica-topo"><span>Valores de referência</span><span className="icone-suave"><Icone nome="financeiro" /></span></div><strong className="estatistica-valor">{moeda(valorReferencia)}</strong><small>Não representa receita recebida</small></div>
    </section>
    <div className="grade-painel">
      <section className="cartao painel-agenda"><div className="cabecalho-cartao"><div><span className="sobretitulo">AGENDA</span><h2>Próximos atendimentos</h2></div><button className="botao texto" onClick={() => mudarTela('agenda')}>Ver agenda <Icone nome="seta" tamanho={16}/></button></div>
        {proximos.length ? <div className="lista-agenda">
          {proximos.map(a => <div className="linha-agenda" key={a.id}><div className="hora-agenda">{horaBR(a.inicioEm)}</div>
            <div className="linha-agenda-dados"><strong>{a.pacienteNome}</strong><small>{a.servicoNome} · {dataHoraBR(a.inicioEm)}</small></div>
            <span className={`status ${a.situacao.toLowerCase()}`}>{rotuloSituacao[a.situacao]}</span></div>)}
        </div> : <div className="vazio pequeno"><Icone nome="calendario" tamanho={28} /><strong>Nenhuma consulta futura</strong><span>Cadastre um serviço e organize sua primeira consulta.</span></div>}
      </section>
      <section className="cartao painel-acesso"><div className="cabecalho-cartao"><div><span className="sobretitulo">ATALHOS</span><h2>Acesso rápido</h2></div></div>
        <div className="atalhos">
          <button onClick={() => mudarTela('pacientes')}><span className="atalho-icone"><Icone nome="pacientes" /></span><span><strong>Pacientes</strong><small>Cadastros e informações</small></span><Icone nome="seta" tamanho={16}/></button>
          <button onClick={() => mudarTela('agenda')}><span className="atalho-icone"><Icone nome="agenda" /></span><span><strong>Agenda</strong><small>Consultas e horários</small></span><Icone nome="seta" tamanho={16}/></button>
          <button onClick={() => mudarTela('servicos')}><span className="atalho-icone"><Icone nome="servicos" /></span><span><strong>Serviços</strong><small>Duração e valores</small></span><Icone nome="seta" tamanho={16}/></button>
        </div>
        <div className="nota-seguranca"><Icone nome="escudo" tamanho={19}/><p><b>Dados demonstrativos somente</b><span>O MVP tem persistência local, mas ainda não está homologado para dados clínicos reais.</span></p></div>
      </section>
    </div>
  </>
}
