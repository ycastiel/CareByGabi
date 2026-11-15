import type { Credenciais } from '../pacientes/Modelos'
import { requisitarDemo } from '../../helpers/ClienteDemo'
import type { Documento, DocumentoFormulario } from './Tipos'

export const documentosApi = {
  listar: (c: Credenciais) => requisitarDemo<Documento[]>(c, '/documentos'),
  criar: (c: Credenciais, form: DocumentoFormulario) => requisitarDemo<Documento>(c, '/documentos',
    { method: 'POST', body: JSON.stringify(form) }),
  editar: (c: Credenciais, id: string, form: DocumentoFormulario) => requisitarDemo<Documento>(c,
    `/documentos/${id}`, { method: 'PUT', body: JSON.stringify(form) }),
  emitir: (c: Credenciais, id: string) => requisitarDemo<Documento>(c, `/documentos/${id}/emitir`, { method: 'POST' }),
  cancelar: (c: Credenciais, id: string) => requisitarDemo<Documento>(c, `/documentos/${id}/cancelar`, { method: 'POST' }),
}
