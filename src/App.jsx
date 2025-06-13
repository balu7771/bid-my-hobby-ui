import { useState } from 'react'
import './App.css'
import ItemUpload from './components/ItemUpload'
import ItemList from './components/ItemList'
import UserEmailSetter from './components/UserEmailSetter'

function App() {
  const [view, setView] = useState('browse') // 'browse' or 'upload'

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Bid My Hobby</h1>
        <div className="app-nav">
          <button 
            className={`nav-button ${view === 'browse' ? 'active' : ''}`}
            onClick={() => setView('browse')}
          >
            Browse Items
          </button>
          <button 
            className={`nav-button ${view === 'upload' ? 'active' : ''}`}
            onClick={() => setView('upload')}
          >
            Share Creation
          </button>
        </div>
      </header>

      <UserEmailSetter />

      <main>
        {view === 'upload' ? <ItemUpload /> : <ItemList />}
      </main>
      
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Bid My Hobby - Share your passion with the world</p>
      </footer>
    </div>
  )
}

export default App
