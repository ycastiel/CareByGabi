import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Paciente, PacienteFormulario, SituacaoPaciente, VinculoPaciente } from '../../javascript/paginas/pacientes/Modelos'
import { CampoIcone } from '../../javascript/componentes/CampoIcone'
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
    `${p.nome} ${p.email ?? ''} ${p.telefone ?? ''}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR')) &&
    (filtro === 'TODOS' || p.situacao === filtro)
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
    if (await aoSalvar(editando ?? null, form)) setEditando(undefined)
  }

  return <>
    <div className="titulo-pagina">
      <div><span className="sobretitulo">BASE CLÍNICA</span><h1>Pacientes</h1><p>Gerencie dados cadastrais e informações administrativas.</p></div>
      <button className="botao primario" onClick={() => abrir()}><Icone nome="adicionar" tamanho={18}/> Cadastrar paciente</button>
    </div>
    <section className="cartao cartao-tabela">
      <div className="filtros">
        <label className="campo-busca"><Icone nome="buscar" tamanho={18}/><input placeholder="Buscar nome, e-mail ou telefone..." aria-label="Buscar pacientes" value={busca} onChange={e => setBusca(e.target.value)}/></label>
        <select aria-label="Filtrar pacientes por situação" value={filtro} onChange={e => setFiltro(e.target.value as typeof filtro)}>
          <option value="TODOS">Todas as situações</option><option value="ATIVO">Ativos</option><option value="INATIVO">Inativos</option>
        </select>
        <span className="quantidade">{filtrados.length} registro(s)</span>
      </div>
      <div className="tabela-container"><table className="tabela">
        <thead><tr><th>Paciente</th><th>Nascimento</th><th>Contato</th><th>Convênio</th><th>Situação</th><th>Ações</th></tr></thead>
        <tbody>{filtrados.map(p => <tr key={p.id}>
          <td><div className="pessoa-tabela"><span className="avatar-iniciais">{p.nome.slice(0, 2).toUpperCase()}</span><span><strong>{p.nome}</strong><small>{rotuloVinculo[p.vinculo]}</small></span></div></td>
          <td>{dataBR(p.dataNascimento)}</td><td><div>{p.telefone || '—'}</div><small>{p.email || ''}</small></td>
          <td>{p.convenio || 'Particular / não informado'}</td>
          <td><span className={`status ${p.situacao.toLowerCase()}`}>{p.situacao === 'ATIVO' ? 'Ativo' : 'Inativo'}</span></td>
          <td><button className="botao secundario pequeno" onClick={() => abrir(p)}><Icone nome="editar" tamanho={15}/> Editar</button></td>
        </tr>)}
          {!filtrados.length && <tr><td colSpan={6}><div className="vazio"><Icone nome="pacientes" tamanho={30}/><strong>Nenhum paciente encontrado</strong><span>Cadastre um novo paciente ou ajuste a busca.</span></div></td></tr>}
        </tbody>
      </table></div>
    </section>

    {editando !== undefined && <Modal titulo={editando ? 'Editar paciente' : 'Novo paciente'} fechar={() => setEditando(undefined)}>
      <form onSubmit={salvar} className="formulario">
        <div className="grupo-formulario"><label>Nome completo <b>*</b>
          <CampoIcone icone="usuario"><input required maxLength={180} placeholder="Nome e sobrenome" autoComplete="name" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}/></CampoIcone>
        </label></div>
        <div className="grade-formulario">
          <label>Data de nascimento
            <CampoIcone icone="calendario"><input type="date" value={form.dataNascimento ?? ''} onChange={e => setForm({ ...form, dataNascimento: e.target.value || null })}/></CampoIcone>
          </label>
          <label>CPF
            <CampoIcone icone="identificacao"><input inputMode="numeric" maxLength={20} placeholder="000.000.000-00" value={form.cpf ?? ''} onChange={e => setForm({ ...form, cpf: e.target.value || null })}/></CampoIcone>
          </label>
          <label>Telefone
            <CampoIcone icone="telefone"><input type="tel" maxLength={30} autoComplete="tel" placeholder="(11) 99999-9999" value={form.telefone ?? ''} onChange={e => setForm({ ...form, telefone: e.target.value || null })}/></CampoIcone>
          </label>
          <label>E-mail
            <CampoIcone icone="email"><input type="email" maxLength={320} autoComplete="email" placeholder="contato@exemplo.com" value={form.email ?? ''} onChange={e => setForm({ ...form, email: e.target.value || null })}/></CampoIcone>
          </label>
          <label>Tipo de cadastro
            <CampoIcone icone="vinculo"><select value={form.vinculo} onChange={e => setForm({ ...form, vinculo: e.target.value as VinculoPaciente })}>
              {vinculos.map(v => <option key={v} value={v}>{rotuloVinculo[v]}</option>)}
            </select></CampoIcone>
          </label>
          <label>Situação
            <CampoIcone icone="atividade"><select value={form.situacao} onChange={e => setForm({ ...form, situacao: e.target.value as SituacaoPaciente })}>
              <option value="ATIVO">Ativo</option><option value="INATIVO">Inativo</option>
            </select></CampoIcone>
          </label>
          <label>Convênio
            <CampoIcone icone="convenio"><input maxLength={120} placeholder="Particular ou nome do convênio" value={form.convenio ?? ''} onChange={e => setForm({ ...form, convenio: e.target.value || null })}/></CampoIcone>
          </label>
          <label>Responsável principal
            <CampoIcone icone="pacientes"><select value={form.responsavelPrincipalId ?? ''} onChange={e => setForm({ ...form, responsavelPrincipalId: e.target.value || null })}>
              <option value="">Nenhum</option>{pacientes.filter(p => p.id !== editando).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select></CampoIcone>
          </label>
        </div>
        <label>Observações administrativas
          <CampoIcone icone="nota" multilinha><textarea rows={3} placeholder="Apenas informações administrativas; não inclua anotações clínicas." value={form.observacoesAdministrativas ?? ''} onChange={e => setForm({ ...form, observacoesAdministrativas: e.target.value || null })}/></CampoIcone>
        </label>
        <div className="rodape-modal">
          <button type="button" className="botao secundario" onClick={() => setEditando(undefined)}>Cancelar</button>
          <button className="botao primario" type="submit" disabled={ocupado}>{ocupado ? 'Salvando...' : 'Salvar paciente'}</button>
        </div>
      </form>
    </Modal>}
  </>
}