import React, { useState, useEffect } from 'react';
import { Creditor } from '../types/Creditor';
import StatuteTooltip from '../components/StatuteTooltip/StatuteTooltip';
import './NoticeGenerator.css';

const API_URL = 'http://127.0.0.1:8000/api';

const NoticeGenerator: React.FC = () => {
  const [templates, setTemplates] = useState<string[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedCreditorId, setSelectedCreditorId] = useState('');
  const [noticeText, setNoticeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/notices/templates`)
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch(() => setError('Failed to load notice templates.'));

    fetch(`${API_URL}/creditors`)
      .then((res) => res.json())
      .then((data) => setCreditors(data))
      .catch(() => setError('Failed to load creditors.'));
  }, []);

  const handleGenerate = async () => {
    if (!selectedTemplate || !selectedCreditorId) {
      setError('Please select a template and a creditor.');
      return;
    }
    setLoading(true);
    setError(null);
    setNoticeText('');

    try {
      const response = await fetch(`${API_URL}/notices/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_name: selectedTemplate,
          user_id: 'user-001', // Hardcoded for now, represents the sovereign user
          creditor_id: selectedCreditorId,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to generate notice.');
      }
      const data = await response.json();
      setNoticeText(data.notice_text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(noticeText).then(
      () => alert('Notice copied to clipboard!'),
      () => setError('Failed to copy notice.'),
    );
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(
      `<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: monospace;">${noticeText}</pre>`,
    );
    printWindow?.document.close();
    printWindow?.focus(); // Required for some browsers
    printWindow?.print();
  };

  const handleSave = () => {
    const blob = new Blob([noticeText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedTemplate.replace('.j2', '')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="notice-generator-container">
      <h2 className="page-header">
        ✉️ Notice Generator
        <StatuteTooltip statuteId="15usc1692g">
          <span className="info-icon">ⓘ</span>
        </StatuteTooltip>
      </h2>
      <div className="generator-controls">
        <div className="control-group">
          <label>1. Select Notice Template</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="" disabled>
              -- Choose Template --
            </option>
            {templates.map((t) => (
              <option key={t} value={t}>
                {t
                  .replace('.j2', '')
                  .split('_')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label>2. Select Creditor</label>
          <select
            value={selectedCreditorId}
            onChange={(e) => setSelectedCreditorId(e.target.value)}
          >
            <option value="" disabled>
              -- Choose Creditor --
            </option>
            {creditors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!selectedTemplate || !selectedCreditorId || loading}
        >
          {loading ? 'Inscribing...' : '3. Generate Notice'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {noticeText && (
        <div className="notice-preview">
          <h3>Sovereign Invocation Preview</h3>
          <pre>{noticeText}</pre>
          <div className="export-actions">
            <button onClick={handleCopy}>📋 Copy</button>
            <button onClick={handlePrint}>🖨️ Print</button>
            <button onClick={handleSave}>💾 Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeGenerator;
