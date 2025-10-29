import React, { useState } from 'react';
import { useStatutes } from '../../context/StatuteContext';
import './StatuteTooltip.css';

interface StatuteTooltipProps {
  children: React.ReactNode;
  statuteId: string;
}

const StatuteTooltip: React.FC<StatuteTooltipProps> = ({
  children,
  statuteId,
}) => {
  const { getStatuteById } = useStatutes();
  const [visible, setVisible] = useState(false);
  const statute = getStatuteById(statuteId);

  if (!statute) {
    return <>{children}</>; // Render children without tooltip if statute not found
  }

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="tooltip-box">
          <h4 className="tooltip-title">{statute.title}</h4>
          <p className="tooltip-excerpt">{statute.excerpt}</p>
        </div>
      )}
    </div>
  );
};

export default StatuteTooltip;
