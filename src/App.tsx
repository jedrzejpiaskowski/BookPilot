import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Browse from './pages/Browse'
import Catalog from './pages/Catalog'
import Rate from './pages/Rate'

function AppContent() {
  return (
    <div className="app-container">
      <header className="header">
        <h1>BookPilot</h1>
        <p>Your personal book reading companion</p>
      </header>

      <Navigation />

      <main>
        <Routes>
          <Route path="/browse" element={<Browse />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/rate" element={<Rate />} />
          <Route path="/" element={
            <div className="section">
              <div className="card">
                <h2>Welcome</h2>
                <p>
                  BookPilot is your modern companion for tracking and planning your reading journey. 
                  Organize your books, set reading goals, and create a meaningful reading habit.
                </p>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
