function RevenueShareDisplay({ winningBid, showDetails = false }) {
  const creatorEarnings = Math.round(winningBid * 0.85);
  const platformFee = Math.round(winningBid * 0.15);

  if (!showDetails) {
    return (
      <div className="revenue-share-simple">
        <span className="creator-earnings">You'll earn: ₹{creatorEarnings}</span>
        <span className="share-percentage">(85% of winning bid)</span>
      </div>
    );
  }

  return (
    <div className="revenue-share-detailed">
      <h4>Revenue Breakdown</h4>
      <div className="revenue-item">
        <span>Winning Bid:</span>
        <span>₹{winningBid}</span>
      </div>
      <div className="revenue-item creator">
        <span>Your Earnings (85%):</span>
        <span>₹{creatorEarnings}</span>
      </div>
      <div className="revenue-item platform">
        <span>Platform Fee (15%):</span>
        <span>₹{platformFee}</span>
      </div>
    </div>
  );
}

export default RevenueShareDisplay;