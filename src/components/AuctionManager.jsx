import { useState } from 'react';
import { AuctionService } from '../services/paymentService';
import PaymentModal from './PaymentModal';

function AuctionManager({ item, onClose, onAuctionCompleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [winnerDetails, setWinnerDetails] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleCompleteAuction = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuctionService.completeAuction(
        item.itemId,
        item.name,
        item.creatorEmail
      );
      
      // Extract winner details from result
      const winnerInfo = {
        bidderEmail: result.winner,
        bidAmount: result.winningBid,
        paymentOrder: result.paymentOrder
      };
      
      setWinnerDetails(winnerInfo);
      setShowPayment(true);
    } catch (err) {
      setError('Failed to complete auction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    onAuctionCompleted('Auction completed and payment processed successfully!');
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Complete Auction - {item.name}</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}
            
            <div className="auction-details">
              <p>This will determine the winner and initiate payment process.</p>
              <div className="item-info">
                <strong>Item:</strong> {item.name}<br/>
                <strong>Creator:</strong> {item.creatorEmail}
              </div>
            </div>
            
            <div className="modal-actions">
              <button type="button" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleCompleteAuction} 
                disabled={loading}
                className="complete-auction-button"
              >
                {loading ? 'Processing...' : 'Complete Auction'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPayment && winnerDetails && (
        <PaymentModal
          item={item}
          winnerDetails={winnerDetails}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}

export default AuctionManager;