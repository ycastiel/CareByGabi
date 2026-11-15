export type TipoAvaliacao = 'ENTREVISTA_SELECAO' | 'ATENDIMENTO_CLINICO' | 'AVALIACAO_PSICOLOGICA'
  | 'ACOMPANHAMENTO_ORGANIZACIONAL' | 'OUTRA'
export type SituacaoAvaliacao = 'RASCUNHO' | 'REVISADA'
export interface CriterioAvaliacao {
  modulo: string
  criterio: string
  nivel: number
  evidencia: string | null
}
export interface AvaliacaoFormulario {
  pacienteId: string
  tipo: TipoAvaliacao
  titulo: string
  contexto: string | null
  objetivo: string | null
  criterios: CriterioAvaliacao[]
  sinteseRascunho: string | null
}
export interface Avaliacao extends AvaliacaoFormulario {
  id: string
  pacienteNome: string
  modeloCodigo: string | null
  modeloVersao: number
  situacao: SituacaoAvaliacao
  realizadoEm: string
  criadoEm: string
}
