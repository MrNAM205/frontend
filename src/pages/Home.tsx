import React, { useState } from 'react';
import SovereignLoop from '../components/SovereignLoop';
import CreditorForm from '../components/CreditorForm';
import CreditorList from '../components/CreditorList';
import RemedyTimeline from '../components/RemedyTimeline/RemedyTimeline';

const Home: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreditorAdded = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <>
      <SovereignLoop />
      <RemedyTimeline />
      <div className="creditor-matrix-container">
        <CreditorList refreshKey={refreshKey} />
        <CreditorForm onCreditorAdded={handleCreditorAdded} />
      </div>
    </>
  );
};

export default Home;
