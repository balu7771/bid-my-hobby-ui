import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ItemList from './components/ItemList';
import ItemUpload from './components/ItemUpload';
import UserEmailSetter from './components/UserEmailSetter';
import BidVerificationPage from './components/BidVerificationPage';
import ChatWithHobbyAI from './components/ChatWithHobbyAI';
import AboutPage from './components/AboutPage';
import VisitorCounter from './components/VisitorCounter';
import ServiceStatus from './components/ServiceStatus';
import CreatorDashboard from './components/CreatorDashboard';
import './App.css';
import './components/VerificationSuccess.css';
import './components/BidAccessModal.css';
import './components/chat.css';
import './components/about.css';
import './components/visitor-counter.css';
import './components/payment.css';
import './components/upload-improvements.css';
import './components/toast.css';

function App() {
  const [activeTab, setActiveTab] = useState('browse');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  
  // Check if user is admin
  const isAdmin = userEmail === 'bidmyhobby@gmail.com';
  
  // Listen for email changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUserEmail(localStorage.getItem('userEmail') || '');
    };
    
    // Listen for custom events when email is set
    const handleEmailSet = () => {
      setUserEmail(localStorage.getItem('userEmail') || '');
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('emailSet', handleEmailSet);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('emailSet', handleEmailSet);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="logo-container">
            <h1>Bid My Hobby</h1>
            <span className="tagline">Microservices Architecture</span>
            <small className="architecture-info">
              🏗️ API Gateway → Catalog Service → Auction Service
            </small>
          </div>
          <UserEmailSetter />
        </header>
        
        <Routes>
          <Route path="/verify-bids" element={<BidVerificationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/" element={
            <>
              <nav className="app-nav">
                <ul>
                  <li>
                    <button 
                      className={activeTab === 'browse' ? 'active' : ''} 
                      onClick={() => setActiveTab('browse')}
                    >
                      Browse Items
                    </button>
                  </li>
                  <li>
                    <button 
                      className={activeTab === 'upload' ? 'active' : ''} 
                      onClick={() => setActiveTab('upload')}
                    >
                      Share Your Creation
                    </button>
                  </li>
                  {isAdmin && (
                    <li>
                      <button 
                        className={activeTab === 'chat' ? 'active' : ''} 
                        onClick={() => setActiveTab('chat')}
                      >
                        Chat With AI
                      </button>
                    </li>
                  )}
                  {isAdmin && (
                    <li>
                      <button 
                        className={activeTab === 'services' ? 'active' : ''} 
                        onClick={() => setActiveTab('services')}
                      >
                        Services Status
                      </button>
                    </li>
                  )}
                  <li>
                    <button 
                      className={activeTab === 'creator' ? 'active' : ''} 
                      onClick={() => setActiveTab('creator')}
                    >
                      Creator Dashboard
                    </button>
                  </li>
                </ul>
              </nav>
              
              <main className="app-main">
                {activeTab === 'browse' && <ItemList />}
                {activeTab === 'upload' && <ItemUpload />}
                {activeTab === 'chat' && isAdmin && <ChatWithHobbyAI />}
                {activeTab === 'services' && isAdmin && <ServiceStatus />}
                {activeTab === 'creator' && <CreatorDashboard />}
              </main>
            </>
          } />
        </Routes>
        
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} Bid My Hobby - Microservices Demo</p>
          <Link to="/about" className="about-link">About Us</Link>
        </footer>
        
        <VisitorCounter />
      </div>
    </Router>
  );
}

export default App;