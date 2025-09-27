import { useState, useEffect } from 'react';
import { ENDPOINTS } from '../api/apiConfig';
import WhatsAppAuctionComplete from './WhatsAppAuctionComplete';

function BidManagement({ item, onClose, onWinnerSelected }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBid, setSelectedBid] = useState(null);
  const [processingWinner, setProcessingWinner] = useState(false);
  const [showWhatsAppComplete, setShowWhatsAppComplete] = useState(false);

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
      setBids(data.sort((a, b) => b.bidAmount - a.bidAmount)); // Sort by highest bid first
    } catch (err) {
      setError('Failed to load bids: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWinner = () => {
    if (!selectedBid) {
      setError('Please select a bid first');
      return;
    }
    setShowWhatsAppComplete(true);
  };

  const handleAuctionCompleted = (message) => {
    setShowWhatsAppComplete(false);
    onWinnerSelected(message);
    onClose();
  };

  if (loading) return <div className="loading">Loading bids...</div>;

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-content bid-management-modal">
        <div className="modal-header">
          <h3>Manage Bids - {item.name}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          {bids.length === 0 ? (
            <p>No bids found for this item.</p>
          ) : (
            <>
              <div className="bid-selection-info">
                <p>Select one bid as the winner. An email will be sent to notify the winner.</p>
              </div>
              
              <div className="bids-list">
                {bids.map((bid, index) => (
                  <div 
                    key={index} 
                    className={`bid-item ${selectedBid === bid ? 'selected' : ''}`}
                    onClick={() => setSelectedBid(bid)}
                  >
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
            </>
          )}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={processingWinner}>
              Cancel
            </button>
            {bids.length > 0 && (
              <button 
                type="button" 
                onClick={handleSelectWinner} 
                disabled={!selectedBid}
                className="select-winner-button"
              >
                Select as Winner
              </button>
            )}
          </div>
        </div>
      </div>
      
      </div>
      
      {showWhatsAppComplete && (
        <WhatsAppAuctionComplete
          item={item}
          selectedBid={selectedBid}
          onClose={() => setShowWhatsAppComplete(false)}
          onCompleted={handleAuctionCompleted}
        />
      )}
    </>
  );
}

export default BidManagement;