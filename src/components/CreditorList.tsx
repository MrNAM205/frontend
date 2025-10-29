import React, { useState, useEffect } from 'react';
import './CreditorList.css';

const API_URL = 'http://127.0.0.1:8000';

interface Creditor {
  id: string;
  name: string;
  address: string;
  contact_method: string;
  tags: string[];
}

interface CreditorListProps {
  refreshKey: number;
}

const CreditorList: React.FC<CreditorListProps> = ({ refreshKey }) => {
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreditors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/creditors`);
        if (!response.ok) {
          throw new Error('Failed to fetch creditors.');
        }
        const data: Creditor[] = await response.json();
        setCreditors(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditors();
  }, [refreshKey]); // Refetch when refreshKey changes

  if (loading) return <p>Loading creditors...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="creditor-list-container">
      <h3>Creditor Matrix</h3>
      {creditors.length === 0 ? (
        <p>No creditors have been added yet.</p>
      ) : (
        <ul className="creditor-list">
          {creditors.map((creditor) => (
            <li key={creditor.id} className="creditor-item">
              <div className="creditor-info">
                <strong>{creditor.name}</strong>
                <p>{creditor.address}</p>
                <p>Contact via: {creditor.contact_method}</p>
              </div>
              <div className="creditor-tags">
                {creditor.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CreditorList;
