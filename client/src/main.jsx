import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'

// Clean up any stale null/undefined tokens from sessionStorage
const token = sessionStorage.getItem('token')
if (!token || token === 'null' || token === 'undefined') {
  sessionStorage.removeItem('token')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
)
