import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type {
  Paciente, Prontuario, RegistroClinico, RegistroFormulario, CategoriaRegistro,
} from '../../javascript/paginas/pacientes/Modelos'
import { CampoIcone } from '../../javascript/componentes/CampoIcone'
import { Icone } from '../../javascript/componentes/Icone'
import { dataBR, dataHoraBR } from '../../javascript/helpers/Formatacao'

const categorias: Record<CategoriaRegistro, string> = {
  ANAMNESE: 'Anamnese', EVOLUCAO: 'Evolução',
  NOTA_RESTRITA: 'Nota restrita', OUTRO: 'Outro',
}
const formularioVazio: RegistroFormulario = { categoria: 'EVOLUCAO', conteudo: '' }

interface Props {
  pacientes: Paciente[]
  prontuarios: Prontuario[]
  versaoRegistros: number
  ocupado: boolean
  aoAbrir: (pacienteId: string) => Promise<Prontuario | null>
  aoListarRegistros: (prontuarioId: string) => Promise<RegistroClinico[]>
  aoSalvarRegistro: (prontuarioId: string, dados: RegistroFormulario, registroId: string | null) => Promise<boolean>
  aoFinalizarRegistro: (prontuarioId: string, registroId: string) => Promise<boolean>
  aoEncerrar: (prontuarioId: string) => Promise<boolean>
}

export function ProntuariosPagina({ pacientes, prontuarios, versaoRegistros, ocupado,
  aoAbrir, aoListarRegistros, aoSalvarRegistro, aoFinalizarRegistro, aoEncerrar }: Props) {
  const [busca, setBusca] = useState('')
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null)
  const [registros, setRegistros] = useState<RegistroClinico[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erroLocal, setErroLocal] = useState('')
  const [form, setForm] = useState<RegistroFormulario>({ ...formularioVazio })
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const elegiveis = useMemo(() => pacientes.filter(p =>
    (p.vinculo === 'PACIENTE' || p.vinculo === 'AMBOS') &&
    p.nome.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))), [pacientes, busca])
  const selecionado = prontuarios.find(p => p.id === selecionadoId) ?? null
  const pacienteSelecionado = elegiveis.find(p => p.id === selecionado?.pacienteId)
    ?? pacientes.find(p => p.id === selecionado?.pacienteId)
  const aberto = selecionado?.situacao === 'ABERTO'

  useEffect(() => {
    let ativo = true
    if (!selecionadoId) { setRegistros([]); setErroLocal(''); return }
    // Limpa os registros do paciente anterior antes de carregar os dados atuais.
    setRegistros([])
    setErroLocal('')
    setCarregando(true)
    void aoListarRegistros(selecionadoId).then(dados => {
      if (ativo) setRegistros(dados)
    }).catch(erro => {
      if (ativo) setErroLocal(erro instanceof Error ? erro.message : 'Erro ao carregar registros.')
    }).finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [selecionadoId, versaoRegistros, aoListarRegistros])

  // Evita manter no formulário texto de outro prontuário.
  function selecionar(id: string | null) {
    setSelecionadoId(id)
    setForm({ ...formularioVazio })
    setEditandoId(null)
    setRegistros([])
    setErroLocal('')
  }

  async function abrirPaciente(pacienteId: string) {
    const existe = prontuarios.find(p => p.pacienteId === pacienteId)
    if (existe) { selecionar(existe.id); return }
    const novo = await aoAbrir(pacienteId)
    if (novo) selecionar(novo.id)
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!selecionadoId || !form.conteudo.trim()) return
    const ok = await aoSalvarRegistro(selecionadoId, {
      categoria: form.categoria,
      conteudo: form.conteudo.trim(),
    }, editandoId)
    if (ok) { setForm({ ...formularioVazio }); setEditandoId(null) }
  }

  function editar(r: RegistroClinico) {
    setForm({ categoria: r.categoria, conteudo: r.conteudo })
    setEditandoId(r.id)
    document.getElementById('form-registro')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function finalizar(r: RegistroClinico) {
    if (!selecionadoId || !window.confirm('Finalizar este registro? Depois disso ele não poderá ser editado.')) return
    const ok = await aoFinalizarRegistro(selecionadoId, r.id)
    if (ok && editandoId === r.id) { setEditandoId(null); setForm({ ...formularioVazio }) }
  }

  async function encerrar() {
    if (!selecionadoId || !window.confirm('Encerrar este prontuário? Essa ação bloqueará novos registros na demonstração.')) return
    await aoEncerrar(selecionadoId)
  }

  return <>
    <div className="titulo-pagina"><div><span className="sobretitulo">ACOMPANHAMENTO</span>
      <h1>Prontuários</h1><p>Registros demonstrativos separados dos dados administrativos.</p></div>
    </div>
    <div className="alerta-prontuario" role="note"><Icone nome="escudo" tamanho={20}/>
      <span><strong>Ambiente de treinamento.</strong> Utilize apenas nomes e textos fictícios. Esta etapa não possui controle de acesso profissional, trilha de auditoria completa ou proteção adequada para prontuários reais.</span>
    </div>
    <div className="prontuario-layout">
      <aside className="cartao prontuario-pacientes" aria-label="Pacientes com acompanhamento clínico">
        <div className="prontuario-coluna-topo"><span className="sobretitulo">PACIENTES</span><strong>Selecionar prontuário</strong></div>
        <label className="campo-busca prontuario-busca"><Icone nome="buscar" tamanho={17}/>
          <input type="search" aria-label="Buscar pacientes fictícios" placeholder="Buscar paciente fictício..." value={busca}
            onChange={e => setBusca(e.target.value)}/></label>
        <div className="prontuario-lista">
          {elegiveis.map(p => {
            const existente = prontuarios.find(pr => pr.pacienteId === p.id)
            return <button key={p.id} type="button"
              disabled={ocupado}
              className={`prontuario-item ${existente?.id === selecionadoId ? 'prontuario-item--ativo' : ''}`}
              onClick={() => void abrirPaciente(p.id)}>
              <span className="avatar-iniciais">{p.nome.split(/\s+/).slice(0, 2).map(n => n[0]).join('').toUpperCase()}</span>
              <span className="prontuario-item-texto"><strong>{p.nome}</strong>
                <small>{!existente ? 'Prontuário ainda não aberto' : existente.situacao === 'ABERTO' ? 'Prontuário aberto' : 'Encerrado'}</small></span>
              <Icone nome={existente ? 'seta' : 'adicionar'} tamanho={17}/>
            </button>
          })}
          {!elegiveis.length && <div className="vazio pequeno"><Icone nome="pacientes"/>
            <span>Não há pacientes clínicos com este nome.</span></div>}
        </div>
      </aside>
      <section className="prontuario-conteudo" aria-label="Detalhes do prontuário">
        {!selecionado ? <div className="cartao prontuario-inicio-vazio">
          <Icone nome="prontuarios" tamanho={38}/><h2>Um espaço para acompanhar cada trajetória</h2>
          <p>Escolha um paciente à esquerda para abrir ou consultar um prontuário demonstrativo.</p>
          <small>A abertura cria um registro na tabela <code>prontuarios</code> do PostgreSQL.</small>
        </div> : <>
          <div className="cartao prontuario-cabecalho"><div><span className="sobretitulo">PRONTUÁRIO DEMONSTRATIVO</span>
            <h2>{pacienteSelecionado?.nome ?? selecionado.pacienteNome}</h2>
            <p>Aberto em {dataBR(selecionado.abertoEm)} · {selecionado.situacao === 'ABERTO' ? 'Em acompanhamento' : `Encerrado em ${dataBR(selecionado.encerradoEm)}`}</p>
          </div><div className="prontuario-cabecalho-acoes">
            {aberto && <button type="button" className="botao secundario pequeno" disabled={ocupado || carregando} onClick={() => void encerrar()}>
              <Icone nome="cadeado" tamanho={16}/> Encerrar prontuário
            </button>}</div></div>
          {erroLocal && <div className="aviso erro" role="alert"><Icone nome="alerta" tamanho={17}/>{erroLocal}</div>}
          {aberto && <section className="cartao prontuario-editor" id="form-registro">
            <div className="cabecalho-cartao"><div><span className="sobretitulo">{editandoId ? 'EDITANDO' : 'NOVO REGISTRO'}</span>
              <h2>{editandoId ? 'Revisar rascunho' : 'Registrar rascunho'}</h2></div></div>
            <form className="formulario" onSubmit={salvar}>
              <label>Categoria
                <CampoIcone icone="nota"><select value={form.categoria}
                  onChange={e => setForm({ ...form, categoria: e.target.value as CategoriaRegistro })}>
                  {Object.entries(categorias).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                </select></CampoIcone>
              </label>
              <label>Conteúdo demonstrativo <b>*</b>
                <CampoIcone icone="descricao" multilinha><textarea rows={6} required maxLength={12000}
                  placeholder="Exemplo fictício: Paciente de demonstração relatou... Não digite informações clínicas reais."
                  value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })}/></CampoIcone>
              </label>
              <div className="rodape-modal">
                {editandoId && <button type="button" className="botao secundario" onClick={() => { setEditandoId(null); setForm({ ...formularioVazio }) }}>Cancelar edição</button>}
                <button type="submit" className="botao primario" disabled={ocupado || !form.conteudo.trim()}>
                  <Icone nome="checar" tamanho={17}/>{ocupado ? 'Salvando...' : 'Salvar rascunho'}
                </button>
              </div>
            </form>
          </section>}
          <section className="cartao prontuario-historico"><div className="cabecalho-cartao"><div>
            <span className="sobretitulo">HISTÓRICO</span><h2>Registros clínicos</h2></div>
            <span className="prontuario-contador">{registros.length} {registros.length === 1 ? 'registro' : 'registros'}</span>
          </div>
            {carregando ? <div className="vazio pequeno">Carregando registros demonstrativos...</div>
              : registros.length === 0 ? <div className="vazio pequeno"><Icone nome="nota" tamanho={28}/>
                <strong>Nenhum registro salvo</strong><span>Rascunhos aparecerão aqui após o primeiro salvamento.</span></div>
              : <div className="prontuario-registros">{registros.map(r => <article className="prontuario-registro" key={r.id}>
                <div className="prontuario-registro-topo"><div><span className="sobretitulo">{categorias[r.categoria]}</span>
                  <h3>{r.situacao === 'FINALIZADO' ? 'Registro finalizado' : 'Rascunho em andamento'}</h3>
                  <small>{dataHoraBR(r.criadoEm)}{r.finalizadoEm ? ` · Finalizado em ${dataHoraBR(r.finalizadoEm)}` : ''}</small></div>
                  <Icone nome={r.situacao === 'FINALIZADO' ? 'cadeado' : 'editar'} tamanho={18}/>
                </div>
                <p className="prontuario-texto">{r.conteudo}</p>
                {r.situacao === 'RASCUNHO' && aberto && <div className="prontuario-registro-acoes">
                  <button type="button" className="botao secundario pequeno" disabled={ocupado} onClick={() => editar(r)}><Icone nome="editar" tamanho={15}/> Editar</button>
                  <button type="button" className="botao secundario pequeno" disabled={ocupado} onClick={() => void finalizar(r)}><Icone nome="checar" tamanho={15}/> Finalizar</button>
                </div>}
              </article>)}</div>}
          </section>
        </>}
      </section>
    </div>
  </>
}
