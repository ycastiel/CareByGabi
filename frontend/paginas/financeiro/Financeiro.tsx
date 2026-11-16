import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CampoIcone } from '../../javascript/componentes/CampoIcone'
import { Icone } from '../../javascript/componentes/Icone'
import type { Credenciais, Paciente, Servico } from '../../javascript/paginas/pacientes/Modelos'
import { financeiroApi } from '../../javascript/paginas/financeiro/ApiFinanceiro'
import type { Cobranca, CobrancaFormulario, Pagamento, PagamentoFormulario, MetodoPagamento,
  SituacaoCobranca } from '../../javascript/paginas/financeiro/Tipos'
import { centavos, decimal, moedaCentavos, moedaDecimal } from '../../javascript/paginas/financeiro/Tipos'
import '../../css/paginas/avaliacoes/avaliacoes.css'
import '../../css/paginas/financeiro/financeiro.css'

const rotulos: Record<SituacaoCobranca, string> = {
  PENDENTE: 'Pendente', PARCIAL: 'Parcialmente paga', PAGA: 'Quitada', CANCELADA: 'Cancelada',
}
const metodos: Record<MetodoPagamento, string> = {
  PIX: 'Pix', DINHEIRO: 'Dinheiro', CARTAO: 'Cartão', TRANSFERENCIA: 'Transferência', OUTRO: 'Outro',
}
const hojeLocal = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const dataBR = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR')
const erroLegivel = (erro: unknown) => erro instanceof Error ? erro.message : 'Não foi possível concluir a operação.'
const vazio = (pacienteId = ''): CobrancaFormulario => ({
  pacienteId, servicoId: null, descricao: '', valor: '', vencimentoEm: hojeLocal(),
})
const pagamentoVazio = (saldo = ''): PagamentoFormulario => ({
  valor: saldo.replace('.', ','), metodo: 'PIX', referencia: null, observacaoAdministrativa: null,
})

export function FinanceiroPagina({ credenciais, pacientes, servicos }: {
  credenciais: Credenciais; pacientes: Paciente[]; servicos: Servico[]
}) {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState<'TODAS' | SituacaoCobranca | 'ATRASADA'>('TODAS')
  const [mes, setMes] = useState('')
  const [editando, setEditando] = useState<string | null | undefined>(undefined)
  const [form, setForm] = useState<CobrancaFormulario>(vazio())
  const [cobrancaSelecionada, setCobrancaSelecionada] = useState<string | null>(null)
  const [formPagamento, setFormPagamento] = useState<PagamentoFormulario>(pagamentoVazio())
  const [carregandoPagamentos, setCarregandoPagamentos] = useState(false)

  async function carregar() {
    try {
      const lista = await financeiroApi.listarCobrancas(credenciais)
      setCobrancas(lista)
      setErro('')
    } catch (ex) { setErro(erroLegivel(ex)); throw ex }
    finally { setCarregando(false) }
  }

  useEffect(() => {
    let ativo = true
    void financeiroApi.listarCobrancas(credenciais)
      .then(lista => { if (ativo) setCobrancas(lista) })
      .catch(ex => { if (ativo) setErro(erroLegivel(ex)) })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [credenciais])

  const hoje = hojeLocal()
  const elegiveis = pacientes.filter(p => p.vinculo !== 'RESPONSAVEL')
  const selecionada = cobrancas.find(c => c.id === cobrancaSelecionada)
  const filtradas = useMemo(() => cobrancas.filter(c => {
    const corresponde = `${c.pacienteNome} ${c.descricao} ${c.servicoNome ?? ''}`
      .toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))
    const atrasada = c.vencimentoEm < hoje && c.saldoAberto !== '0.00' && c.situacao !== 'CANCELADA'
    return corresponde && (!mes || c.vencimentoEm.startsWith(mes)) &&
      (situacao === 'TODAS' || (situacao === 'ATRASADA' ? atrasada : c.situacao === situacao))
  }), [cobrancas, busca, mes, situacao, hoje])

  // Indicadores globais da carteira; filtros afetam apenas a tabela, não os totais.
  const resumo = useMemo(() => cobrancas.reduce((acc, c) => {
    if (c.situacao !== 'CANCELADA') {
      acc.recebido += centavos(c.valorRecebido)
      acc.aberto += centavos(c.saldoAberto)
      if (c.vencimentoEm < hoje) acc.atrasado += centavos(c.saldoAberto)
      if (c.situacao === 'PARCIAL') acc.parciais++
    }
    return acc
  }, { recebido: 0n, aberto: 0n, atrasado: 0n, parciais: 0 }), [cobrancas, hoje])

  function abrirCobranca(c?: Cobranca) {
    setErro('')
    setEditando(c?.id ?? null)
    setForm(c ? { pacienteId: c.pacienteId, servicoId: c.servicoId, descricao: c.descricao,
      valor: c.valor.replace('.', ','), vencimentoEm: c.vencimentoEm } : vazio(elegiveis[0]?.id ?? ''))
  }
  function selecionarServico(id: string) {
    const s = servicos.find(item => item.id === id)
    setForm(atual => ({ ...atual, servicoId: id || null,
      descricao: s ? s.nome : atual.descricao,
      valor: s && s.valorPadrao != null ? s.valorPadrao.toFixed(2).replace('.', ',') : atual.valor }))
  }
  async function salvarCobranca(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!form.pacienteId) { setErro('Selecione um paciente fictício.'); return }
    let valor: string
    try { valor = decimal(form.valor) } catch (ex) { setErro(erroLegivel(ex)); return }
    setOcupado(true); setErro(''); setAviso('')
    try {
      const payload = { ...form, valor }
      if (editando) await financeiroApi.editarCobranca(credenciais, editando, payload)
      else await financeiroApi.criarCobranca(credenciais, payload)
      await carregar()
      setEditando(undefined)
      setAviso(editando ? 'Cobrança atualizada.' : 'Cobrança cadastrada no PostgreSQL.')
    } catch (ex) { setErro(erroLegivel(ex)) }
    finally { setOcupado(false) }
  }
  async function cancelar(c: Cobranca) {
    if (!window.confirm(`Cancelar a cobrança “${c.descricao}” de ${c.pacienteNome}? Esta operação não apaga o registro.`)) return
    setOcupado(true); setErro(''); setAviso('')
    try {
      await financeiroApi.cancelarCobranca(credenciais, c.id)
      await carregar()
      setAviso('Cobrança cancelada e preservada no histórico.')
    } catch (ex) { setErro(erroLegivel(ex)) }
    finally { setOcupado(false) }
  }
  async function abrirPagamentos(c: Cobranca) {
    setCobrancaSelecionada(c.id)
    setPagamentos([])
    setFormPagamento(pagamentoVazio(c.saldoAberto))
    setErro(''); setCarregandoPagamentos(true)
    try { setPagamentos(await financeiroApi.listarPagamentos(credenciais, c.id)) }
    catch (ex) { setErro(erroLegivel(ex)) }
    finally { setCarregandoPagamentos(false) }
  }
  async function pagar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!selecionada) return
    let valor: string
    try { valor = decimal(formPagamento.valor) } catch (ex) { setErro(erroLegivel(ex)); return }
    if (centavos(valor) > centavos(selecionada.saldoAberto)) {
      setErro('Pagamento maior que o saldo disponível.'); return
    }
    if (!window.confirm(`Confirmar o recebimento de ${moedaDecimal(valor)}? O MVP não permite excluir pagamentos.`)) return
    setOcupado(true); setErro(''); setAviso('')
    try {
      await financeiroApi.pagar(credenciais, selecionada.id, { ...formPagamento, valor })
      const [lista, historico] = await Promise.all([
        financeiroApi.listarCobrancas(credenciais), financeiroApi.listarPagamentos(credenciais, selecionada.id),
      ])
      setCobrancas(lista); setPagamentos(historico)
      setFormPagamento(pagamentoVazio())
      setAviso('Pagamento registrado no PostgreSQL.')
    } catch (ex) { setErro(erroLegivel(ex)) }
    finally { setOcupado(false) }
  }

  return <>
    <div className="titulo-pagina"><div><span className="sobretitulo">ORGANIZAÇÃO FINANCEIRA</span>
      <h1>Financeiro</h1><p>Cobranças e recebimentos fictícios, com valores e histórico persistentes.</p></div>
      <button className="botao primario" disabled={ocupado || elegiveis.length === 0} onClick={() => abrirCobranca()}>
        <Icone nome="adicionar" tamanho={18}/> Nova cobrança</button></div>
    <div className="modulo-aviso" role="note"><Icone nome="escudo" tamanho={19}/>
      <span>Demonstração local: somente dados fictícios. Recebimento manual, sem integração bancária,
        nota fiscal, conciliação ou estorno automático. Não é comprovante de pagamento.</span></div>
    {erro && <div className="aviso erro" role="alert">{erro}</div>}
    {aviso && <div className="aviso sucesso" role="status">{aviso}</div>}
    <div className="financeiro-resumo" aria-label="Resumo da carteira">
      <article className="financeiro-indicador"><span>Recebido</span><strong>{moedaCentavos(resumo.recebido)}</strong><small>Pagamentos registrados</small></article>
      <article className="financeiro-indicador"><span>Em aberto</span><strong>{moedaCentavos(resumo.aberto)}</strong><small>Saldo ainda não quitado</small></article>
      <article className="financeiro-indicador"><span>Vencido</span><strong>{moedaCentavos(resumo.atrasado)}</strong><small>Parte em aberto com prazo vencido</small></article>
      <article className="financeiro-indicador"><span>Pagamentos parciais</span><strong>{resumo.parciais}</strong><small>Cobranças parcialmente pagas</small></article>
    </div>
    <section className="cartao financeiro-listagem">
      <div className="financeiro-filtros">
        <label className="financeiro-busca"><Icone nome="buscar" tamanho={18}/>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar paciente ou descrição" aria-label="Buscar cobranças"/></label>
        <select aria-label="Filtrar situação" value={situacao} onChange={e => setSituacao(e.target.value as typeof situacao)}>
          <option value="TODAS">Todas as situações</option><option value="PENDENTE">Pendentes</option>
          <option value="PARCIAL">Parciais</option><option value="PAGA">Quitadas</option>
          <option value="ATRASADA">Vencidas</option><option value="CANCELADA">Canceladas</option>
        </select>
        <label className="financeiro-mes">Vencimento <input type="month" value={mes} onChange={e => setMes(e.target.value)}/></label>
        <button className="botao secundario pequeno" type="button" disabled={ocupado} onClick={() => { setCarregando(true); void carregar().catch(() => undefined) }}>
          <Icone nome="atualizar" tamanho={16}/> Atualizar</button>
        <small>{filtradas.length} cobranças</small>
      </div>
      <div className="tabela-container"><table className="tabela financeiro-tabela">
        <thead><tr><th>Paciente / cobrança</th><th>Vencimento</th><th>Valor</th><th>Recebido</th><th>Saldo aberto</th><th>Situação</th><th>Ações</th></tr></thead>
        <tbody>{filtradas.map(c => {
          const atrasada = c.vencimentoEm < hoje && c.saldoAberto !== '0.00' && c.situacao !== 'CANCELADA'
          const semPagamento = c.valorRecebido === '0.00' && c.situacao === 'PENDENTE'
          return <tr key={c.id}><td><strong>{c.pacienteNome}</strong><small className="financeiro-descricao">{c.descricao}</small></td>
            <td>{dataBR(c.vencimentoEm)}</td><td>{moedaDecimal(c.valor)}</td><td>{moedaDecimal(c.valorRecebido)}</td>
            <td><strong>{moedaDecimal(c.saldoAberto)}</strong></td>
            <td><span className={`financeiro-estado financeiro-estado--${c.situacao.toLowerCase()}`}>
              {rotulos[c.situacao]}{atrasada ? ' · Vencida' : ''}</span></td>
            <td><div className="financeiro-acoes"><button className="botao secundario pequeno" disabled={ocupado}
              onClick={() => void abrirPagamentos(c)}>Histórico / pagar</button>
              {semPagamento && <button className="botao secundario pequeno" disabled={ocupado} onClick={() => abrirCobranca(c)}>Editar</button>}
              {semPagamento && <button className="botao secundario pequeno" disabled={ocupado} onClick={() => void cancelar(c)}>Cancelar</button>}
            </div></td></tr>
        })}</tbody></table></div>
      {!carregando && filtradas.length === 0 && <div className="vazio"><Icone nome="financeiro" tamanho={30}/>
        <strong>Nenhuma cobrança encontrada</strong><span>Cadastre uma cobrança fictícia ou ajuste os filtros.</span></div>}
      {carregando && <div className="vazio">Carregando cobranças…</div>}
    </section>

    {editando !== undefined && <div className="modulo-sobreposicao" onMouseDown={e => { if (e.target === e.currentTarget && !ocupado) setEditando(undefined) }}>
      <section className="modulo-dialogo" role="dialog" aria-modal="true" aria-label="Cadastro de cobrança">
        <header><div><span className="sobretitulo">CONTROLE DE RECEBIMENTOS</span>
          <h2>{editando ? 'Editar cobrança' : 'Nova cobrança'}</h2></div>
          <button className="botao-iconico" type="button" onClick={() => setEditando(undefined)} aria-label="Fechar"><Icone nome="fechar"/></button></header>
        <form className="formulario" onSubmit={e => void salvarCobranca(e)}>
          <label>Paciente *<CampoIcone icone="usuario"><select value={form.pacienteId} required
            onChange={e => setForm({ ...form, pacienteId: e.target.value })}>
            <option value="">Selecione…</option>{elegiveis.map(p => <option value={p.id} key={p.id}>{p.nome}</option>)}</select></CampoIcone></label>
          <label>Serviço vinculado (opcional)<CampoIcone icone="servicos"><select value={form.servicoId ?? ''}
            onChange={e => selecionarServico(e.target.value)}><option value="">Sem vínculo</option>
            {servicos.map(s => <option value={s.id} key={s.id}>{s.nome}{!s.ativo ? ' (inativo)' : ''}</option>)}</select></CampoIcone></label>
          <label>Descrição *<CampoIcone icone="descricao"><input required maxLength={255} value={form.descricao}
            onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: Sessão clínica de demonstração"/></CampoIcone></label>
          <div className="grade-formulario"><label>Valor (R$) *<CampoIcone icone="dinheiro"><input required inputMode="decimal" type="text"
            value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="180,00"/></CampoIcone></label>
            <label>Data do vencimento *<CampoIcone icone="calendario"><input required type="date"
              value={form.vencimentoEm} onChange={e => setForm({ ...form, vencimentoEm: e.target.value })}/></CampoIcone></label></div>
          <p className="nota-form">O valor é uma fotografia do combinado: alterar depois o catálogo de serviços não muda esta cobrança. Não há vinculação automática com consultas.</p>
          <footer className="rodape-modal"><button type="button" className="botao secundario" onClick={() => setEditando(undefined)}>Voltar</button>
            <button type="submit" className="botao primario" disabled={ocupado}>{ocupado ? 'Salvando…' : 'Salvar cobrança'}</button></footer>
        </form>
      </section>
    </div>}

    {selecionada && <div className="modulo-sobreposicao" onMouseDown={e => { if (e.target === e.currentTarget && !ocupado) setCobrancaSelecionada(null) }}>
      <section className="modulo-dialogo" role="dialog" aria-modal="true" aria-label="Histórico de pagamentos">
        <header><div><span className="sobretitulo">HISTÓRICO FINANCEIRO</span><h2>{selecionada.pacienteNome}</h2>
          <small>{selecionada.descricao} · {rotulos[selecionada.situacao]}</small></div>
          <button className="botao-iconico" type="button" onClick={() => setCobrancaSelecionada(null)} aria-label="Fechar"><Icone nome="fechar"/></button></header>
        <div className="financeiro-pagamentos">
          <div className="financeiro-saldo"><span>Total: {moedaDecimal(selecionada.valor)}</span>
            <strong>Saldo: {moedaDecimal(selecionada.saldoAberto)}</strong></div>
          <h3>Pagamentos registrados</h3>
          {carregandoPagamentos ? <p>Carregando…</p> : pagamentos.length ? <ol className="financeiro-historico">
            {pagamentos.map(p => <li key={p.id}><div><strong>{moedaDecimal(p.valor)}</strong>
              <small>{new Date(p.recebidoEm).toLocaleString('pt-BR')} · {metodos[p.metodo]}</small>
              {p.referencia && <small>Referência: {p.referencia}</small>}</div></li>)}</ol> : <p>Sem pagamentos registrados.</p>}
          {selecionada.situacao !== 'PAGA' && selecionada.situacao !== 'CANCELADA' && <form className="formulario" onSubmit={e => void pagar(e)}>
            <h3>Registrar recebimento manual</h3>
            <div className="grade-formulario"><label>Valor recebido (R$) *<CampoIcone icone="dinheiro"><input required
              inputMode="decimal" value={formPagamento.valor} onChange={e => setFormPagamento({ ...formPagamento, valor: e.target.value })}
              placeholder="180,00"/></CampoIcone></label>
              <label>Método *<CampoIcone icone="financeiro"><select value={formPagamento.metodo}
                onChange={e => setFormPagamento({ ...formPagamento, metodo: e.target.value as MetodoPagamento })}>
                {Object.entries(metodos).map(([codigo, nome]) => <option key={codigo} value={codigo}>{nome}</option>)}
              </select></CampoIcone></label></div>
            <label>Referência (opcional)<CampoIcone icone="identificacao"><input maxLength={160}
              value={formPagamento.referencia ?? ''} onChange={e => setFormPagamento({ ...formPagamento, referencia: e.target.value || null })}
              placeholder="Identificador fictício de transferência"/></CampoIcone></label>
            <label>Observação administrativa<CampoIcone icone="nota" multilinha><textarea rows={3} maxLength={3000}
              value={formPagamento.observacaoAdministrativa ?? ''} onChange={e => setFormPagamento({ ...formPagamento, observacaoAdministrativa: e.target.value || null })}
              placeholder="Somente observações administrativas fictícias"/></CampoIcone></label>
            <p className="nota-form">Após registrar, o pagamento permanece no histórico. Estorno e conciliação bancária não fazem parte do MVP.</p>
            <footer className="rodape-modal"><button className="botao secundario" type="button" onClick={() => setCobrancaSelecionada(null)}>Fechar</button>
              <button className="botao primario" type="submit" disabled={ocupado}>{ocupado ? 'Registrando…' : 'Confirmar recebimento'}</button></footer>
          </form>}
        </div>
      </section>
    </div>}
  </>
}
