import React, { useState, useEffect } from 'react';
import './DispatchTracker.css';

// Define the types based on the backend models
interface DispatchEvent {
  id: string;
  document_id: string;
  document_type: string;
  dispatch_method: string;
  tracking_number?: string;
  sent_at: string;
  delivered_at?: string;
  responded_at?: string;
  status: string; // This is dynamically added from the notice
}

enum DispatchStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  DELIVERED = 'delivered',
  RESPONDED = 'responded',
}

const DispatchTracker: React.FC = () => {
  const [dispatches, setDispatches] = useState<DispatchEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [affidavitPreview, setAffidavitPreview] = useState<string | null>(null);

  const fetchDispatches = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/dispatch');
      if (!response.ok) {
        throw new Error('Failed to fetch dispatches');
      }
      const data = await response.json();
      const dispatchesWithStatus = await Promise.all(
        data.map(async (dispatch: any) => {
          if (dispatch.document_type === 'notice') {
            try {
              const noticeResponse = await fetch(
                `http://localhost:8000/api/notices/${dispatch.document_id}`,
              );
              if (noticeResponse.ok) {
                const noticeData = await noticeResponse.json();
                return { ...dispatch, status: noticeData.status };
              }
            } catch (e) {
              /* ignore */
            }
          }
          return { ...dispatch, status: 'N/A' };
        }),
      );
      setDispatches(dispatchesWithStatus);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const handleStatusChange = async (
    dispatchId: string,
    newStatus: DispatchStatus,
  ) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/dispatch/${dispatchId}/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (!response.ok) throw new Error('Failed to update status');
      fetchDispatches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
    }
  };

  const handleGenerateAffidavit = async (dispatchId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/affidavit/mailing/${dispatchId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      if (!response.ok) throw new Error('Affidavit generation failed');
      const data = await response.json();
      setAffidavitPreview(data.affidavit_text);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
    }
  };

  const copyToClipboard = () => {
    if (affidavitPreview) navigator.clipboard.writeText(affidavitPreview);
  };

  const saveAsTxt = () => {
    if (!affidavitPreview) return;
    const blob = new Blob([affidavitPreview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'affidavit_of_mailing.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="dispatch-tracker-container">
      <h2>Document Dispatch Tracker</h2>
      <table className="dispatch-table">
        <thead>
          <tr>
            <th>Document ID</th>
            <th>Type</th>
            <th>Method</th>
            <th>Tracking #</th>
            <th>Sent At</th>
            <th>Status</th>
            <th>Update Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dispatches.map((dispatch) => (
            <tr key={dispatch.id}>
              <td>{dispatch.document_id}</td>
              <td>{dispatch.document_type}</td>
              <td>{dispatch.dispatch_method}</td>
              <td>{dispatch.tracking_number || 'N/A'}</td>
              <td>{new Date(dispatch.sent_at).toLocaleString()}</td>
              <td>{dispatch.status}</td>
              <td>
                <select
                  value={dispatch.status}
                  onChange={(e) =>
                    handleStatusChange(
                      dispatch.id,
                      e.target.value as DispatchStatus,
                    )
                  }
                >
                  {Object.values(DispatchStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  onClick={() => handleGenerateAffidavit(dispatch.id)}
                  disabled={dispatch.document_type !== 'notice'}
                >
                  Generate Affidavit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {affidavitPreview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>📜 Affidavit of Mailing</h3>
            <pre>{affidavitPreview}</pre>
            <div className="modal-actions">
              <button onClick={copyToClipboard}>📋 Copy</button>
              <button onClick={() => window.print()}>🖨️ Print</button>
              <button onClick={saveAsTxt}>💾 Save</button>
              <button onClick={() => setAffidavitPreview(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchTracker;
