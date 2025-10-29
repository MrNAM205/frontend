import React, { useState } from 'react';
import './CreditorForm.css';

const API_URL = 'http://127.0.0.1:8000';

interface CreditorFormProps {
  onCreditorAdded: () => void;
}

const CreditorForm: React.FC<CreditorFormProps> = ({ onCreditorAdded }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactMethod, setContactMethod] = useState('mail');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const creditorData = {
      name,
      address,
      contact_method: contactMethod,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    };

    try {
      const response = await fetch(`${API_URL}/creditors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creditorData),
      });

      if (!response.ok) {
        throw new Error('Failed to add creditor.');
      }

      setSuccess(`Creditor "${name}" added successfully.`);
      // Clear form
      setName('');
      setAddress('');
      setContactMethod('mail');
      setTags('');
      // Notify parent component
      onCreditorAdded();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="creditor-form-container">
      <h3>Add New Creditor</h3>
      <form onSubmit={handleSubmit} className="creditor-form">
        <div className="form-group">
          <label htmlFor="name">Creditor Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contactMethod">Contact Method</label>
          <select
            id="contactMethod"
            value={contactMethod}
            onChange={(e) => setContactMethod(e.target.value)}
          >
            <option value="mail">Mail</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., original creditor, debt collector"
          />
        </div>
        <button type="submit" className="submit-btn">
          Add Creditor
        </button>
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default CreditorForm;
