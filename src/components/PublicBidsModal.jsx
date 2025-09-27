import { useState, useEffect } from 'react';
import { ENDPOINTS } from '../api/apiConfig';

function PublicBidsModal({ item, onClose }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBids = async () => {
    try {
      const response = await fetch(ENDPOINTS.GET_BIDS, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId: item.itemId })
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch bids: ${response.status}`);
      }
      const data = await response.json();
      setBids(data);
    } catch (err) {
      setError(err.message);
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
    
    // Real-time updates every 5 seconds
    const interval = setInterval(fetchBids, 5000);
    return () => clearInterval(interval);
  }, [item.itemId]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return `₹${amount.toLocaleString()}`;
  };

  const isCreator = () => {
    return item.creatorEmail === localStorage.getItem('userEmail');
  };

  const maskEmail = (email) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '*'.repeat(Math.max(username.length - 2, 1)) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  const handleSelectWinner = (bid) => {
    if (isCreator()) {
      // Creator can select any bidder as winner
      const confirmed = window.confirm(
        `Select ${bid.bidderEmail} as the winner with bid ₹${bid.bidAmount}?`
      );
      if (confirmed) {
        // Trigger auction completion with selected winner
        onSelectWinner(bid);
      }
    }
  };

  const getHighestBid = () => {
    if (bids.length === 0) return null;
    return Math.max(...bids.map(bid => bid.bidAmount));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content public-bids-modal">
        <div className="modal-header">
          <h3>Bids for {item.name}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading">Loading bids...</div>
          ) : (
            <div className="bids-section">
              <div className="bids-summary">
                <span>Total Bids: {bids.length}</span>
                {getHighestBid() && (
                  <span className="highest-bid">
                    Highest: {formatCurrency(getHighestBid())}
                  </span>
                )}
              </div>
              
              {bids.length > 0 ? (
                <div className="bids-list">
                  {bids.map((bid, index) => (
                    <div key={bid.bidId} className={`bid-item ${index === 0 ? 'highest-bid-item' : ''}`}>
                      <div className="bid-rank">#{index + 1}</div>
                      <div className="bid-amount">
                        {formatCurrency(bid.bidAmount)}
                        {index === 0 && <span className="highest-badge">🏆</span>}
                      </div>
                      <div className="bid-details">
                        <span className="bidder">
                          {isCreator() ? bid.bidderEmail : maskEmail(bid.bidderEmail)}
                        </span>
                        <span className="bid-time">
                          {formatTimestamp(bid.timestamp)}
                        </span>
                      </div>
                      {isCreator() && (
                        <button 
                          className="select-winner-btn"
                          onClick={() => handleSelectWinner(bid)}
                        >
                          Select as Winner
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-bids">No bids yet. Be the first to bid!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicBidsModal;