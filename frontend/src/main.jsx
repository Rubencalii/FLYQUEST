import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FlyQuestDashboard from './components/FlyQuestDashboard'

function Main() {
  return <FlyQuestDashboard />
}

createRoot(document.getElementById('root')).render(<Main />)
