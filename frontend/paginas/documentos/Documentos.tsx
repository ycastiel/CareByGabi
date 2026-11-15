import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Credenciais, Paciente } from '../../javascript/paginas/pacientes/Modelos'
import { CampoIcone } from '../../javascript/componentes/CampoIcone'
import { Icone } from '../../javascript/componentes/Icone'
import { documentosApi } from '../../javascript/paginas/documentos/ApiDocumentos'
import { arquivosApi } from '../../javascript/paginas/documentos/ApiArquivos'
import type { Anexo, Documento, DocumentoFormulario, TipoDocumento } from '../../javascript/paginas/documentos/Tipos'
import '../../css/paginas/avaliacoes/avaliacoes.css'

const tipos: Record<TipoDocumento, string> = {
  DECLARACAO: 'Declaração', ATESTADO_PSICOLOGICO: 'Atestado psicológico',
  RELATORIO_PSICOLOGICO: 'Relatório psicológico', LAUDO_PSICOLOGICO: 'Laudo psicológico',
  PARECER_PSICOLOGICO: 'Parecer psicológico', ENCAMINHAMENTO: 'Encaminhamento',
  RECIBO: 'Recibo', TERMO_CONSENTIMENTO: 'Termo de consentimento', OUTRO: 'Outro documento',
}
function vazio(id: string): DocumentoFormulario {
  return { pacienteId: id, tipo: 'DECLARACAO', titulo: '', conteudo: '' }
}
export function DocumentosPagina({ credenciais, pacientes }: { credenciais: Credenciais; pacientes: Paciente[] }) {
  const [pacienteId, setPacienteId] = useState(pacientes[0]?.id ?? '')
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [anexos, setAnexos] = useState<Anexo[]>([])
  const [aba, setAba] = useState<'documentos' | 'anexos'>('documentos')
  const [editando, setEditando] = useState<string | null | undefined>(undefined)
  const [form, setForm] = useState<DocumentoFormulario>(vazio(pacienteId))
  const [selecionadoParaAnexo, setSelecionadoParaAnexo] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let ativo = true
    void documentosApi.listar(credenciais).then(lista => { if (ativo) setDocumentos(lista) })
      .catch(e => { if (ativo) setErro(e instanceof Error ? e.message : 'Falha ao carregar documentos.') })
    return () => { ativo = false }
  }, [credenciais])
  useEffect(() => {
    let ativo = true
    setAnexos([])
    if (pacienteId) void arquivosApi.listar(credenciais, pacienteId).then(lista => {
      if (ativo) setAnexos(lista)
    }).catch(e => { if (ativo) setErro(e instanceof Error ? e.message : 'Falha ao carregar anexos.') })
    return () => { ativo = false }
  }, [credenciais, pacienteId])

  const docsPaciente = useMemo(() => documentos.filter(d => d.pacienteId === pacienteId), [documentos, pacienteId])
  const edicaoBloqueada = !!editando && documentos.find(d => d.id === editando)?.situacao !== 'RASCUNHO'
  function abrir(doc?: Documento) {
    setErro(''); setAviso('')
    setEditando(doc?.id ?? null)
    setForm(doc ? { pacienteId: doc.pacienteId, tipo: doc.tipo, titulo: doc.titulo, conteudo: doc.conteudo } : vazio(pacienteId))
  }
  async function acao(operacao: () => Promise<unknown>, mensagem: string) {
    setOcupado(true); setErro(''); setAviso('')
    try {
      await operacao()
      setDocumentos(await documentosApi.listar(credenciais))
      setEditando(undefined)
      setAviso(mensagem)
    } catch (e) { setErro(e instanceof Error ? e.message : 'Operação não concluída.') }
    finally { setOcupado(false) }
  }
  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    await acao(() => editando
      ? documentosApi.editar(credenciais, editando, form) : documentosApi.criar(credenciais, form),
    editando ? 'Rascunho atualizado.' : 'Documento fictício salvo no PostgreSQL.')
  }
  async function mudarSituacao(d: Documento, destino: 'emitir' | 'cancelar') {
    if (!window.confirm(destino === 'emitir'
      ? 'Marcar como emitido? O texto não poderá mais ser editado.'
      : 'Cancelar este documento? Seu conteúdo será preservado no histórico.')) return
    await acao(() => destino === 'emitir' ? documentosApi.emitir(credenciais, d.id)
      : documentosApi.cancelar(credenciais, d.id), destino === 'emitir' ? 'Documento marcado como emitido.' : 'Documento cancelado.')
  }
  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!arquivo || !pacienteId) { setErro('Selecione um paciente e um arquivo.'); return }
    if (arquivo.size > 8 * 1024 * 1024) { setErro('O limite de anexo é 8 MiB.'); return }
    setOcupado(true); setErro(''); setAviso('')
    try {
      await arquivosApi.enviar(credenciais, pacienteId, arquivo, selecionadoParaAnexo || undefined)
      setAnexos(await arquivosApi.listar(credenciais, pacienteId))
      setArquivo(null)
      // O input é refeito após limpar pelo atributo key, evitando manter o arquivo anterior.
      setChaveArquivo(v => v + 1)
      setAviso('Anexo salvo no diretório privado; metadados gravados no PostgreSQL.')
    } catch (e) { setErro(e instanceof Error ? e.message : 'Falha no upload.') }
    finally { setOcupado(false) }
  }
  const [chaveArquivo, setChaveArquivo] = useState(0)
  async function baixar(a: Anexo) {
    setOcupado(true); setErro('')
    try {
      const blob = await arquivosApi.baixar(credenciais, a.id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = a.nomeOriginal
      document.body.append(link); link.click(); link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (e) { setErro(e instanceof Error ? e.message : 'Falha no download.') }
    finally { setOcupado(false) }
  }
  return <>
    <div className="titulo-pagina"><div><span className="sobretitulo">ARQUIVOS E MODELOS</span>
      <h1>Documentos e anexos</h1><p>Rascunhos de texto e arquivos privados associados a pacientes fictícios.</p></div>
      {aba === 'documentos' && <button className="botao primario" disabled={!pacienteId || ocupado} onClick={() => abrir()}>
        <Icone nome="adicionar" tamanho={18}/> Novo documento</button>}</div>
    <div className="modulo-aviso" role="note"><Icone nome="escudo" tamanho={19}/><span>
      Ambiente exclusivamente local. Não faça upload de arquivos reais, documentos pessoais ou informações clínicas verdadeiras.
      A marcação “Emitido” é somente demonstrativa; não gera assinatura ou documento profissional válido.</span></div>
    {erro && <div className="aviso erro" role="alert">{erro}</div>}
    {aviso && <div className="aviso sucesso" role="status">{aviso}</div>}
    <div className="modulo-secao" style={{ marginBottom: 19 }}>
      <label className="modulo-seletor">Paciente fictício
        <CampoIcone icone="usuario"><select value={pacienteId} onChange={e => {
          setPacienteId(e.target.value); setSelecionadoParaAnexo(''); setArquivo(null)
        }}><option value="">Selecione...</option>{pacientes.map(p => <option value={p.id} key={p.id}>{p.nome}</option>)}</select></CampoIcone>
      </label>
      <div className="modulo-abas" role="group" aria-label="Seções de documentos">
        <button type="button" className={aba === 'documentos' ? 'selecionado' : ''} onClick={() => setAba('documentos')}>
          <Icone nome="documentos" tamanho={17}/> Documentos</button>
        <button type="button" className={aba === 'anexos' ? 'selecionado' : ''} onClick={() => setAba('anexos')}>
          <Icone nome="setaCima" tamanho={17}/> Anexos</button>
      </div>
    </div>
    {aba === 'documentos' ? <div className="modulo-grade">
      {docsPaciente.map(d => <article className="cartao modulo-card" key={d.id}>
        <div className="modulo-topo"><span className="sobretitulo">{tipos[d.tipo]}</span>
          <span className="modulo-situacao">{d.situacao === 'EMITIDO' ? 'Emitido' : d.situacao === 'CANCELADO' ? 'Cancelado' : 'Rascunho'}</span></div>
        <h2>{d.titulo}</h2><p>{d.pacienteNome}</p>
        <small>{new Date(d.criadoEm).toLocaleDateString('pt-BR')} · Modelo {d.modeloVersao}</small>
        <div className="modulo-acoes">
          <button className="botao secundario pequeno" disabled={ocupado} onClick={() => abrir(d)}>
            <Icone nome={d.situacao === 'RASCUNHO' ? 'editar' : 'documentos'} tamanho={16}/>
            {d.situacao === 'RASCUNHO' ? 'Editar' : 'Consultar'}</button>
          {d.situacao === 'RASCUNHO' && <button className="botao secundario pequeno" disabled={ocupado}
            onClick={() => void mudarSituacao(d, 'emitir')}>Marcar emitido</button>}
          {d.situacao !== 'CANCELADO' && <button className="botao secundario pequeno" disabled={ocupado}
            onClick={() => void mudarSituacao(d, 'cancelar')}>Cancelar</button>}
        </div></article>)}
      {!docsPaciente.length && <div className="cartao modulo-vazio"><Icone nome="documentos" tamanho={30}/>
        <strong>Nenhum documento demonstrativo</strong><span>Crie um rascunho fictício para começar.</span></div>}
    </div> : <div className="modulo-dois">
      <section className="cartao modulo-detalhe"><strong>Adicionar anexo privado</strong><p>Formatos permitidos: PDF, PNG, JPG e WEBP. Máximo: 8 MiB.</p>
        <form className="formulario" onSubmit={e => void enviar(e)} style={{ padding: 0 }}>
          <label>Arquivo *<input key={chaveArquivo} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" required
            onChange={e => setArquivo(e.target.files?.[0] ?? null)}/></label>
          <label>Vincular ao documento (opcional)<select value={selecionadoParaAnexo}
            onChange={e => setSelecionadoParaAnexo(e.target.value)}>
            <option value="">Somente ao paciente</option>{docsPaciente.map(d => <option value={d.id} key={d.id}>{d.titulo}</option>)}
          </select></label>
          <button className="botao primario" type="submit" disabled={!arquivo || !pacienteId || ocupado}>
            <Icone nome="setaCima" tamanho={17}/> {ocupado ? 'Enviando...' : 'Enviar arquivo'}</button>
        </form></section>
      <section className="cartao modulo-detalhe"><strong>Anexos do paciente</strong>
        <div className="modulo-arquivo-lista">
          {anexos.map(a => <div key={a.id} className="modulo-arquivo-item"><div>
            <span className="modulo-nome-arquivo">{a.nomeOriginal}</span>
            <small>{(a.tamanhoBytes / 1024).toFixed(0)} KiB · {new Date(a.criadoEm).toLocaleDateString('pt-BR')}</small>
          </div><button type="button" className="botao secundario pequeno" disabled={ocupado} onClick={() => void baixar(a)}>
            <Icone nome="documentos" tamanho={16}/> Baixar</button></div>)}
          {!anexos.length && <p>Nenhum anexo cadastrado para este paciente.</p>}
        </div></section>
    </div>}
    {editando !== undefined && <div className="modulo-sobreposicao" onMouseDown={e => {
      if (e.target === e.currentTarget && !ocupado) setEditando(undefined)
    }}><section className="modulo-dialogo" role="dialog" aria-modal="true" aria-label="Formulário de documento">
      <header><div><span className="sobretitulo">DOCUMENTO DEMONSTRATIVO</span>
        <h2>{editando ? 'Documento salvo' : 'Novo rascunho'}</h2></div>
        <button type="button" className="botao-iconico" onClick={() => setEditando(undefined)} aria-label="Fechar"><Icone nome="fechar"/></button></header>
      <form className="formulario" onSubmit={e => void salvar(e)}>
        <label>Tipo *<CampoIcone icone="documentos"><select value={form.tipo} disabled={edicaoBloqueada}
          onChange={e => setForm({ ...form, tipo: e.target.value as TipoDocumento })}>
          {Object.entries(tipos).map(([codigo, nome]) => <option value={codigo} key={codigo}>{nome}</option>)}
        </select></CampoIcone></label>
        <label>Título *<CampoIcone icone="descricao"><input required maxLength={220} readOnly={edicaoBloqueada}
          value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
          placeholder="Ex.: Documento fictício de teste"/></CampoIcone></label>
        <label>Conteúdo textual *<CampoIcone icone="nota" multilinha><textarea required rows={10} maxLength={30000}
          readOnly={edicaoBloqueada} value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })}
          placeholder="Insira somente texto de demonstração. Não há modelos de laudos preenchidos automaticamente."/></CampoIcone></label>
        <p className="nota-form">Documento fictício, sem assinatura, revisão normativa ou validade profissional.</p>
        <footer className="rodape-modal"><button className="botao secundario" type="button" onClick={() => setEditando(undefined)}>Fechar</button>
          {!edicaoBloqueada && <button className="botao primario" type="submit" disabled={ocupado}>
            {ocupado ? 'Salvando...' : 'Salvar rascunho'}</button>}
        </footer>
      </form>
    </section></div>}
  </>
}
