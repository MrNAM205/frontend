import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import AffidavitForge from './pages/AffidavitForge';
import MonthlyEndorsement from './pages/MonthlyEndorsement';
import FDCPAViolationTracker from './pages/FDCPAViolationTracker';
import SovereignProfileEditor from './pages/SovereignProfileEditor';
import NoticeGenerator from './pages/NoticeGenerator';
import DispatchTracker from './pages/DispatchTracker';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Sovereign Financial Navigator</h1>
        <nav className="app-nav">
          <Link to="/">Dashboard</Link>
          <Link to="/forge">Affidavit Forge</Link>
          <Link to="/endorse">Bill Endorsement</Link>
          <Link to="/violations">FDCPA Tracker</Link>
          <Link to="/profile">Sovereign Profile</Link>
          <Link to="/notices">Notice Generator</Link>
          <Link to="/dispatch">Dispatch Tracker</Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forge" element={<AffidavitForge />} />
          <Route path="/endorse" element={<MonthlyEndorsement />} />
          <Route path="/violations" element={<FDCPAViolationTracker />} />
          <Route path="/profile" element={<SovereignProfileEditor />} />
          <Route path="/notices" element={<NoticeGenerator />} />
          <Route path="/dispatch" element={<DispatchTracker />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
