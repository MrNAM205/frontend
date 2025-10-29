import React, { useState, useEffect } from 'react';
import { useRemedyLog } from '../context/RemedyLogContext';
import { Creditor } from '../types/Creditor';
import './AffidavitForge.css';

const API_URL = 'http://127.0.0.1:8000/api';

const AffidavitForge: React.FC = () => {
  const { events, addEvent } = useRemedyLog();
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [selectedCreditorId, setSelectedCreditorId] = useState<string>('');
  const [affidavitText, setAffidavitText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/creditors`)
      .then((res) => res.json())
      .then((data) => setCreditors(data))
      .catch((err) => console.error('Failed to load creditors:', err));
  }, []);

  const handleGenerate = async () => {
    const selectedCreditor = creditors.find((c) => c.id === selectedCreditorId);
    if (!selectedCreditor) {
      setError('Please select a creditor.');
      return;
    }

    setLoading(true);
    setError(null);
    setAffidavitText('');

    try {
      // First, get the user profile
      const userRes = await fetch(`${API_URL}/user-profile`);
      if (!userRes.ok) throw new Error('Failed to fetch user profile.');
      const user = await userRes.json();

      // Now, generate the affidavit
      const requestBody = {
        user,
        creditor: selectedCreditor,
        events,
      };

      const affidavitRes = await fetch(`${API_URL}/affidavit/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!affidavitRes.ok) {
        const errorData = await affidavitRes.json();
        throw new Error(errorData.detail || 'Affidavit generation failed.');
      }

      const data = await affidavitRes.json();
      setAffidavitText(data.affidavit);

      // Log the event to the remedy log
      await addEvent({
        action: `Affidavit generated for ${selectedCreditor.name}`,
        actor: 'user',
        stage: 'endorsement',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="affidavit-forge-container">
      <h2 className="forge-title">🛡️ Affidavit Forge</h2>
      <div className="forge-controls">
        <label htmlFor="creditor-select">Select Creditor:</label>
        <select
          id="creditor-select"
          value={selectedCreditorId}
          onChange={(e) => setSelectedCreditorId(e.target.value)}
        >
          <option value="" disabled>
            -- Choose a Creditor --
          </option>
          {creditors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleGenerate}
          disabled={!selectedCreditorId || loading}
        >
          {loading ? 'Generating...' : 'Generate Affidavit'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {affidavitText && (
        <div className="affidavit-preview">
          <h3>📜 Affidavit Preview</h3>
          <pre>{affidavitText}</pre>
          <div className="export-actions">
            <button
              onClick={() => navigator.clipboard.writeText(affidavitText)}
            >
              Copy Text
            </button>
            <button onClick={() => window.print()}>Print</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffidavitForge;
