import React, { useState, useEffect } from 'react';
import { useRemedyLog } from '../context/RemedyLogContext';
import './MonthlyEndorsement.css';

const API_URL = 'http://127.0.0.1:8000/api';

interface MonthlyBill {
  id: string;
  user_id: string;
  creditor_id: string;
  due_date: string;
  amount_due: number;
  status: string;
  notes?: string;
  endorsement_date?: string;
  document_url?: string;
}

const MonthlyEndorsement: React.FC = () => {
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addEvent } = useRemedyLog(); // To refresh the loop

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/monthly-bills`);
      if (!response.ok) throw new Error('Failed to fetch bills.');
      const data = await response.json();
      setBills(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleEndorse = async (billId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/monthly-bills/${billId}/endorse`,
        {
          method: 'POST',
        },
      );
      if (!response.ok) throw new Error('Failed to endorse bill.');
      // The backend now logs the remedy event, so we just need to refresh our data
      fetchBills();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading bills...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="monthly-endorsement-container">
      <h2>💵 Monthly Bill Endorsement</h2>
      <div className="bill-list">
        {bills.length === 0 ? (
          <p>No monthly bills found. Add one to get started.</p>
        ) : (
          bills.map((bill) => (
            <div key={bill.id} className={`bill-item status-${bill.status}`}>
              <div className="bill-details">
                <p>
                  <strong>Creditor ID:</strong> {bill.creditor_id}
                </p>
                <p>
                  <strong>Amount:</strong> ${bill.amount_due.toFixed(2)}
                </p>
                <p>
                  <strong>Due:</strong>{' '}
                  {new Date(bill.due_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className="status-badge">{bill.status}</span>
                </p>
              </div>
              <div className="bill-actions">
                {bill.status === 'pending' && (
                  <button
                    onClick={() => handleEndorse(bill.id)}
                    className="endorse-btn"
                  >
                    Endorse Bill
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonthlyEndorsement;
