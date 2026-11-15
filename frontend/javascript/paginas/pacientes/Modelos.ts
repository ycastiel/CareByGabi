export type VinculoPaciente = 'PACIENTE' | 'AVALIADO_EXTERNO' | 'AMBOS' | 'RESPONSAVEL'
export type SituacaoPaciente = 'ATIVO' | 'INATIVO'
export type CategoriaServico = 'CLINICO' | 'ORGANIZACIONAL' | 'OUTRO'
export type ModalidadeAgendamento = 'PRESENCIAL' | 'ONLINE'
export type SituacaoAgendamento = 'AGENDADO' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO' | 'NAO_COMPARECEU'

export interface Credenciais { usuario: string; senha: string }
export interface Paciente {
  id: string
  nome: string
  dataNascimento: string | null
  telefone: string | null
  email: string | null
  cpf: string | null
  vinculo: VinculoPaciente
  situacao: SituacaoPaciente
  convenio: string | null
  responsavelPrincipalId: string | null
  responsavelPrincipalNome: string | null
  observacoesAdministrativas: string | null
  criadoEm: string
  atualizadoEm: string
}
export type PacienteFormulario = Omit<Paciente, 'id' | 'responsavelPrincipalNome' | 'criadoEm' | 'atualizadoEm'>

export interface Servico {
  id: string
  nome: string
  categoria: CategoriaServico
  descricao: string | null
  duracaoMinutos: number
  valorPadrao: number | null
  ativo: boolean
  criadoEm: string
}
export type ServicoFormulario = Omit<Servico, 'id' | 'criadoEm'>

export interface Agendamento {
  id: string
  pacienteId: string
  pacienteNome: string
  servicoId: string
  servicoNome: string
  inicioEm: string
  fimEm: string
  modalidade: ModalidadeAgendamento
  situacao: SituacaoAgendamento
  linkReuniao: string | null
  observacaoAdministrativa: string | null
  criadoEm: string
  atualizadoEm: string
}
export type AgendamentoFormulario = Omit<Agendamento,
  'id' | 'pacienteNome' | 'servicoNome' | 'criadoEm' | 'atualizadoEm'>

export interface DadosClinica {
  pacientes: Paciente[]
  servicos: Servico[]
  agendamentos: Agendamento[]
  prontuarios: Prontuario[]
}
export type SituacaoProntuario = 'ABERTO' | 'ENCERRADO'
export type CategoriaRegistro = 'ANAMNESE' | 'EVOLUCAO' | 'NOTA_RESTRITA' | 'OUTRO'
export type SituacaoRegistro = 'RASCUNHO' | 'FINALIZADO'

export interface Prontuario {
  id: string
  pacienteId: string
  pacienteNome: string
  abertoEm: string
  encerradoEm: string | null
  situacao: SituacaoProntuario
}
export interface RegistroClinico {
  id: string
  prontuarioId: string
  categoria: CategoriaRegistro
  conteudo: string
  situacao: SituacaoRegistro
  criadoEm: string
  atualizadoEm: string
  finalizadoEm: string | null
}
export interface RegistroFormulario { categoria: CategoriaRegistro; conteudo: string }
export type Tela = 'inicio' | 'pacientes' | 'agenda' | 'servicos' | 'prontuarios'
