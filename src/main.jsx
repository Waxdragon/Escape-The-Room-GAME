import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

function showFatalError(error) {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = `<div style="min-height:100vh;display:grid;place-items:center;padding:32px;background:#101918;color:#f0e8d7;font:14px monospace"><div><h1 style="font:600 28px serif;margin:0 0 12px">The room could not load</h1><p style="color:#d27a63;max-width:650px;line-height:1.6">${String(error?.message || error).replace(/[<>&]/g, '')}</p><p style="color:#8fa39b">Refresh the page to try again.</p></div></div>`
}

window.addEventListener('error', (event) => showFatalError(event.error || event.message))
window.addEventListener('unhandledrejection', (event) => showFatalError(event.reason))

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  showFatalError(error)
}
