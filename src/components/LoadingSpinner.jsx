function LoadingSpinner({ message = 'Loading...', size = 'medium' }) {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
      <span className="loading-message">{message}</span>
    </div>
  );
}

export default LoadingSpinner;