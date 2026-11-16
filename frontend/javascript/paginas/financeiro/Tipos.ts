/** Valores decimais sempre como strings: a API não perde precisão monetária no JSON. */
export type SituacaoCobranca = 'PENDENTE' | 'PARCIAL' | 'PAGA' | 'CANCELADA'
export type MetodoPagamento = 'PIX' | 'DINHEIRO' | 'CARTAO' | 'TRANSFERENCIA' | 'OUTRO'

export interface Cobranca {
  id: string
  pacienteId: string
  pacienteNome: string
  servicoId: string | null
  servicoNome: string | null
  descricao: string
  valor: string
  valorRecebido: string
  saldoAberto: string
  vencimentoEm: string
  situacao: SituacaoCobranca
  criadoEm: string
}
export interface CobrancaFormulario {
  pacienteId: string
  servicoId: string | null
  descricao: string
  valor: string
  vencimentoEm: string
}
export interface Pagamento {
  id: string
  cobrancaId: string
  valor: string
  metodo: MetodoPagamento
  recebidoEm: string
  referencia: string | null
  observacaoAdministrativa: string | null
}
export interface PagamentoFormulario {
  valor: string
  metodo: MetodoPagamento
  referencia: string | null
  observacaoAdministrativa: string | null
}

/** Calcula somente centavos inteiros, sem acumular diferenças de ponto flutuante. */
export function centavos(valor: string): bigint {
  const partes = valor.trim().replace(',', '.').match(/^(\d{1,10})(?:\.(\d{1,2}))?$/)
  if (!partes) throw new Error('Informe um valor como 180,00 (sem separador de milhar).')
  return BigInt(partes[1]) * 100n + BigInt((partes[2] ?? '').padEnd(2, '0'))
}
export function decimal(valor: string): string {
  const cents = centavos(valor)
  if (cents <= 0n) throw new Error('O valor deve ser maior que zero.')
  return `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`
}
export function moedaCentavos(valor: bigint): string {
  const sinal = valor < 0n ? '−' : ''
  const positivo = valor < 0n ? -valor : valor
  return `${sinal}R$ ${new Intl.NumberFormat('pt-BR').format(Number(positivo / 100n))},${String(positivo % 100n).padStart(2, '0')}`
}
export const moedaDecimal = (valor: string) => moedaCentavos(centavos(valor))
