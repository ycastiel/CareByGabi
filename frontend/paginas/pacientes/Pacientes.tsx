import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Paciente, PacienteFormulario, SituacaoPaciente, VinculoPaciente } from '../../javascript/paginas/pacientes/Modelos'
import { Icone } from '../../javascript/componentes/Icone'
import { Modal } from '../../javascript/componentes/Modal'
import { dataBR, rotuloVinculo } from '../../javascript/helpers/Formatacao'

const formularioVazio: PacienteFormulario = {
  nome: '', dataNascimento: null, telefone: null, email: null, cpf: null,
  vinculo: 'PACIENTE', situacao: 'ATIVO', convenio: null,
  responsavelPrincipalId: null, observacoesAdministrativas: null,
}
const vinculos: VinculoPaciente[] = ['PACIENTE', 'AVALIADO_EXTERNO', 'AMBOS', 'RESPONSAVEL']

export function PacientesPagina({ pacientes, aoSalvar, ocupado }: {
  pacientes: Paciente[]
  aoSalvar: (id: string | null, dados: PacienteFormulario) => Promise<boolean>
  ocupado: boolean
}) {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'TODOS' | SituacaoPaciente>('TODOS')
  const [editando, setEditando] = useState<string | null | undefined>(undefined)
  const [form, setForm] = useState<PacienteFormulario>(formularioVazio)
  const filtrados = useMemo(() => pacientes.filter(p =>
    `${p.nome} ${p.email ?? ''} ${p.telefone ?? ''}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR'))
    && (filtro === 'TODOS' || p.situacao === filtro)
  ), [pacientes, busca, filtro])

  function abrir(p?: Paciente) {
    setEditando(p?.id ?? null)
    setForm(p ? {
      nome: p.nome, dataNascimento: p.dataNascimento, telefone: p.telefone,
      email: p.email, cpf: p.cpf, vinculo: p.vinculo, situacao: p.situacao,
      convenio: p.convenio, responsavelPrincipalId: p.responsavelPrincipalId,
      observacoesAdministrativas: p.observacoesAdministrativas,
    } : { ...formularioVazio })
  }
  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const sucesso = await aoSalvar(editando ?? null, form)
    if (sucesso) setEditando(undefined)
  }
  return <>
    <div className="titulo-pagina"><div><span className="sobretitulo">BASE CLÍNICA</span><h1>Pacientes</h1><p>Gerencie dados cadastrais e informações administrativas.</p></div>
      <button className="botao primario" onClick={() => abrir()}><Icone nome="adicionar" tamanho={18} /> Cadastrar paciente</button></div>
    <section className="cartao cartao-tabela">
      <div className="filtros"><label className="campo-busca"><Icone nome="buscar" tamanho={18} /><input placeholder="Buscar nome, e-mail ou telefone..." aria-label="Buscar pacientes" value={busca} onChange={e => setBusca(e.target.value)} /></label>
        <select aria-label="Filtrar pacientes por situação" value={filtro} onChange={e => setFiltro(e.target.value as typeof filtro)}>
          <option value="TODOS">Todas as situações</option><option value="ATIVO">Ativos</option><option value="INATIVO">Inativos</option>
        </select><span className="quantidade">{filtrados.length} registro(s)</span></div>
      <div className="tabela-container"><table className="tabela"><thead><tr><th>Paciente</th><th>Nascimento</th><th>Contato</th><th>Convênio</th><th>Situação</th><th>Ações</th></tr></thead>
        <tbody>{filtrados.map(p => <tr key={p.id}><td><div className="pessoa-tabela"><span className="avatar-iniciais">{p.nome.slice(0, 2).toUpperCase()}</span><span><strong>{p.nome}</strong><small>{rotuloVinculo[p.vinculo]}</small></span></div></td>
          <td>{dataBR(p.dataNascimento)}</td><td><div>{p.telefone || '—'}</div><small>{p.email || ''}</small></td><td>{p.convenio || 'Particular / não informado'}</td>
          <td><span className={`status ${p.situacao.toLowerCase()}`}>{p.situacao === 'ATIVO' ? 'Ativo' : 'Inativo'}</span></td>
          <td><button className="botao secundario pequeno" onClick={() => abrir(p)}><Icone nome="editar" tamanho={15} /> Editar</button></td></tr>)}
          {!filtrados.length && <tr><td colSpan={6}><div className="vazio"><Icone nome="pacientes" tamanho={30} /><strong>Nenhum paciente encontrado</strong><span>Cadastre um novo paciente ou ajuste a busca.</span></div></td></tr>}
        </tbody></table></div>
    </section>
    {editando !== undefined && <Modal titulo={editando ? 'Editar paciente' : 'Novo paciente'} fechar={() => setEditando(undefined)}>
      <form onSubmit={salvar} className="formulario">
        <div className="grupo-formulario"><label>Nome completo <b>*</b><input required maxLength={180} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></label></div>
        <div className="grade-formulario">
          <label>Data de nascimento<input type="date" value={form.dataNascimento ?? ''} onChange={e => setForm({ ...form, dataNascimento: e.target.value || null })} /></label>
          <label>CPF<input inputMode="numeric" maxLength={20} placeholder="Somente números ou formatado" value={form.cpf ?? ''} onChange={e => setForm({ ...form, cpf: e.target.value || null })} /></label>
          <label>Telefone<input maxLength={30} placeholder="(11) 99999-9999" value={form.telefone ?? ''} onChange={e => setForm({ ...form, telefone: e.target.value || null })} /></label>
          <label>E-mail<input type="email" maxLength={320} value={form.email ?? ''} onChange={e => setForm({ ...form, email: e.target.value || null })} /></label>
          <label>Tipo de cadastro<select value={form.vinculo} onChange={e => setForm({ ...form, vinculo: e.target.value as VinculoPaciente })}>
            {vinculos.map(v => <option key={v} value={v}>{rotuloVinculo[v]}</option>)}
          </select></label>
          <label>Situação<select value={form.situacao} onChange={e => setForm({ ...form, situacao: e.target.value as SituacaoPaciente })}>
            <option value="ATIVO">Ativo</option><option value="INATIVO">Inativo</option></select></label>
          <label>Convênio<input maxLength={120} value={form.convenio ?? ''} onChange={e => setForm({ ...form, convenio: e.target.value || null })} /></label>
          <label>Responsável principal<select value={form.responsavelPrincipalId ?? ''} onChange={e => setForm({ ...form, responsavelPrincipalId: e.target.value || null })}>
            <option value="">Nenhum</option>{pacientes.filter(p => p.id !== editando).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select></label>
        </div>
        <label>Observações administrativas<textarea rows={3} placeholder="Somente informações administrativas, não anotações clínicas." value={form.observacoesAdministrativas ?? ''} onChange={e => setForm({ ...form, observacoesAdministrativas: e.target.value || null })} /></label>
        <div className="rodape-modal"><button type="button" className="botao secundario" onClick={() => setEditando(undefined)}>Cancelar</button><button className="botao primario" type="submit" disabled={ocupado}>{ocupado ? 'Salvando...' : 'Salvar paciente'}</button></div>
      </form>
    </Modal>}
  </>
}
