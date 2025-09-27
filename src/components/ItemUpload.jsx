import { useState } from 'react';
import { ENDPOINTS, API_BASE_URL } from '../api/apiConfig';

function ItemUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [currency, setCurrency] = useState('INR'); // Default to INR for microservices
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    
    // Create preview for the selected image
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !title || !description || !email || !basePrice) {
      setMessage('Please fill all fields and select an image');
      return;
    }

    setLoading(true);
    setMessage('');
    
    // Inform user about processing
    setMessage('Uploading to catalog service...');

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', title);
    formData.append('description', description);
    formData.append('email', email);
    formData.append('basePrice', basePrice);
    formData.append('currency', currency);

    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.UPLOAD_ITEM}`, {
        method: 'POST',
        // Don't set Content-Type header - browser sets it automatically for FormData
        body: formData,
      });

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        data = { message: text };
      }
      
      if (response.ok) {
        setMessage('Item uploaded successfully to catalog service!');
        setTitle('');
        setDescription('');
        setEmail('');
        setBasePrice('');
        setCurrency('INR');
        setFile(null);
        setPreview(null);
      } else {
        setMessage(`Error: ${data.message || response.statusText || 'Failed to upload item to catalog service'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`Network error: ${error.message}. Check if catalog service is running on port 8080.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Share Your Hobby Creation</h2>
      <p className="service-info">📦 Uploading via Catalog Service (Microservices Architecture)</p>
      {message && <div className={message.includes('Error') ? 'error-message' : 'success-message'}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name your creation"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about your hobby item"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email for notifications"
            required
          />
          <small className="form-note">Note: Your email will be partially masked in the watermark</small>
        </div>
        
        <div className="form-group price-currency-group">
          <div className="price-field">
            <label htmlFor="basePrice">Base Price:</label>
            <input
              type="number"
              id="basePrice"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="Starting price"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          
          <div className="currency-field">
            <label htmlFor="currency">Currency:</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image:</label>
          <div 
            className={`file-input-container ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
              capture="environment"
              required
            />
            <div className="drag-drop-area">
              <div className="upload-buttons">
                <label htmlFor="image" className="file-input-label">
                  Choose File
                </label>
                <div className="camera-button-container">
                  <label htmlFor="camera" className="camera-input-label">
                    Take Photo
                  </label>
                  <small className="mobile-only-note">Works on mobile devices</small>
                  <input
                    type="file"
                    id="camera"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                    capture="user"
                  />
                </div>
              </div>
              <div className="drag-drop-text">
                {dragActive ? 'Drop image here' : 'Or drag & drop image here'}
              </div>
            </div>
            <span className="file-name">
              {file ? file.name : 'No file selected'}
            </span>
          </div>
          <small className="form-note">
            Note: Images processed through microservices architecture.
          </small>
          
          {preview && (
            <div className="image-preview-container">
              <img src={preview} alt="Preview" className="image-preview" />
            </div>
          )}
        </div>
        
        <button type="submit" disabled={loading} className="upload-button">
          {loading ? 'Uploading via API Gateway...' : 'Share Your Creation'}
        </button>
      </form>
    </div>
  );
}

export default ItemUpload;