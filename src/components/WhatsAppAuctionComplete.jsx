import { useState } from 'react';
import { ENDPOINTS } from '../api/apiConfig';

function WhatsAppAuctionComplete({ item, selectedBid, onClose, onCompleted }) {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleComplete = async () => {
    if (!whatsappNumber) {
      setError('Please enter your WhatsApp number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send email to winner with WhatsApp contact
      const emailResponse = await fetch(ENDPOINTS.SEND_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: selectedBid.bidderEmail,
          subject: `🎉 You won! Contact seller for ${item.name}`,
          message: `Congratulations! You won the auction for "${item.name}"!

Your winning bid: ₹${selectedBid.bidAmount}

NEXT STEPS:
1. Contact the seller on WhatsApp: ${whatsappNumber}
2. Arrange payment and delivery directly
3. Complete the transaction

Seller Details:
- Email: ${item.creatorEmail}
- WhatsApp: ${whatsappNumber}

Item: ${item.name}
Description: ${item.description}

Please contact the seller within 24 hours to arrange payment and delivery.

Thank you for using BidMyHobby!`
        })
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send notification email');
      }

      // Send email to seller with winner details
      await fetch(ENDPOINTS.SEND_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: item.creatorEmail,
          subject: `🎯 Auction completed for ${item.name}`,
          message: `Your auction for "${item.name}" has been completed!

Winner Details:
- Email: ${selectedBid.bidderEmail}
- Winning Bid: ₹${selectedBid.bidAmount}
- Your WhatsApp: ${whatsappNumber}

The winner has been notified and will contact you on WhatsApp to arrange payment and delivery.

Please respond promptly to complete the transaction.

Thank you for using BidMyHobby!`
        })
      });

      // Update item status to SALE_IN_PROGRESS
      const filename = item.itemId.split('/').pop();
      const email = localStorage.getItem('userEmail');
      await fetch(`/api/catalog/items/${filename}/sale-in-progress?email=${email}`, {
        method: 'POST'
      });

      onCompleted(`Auction completed! Winner notified to contact you on WhatsApp: ${whatsappNumber}`);
      onClose();
    } catch (err) {
      setError('Failed to complete auction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Complete Auction - {item.name}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <div className="auction-completion-info">
            <div className="winner-details">
              <h4>🏆 Auction Winner</h4>
              <p><strong>Email:</strong> {selectedBid.bidderEmail}</p>
              <p><strong>Winning Bid:</strong> ₹{selectedBid.bidAmount}</p>
            </div>
            
            <div className="whatsapp-section">
              <h4>📱 Your WhatsApp Contact</h4>
              <p>Enter your WhatsApp number so the winner can contact you for payment and delivery:</p>
              
              <div className="form-group">
                <label htmlFor="whatsappNumber">WhatsApp Number:</label>
                <input
                  type="tel"
                  id="whatsappNumber"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 9876543210"
                  required
                />
                <small className="form-note">
                  Include country code (e.g., +91 for India)
                </small>
              </div>
            </div>
            
            <div className="process-info">
              <h4>What happens next:</h4>
              <ul>
                <li>Winner gets email with your WhatsApp number</li>
                <li>You get email with winner's details</li>
                <li>Winner contacts you on WhatsApp</li>
                <li>You arrange payment and delivery directly</li>
              </ul>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleComplete} 
              disabled={loading || !whatsappNumber}
              className="complete-button"
            >
              {loading ? 'Completing...' : 'Complete Auction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppAuctionComplete;