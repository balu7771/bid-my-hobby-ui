import { useState, useEffect } from 'react';
import { ENDPOINTS } from '../api/apiConfig';

function BidAccessModal({ item, onClose }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBids();
  }, [item.itemId]);

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
        throw new Error('Failed to fetch bids');
      }
      const data = await response.json();
      setBids(data.sort((a, b) => b.bidAmount - a.bidAmount));
    } catch (err) {
      setError('Failed to load bids: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>View Bids for {item.name}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading">Loading bids...</div>
          ) : bids.length === 0 ? (
            <p>No bids found for this item.</p>
          ) : (
            <div className="bids-list">
              {bids.map((bid, index) => (
                <div key={index} className="bid-item">
                  <div className="bid-details">
                    <div className="bid-amount">₹{bid.bidAmount}</div>
                    <div className="bid-email">{bid.bidderEmail}</div>
                    <div className="bid-time">
                      {new Date(bid.bidTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="bid-rank">#{index + 1}</div>
                </div>
              ))}
            </div>
          )}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BidAccessModal;