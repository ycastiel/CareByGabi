import { useCallback, useState } from 'react'
import type { FormEvent } from 'react'
import { api, ErroApi } from '../../../frontend/javascript/paginas/servicos/Api'
import type {
  AgendamentoFormulario, Credenciais, DadosClinica, PacienteFormulario,
  Prontuario, ServicoFormulario, Tela,
} from '../../../frontend/javascript/paginas/pacientes/Modelos'
import { Estrutura } from '../../../frontend/javascript/componentes/Estrutura'
import { Icone } from '../../../frontend/javascript/componentes/Icone'
import { CampoIcone } from '../../../frontend/javascript/componentes/CampoIcone'
import { AeroAtmosfera } from '../../../frontend/javascript/componentes/temas/AeroAtmosfera'
import { LogoGabriela } from '../../../frontend/javascript/componentes/imagens/LogoGabriela'
import { InicioPagina } from '../../../frontend/paginas/Index'
import { PacientesPagina } from '../../../frontend/paginas/pacientes/Pacientes'
import { AgendaPagina } from '../../../frontend/paginas/agendamentos/Agenda'
import { ServicosPagina } from '../../../frontend/paginas/servicos/Servicos'
import { ProntuariosPagina } from '../../../frontend/paginas/prontuarios/Prontuarios'
import { AvaliacoesPagina } from '../../../frontend/paginas/avaliacoes/Avaliacoes'
import { DocumentosPagina } from '../../../frontend/paginas/documentos/Documentos'

const dadosVazios: DadosClinica = { pacientes: [], servicos: [], agendamentos: [], prontuarios: [] }

export default function App() {
  const [credenciais, setCredenciais] = useState<Credenciais | null>(null)
  const [usuarioDigitado, setUsuarioDigitado] = useState('')
  const [senhaDigitada, setSenhaDigitada] = useState('')
  const [tela, setTela] = useState<Tela>('inicio')
  const [dados, setDados] = useState<DadosClinica>(dadosVazios)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [versaoRegistros, setVersaoRegistros] = useState(0)

  async function buscarTudo(c: Credenciais): Promise<DadosClinica> {
    const [pacientes, servicos, agendamentos, prontuarios] = await Promise.all([
      api.pacientes.listar(c), api.servicos.listar(c), api.agendamentos.listar(c), api.prontuarios.listar(c),
    ])
    return { pacientes, servicos, agendamentos, prontuarios }
  }

  const listarRegistros = useCallback((id: string) => {
    if (!credenciais) return Promise.reject(new Error('Acesso demonstrativo encerrado.'))
    return api.prontuarios.registros(credenciais, id)
  }, [credenciais])

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setOcupado(true)
    setErro('')
    const entrada = { usuario: usuarioDigitado.trim(), senha: senhaDigitada }
    try {
      const resposta = await buscarTudo(entrada)
      setDados(resposta)
      setCredenciais(entrada)
      setSenhaDigitada('')
    } catch (ex) {
      setErro(ex instanceof Error ? ex.message : 'Não foi possível entrar.')
    } finally { setOcupado(false) }
  }

  async function atualizar() {
    if (!credenciais) return
    setOcupado(true)
    setErro('')
    try {
      setDados(await buscarTudo(credenciais))
      setAviso('Informações atualizadas diretamente do PostgreSQL.')
    } catch (ex) {
      setErro(ex instanceof Error ? ex.message : 'Falha ao atualizar dados.')
      if (ex instanceof ErroApi && ex.status === 401) setCredenciais(null)
    } finally { setOcupado(false) }
  }

  async function executar(descricao: string, operacao: () => Promise<unknown>): Promise<boolean> {
    if (!credenciais) return false
    setOcupado(true)
    setErro('')
    setAviso('')
    try {
      await operacao()
      setDados(await buscarTudo(credenciais))
      setVersaoRegistros(v => v + 1)
      setAviso(`${descricao} com sucesso. Os dados foram gravados no PostgreSQL.`)
      return true
    } catch (ex) {
      setErro(ex instanceof Error ? ex.message : 'Não foi possível salvar os dados.')
      if (ex instanceof ErroApi && ex.status === 401) setCredenciais(null)
      return false
    } finally { setOcupado(false) }
  }

  async function abrirProntuario(pacienteId: string): Promise<Prontuario | null> {
    if (!credenciais) return null
    let criado: Prontuario | null = null
    const ok = await executar('Prontuário demonstrativo aberto', async () => {
      criado = await api.prontuarios.abrir(credenciais, pacienteId)
    })
    return ok ? criado : null
  }

  function sair() {
    setCredenciais(null)
    setDados(dadosVazios)
    setSenhaDigitada('')
    setErro('')
    setAviso('')
  }

  if (!credenciais) return <div className="login-pagina"><div className="login-esquerda"><AeroAtmosfera variante="entrada"/>
    <div className="logo-login"><div className="marca-simbolo grande"><LogoGabriela className="logo-profissional" /></div><span>CareByGabi</span></div>
    <div className="login-mensagem"><span className="sobretitulo">SEU ESPAÇO DE CUIDADO</span><h1>Uma rotina mais leve começa com organização.</h1>
      <p>Pacientes, consultas e serviços em um só lugar. Uma demonstração construída para acompanhar o dia a dia clínico.</p></div>
    <div className="rodape-login">MVP local · Dados fictícios · Não é um prontuário clínico homologado</div>
  </div><div className="login-direita"><form className="login-cartao" onSubmit={entrar}>
      <span className="login-selo"><Icone nome="escudo" tamanho={17}/> Acesso demonstrativo</span>
      <h2>Bem-vinda de volta</h2><p>Utilize as credenciais configuradas no backend para acessar o ambiente local.</p>
      {erro && <div className="aviso erro" role="alert"><Icone nome="alerta" tamanho={19}/>{erro}</div>}
      <label>Usuário<CampoIcone icone="usuario"><input autoComplete="username" placeholder="Seu usuário de demonstração" required value={usuarioDigitado} onChange={e => setUsuarioDigitado(e.target.value)}/></CampoIcone></label>
      <label>Senha<CampoIcone icone="cadeado"><input type="password" autoComplete="current-password" placeholder="Sua senha local" required value={senhaDigitada} onChange={e => setSenhaDigitada(e.target.value)}/></CampoIcone></label>
      <button className="botao primario login-botao" disabled={ocupado} type="submit">{ocupado ? 'Conectando...' : 'Entrar no consultório'}<Icone nome="seta" tamanho={18}/></button>
      <div className="login-nota">A senha permanece apenas na memória desta aba e não é salva no navegador.</div>
    </form></div></div>

  return <Estrutura tela={tela} mudarTela={setTela} sair={sair} aoAtualizar={() => void atualizar()} usuario={credenciais.usuario}>
    {erro && <div className="aviso erro" role="alert"><Icone nome="alerta" tamanho={19}/><span>{erro}</span><button onClick={() => setErro('')} aria-label="Dispensar erro"><Icone nome="fechar" tamanho={16}/></button></div>}
    {aviso && <div className="aviso sucesso" role="status"><Icone nome="checar" tamanho={19}/><span>{aviso}</span><button onClick={() => setAviso('')} aria-label="Dispensar confirmação"><Icone nome="fechar" tamanho={16}/></button></div>}
    {tela === 'inicio' && <InicioPagina dados={dados} mudarTela={setTela}/>}
    {tela === 'pacientes' && <PacientesPagina pacientes={dados.pacientes} ocupado={ocupado} aoSalvar={(id: string | null, d: PacienteFormulario) =>
      executar(id ? 'Paciente atualizado' : 'Paciente cadastrado', () => id ? api.pacientes.atualizar(credenciais, id, d) : api.pacientes.criar(credenciais, d))}/>}
    {tela === 'agenda' && <AgendaPagina agendamentos={dados.agendamentos} pacientes={dados.pacientes} servicos={dados.servicos}
      ocupado={ocupado} irParaPacientes={() => setTela('pacientes')} irParaServicos={() => setTela('servicos')}
      aoSalvar={(id: string | null, d: AgendamentoFormulario) => executar(id ? 'Agendamento atualizado' : 'Consulta agendada', () =>
        id ? api.agendamentos.atualizar(credenciais, id, d) : api.agendamentos.criar(credenciais, d))}/>}
    {tela === 'prontuarios' && <ProntuariosPagina
      pacientes={dados.pacientes} prontuarios={dados.prontuarios} versaoRegistros={versaoRegistros}
      ocupado={ocupado} aoAbrir={abrirProntuario}
      aoListarRegistros={listarRegistros}
      aoSalvarRegistro={(id, dadosRegistro, registroId) => executar(registroId ? 'Rascunho atualizado' : 'Rascunho salvo',
        () => registroId ? api.prontuarios.atualizarRegistro(credenciais, id, registroId, dadosRegistro)
          : api.prontuarios.criarRegistro(credenciais, id, dadosRegistro))}
      aoFinalizarRegistro={(id, registroId) => executar('Registro finalizado',
        () => api.prontuarios.finalizarRegistro(credenciais, id, registroId))}
      aoEncerrar={id => executar('Prontuário encerrado', () => api.prontuarios.encerrar(credenciais, id))}
    />}
    {tela === 'avaliacoes' && <AvaliacoesPagina credenciais={credenciais} pacientes={dados.pacientes}/>}
    {tela === 'documentos' && <DocumentosPagina credenciais={credenciais} pacientes={dados.pacientes}/>}
    {tela === 'servicos' && <ServicosPagina servicos={dados.servicos} ocupado={ocupado} aoSalvar={(id: string | null, d: ServicoFormulario) =>
      executar(id ? 'Serviço atualizado' : 'Serviço cadastrado', () => id ? api.servicos.atualizar(credenciais, id, d) : api.servicos.criar(credenciais, d))}/>}
  </Estrutura>
}
