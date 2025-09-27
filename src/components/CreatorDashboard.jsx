import { useState, useEffect } from 'react';
import { CreatorService } from '../services/paymentService';
import RevenueShareDisplay from './RevenueShareDisplay';

function CreatorDashboard() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(null);

  const creatorEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (creatorEmail) {
      fetchEarnings();
    }
  }, [creatorEmail]);

  const fetchEarnings = async () => {
    try {
      const data = await CreatorService.getEarnings(creatorEmail);
      setEarnings(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch earnings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }

    if (!paymentMethod) {
      setError('Please enter your UPI ID or bank account details');
      return;
    }

    if (parseFloat(withdrawalAmount) > earnings.availableAmount) {
      setError('Withdrawal amount exceeds available balance');
      return;
    }

    setWithdrawalLoading(true);
    setError(null);

    try {
      await CreatorService.requestWithdrawal({
        creatorEmail,
        amount: parseFloat(withdrawalAmount),
        paymentMethod
      });
      
      setWithdrawalSuccess('Withdrawal request submitted successfully!');
      setWithdrawalAmount('');
      setPaymentMethod('');
      
      // Refresh earnings
      await fetchEarnings();
      
      setTimeout(() => setWithdrawalSuccess(null), 5000);
    } catch (err) {
      setError('Withdrawal failed: ' + err.message);
    } finally {
      setWithdrawalLoading(false);
    }
  };

  if (!creatorEmail) {
    return (
      <div className="creator-dashboard">
        <p>Please set your email to view creator dashboard.</p>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading earnings...</div>;

  return (
    <div className="creator-dashboard">
      <h2>Creator Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}
      {withdrawalSuccess && <div className="success-message">{withdrawalSuccess}</div>}

      {earnings && (
        <>
          <div className="earnings-overview">
            <h3>Earnings Overview</h3>
            <div className="revenue-info">
              <p><strong>Revenue Share:</strong> You earn 85% of every winning bid!</p>
            </div>
            <div className="earnings-grid">
              <div className="earnings-card">
                <h4>Total Earnings</h4>
                <div className="amount">₹{earnings.totalEarnings}</div>
              </div>
              <div className="earnings-card">
                <h4>Pending Amount</h4>
                <div className="amount">₹{earnings.pendingAmount}</div>
              </div>
              <div className="earnings-card">
                <h4>Available for Withdrawal</h4>
                <div className="amount">₹{earnings.availableAmount}</div>
              </div>
            </div>
          </div>

          {earnings.availableAmount > 0 && (
            <div className="withdrawal-section">
              <h3>Request Withdrawal</h3>
              <form onSubmit={handleWithdrawal}>
                <div className="form-group">
                  <label htmlFor="withdrawalAmount">Amount (₹):</label>
                  <input
                    type="number"
                    id="withdrawalAmount"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    max={earnings.availableAmount}
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="paymentMethod">UPI ID / Bank Account:</label>
                  <input
                    type="text"
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="your-upi@paytm or bank account details"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={withdrawalLoading}
                  className="withdrawal-button"
                >
                  {withdrawalLoading ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </form>
            </div>
          )}

          {earnings.earnings && earnings.earnings.length > 0 && (
            <div className="earnings-history">
              <h3>Transaction History</h3>
              <div className="earnings-list">
                {earnings.earnings.map((earning, index) => (
                  <div key={index} className="earning-item">
                    <div className="earning-details">
                      <strong>{earning.itemName}</strong>
                      <span className="earning-date">{new Date(earning.date).toLocaleDateString()}</span>
                    </div>
                    <div className="earning-amount">₹{earning.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CreatorDashboard;