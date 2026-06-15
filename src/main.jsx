import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DMS from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DMS />
  </StrictMode>,
)
