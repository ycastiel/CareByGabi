import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '../../../frontend/css/index.css'
import '../../../frontend/css/paginas/App.css'
import '../../../frontend/css/componentes/temas/frutiger-aero.css'

const raiz = document.getElementById('root')
if (!raiz) throw new Error('O elemento #root não foi encontrado no index.html.')
createRoot(raiz).render(<StrictMode><App /></StrictMode>)
