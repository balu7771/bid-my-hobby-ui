import { useState, useEffect } from 'react';
import { ENDPOINTS } from '../api/apiConfig';
import BidModal from './BidModal';
import ImageModal from './ImageModal';
import ItemActionModal from './ItemActionModal';
import BidAccessModal from './BidAccessModal';
import PublicBidsModal from './PublicBidsModal';
import AuctionManager from './AuctionManager';
import BidManagement from './BidManagement';
import { mockItems, getMockImageUrl } from './MockData';
import './ai-description.css';
import './public-bids.css';

// AI Description component
function AiDescription({ description }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="ai-description">
      <div className="ai-description-title">
        <span className="ai-description-icon">🤖</span>
        AI Description
        <button 
          className="ai-description-toggle" 
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>
      <div className={`ai-description-content ${expanded ? 'expanded' : ''}`}>
        {description}
      </div>
    </div>
  );
}

function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [actionItem, setActionItem] = useState(null);
  const [actionType, setActionType] = useState(null); // 'delete' or 'markSold'
  const [actionSuccess, setActionSuccess] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [bidAccessItem, setBidAccessItem] = useState(null);
  const [publicBidsItem, setPublicBidsItem] = useState(null);
  const [auctionItem, setAuctionItem] = useState(null);
  const [manageBidsItem, setManageBidsItem] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'myItems', 'myBids'
  const [userBids, setUserBids] = useState([]); // Track user's bids

  const fetchItems = async () => {
    try {
      console.log('Fetching items from:', ENDPOINTS.ITEMS);
      const response = await fetch(ENDPOINTS.ITEMS);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Catalog service response:", data);
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching from catalog service:', err);
      setError(`Catalog service error: ${err.message}`);
      setUseMockData(true);
      setItems(mockItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleBidClick = (item) => {
    if (item.status === 'SOLD') return; // Prevent bidding on sold items
    setSelectedItem(item);
  };

  const handleImageClick = (item) => {
    setSelectedImage(item);
  };

  const handleActionClick = (item, type) => {
    setActionItem(item);
    setActionType(type);
  };

  const handleActionComplete = (message) => {
    // Set success message based on action type or use provided message
    setActionSuccess(message || (actionType === 'delete' ? 'Item deleted successfully' : 'Item marked as sold'));
    
    // Refresh the items list after an action
    fetchItems();
    setActionItem(null);
    setActionType(null);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setActionSuccess(null);
    }, 3000);
  };

  const handleBidPlaced = (itemId, bidAmount) => {
    // Refresh bids after placing a new bid
    console.log(`Bid placed on item ${itemId} for ${bidAmount}`);
    // Refresh the items list to show updated bid count
    fetchItems();
  };
  
  // Helper function to mask email
  const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency) => {
    switch(currency) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  // Helper function to get image URL
  const getImageUrl = (item) => {
    if (useMockData) {
      return getMockImageUrl(item.itemId);
    }
    // Use the imageUrl field from catalog service response
    return item.imageUrl;
  };

  // Helper functions
  const getMyItemsCount = () => {
    const userEmail = localStorage.getItem('userEmail');
    return items.filter(item => 
      item.creatorEmail === userEmail && item.status !== 'DELETED'
    ).length;
  };

  const getFilteredItems = () => {
    const userEmail = localStorage.getItem('userEmail');
    let filtered = items.filter(item => item.status !== 'DELETED');
    
    switch(filter) {
      case 'myItems':
        return filtered.filter(item => item.creatorEmail === userEmail);
      case 'myBids':
        // Items where user has placed bids (you'll need to track this)
        return filtered.filter(item => 
          userBids.some(bid => bid.itemId === item.itemId)
        );
      default:
        return filtered;
    }
  };

  const displayItems = getFilteredItems();

  if (loading) return <div className="loading">Loading items...</div>;
  if (error) return <div className="error">Error loading items: {error}</div>;
  if (displayItems.length === 0) return <div className="no-items">No items available</div>;

  return (
    <div className="items-container">
      <div className="items-header">
        <h2>Available Items for Bidding</h2>
        
        {/* Filter Options */}
        <div className="filter-options">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Items
          </button>
          
          {localStorage.getItem('userEmail') && (
            <>
              <button 
                className={`filter-btn ${filter === 'myItems' ? 'active' : ''}`}
                onClick={() => setFilter('myItems')}
              >
                My Items ({getMyItemsCount()})
              </button>
              
              <button 
                className={`filter-btn ${filter === 'myBids' ? 'active' : ''}`}
                onClick={() => setFilter('myBids')}
              >
                Items I Bid On
              </button>
            </>
          )}
        </div>
      </div>

      {actionSuccess && <div className="success-message">{actionSuccess}</div>}
      <div className="items-grid">
        {displayItems.map((item) => (
          <div className={`item-card ${item.status === 'SOLD' ? 'item-sold' : ''}`} key={item.itemId}>
            <div className="thumbnail-container" onClick={() => handleImageClick(item)}>
              <div className="watermarked-image-container">
                <img 
                  src={getImageUrl(item)} 
                  alt={item.name} 
                  className="item-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                <div className="watermark">Bid My Hobby</div>
                {item.creatorEmail && (
                  <div className="email-watermark">
                    {maskEmail(item.creatorEmail)}
                  </div>
                )}
                {item.bids && item.bids.length > 0 && (
                  <div className="bid-badge">{item.bids.length}</div>
                )}
              </div>
              <div className="thumbnail-overlay">
                <span className="view-icon">🔍</span>
              </div>
              {item.status === 'SOLD' && (
                <div className="status-badge sold">SOLD</div>
              )}
              {item.status === 'ACTIVE' && (
                <div className="status-badge active">ACTIVE</div>
              )}
              {item.status === 'SALE_IN_PROGRESS' && (
                <div className="status-badge sale-in-progress">SALE IN PROGRESS</div>
              )}
            </div>
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              {item.aiDescription && (
                <AiDescription description={item.aiDescription} />
              )}
              {item.basePrice && (
                <div className="price-display">
                  <span className="currency-symbol">
                    {getCurrencySymbol(item.currency)}
                  </span>
                  {item.basePrice} {item.currency}
                </div>
              )}
              <div className="item-actions">
                <button 
                  className="bid-button"
                  onClick={() => handleBidClick(item)}
                  disabled={item.status === 'SOLD'}
                >
                  {item.status === 'SOLD' ? 'Sold' : 'Place Bid'}
                </button>
                
                <button 
                  className="view-public-bids-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPublicBidsItem(item);
                  }}
                >
                  View All Bids
                </button>
                
                {/* Show management buttons only for the actual creator */}
                {item.creatorEmail === localStorage.getItem('userEmail') && 
                  item.status === 'ACTIVE' && (
                  <div className="management-buttons">
                    <button 
                      className="manage-bids-button"
                      onClick={() => setManageBidsItem(item)}
                    >
                      Manage Bids
                    </button>
                    <button 
                      className="mark-sold-button"
                      onClick={() => handleActionClick(item, 'markSold')}
                    >
                      Mark as Sold
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleActionClick(item, 'delete')}
                    >
                      Delete Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <BidModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onBidPlaced={handleBidPlaced}
        />
      )}

      {selectedImage && (
        <ImageModal 
          imageUrl={getImageUrl(selectedImage)}
          alt={selectedImage.name}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {actionItem && (
        <ItemActionModal
          item={actionItem}
          actionType={actionType}
          onClose={() => { setActionItem(null); setActionType(null); }}
          onActionComplete={handleActionComplete}
        />
      )}

      {bidAccessItem && (
        <BidAccessModal
          item={bidAccessItem}
          onClose={() => setBidAccessItem(null)}
        />
      )}

      {publicBidsItem && (
        <PublicBidsModal
          item={publicBidsItem}
          onClose={() => setPublicBidsItem(null)}
        />
      )}

      {auctionItem && (
        <AuctionManager
          item={auctionItem}
          onClose={() => setAuctionItem(null)}
          onAuctionCompleted={handleActionComplete}
        />
      )}

      {manageBidsItem && (
        <BidManagement
          item={manageBidsItem}
          onClose={() => setManageBidsItem(null)}
          onWinnerSelected={handleActionComplete}
        />
      )}
    </div>
  );
}

export default ItemList;