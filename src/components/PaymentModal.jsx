import { useState } from 'react';
import { PaymentService } from '../services/paymentService';

function PaymentModal({ item, winnerDetails, onClose, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create payment order
      const orderData = {
        itemId: item.itemId,
        itemName: item.name,
        buyerEmail: winnerDetails.bidderEmail,
        sellerEmail: item.creatorEmail,
        amount: winnerDetails.bidAmount
      };

      console.log('Creating payment order:', orderData);
      const paymentOrder = await PaymentService.createPaymentOrder(orderData);
      console.log('Payment order created:', paymentOrder);

      // Check if RazorPay is loaded
      if (!window.Razorpay) {
        throw new Error('RazorPay SDK not loaded. Please refresh the page.');
      }

      // Initialize RazorPay payment with proper error handling
      const options = {
        key: paymentOrder.keyId || 'rzp_test_key', // Use test key if not provided
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || 'INR',
        order_id: paymentOrder.razorpayOrderId,
        name: 'BidMyHobby',
        description: `Payment for ${item.name}`,
        prefill: {
          email: winnerDetails.bidderEmail
        },
        theme: {
          color: '#FF6B35'
        },
        handler: async function(response) {
          try {
            console.log('Payment successful:', response);
            await PaymentService.completePayment(
              paymentOrder.orderId,
              response.razorpay_payment_id
            );
            onPaymentSuccess();
          } catch (err) {
            console.error('Payment completion error:', err);
            setError('Payment verification failed: ' + err.message);
          }
        },
        modal: {
          ondismiss: function() {
            setError('Payment cancelled by user');
            setLoading(false);
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError('Failed to initiate payment: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Complete Payment</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <div className="payment-details">
            <h4>Payment Summary</h4>
            <div className="payment-item">
              <strong>Item:</strong> {item.name}
            </div>
            <div className="payment-item">
              <strong>Winner:</strong> {winnerDetails.bidderEmail}
            </div>
            <div className="payment-item">
              <strong>Winning Bid:</strong> ₹{winnerDetails.bidAmount}
            </div>
            <div className="payment-item">
              <strong>Seller:</strong> {item.creatorEmail}
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handlePayment} 
              disabled={loading}
              className="payment-button"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;