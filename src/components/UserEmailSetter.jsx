import { useState, useEffect } from 'react';

function UserEmailSetter() {
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || '');
  const [showBanner, setShowBanner] = useState(!localStorage.getItem('userEmail'));
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      localStorage.setItem('userEmail', email);
      setShowBanner(false);
      setShowSettings(false);
      // Dispatch custom event to notify App component
      window.dispatchEvent(new Event('emailSet'));
    }
  };

  const currentEmail = localStorage.getItem('userEmail');

  return (
    <>
      {/* Always show email indicator */}
      <div className="email-indicator">
        <span className="email-display">
          📧 {currentEmail || 'No email set'}
        </span>
        <button 
          className="change-email-button"
          onClick={() => setShowSettings(!showSettings)}
        >
          {currentEmail ? 'Change' : 'Set Email'}
        </button>
      </div>

      {/* Show banner for first-time users */}
      {showBanner && (
        <div className="email-setter-banner">
          <div className="banner-content">
            <h3>🎯 Welcome to BidMyHobby!</h3>
            <p>Set your email to upload items, complete auctions, and manage your listings:</p>
            <form onSubmit={handleSubmit} className="email-setter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
              <button type="submit">Get Started</button>
            </form>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className="email-settings-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Email Address</h3>
              <button 
                className="close-button" 
                onClick={() => setShowSettings(false)}
              >×</button>
            </div>
            <form onSubmit={handleSubmit} className="email-form">
              <label>
                Your email address:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </label>
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </button>
                <button type="submit">Save Email</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default UserEmailSetter;