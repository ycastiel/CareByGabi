import type { Credenciais } from '../pacientes/Modelos'
import { baixarDemo, requisitarDemo } from '../../helpers/ClienteDemo'
import type { Anexo } from '../documentos/Tipos'

export const arquivosApi = {
  listar: (c: Credenciais, pacienteId: string) => requisitarDemo<Anexo[]>(c,
    `/arquivos?pacienteId=${encodeURIComponent(pacienteId)}`),
  enviar: (c: Credenciais, pacienteId: string, arquivo: File, documentoId?: string) => {
    const form = new FormData()
    form.append('pacienteId', pacienteId)
    if (documentoId) form.append('documentoId', documentoId)
    form.append('arquivo', arquivo, arquivo.name)
    return requisitarDemo<Anexo>(c, '/arquivos', { method: 'POST', body: form })
  },
  baixar: (c: Credenciais, id: string) => baixarDemo(c, `/arquivos/${id}/download`),
}
