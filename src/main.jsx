import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

let fatalOverlay

function showFatalError(error) {
  if (!document.body) return
  if (!fatalOverlay) {
    fatalOverlay = document.createElement('div')
    fatalOverlay.setAttribute('role', 'alert')
    document.body.appendChild(fatalOverlay)
  }
  const message = String(error?.message || error).replace(/[<>&]/g, '')
  fatalOverlay.innerHTML = `<div style="position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:32px;background:#101918;color:#f0e8d7;font:14px monospace"><div><h1 style="font:600 28px serif;margin:0 0 12px">The room could not load</h1><p style="color:#d27a63;max-width:650px;line-height:1.6">${message}</p><p style="color:#8fa39b">Refresh the page to try again.</p></div></div>`
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
