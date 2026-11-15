import type { SVGProps } from 'react'

type IconeNome =
  | 'inicio' | 'pacientes' | 'agenda' | 'servicos' | 'prontuarios' | 'financeiro'
  | 'avaliacoes' | 'documentos' | 'ia' | 'adicionar' | 'buscar' | 'fechar'
  | 'atualizar' | 'sair' | 'calendario' | 'relogio' | 'checar' | 'alerta'
  | 'seta' | 'menu' | 'editar' | 'escudo' | 'setaCima'

const desenhos: Record<IconeNome, string[]> = {
  inicio: ['M3 11 12 3l9 8', 'M5 10v11h14V10', 'M9 21v-7h6v7'],
  pacientes: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  agenda: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2', 'm9 16 2 2 4-4'],
  servicos: ['M12 2v20', 'M2 12h20', 'M5 5h14v14H5z'],
  prontuarios: ['M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3', 'M9 2h6v4H9z', 'M8 11h8', 'M8 15h6'],
  financeiro: ['M3 6h18v14H3z', 'M3 10h18', 'M7 16h3'],
  avaliacoes: ['M5 4h14v16H5z', 'M8 9h8', 'M8 13h6', 'm8 17 2 2 4-4'],
  documentos: ['M6 2h9l5 5v15H6z', 'M15 2v5h5', 'M9 13h8', 'M9 17h8'],
  ia: ['m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z', 'M19 17v5', 'M16.5 19.5h5'],
  adicionar: ['M12 5v14', 'M5 12h14'],
  buscar: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16', 'm21 21-4.3-4.3'],
  fechar: ['M18 6 6 18', 'M6 6l12 12'],
  atualizar: ['M20 11a8 8 0 1 0-2.1 5.4', 'M20 4v7h-7'],
  sair: ['M10 17l5-5-5-5', 'M15 12H3', 'M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7'],
  calendario: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2'],
  relogio: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20', 'M12 6v6l4 2'],
  checar: ['M20 6 9 17l-5-5'],
  alerta: ['M12 3 2 21h20L12 3z', 'M12 9v4', 'M12 17h.01'],
  seta: ['M5 12h14', 'm13 6 6 6-6 6'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  editar: ['M12 20h9', 'M16 4a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4z'],
  escudo: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'm9 12 2 2 4-4'],
  setaCima: ['M12 19V5', 'm5 12 7-7 7 7'],
}

export function Icone({ nome, tamanho = 20, ...props }: SVGProps<SVGSVGElement> & {
  nome: IconeNome; tamanho?: number
}) {
  return <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" {...props}>
    {desenhos[nome].map((d, i) => <path key={i} d={d} />)}
  </svg>
}
