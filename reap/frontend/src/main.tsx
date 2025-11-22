import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { ProgressProvider } from './context/ProgressContext.jsx'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container not found')
}

createRoot(container).render(
  <StrictMode>
    <LanguageProvider>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </LanguageProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker.register(swUrl).catch((error) => {
      console.error('Service worker registration failed', error)
    })
  })
}
