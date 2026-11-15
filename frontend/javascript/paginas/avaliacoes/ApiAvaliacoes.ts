import type { Credenciais } from '../pacientes/Modelos'
import { requisitarDemo } from '../../helpers/ClienteDemo'
import type { Avaliacao, AvaliacaoFormulario } from './Tipos'

export const avaliacoesApi = {
  listar: (c: Credenciais) => requisitarDemo<Avaliacao[]>(c, '/avaliacoes'),
  criar: (c: Credenciais, dados: AvaliacaoFormulario) => requisitarDemo<Avaliacao>(c, '/avaliacoes',
    { method: 'POST', body: JSON.stringify(dados) }),
  editar: (c: Credenciais, id: string, dados: AvaliacaoFormulario) => requisitarDemo<Avaliacao>(c,
    `/avaliacoes/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  revisar: (c: Credenciais, id: string) => requisitarDemo<Avaliacao>(c, `/avaliacoes/${id}/revisar`, { method: 'POST' }),
}
