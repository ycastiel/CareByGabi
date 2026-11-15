import { useState } from 'react'
import logoGabriela from '../../../recursos/publico/logo-gabriela.webp'

/** Asset versionado e processado pelo Vite; não depende da pasta public. */
export function LogoGabriela({ className = '' }: { className?: string }) {
  const [falhou, setFalhou] = useState(false)
  if (falhou) return <span className={`marca-monograma ${className}`.trim()} role="img" aria-label="Identidade alternativa Gabriela">G</span>
  return <img className={className} src={logoGabriela} alt="Logotipo Gabriela Souza" onError={() => setFalhou(true)} />
}
