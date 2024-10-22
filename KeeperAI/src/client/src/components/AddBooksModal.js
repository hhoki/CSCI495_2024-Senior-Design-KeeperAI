import React, { useState } from 'react';
import '../styles/AddBooksModal.css';

const AddBooksModal = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
  
    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!file) return;
  
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await fetch('http://localhost:5000/book/upload', {
            method: 'POST',
            body: formData,
          });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        setResult(data.result);
      } catch (error) {
        console.error('Error uploading file:', error);
        setResult('Error processing image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>&times;</button>
          <h2>Add Books from Image</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="bookImage">Upload Book Image:</label>
              <input
                type="file"
                id="bookImage"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Upload and Process'}
              </button>
            </div>
          </form>
          {result && (
            <div className="result-container">
              <h3>Detected Books:</h3>
              <pre>{result}</pre>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default AddBooksModal;