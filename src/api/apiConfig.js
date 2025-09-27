// API configuration for microservices architecture
// Routes through API Gateway to individual services

// Base URL for API requests - API Gateway endpoint
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-gateway-url.com'  // Replace with actual production URL
  : '';  // Use Vite proxy in development

// Common headers for API requests
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Microservices API endpoints through API Gateway
const ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  VALIDATE_TOKEN: '/api/auth/validate',
  
  // User Management Service
  CREATE_USER: '/api/users',
  GET_USER_BY_EMAIL: (email) => `/api/users/by-email?email=${email}`,
  GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
  
  // Catalog Service
  ITEMS: '/api/catalog/items',
  UPLOAD_ITEM: '/api/catalog/items',
  GET_ITEM: (itemId) => `/api/catalog/item/${itemId}`,
  DELETE_ITEM: (itemId) => `/api/catalog/items/${itemId}`,
  MARK_AS_SOLD: (itemId) => `/api/catalog/items/${itemId}/sold`,
  
  // Auction Service
  PLACE_BID: '/api/auction/bids',
  GET_BIDS: '/api/auction/bids/get',
  COMPLETE_AUCTION: '/api/auction/bids/complete',
  
  // Payment Service
  CREATE_PAYMENT_ORDER: '/api/payments/create-order-for-item',
  COMPLETE_PAYMENT: '/api/payments/complete-payment',
  GET_CREATOR_EARNINGS: (email) => `/api/payments/creator/earnings/${encodeURIComponent(email)}`,
  REQUEST_WITHDRAWAL: '/api/payments/creator/withdraw',
  
  // Notifications
  SEND_EMAIL: '/api/notifications/custom-email',
  REQUEST_BID_ACCESS: (itemId) => `/api/notifications/request-bid-access/${itemId}`,
  
  // Health checks
  HEALTH: '/actuator/health',
};

// Helper function for authenticated requests
const authenticatedFetch = (url, options = {}) => {
  const token = localStorage.getItem('jwt_token');
  
  const headers = {
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  
  // Only set Content-Type for JSON, not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  return fetch(url, {
    ...options,
    headers
  });
};

// Handle authentication errors
const handleAuthError = (response) => {
  if (response.status === 401) {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email');
    window.location.href = '/login';
  }
  return response;
};

export { API_BASE_URL, DEFAULT_HEADERS, ENDPOINTS, authenticatedFetch, handleAuthError };