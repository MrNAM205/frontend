import React, { useState, useEffect } from 'react';
import './FDCPAViolationTracker.css';

const API_URL = 'http://127.0.0.1:8000/api';

interface ViolationEvent {
  id: string;
  date: string;
  collector: string;
  violation_type: string;
  statute_reference: string;
  notes: string;
}

const FDCPAViolationTracker: React.FC = () => {
  const [violations, setViolations] = useState<ViolationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [collector, setCollector] = useState('');
  const [violationType, setViolationType] = useState('');
  const [statute, setStatute] = useState('');
  const [notes, setNotes] = useState('');

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/violations`);
      if (!response.ok) throw new Error('Failed to fetch violations.');
      const data = await response.json();
      setViolations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newViolation = {
      date,
      collector,
      violation_type: violationType,
      statute_reference: statute,
      notes,
    };

    try {
      const response = await fetch(`${API_URL}/violations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newViolation),
      });
      if (!response.ok) throw new Error('Failed to log violation.');

      // Refresh list and clear form
      fetchViolations();
      setCollector('');
      setViolationType('');
      setStatute('');
      setNotes('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="violation-tracker-container">
      <h2>🛡️ FDCPA Violation Tracker</h2>

      <form onSubmit={handleSubmit} className="violation-form">
        <h3>Log a New Violation</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Collector</label>
            <input
              type="text"
              value={collector}
              onChange={(e) => setCollector(e.target.value)}
              placeholder="e.g., ABC Collection Agency"
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Violation Type</label>
            <input
              type="text"
              value={violationType}
              onChange={(e) => setViolationType(e.target.value)}
              placeholder="e.g., Harassment, False Statements"
              required
            />
          </div>
          <div className="form-group">
            <label>Statute Reference</label>
            <input
              type="text"
              value={statute}
              onChange={(e) => setStatute(e.target.value)}
              placeholder="e.g., 15 U.S.C. § 1692d"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />
        </div>
        <button type="submit">Log Violation</button>
      </form>

      <div className="violations-list">
        <h3>Violation Log</h3>
        {loading && <p>Loading violations...</p>}
        {error && <p className="error-message">{error}</p>}
        {violations.length === 0 && !loading && (
          <p>No violations logged yet.</p>
        )}
        {violations.map((v) => (
          <div key={v.id} className="violation-item">
            <p>
              <strong>Date:</strong> {new Date(v.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Collector:</strong> {v.collector}
            </p>
            <p>
              <strong>Violation:</strong> {v.violation_type} (
              {v.statute_reference})
            </p>
            <p>
              <strong>Notes:</strong> {v.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FDCPAViolationTracker;
