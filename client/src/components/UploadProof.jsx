import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/UploadProof.css';

const UploadProof = () => {
  const { id } = useParams(); // Order ID from URL
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert('⚠️ Please select a proof image');
      return;
    }

    const formData = new FormData();
    formData.append('proofImage', file);

    try {
      setUploading(true);

    const response = await axios.put(
  `http://localhost:5000/api/agents/upload-proof/${id}`,  // ✅ Corrected

  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }
);


      if (response.status === 200) {
        navigate('/thank-you'); // ✅ Redirect after upload
      } else {
        throw new Error('Upload failed');
      }

    } catch (err) {
      console.error('❌ Upload error:', err);
      alert('❌ Failed to upload delivery proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-proof-container">
      <h2>📤 Upload Delivery Proof</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button
        className="upload-button"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Submit Proof'}
      </button>
    </div>
  );
};

export default UploadProof;
