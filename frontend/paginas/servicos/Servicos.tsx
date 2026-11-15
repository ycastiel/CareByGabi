import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CategoriaServico, Servico, ServicoFormulario } from '../../javascript/paginas/pacientes/Modelos'
import { Icone } from '../../javascript/componentes/Icone'
import { Modal } from '../../javascript/componentes/Modal'
import { moeda } from '../../javascript/helpers/Formatacao'

const vazio: ServicoFormulario = {
  nome: '', categoria: 'CLINICO', descricao: null, duracaoMinutos: 50, valorPadrao: null, ativo: true,
}
const rotuloCategoria: Record<CategoriaServico, string> = {
  CLINICO: 'Clínico', ORGANIZACIONAL: 'Organizacional', OUTRO: 'Outro',
}

export function ServicosPagina({ servicos, aoSalvar, ocupado }: {
  servicos: Servico[]
  aoSalvar: (id: string | null, dados: ServicoFormulario) => Promise<boolean>
  ocupado: boolean
}) {
  const [editando, setEditando] = useState<string | null | undefined>(undefined)
  const [form, setForm] = useState<ServicoFormulario>(vazio)
  function abrir(s?: Servico) {
    setEditando(s?.id ?? null)
    setForm(s ? { nome: s.nome, categoria: s.categoria, descricao: s.descricao,
      duracaoMinutos: s.duracaoMinutos, valorPadrao: s.valorPadrao, ativo: s.ativo } : { ...vazio })
  }
  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (await aoSalvar(editando ?? null, form)) setEditando(undefined)
  }
  return <>
    <div className="titulo-pagina"><div><span className="sobretitulo">CATÁLOGO</span><h1>Serviços e valores</h1><p>Configure os tipos de atendimento usados nos agendamentos.</p></div>
      <button className="botao primario" onClick={() => abrir()}><Icone nome="adicionar" tamanho={18}/> Novo serviço</button></div>
    <div className="grade-servicos">
      {servicos.map(s => <article className="cartao cartao-servico" key={s.id}><div className="servico-topo"><span className="icone-suave"><Icone nome="servicos" /></span><span className={`status ${s.ativo ? 'ativo' : 'inativo'}`}>{s.ativo ? 'Ativo' : 'Inativo'}</span></div>
        <span className="sobretitulo">{rotuloCategoria[s.categoria]}</span><h2>{s.nome}</h2><p>{s.descricao || 'Serviço cadastrado na clínica.'}</p>
        <div className="servico-dados"><span><Icone nome="relogio" tamanho={16}/> {s.duracaoMinutos} min</span><strong>{moeda(s.valorPadrao)}</strong></div>
        <button className="botao secundario pequeno" onClick={() => abrir(s)}><Icone nome="editar" tamanho={15}/> Editar serviço</button></article>)}
      {!servicos.length && <div className="cartao vazio cartao-vazio"><Icone nome="servicos" tamanho={32}/><strong>Nenhum serviço cadastrado</strong><span>Cadastre pelo menos um serviço para criar agendamentos.</span></div>}
    </div>
    {editando !== undefined && <Modal titulo={editando ? 'Editar serviço' : 'Cadastrar serviço'} fechar={() => setEditando(undefined)}>
      <form className="formulario" onSubmit={salvar}>
        <label>Nome do serviço <b>*</b><input required maxLength={160} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}/></label>
        <div className="grade-formulario">
          <label>Categoria<select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value as CategoriaServico })}>
            {Object.entries(rotuloCategoria).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select></label>
          <label>Duração padrão (minutos)<input type="number" required min={15} max={480} value={form.duracaoMinutos} onChange={e => setForm({ ...form, duracaoMinutos: Number(e.target.value) })}/></label>
          <label>Valor de referência (R$)<input type="number" min={0} step="0.01" placeholder="Opcional" value={form.valorPadrao ?? ''} onChange={e => setForm({ ...form, valorPadrao: e.target.value === '' ? null : Number(e.target.value) })}/></label>
          <label>Situação<select value={form.ativo ? 'SIM' : 'NAO'} onChange={e => setForm({ ...form, ativo: e.target.value === 'SIM' })}><option value="SIM">Ativo</option><option value="NAO">Inativo</option></select></label>
        </div>
        <label>Descrição<textarea rows={3} value={form.descricao ?? ''} onChange={e => setForm({ ...form, descricao: e.target.value || null })}/></label>
        <div className="rodape-modal"><button type="button" className="botao secundario" onClick={() => setEditando(undefined)}>Cancelar</button>
          <button className="botao primario" type="submit" disabled={ocupado}>{ocupado ? 'Salvando...' : 'Salvar serviço'}</button></div>
      </form>
    </Modal>}
  </>
}
