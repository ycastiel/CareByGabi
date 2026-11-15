import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Agendamento, AgendamentoFormulario, ModalidadeAgendamento, Paciente,
  Servico, SituacaoAgendamento } from '../../javascript/paginas/pacientes/Modelos'
import { CampoIcone } from '../../javascript/componentes/CampoIcone'
import { Icone } from '../../javascript/componentes/Icone'
import { Modal } from '../../javascript/componentes/Modal'
import { chaveDia, dataHoraBR, paraInputDataHora, rotuloSituacao } from '../../javascript/helpers/Formatacao'

interface FormularioAgenda {
  pacienteId: string; servicoId: string; dataHoraLocal: string; duracaoMinutos: number
  modalidade: ModalidadeAgendamento; situacao: SituacaoAgendamento
  linkReuniao: string; observacaoAdministrativa: string
}

export function AgendaPagina({ agendamentos, pacientes, servicos, ocupado, aoSalvar, irParaServicos, irParaPacientes }: {
  agendamentos: Agendamento[]; pacientes: Paciente[]; servicos: Servico[]; ocupado: boolean
  aoSalvar: (id: string | null, dados: AgendamentoFormulario) => Promise<boolean>
  irParaServicos: () => void; irParaPacientes: () => void
}) {
  const [editando, setEditando] = useState<string | null | undefined>(undefined)
  const [form, setForm] = useState<FormularioAgenda | null>(null)
  const [dia, setDia] = useState('')
  const [situacao, setSituacao] = useState('TODOS')
  const ativos = pacientes.filter(p => p.situacao === 'ATIVO')
  const habilitados = servicos.filter(s => s.ativo)
  const filtrados = useMemo(() => agendamentos.filter(a =>
    (!dia || chaveDia(a.inicioEm) === dia) && (situacao === 'TODOS' || a.situacao === situacao)
  ).sort((a, b) => a.inicioEm.localeCompare(b.inicioEm)), [agendamentos, dia, situacao])

  function abrir(a?: Agendamento) {
    const horarioInicial = new Date()
    horarioInicial.setMinutes(0, 0, 0)
    horarioInicial.setHours(horarioInicial.getHours() + 1)
    setEditando(a?.id ?? null)
    setForm(a ? {
      pacienteId: a.pacienteId, servicoId: a.servicoId,
      dataHoraLocal: paraInputDataHora(a.inicioEm),
      duracaoMinutos: Math.round((new Date(a.fimEm).getTime() - new Date(a.inicioEm).getTime()) / 60000),
      modalidade: a.modalidade, situacao: a.situacao,
      linkReuniao: a.linkReuniao ?? '', observacaoAdministrativa: a.observacaoAdministrativa ?? '',
    } : {
      pacienteId: ativos[0]?.id ?? '', servicoId: habilitados[0]?.id ?? '',
      dataHoraLocal: paraInputDataHora(horarioInicial), duracaoMinutos: habilitados[0]?.duracaoMinutos ?? 50,
      modalidade: 'ONLINE', situacao: 'AGENDADO', linkReuniao: '', observacaoAdministrativa: '',
    })
  }
  function dadosParaApi(f: FormularioAgenda): AgendamentoFormulario {
    const inicio = new Date(f.dataHoraLocal)
    return {
      pacienteId: f.pacienteId, servicoId: f.servicoId,
      inicioEm: inicio.toISOString(),
      fimEm: new Date(inicio.getTime() + f.duracaoMinutos * 60000).toISOString(),
      modalidade: f.modalidade, situacao: f.situacao,
      linkReuniao: f.linkReuniao || null,
      observacaoAdministrativa: f.observacaoAdministrativa || null,
    }
  }
  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (form && await aoSalvar(editando ?? null, dadosParaApi(form))) setEditando(undefined)
  }
  async function cancelar(a: Agendamento) {
    if (!window.confirm(`Cancelar a consulta de ${a.pacienteNome}?`)) return
    await aoSalvar(a.id, {
      pacienteId: a.pacienteId, servicoId: a.servicoId, inicioEm: a.inicioEm, fimEm: a.fimEm,
      modalidade: a.modalidade, situacao: 'CANCELADO', linkReuniao: a.linkReuniao,
      observacaoAdministrativa: a.observacaoAdministrativa,
    })
  }

  return <>
    <div className="titulo-pagina">
      <div><span className="sobretitulo">ORGANIZAÇÃO DA ROTINA</span><h1>Agenda clínica</h1><p>Marque, confirme, remarque e cancele atendimentos.</p></div>
      <button className="botao primario" disabled={!ativos.length || !habilitados.length} onClick={() => abrir()}><Icone nome="adicionar" tamanho={18}/> Novo agendamento</button>
    </div>
    {(!ativos.length || !habilitados.length) && <div className="aviso aviso-calmo"><Icone nome="alerta" tamanho={20}/>
      <span>Para agendar, é necessário ter pelo menos um paciente ativo e um serviço ativo.</span>
      {!ativos.length && <button className="botao secundario pequeno" onClick={irParaPacientes}>Cadastrar paciente</button>}
      {!habilitados.length && <button className="botao secundario pequeno" onClick={irParaServicos}>Cadastrar serviço</button>}
    </div>}
    <section className="cartao cartao-tabela">
      <div className="filtros">
        <label className="filtro-data">Data<input type="date" value={dia} onChange={e => setDia(e.target.value)}/></label>
        <select aria-label="Filtrar situação" value={situacao} onChange={e => setSituacao(e.target.value)}>
          <option value="TODOS">Todas as situações</option><option value="AGENDADO">Agendados</option>
          <option value="CONFIRMADO">Confirmados</option><option value="CANCELADO">Cancelados</option>
          <option value="NAO_COMPARECEU">Não compareceu</option><option value="REALIZADO">Realizados</option>
        </select>
        <button className="botao secundario pequeno" onClick={() => { setDia(''); setSituacao('TODOS') }}>Limpar filtros</button>
        <span className="quantidade">{filtrados.length} consulta(s)</span>
      </div>
      <div className="tabela-container"><table className="tabela">
        <thead><tr><th>Data e hora</th><th>Paciente</th><th>Serviço</th><th>Modalidade</th><th>Situação</th><th>Ações</th></tr></thead>
        <tbody>{filtrados.map(a => <tr key={a.id}>
          <td className="data-destaque">{dataHoraBR(a.inicioEm)}</td><td><strong>{a.pacienteNome}</strong></td><td>{a.servicoNome}</td>
          <td>{a.modalidade === 'ONLINE' ? 'On-line' : 'Presencial'}</td>
          <td><span className={`status ${a.situacao.toLowerCase()}`}>{rotuloSituacao[a.situacao]}</span></td>
          <td><div className="acoes-tabela">
            <button className="botao secundario pequeno" onClick={() => abrir(a)} disabled={ocupado}>Editar</button>
            {a.situacao !== 'CANCELADO' && a.situacao !== 'REALIZADO' && <button className="botao fantasma perigoso pequeno" onClick={() => void cancelar(a)} disabled={ocupado}>Cancelar</button>}
          </div></td>
        </tr>)}
          {!filtrados.length && <tr><td colSpan={6}><div className="vazio"><Icone nome="agenda" tamanho={30}/><strong>Nenhum agendamento encontrado</strong><span>Escolha outra data ou registre uma consulta.</span></div></td></tr>}
        </tbody>
      </table></div>
    </section>

    {editando !== undefined && form && <Modal titulo={editando ? 'Editar agendamento' : 'Novo agendamento'} fechar={() => setEditando(undefined)}>
      <form className="formulario" onSubmit={salvar}>
        <div className="grade-formulario">
          <label>Paciente <b>*</b>
            <CampoIcone icone="usuario"><select required value={form.pacienteId} onChange={e => setForm({ ...form, pacienteId: e.target.value })}>
              <option value="">Selecione</option>{pacientes.filter(p => p.situacao === 'ATIVO' || p.id === form.pacienteId).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select></CampoIcone>
          </label>
          <label>Serviço <b>*</b>
            <CampoIcone icone="servicos"><select required value={form.servicoId} onChange={e => {
              const s = servicos.find(item => item.id === e.target.value)
              setForm({ ...form, servicoId: e.target.value, duracaoMinutos: s?.duracaoMinutos ?? form.duracaoMinutos })
            }}><option value="">Selecione</option>{servicos.filter(s => s.ativo || s.id === form.servicoId).map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></CampoIcone>
          </label>
          <label>Data e horário <b>*</b>
            <CampoIcone icone="calendario"><input type="datetime-local" required value={form.dataHoraLocal} onChange={e => setForm({ ...form, dataHoraLocal: e.target.value })}/></CampoIcone>
          </label>
          <label>Duração (minutos) <b>*</b>
            <CampoIcone icone="relogio"><input type="number" required min={15} max={480} value={form.duracaoMinutos} onChange={e => setForm({ ...form, duracaoMinutos: Number(e.target.value) })}/></CampoIcone>
          </label>
          <label>Modalidade
            <CampoIcone icone="globo"><select value={form.modalidade} onChange={e => setForm({ ...form, modalidade: e.target.value as ModalidadeAgendamento })}>
              <option value="ONLINE">On-line</option><option value="PRESENCIAL">Presencial</option>
            </select></CampoIcone>
          </label>
          <label>Situação
            <CampoIcone icone="atividade"><select value={form.situacao} onChange={e => setForm({ ...form, situacao: e.target.value as SituacaoAgendamento })}>
              <option value="AGENDADO">Agendado</option><option value="CONFIRMADO">Confirmado</option>
              <option value="CANCELADO">Cancelado</option><option value="NAO_COMPARECEU">Não compareceu</option>
            </select></CampoIcone>
          </label>
        </div>
        {form.modalidade === 'ONLINE' && <label>Link da consulta
          <CampoIcone icone="globo"><input type="url" maxLength={2048} placeholder="https://..." value={form.linkReuniao} onChange={e => setForm({ ...form, linkReuniao: e.target.value })}/></CampoIcone>
        </label>}
        <label>Observação administrativa
          <CampoIcone icone="nota" multilinha><textarea rows={3} placeholder="Sem informações clínicas sensíveis." value={form.observacaoAdministrativa} onChange={e => setForm({ ...form, observacaoAdministrativa: e.target.value })}/></CampoIcone>
        </label>
        <div className="nota-form">O sistema impede dois atendimentos ativos no mesmo intervalo, inclusive em gravações simultâneas.</div>
        <div className="rodape-modal">
          <button type="button" className="botao secundario" onClick={() => setEditando(undefined)}>Cancelar</button>
          <button type="submit" className="botao primario" disabled={ocupado}>{ocupado ? 'Salvando...' : 'Salvar agendamento'}</button>
        </div>
      </form>
    </Modal>}
  </>
}
