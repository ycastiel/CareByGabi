import type { Credenciais } from '../pacientes/Modelos'
import { requisitarDemo } from '../../helpers/ClienteDemo'
import type { Cobranca, CobrancaFormulario, Pagamento, PagamentoFormulario } from './Tipos'

/** Rotas disponíveis apenas no perfil demo, com autenticação local. */
export const financeiroApi = {
  listarCobrancas: (c: Credenciais) => requisitarDemo<Cobranca[]>(c, '/financeiro/cobrancas'),
  criarCobranca: (c: Credenciais, form: CobrancaFormulario) =>
    requisitarDemo<Cobranca>(c, '/financeiro/cobrancas', { method: 'POST', body: JSON.stringify(form) }),
  editarCobranca: (c: Credenciais, id: string, form: CobrancaFormulario) =>
    requisitarDemo<Cobranca>(c, `/financeiro/cobrancas/${id}`, { method: 'PUT', body: JSON.stringify(form) }),
  cancelarCobranca: (c: Credenciais, id: string) =>
    requisitarDemo<Cobranca>(c, `/financeiro/cobrancas/${id}/cancelar`, { method: 'POST' }),
  listarPagamentos: (c: Credenciais, id: string) =>
    requisitarDemo<Pagamento[]>(c, `/financeiro/cobrancas/${id}/pagamentos`),
  pagar: (c: Credenciais, id: string, form: PagamentoFormulario) =>
    requisitarDemo<Pagamento>(c, `/financeiro/cobrancas/${id}/pagamentos`,
      { method: 'POST', body: JSON.stringify(form) }),
}
