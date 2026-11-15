export const moeda = (valor: number | null | undefined) => valor == null ? 'Não definido'
  : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
export const dataBR = (valor: string | null | undefined) => valor
  ? new Date(`${valor}T12:00:00`).toLocaleDateString('pt-BR') : '—'
export const dataHoraBR = (valor: string) => new Date(valor).toLocaleString('pt-BR', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
})
export const horaBR = (valor: string) => new Date(valor).toLocaleTimeString('pt-BR', {
  hour: '2-digit', minute: '2-digit',
})
export const chaveDia = (valor: string) => {
  const d = new Date(valor)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const paraInputDataHora = (valor: string | Date) => {
  const d = new Date(valor)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export const rotuloVinculo: Record<string, string> = {
  PACIENTE: 'Paciente clínico', AVALIADO_EXTERNO: 'Avaliado externo',
  AMBOS: 'Clínico e externo', RESPONSAVEL: 'Responsável',
}
export const rotuloSituacao: Record<string, string> = {
  AGENDADO: 'Agendado', CONFIRMADO: 'Confirmado', REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado', NAO_COMPARECEU: 'Não compareceu',
}
