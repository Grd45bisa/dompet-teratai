import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { purgeClientCaches } from './utils/cacheControl.ts'

void purgeClientCaches()

createRoot(document.getElementById('root')!).render(
    <App />,
)
