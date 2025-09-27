import { useState, useEffect } from 'react';
import { ENDPOINTS } from '../api/apiConfig';

function BidsList({ itemId }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBids = async () => {
    try {
      const response = await fetch(ENDPOINTS.GET_BIDS, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId })
      });
      const data = await response.json();
      setBids(data);
    } catch (error) {
      console.error('Error fetching bids:', error);
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
  }, [itemId]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return `₹${amount.toLocaleString()}`;
  };

  const getHighestBid = () => {
    if (bids.length === 0) return null;
    return Math.max(...bids.map(bid => bid.bidAmount));
  };

  if (loading) return <div className="loading">Loading bids...</div>;

  return (
    <div className="bids-section">
      <h3>Current Bids ({bids.length})</h3>
      {getHighestBid() && (
        <div className="highest-bid">
          Highest Bid: {formatCurrency(getHighestBid())}
        </div>
      )}
      
      {bids.length > 0 ? (
        <div className="bids-list">
          {bids.map((bid, index) => (
            <div key={bid.bidId} className="bid-item">
              <div className="bid-rank">#{index + 1}</div>
              <div className="bid-amount">
                {formatCurrency(bid.bidAmount)}
              </div>
              <div className="bid-details">
                <span className="bidder">
                  {bid.bidderEmail.split('@')[0]}***
                </span>
                <span className="bid-time">
                  {formatTimestamp(bid.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No bids yet. Be the first to bid!</p>
      )}
    </div>
  );
}

export default BidsList;