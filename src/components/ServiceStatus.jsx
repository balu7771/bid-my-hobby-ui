import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/apiConfig';

function ServiceStatus() {
  const [services, setServices] = useState({
    apiGateway: 'checking',
    catalogService: 'checking',
    auctionService: 'checking'
  });

  useEffect(() => {
    checkServices();
  }, []);

  const checkServices = async () => {
    // Check API Gateway
    try {
      const response = await fetch(`${API_BASE_URL}/actuator/health`);
      setServices(prev => ({
        ...prev,
        apiGateway: response.ok ? 'online' : 'offline'
      }));
    } catch (error) {
      setServices(prev => ({ ...prev, apiGateway: 'offline' }));
    }

    // Check Catalog Service through Gateway
    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog/items`);
      setServices(prev => ({
        ...prev,
        catalogService: response.ok ? 'online' : 'offline'
      }));
    } catch (error) {
      setServices(prev => ({ ...prev, catalogService: 'offline' }));
    }

    // Check Auction Service through Gateway
    try {
      const response = await fetch(`${API_BASE_URL}/api/auction/test`);
      setServices(prev => ({
        ...prev,
        auctionService: response.ok ? 'online' : 'offline'
      }));
    } catch (error) {
      setServices(prev => ({ ...prev, auctionService: 'offline' }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <div className="service-status">
      <h3>🏗️ Microservices Status</h3>
      <div className="status-grid">
        <div className="status-item">
          {getStatusIcon(services.apiGateway)} API Gateway (8080)
        </div>
        <div className="status-item">
          {getStatusIcon(services.catalogService)} Catalog Service (8081)
        </div>
        <div className="status-item">
          {getStatusIcon(services.auctionService)} Auction Service (8082)
        </div>
      </div>
      <button onClick={checkServices} className="refresh-button">
        🔄 Refresh Status
      </button>
    </div>
  );
}

export default ServiceStatus;