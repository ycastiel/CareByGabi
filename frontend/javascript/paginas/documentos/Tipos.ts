export type TipoDocumento = 'DECLARACAO' | 'ATESTADO_PSICOLOGICO' | 'RELATORIO_PSICOLOGICO'
  | 'LAUDO_PSICOLOGICO' | 'PARECER_PSICOLOGICO' | 'ENCAMINHAMENTO'
  | 'RECIBO' | 'TERMO_CONSENTIMENTO' | 'OUTRO'
export type SituacaoDocumento = 'RASCUNHO' | 'EMITIDO' | 'CANCELADO'
export interface DocumentoFormulario { pacienteId: string; tipo: TipoDocumento; titulo: string; conteudo: string }
export interface Documento extends DocumentoFormulario {
  id: string; pacienteNome: string; modelo: string; modeloVersao: number
  situacao: SituacaoDocumento; emitidoEm: string | null; criadoEm: string; atualizadoEm: string
}
export interface Anexo {
  id: string; pacienteId: string; documentoId: string | null
  nomeOriginal: string; mimeType: string; tamanhoBytes: number; checksumSha256: string; criadoEm: string
}
