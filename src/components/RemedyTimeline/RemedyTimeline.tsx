import React, { useState, useMemo } from 'react';
import { useRemedyLog } from '../../context/RemedyLogContext';
import './RemedyTimeline.css';

const RemedyTimeline: React.FC = () => {
  const { events, loading, error } = useRemedyLog();
  const [stageFilter, setStageFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');

  const getIconForStage = (stage: string) => {
    switch (stage) {
      case 'notice':
        return '✉️';
      case 'rebuttal':
        return '🛡️';
      case 'affidavit':
        return '📜';
      case 'endorsement':
        return '💸';
      case 'violation':
        return '⚖️';
      default:
        return '🔵';
    }
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => (stageFilter ? event.stage === stageFilter : true))
      .filter((event) => (actorFilter ? event.actor === actorFilter : true))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [events, stageFilter, actorFilter]);

  const handleExportPlaintext = () => {
    const text = filteredEvents
      .map(
        (e) =>
          `[${new Date(e.timestamp).toLocaleString()}] [${e.stage.toUpperCase()}] [${e.actor}] - ${e.action}`,
      )
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `remedy_timeline_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const timelineHtml = document.getElementById('timeline-content')?.innerHTML;
    printWindow?.document.write(`
      <html>
        <head>
          <title>Remedy Timeline</title>
          <style>
            body { font-family: sans-serif; }
            .timeline-item { display: flex; align-items: center; margin-bottom: 1rem; }
            .timeline-icon { font-size: 1.5rem; margin-right: 1rem; }
            .timeline-details { border-left: 2px solid #ccc; padding-left: 1rem; }
            .timeline-details p { margin: 0; }
            .timeline-details .timestamp { font-size: 0.8rem; color: #555; }
          </style>
        </head>
        <body>
          <h2>Remedy Timeline</h2>
          ${timelineHtml}
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
  };

  if (loading) return <p>Loading timeline...</p>;
  if (error)
    return <p className="error-message">Error loading timeline: {error}</p>;

  return (
    <div className="remedy-timeline-container">
      <h3>Sovereign Action Chronicle</h3>
      <div className="timeline-controls">
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">All Stages</option>
          <option value="notice">Notice</option>
          <option value="rebuttal">Rebuttal</option>
          <option value="affidavit">Affidavit</option>
          <option value="endorsement">Endorsement</option>
        </select>
        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
        >
          <option value="">All Actors</option>
          <option value="user">User</option>
          <option value="system">System</option>
        </select>
        <div className="export-buttons">
          <button onClick={handleExportPlaintext}>Export TXT</button>
          <button onClick={handleExportPDF}>Export PDF</button>
        </div>
      </div>
      <div id="timeline-content" className="timeline">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="timeline-item">
              <div className="timeline-icon">
                {getIconForStage(event.stage)}
              </div>
              <div className="timeline-details">
                <p className="action">{event.action}</p>
                <p className="timestamp">
                  {new Date(event.timestamp).toLocaleString()} - by{' '}
                  {event.actor}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No remedy events recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default RemedyTimeline;
