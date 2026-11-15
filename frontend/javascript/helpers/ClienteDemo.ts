import type { Credenciais } from '../paginas/pacientes/Modelos'

/** Transporte exclusivo do MVP local; não reutilizar Basic Auth em produção. */
function tokenBasico(c: Credenciais): string {
  const bytes = new TextEncoder().encode(`${c.usuario}:${c.senha}`)
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''))
}

export async function requisitarDemo<T>(c: Credenciais, rota: string, init: RequestInit = {}): Promise<T> {
  let resposta: Response
  try {
    resposta = await fetch(`/api${rota}`, {
      ...init,
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${tokenBasico(c)}`,
        ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new Error('API indisponível. Verifique o Spring Boot na porta 8080.')
  }
  if (!resposta.ok) {
    const body: unknown = await resposta.json().catch(() => null)
    const mensagem = body && typeof body === 'object' && 'mensagem' in body && typeof body.mensagem === 'string'
      ? body.mensagem : `Falha HTTP ${resposta.status}`
    throw new Error(resposta.status === 401 ? 'Credenciais de demonstração inválidas.' : mensagem)
  }
  if (resposta.status === 204) return undefined as T
  return resposta.json() as Promise<T>
}

export async function baixarDemo(c: Credenciais, rota: string): Promise<Blob> {
  let resposta: Response
  try {
    resposta = await fetch(`/api${rota}`, {
      credentials: 'omit',
      headers: { Authorization: `Basic ${tokenBasico(c)}`, Accept: 'application/octet-stream' },
    })
  } catch { throw new Error('Download indisponível: API desconectada.') }
  if (!resposta.ok) throw new Error(`Não foi possível baixar o anexo (HTTP ${resposta.status}).`)
  return resposta.blob()
}
