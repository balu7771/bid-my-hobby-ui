import { ENDPOINTS, API_BASE_URL } from '../api/apiConfig';

export const NotificationService = {
  // Send custom email notification
  sendCustomEmail: async (emailData) => {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SEND_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail: emailData.toEmail,
        subject: emailData.subject,
        message: emailData.message
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Email sending failed' }));
      throw new Error(errorData.message || 'Failed to send email');
    }
    
    return response.json();
  },

  // Send welcome email to new users
  sendWelcomeEmail: async (userEmail) => {
    return NotificationService.sendCustomEmail({
      toEmail: userEmail,
      subject: 'Welcome to BidMyHobby! 🎨',
      message: 'Welcome to BidMyHobby! Start bidding on amazing hobby items and share your own creations.'
    });
  },

  // Send bid confirmation email
  sendBidConfirmation: async (bidderEmail, itemName, bidAmount) => {
    return NotificationService.sendCustomEmail({
      toEmail: bidderEmail,
      subject: `Bid Placed Successfully - ${itemName}`,
      message: `Your bid of ₹${bidAmount} has been placed successfully on "${itemName}". You'll be notified if you win!`
    });
  }
};