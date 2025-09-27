import { ENDPOINTS, API_BASE_URL } from '../api/apiConfig';

// RazorPay integration service
export const PaymentService = {
  // Create payment order for item
  createPaymentOrder: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE_PAYMENT_ORDER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: orderData.itemId,
        itemName: orderData.itemName,
        buyerEmail: orderData.buyerEmail,
        sellerEmail: orderData.sellerEmail,
        amount: orderData.amount // Keep in INR, backend will handle paise conversion
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Payment order creation failed' }));
      throw new Error(errorData.message || 'Failed to create payment order');
    }
    
    return response.json();
  },

  // Complete payment after RazorPay success
  completePayment: async (orderId, paymentId) => {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.COMPLETE_PAYMENT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        paymentId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Payment completion failed' }));
      throw new Error(errorData.message || 'Failed to complete payment');
    }
    
    return response.json();
  },

  // Initialize RazorPay payment
  initiateRazorPayPayment: (orderData, onSuccess, onError) => {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.razorpayOrderId,
      name: 'BidMyHobby',
      description: `Payment for ${orderData.itemName}`,
      handler: function(response) {
        onSuccess(response);
      },
      prefill: {
        email: orderData.buyerEmail
      },
      theme: {
        color: '#FF6B35'
      },
      modal: {
        ondismiss: function() {
          onError(new Error('Payment cancelled by user'));
        }
      }
    };
    
    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      onError(new Error('RazorPay SDK not loaded'));
    }
  }
};

// Creator earnings service
export const CreatorService = {
  // Get creator earnings
  getEarnings: async (creatorEmail) => {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.GET_CREATOR_EARNINGS(creatorEmail)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch earnings');
    }
    
    return response.json();
  },

  // Request withdrawal
  requestWithdrawal: async (withdrawalData) => {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REQUEST_WITHDRAWAL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withdrawalData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to request withdrawal');
    }
    
    return response.json();
  }
};

// Auction service
export const AuctionService = {
  // Complete auction (admin function)
  completeAuction: async (itemId, itemName, sellerEmail) => {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.COMPLETE_AUCTION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId,
        itemName,
        sellerEmail
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to complete auction');
    }
    
    return response.json();
  }
};