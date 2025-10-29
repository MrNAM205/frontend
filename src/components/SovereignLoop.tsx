import React from 'react';
import './SovereignLoop.css';
import { useRemedyLog } from '../context/RemedyLogContext';

// Define the structure and order for each stage in the remedy process
const STAGES_CONFIG = [
  { id: 'notice', name: 'Notice Sent', symbol: '✉️' },
  { id: 'response', name: 'Response Received', symbol: '📬' },
  { id: 'rebuttal', name: 'Rebuttal', symbol: '🛡️' },
  { id: 'endorsement', name: 'Endorsement', symbol: '✅' },
];

const SovereignLoop: React.FC = () => {
  const { getCompletedStages, loading, error, addEvent } = useRemedyLog();

  if (loading) return <p>Loading Remedy Log...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  const completedStages = getCompletedStages();

  // Find the index of the first stage that is NOT completed.
  // This will be our current, active stage.
  const activeStageIndex = STAGES_CONFIG.findIndex(
    (stage) => !completedStages.includes(stage.id),
  );

  // If all stages are completed, the last stage remains active
  const currentStageIndex =
    activeStageIndex === -1 ? STAGES_CONFIG.length - 1 : activeStageIndex;

  // --- Temporary controls for demonstration ---
  const handleSimulateNextStage = async () => {
    const nextStage = STAGES_CONFIG[completedStages.length];
    if (nextStage) {
      await addEvent({
        action: `Simulated ${nextStage.name}`,
        actor: 'system',
        stage: nextStage.id as any, // Type assertion for demo
      });
    }
  };

  return (
    <div className="sovereign-loop-container">
      <h2 className="sovereign-loop-title">Sovereign Loop</h2>
      <p className="sovereign-loop-subtitle">
        Your guide through the remedy process
      </p>
      <div className="sovereign-loop">
        {STAGES_CONFIG.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.id);
          const isActive = index === currentStageIndex;

          return (
            <React.Fragment key={stage.id}>
              <div
                className={`stage ${isActive ? 'active' : ''} ${
                  isCompleted ? 'completed' : ''
                }`}
              >
                <div className="stage-symbol">{stage.symbol}</div>
                <div className="stage-name">{stage.name}</div>
              </div>
              {index < STAGES_CONFIG.length - 1 && (
                <div className="connector"></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="navigation-controls">
        <button
          onClick={handleSimulateNextStage}
          disabled={completedStages.length === STAGES_CONFIG.length}
        >
          Simulate Next Stage
        </button>
      </div>
    </div>
  );
};

export default SovereignLoop;
