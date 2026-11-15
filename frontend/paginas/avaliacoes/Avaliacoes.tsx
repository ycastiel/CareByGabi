import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CampoIcone } from '../../javascript/componentes/CampoIcone'
import { Icone } from '../../javascript/componentes/Icone'
import type { Credenciais, Paciente } from '../../javascript/paginas/pacientes/Modelos'
import { avaliacoesApi } from '../../javascript/paginas/avaliacoes/ApiAvaliacoes'
import type { Avaliacao, AvaliacaoFormulario, TipoAvaliacao, CriterioAvaliacao } from '../../javascript/paginas/avaliacoes/Tipos'
import '../../css/paginas/avaliacoes/avaliacoes.css'

const rotulos: Record<TipoAvaliacao, string> = {
  ENTREVISTA_SELECAO: 'Entrevista de seleção', ATENDIMENTO_CLINICO: 'Atendimento clínico',
  AVALIACAO_PSICOLOGICA: 'Avaliação psicológica',
  ACOMPANHAMENTO_ORGANIZACIONAL: 'Acompanhamento organizacional', OUTRA: 'Outra avaliação',
}
function vazio(pacienteId = ''): AvaliacaoFormulario {
  return { pacienteId, tipo: 'AVALIACAO_PSICOLOGICA', titulo: '', contexto: null, objetivo: null,
    criterios: [], sinteseRascunho: null }
}
function criterioVazio(): CriterioAvaliacao {
  return { modulo: '', criterio: '', nivel: 3, evidencia: null }
}
export function AvaliacoesPagina({ credenciais, pacientes }: { credenciais: Credenciais; pacientes: Paciente[] }) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [editando, setEditando] = useState<string | null | undefined>(undefined)
  const [form, setForm] = useState<AvaliacaoFormulario>(vazio())
  const [busca, setBusca] = useState('')
  const somenteLeitura = !!editando && avaliacoes.find(a => a.id === editando)?.situacao === 'REVISADA'

  useEffect(() => {
    let ativo = true
    void avaliacoesApi.listar(credenciais).then(lista => { if (ativo) setAvaliacoes(lista) })
      .catch(e => { if (ativo) setErro(e instanceof Error ? e.message : 'Erro ao carregar avaliações.') })
    return () => { ativo = false }
  }, [credenciais])

  const elegiveis = pacientes.filter(p => p.vinculo !== 'RESPONSAVEL')
  const filtradas = useMemo(() => avaliacoes.filter(a =>
    `${a.titulo} ${a.pacienteNome}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))),
  [avaliacoes, busca])
  function abrir(avaliacao?: Avaliacao) {
    setErro(''); setAviso('')
    setEditando(avaliacao?.id ?? null)
    setForm(avaliacao ? { pacienteId: avaliacao.pacienteId, tipo: avaliacao.tipo, titulo: avaliacao.titulo,
      contexto: avaliacao.contexto, objetivo: avaliacao.objetivo,
      criterios: avaliacao.criterios.map(c => ({ ...c })), sinteseRascunho: avaliacao.sinteseRascunho }
      : vazio(elegiveis[0]?.id ?? ''))
  }
  async function executar(acao: () => Promise<unknown>, mensagem: string) {
    setOcupado(true); setErro(''); setAviso('')
    try {
      await acao()
      setAvaliacoes(await avaliacoesApi.listar(credenciais))
      setEditando(undefined)
      setAviso(mensagem)
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível salvar a avaliação.') }
    finally { setOcupado(false) }
  }
  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.pacienteId) { setErro('Cadastre ou selecione um paciente fictício.'); return }
    await executar(() => editando
      ? avaliacoesApi.editar(credenciais, editando, form) : avaliacoesApi.criar(credenciais, form),
    editando ? 'Rascunho atualizado no PostgreSQL.' : 'Avaliação demonstrativa cadastrada.')
  }
  async function revisar(a: Avaliacao) {
    if (!window.confirm('Marcar esta avaliação como revisada? Ela não poderá mais ser editada.')) return
    await executar(() => avaliacoesApi.revisar(credenciais, a.id), 'Avaliação revisada e bloqueada para edição.')
  }
  function atualizarCriterio(i: number, alteracao: Partial<CriterioAvaliacao>) {
    setForm(f => ({ ...f, criterios: f.criterios.map((c, idx) => idx === i ? { ...c, ...alteracao } : c) }))
  }
  return <>
    <div className="titulo-pagina"><div><span className="sobretitulo">PROCESSOS E ACOMPANHAMENTO</span>
      <h1>Avaliações</h1><p>Critérios estruturados e sínteses revisadas pela profissional.</p></div>
      <button className="botao primario" disabled={!elegiveis.length || ocupado} onClick={() => abrir()}>
        <Icone nome="adicionar" tamanho={18}/> Nova avaliação</button></div>
    <div className="modulo-aviso" role="note"><Icone nome="escudo" tamanho={19}/>
      <span>Exclusivamente demonstrativo: não insira dados reais nem utilize níveis de critérios como diagnóstico automático.</span></div>
    {erro && <div className="aviso erro" role="alert">{erro}</div>}
    {aviso && <div className="aviso sucesso" role="status">{aviso}</div>}
    <div className="modulo-busca"><Icone nome="buscar" tamanho={18}/><input aria-label="Buscar avaliações" type="search"
      placeholder="Buscar por título ou paciente..." value={busca} onChange={e => setBusca(e.target.value)}/></div>
    <div className="modulo-grade">
      {filtradas.map(a => <article key={a.id} className="cartao modulo-card">
        <div className="modulo-topo"><span className="sobretitulo">{rotulos[a.tipo]}</span>
          <span className="modulo-situacao">{a.situacao === 'REVISADA' ? 'Revisada' : 'Rascunho'}</span></div>
        <h2>{a.titulo}</h2><p>{a.pacienteNome}</p>
        <small>{a.criterios.length} critério(s) · {new Date(a.realizadoEm).toLocaleDateString('pt-BR')}</small>
        <div className="modulo-acoes">
          <button className="botao secundario pequeno" disabled={ocupado} onClick={() => abrir(a)}>
            <Icone nome={a.situacao === 'RASCUNHO' ? 'editar' : 'documentos'} tamanho={16}/>
            {a.situacao === 'RASCUNHO' ? 'Editar' : 'Consultar'}</button>
          {a.situacao === 'RASCUNHO' && <button className="botao secundario pequeno" disabled={ocupado}
            onClick={() => void revisar(a)}><Icone nome="checar" tamanho={16}/> Revisar</button>}
        </div>
      </article>)}
      {!filtradas.length && <div className="cartao modulo-vazio"><Icone nome="avaliacoes" tamanho={30}/>
        <strong>Nenhuma avaliação encontrada</strong><span>Comece com um caso inteiramente fictício.</span></div>}
    </div>
    {editando !== undefined && <div className="modulo-sobreposicao" role="presentation" onMouseDown={e => {
      if (e.target === e.currentTarget && !ocupado) setEditando(undefined)
    }}><section className="modulo-dialogo" role="dialog" aria-modal="true" aria-label="Formulário de avaliação">
      <header><div><span className="sobretitulo">AVALIAÇÃO DEMONSTRATIVA</span><h2>{editando ? 'Editar avaliação' : 'Nova avaliação'}</h2></div>
        <button className="botao-iconico" type="button" aria-label="Fechar" onClick={() => setEditando(undefined)}><Icone nome="fechar"/></button></header>
      <form className="formulario" onSubmit={e => void salvar(e)}>
        <label>Paciente / avaliado *<CampoIcone icone="usuario"><select required disabled={!!editando}
          value={form.pacienteId} onChange={e => setForm({ ...form, pacienteId: e.target.value })}>
          <option value="">Selecione...</option>{elegiveis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select></CampoIcone></label>
        <div className="grade-formulario"><label>Tipo de avaliação *<CampoIcone icone="avaliacoes"><select
          disabled={somenteLeitura}
          value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as TipoAvaliacao })}>
          {Object.entries(rotulos).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
        </select></CampoIcone></label><label>Título *<CampoIcone icone="descricao"><input required readOnly={somenteLeitura} maxLength={200}
          value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex.: Avaliação inicial"/></CampoIcone></label></div>
        <label>Contexto<CampoIcone icone="nota" multilinha><textarea rows={2} readOnly={somenteLeitura} maxLength={5000} value={form.contexto ?? ''}
          onChange={e => setForm({ ...form, contexto: e.target.value })} placeholder="Descreva um contexto inventado"/></CampoIcone></label>
        <label>Objetivo<CampoIcone icone="atividade" multilinha><textarea rows={2} readOnly={somenteLeitura} maxLength={5000} value={form.objetivo ?? ''}
          onChange={e => setForm({ ...form, objetivo: e.target.value })}/></CampoIcone></label>
        <div className="modulo-secao"><div><strong>Critérios de avaliação</strong><small>Escala demonstrativa de 1 a 5, sem interpretação automática</small></div>
          <button type="button" className="botao secundario pequeno" disabled={somenteLeitura || form.criterios.length >= 25}
            onClick={() => setForm({ ...form, criterios: [...form.criterios, criterioVazio()] })}><Icone nome="adicionar" tamanho={15}/> Critério</button></div>
        {form.criterios.map((c, i) => <div className="modulo-criterio" key={i}>
          <div className="modulo-secao"><b>Critério {i + 1}</b><button type="button" className="botao secundario pequeno" disabled={somenteLeitura}
            onClick={() => setForm({ ...form, criterios: form.criterios.filter((_, idx) => idx !== i) })}>Remover</button></div>
          <div className="grade-formulario"><label>Módulo *<input required readOnly={somenteLeitura} maxLength={100} placeholder="Ex.: Comunicação" value={c.modulo}
            onChange={e => atualizarCriterio(i, { modulo: e.target.value })}/></label>
            <label>Critério *<input required readOnly={somenteLeitura} maxLength={160} placeholder="Ex.: Clareza" value={c.criterio}
              onChange={e => atualizarCriterio(i, { criterio: e.target.value })}/></label></div>
          <label>Nível ilustrativo<select disabled={somenteLeitura} value={c.nivel} onChange={e => atualizarCriterio(i, { nivel: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5].map(n => <option value={n} key={n}>{n}</option>)}</select></label>
          <label>Evidência fictícia<textarea readOnly={somenteLeitura} rows={2} maxLength={1000} value={c.evidencia ?? ''}
            onChange={e => atualizarCriterio(i, { evidencia: e.target.value })}/></label>
        </div>)}
        <label>Síntese (rascunho)<CampoIcone icone="nota" multilinha><textarea rows={4} readOnly={somenteLeitura} maxLength={8000}
          value={form.sinteseRascunho ?? ''} onChange={e => setForm({ ...form, sinteseRascunho: e.target.value })}
          placeholder="Texto fictício sujeito a revisão profissional"/></CampoIcone></label>
        <footer className="rodape-modal"><button type="button" className="botao secundario" onClick={() => setEditando(undefined)}>Fechar</button>
          {(editando === null || avaliacoes.find(a => a.id === editando)?.situacao === 'RASCUNHO') &&
            <button type="submit" className="botao primario" disabled={ocupado}>{ocupado ? 'Salvando...' : 'Salvar rascunho'}</button>}</footer>
      </form>
    </section></div>}
  </>
}
