import type {
  Agendamento, AgendamentoFormulario, Credenciais, Paciente, PacienteFormulario,
  Servico, ServicoFormulario, Prontuario, RegistroClinico, RegistroFormulario,
} from '../pacientes/Modelos'

export class ErroApi extends Error {
  readonly status: number
  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.status = status
    this.name = 'ErroApi'
  }
}

function tokenBasico({ usuario, senha }: Credenciais): string {
  const bytes = new TextEncoder().encode(`${usuario}:${senha}`)
  const binario = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binario)
}

async function requisicao<T>(credenciais: Credenciais, rota: string, opcoes: RequestInit = {}): Promise<T> {
  let resposta: Response
  try {
    resposta = await fetch(`/api${rota}`, {
      ...opcoes,
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${tokenBasico(credenciais)}`,
        ...(opcoes.body ? { 'Content-Type': 'application/json' } : {}),
        ...opcoes.headers,
      },
    })
  } catch {
    throw new ErroApi(0, 'Não foi possível acessar a API. O Spring Boot está em execução na porta 8080?')
  }
  if (!resposta.ok) {
    const conteudo: unknown = await resposta.json().catch(() => null)
    const mensagem = conteudo && typeof conteudo === 'object' && 'mensagem' in conteudo
      && typeof conteudo.mensagem === 'string' ? conteudo.mensagem : null
    if (resposta.status === 401) throw new ErroApi(401, 'Usuário ou senha incorretos para a demonstração local.')
    throw new ErroApi(resposta.status, mensagem ?? `Não foi possível concluir a operação (HTTP ${resposta.status}).`)
  }
  return resposta.json() as Promise<T>
}

const json = (valor: unknown) => JSON.stringify(valor)
export const api = {
  pacientes: {
    listar: (c: Credenciais) => requisicao<Paciente[]>(c, '/pacientes'),
    criar: (c: Credenciais, dados: PacienteFormulario) => requisicao<Paciente>(c, '/pacientes', { method: 'POST', body: json(dados) }),
    atualizar: (c: Credenciais, id: string, dados: PacienteFormulario) => requisicao<Paciente>(c, `/pacientes/${id}`, { method: 'PUT', body: json(dados) }),
  },
  servicos: {
    listar: (c: Credenciais) => requisicao<Servico[]>(c, '/servicos'),
    criar: (c: Credenciais, dados: ServicoFormulario) => requisicao<Servico>(c, '/servicos', { method: 'POST', body: json(dados) }),
    atualizar: (c: Credenciais, id: string, dados: ServicoFormulario) => requisicao<Servico>(c, `/servicos/${id}`, { method: 'PUT', body: json(dados) }),
  },
  agendamentos: {
    listar: (c: Credenciais) => requisicao<Agendamento[]>(c, '/agendamentos'),
    criar: (c: Credenciais, dados: AgendamentoFormulario) => requisicao<Agendamento>(c, '/agendamentos', { method: 'POST', body: json(dados) }),
    atualizar: (c: Credenciais, id: string, dados: AgendamentoFormulario) => requisicao<Agendamento>(c, `/agendamentos/${id}`, { method: 'PUT', body: json(dados) }),
  },
  prontuarios: {
    listar: (c: Credenciais) => requisicao<Prontuario[]>(c, '/prontuarios'),
    abrir: (c: Credenciais, pacienteId: string) => requisicao<Prontuario>(c, '/prontuarios',
      { method: 'POST', body: json({ pacienteId }) }),
    registros: (c: Credenciais, id: string) => requisicao<RegistroClinico[]>(c, `/prontuarios/${id}/registros`),
    criarRegistro: (c: Credenciais, id: string, dados: RegistroFormulario) => requisicao<RegistroClinico>(c,
      `/prontuarios/${id}/registros`, { method: 'POST', body: json(dados) }),
    atualizarRegistro: (c: Credenciais, id: string, registroId: string, dados: RegistroFormulario) =>
      requisicao<RegistroClinico>(c, `/prontuarios/${id}/registros/${registroId}`,
        { method: 'PUT', body: json(dados) }),
    finalizarRegistro: (c: Credenciais, id: string, registroId: string) =>
      requisicao<RegistroClinico>(c, `/prontuarios/${id}/registros/${registroId}/finalizar`, { method: 'POST' }),
    encerrar: (c: Credenciais, id: string) => requisicao<Prontuario>(c,
      `/prontuarios/${id}/encerrar`, { method: 'POST' }),
  },
}
