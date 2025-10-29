import React, { useState, useEffect } from 'react';
import './SovereignProfileEditor.css';

const API_URL = 'http://127.0.0.1:8000/api';

interface UserProfile {
  id: string;
  full_name: string;
  address: string;
  status?: string;
  declarations?: string[];
}

const SovereignProfileEditor: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/user-profile`)
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    try {
      const response = await fetch(`${API_URL}/user-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error('Failed to save profile.');
      alert('Profile saved successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleDeclarationsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    if (!profile) return;
    const declarations = e.target.value.split('\n');
    setProfile({ ...profile, declarations });
  };

  if (loading) return <p>Loading Profile...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!profile) return <p>No profile found.</p>;

  return (
    <div className="profile-editor-container">
      <h2>🧬 Sovereign Identity & Profile</h2>
      <div className="profile-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            name="full_name"
            value={profile.full_name}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            name="address"
            value={profile.address}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <input
            name="status"
            value={profile.status || ''}
            onChange={handleInputChange}
            placeholder="e.g., Sovereign Living Man/Woman"
          />
        </div>
        <div className="form-group">
          <label>Declarations (one per line)</label>
          <textarea
            name="declarations"
            value={profile.declarations?.join('\n') || ''}
            onChange={handleDeclarationsChange}
            rows={4}
          />
        </div>
        <button onClick={handleSave} className="save-btn">
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default SovereignProfileEditor;
