import { useState } from 'react';
import { ENDPOINTS, API_BASE_URL } from '../api/apiConfig';
import { NotificationService } from '../services/notificationService';

function BidModal({ item, onClose, onBidPlaced }) {
  const [bidAmount, setBidAmount] = useState('');
  const [bidderEmail, setBidderEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    switch(currencyCode) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  const currencySymbol = getCurrencySymbol(item.currency || 'USD');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bidAmount || isNaN(parseFloat(bidAmount)) || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    if (!bidderEmail) {
      setError('Please enter your email address');
      return;
    }

    // Validate bid amount is greater than base price
    if (item.basePrice && parseFloat(bidAmount) <= parseFloat(item.basePrice)) {
      setError(`Bid amount must be greater than the base price (${currencySymbol}${item.basePrice})`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PLACE_BID}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId: item.itemId,
          bidderEmail: bidderEmail,
          bidAmount: parseFloat(bidAmount)
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to place bid');
      }

      const result = await response.json();
      console.log('Bid placed:', result);
      
      // Send bid confirmation email (optional - don't block on failure)
      try {
        await NotificationService.sendBidConfirmation(
          bidderEmail, 
          item.name, 
          parseFloat(bidAmount)
        );
      } catch (emailError) {
        console.warn('Failed to send confirmation email:', emailError);
      }
      
      onBidPlaced(item.itemId, parseFloat(bidAmount));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Place a Bid on {item.name}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="bidAmount">
                Your Bid Amount ({item.currency || 'USD'}):
              </label>
              <div className="bid-input-container">
                <span className="currency-prefix">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={item.basePrice ? (parseFloat(item.basePrice) + 0.01).toString() : "0.01"}
                  step="0.01"
                  required
                  className="bid-amount-input"
                />
              </div>
              {item.basePrice && (
                <div className="base-price-note">
                  Base price: {currencySymbol}{item.basePrice} {item.currency}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bidderEmail">Your Email:</label>
              <input
                type="email"
                id="bidderEmail"
                value={bidderEmail}
                onChange={(e) => setBidderEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
              <small className="form-note">
                Required for bid confirmation and notifications
              </small>
            </div>
            
            <div className="modal-actions">
              <button type="button" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" disabled={loading}>
                {loading ? 'Placing Bid...' : 'Place Bid'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BidModal;