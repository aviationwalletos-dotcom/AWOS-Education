import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'
import { MODULE } from './module'

import './index.css'

document.title = MODULE.title

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
