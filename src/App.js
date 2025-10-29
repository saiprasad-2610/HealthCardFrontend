// App.js

import React, { useState } from 'react';
import './App.css'; // Import the standard CSS file

// --- Core Components ---

/**
 * 1. Header Component
 */
const Header = ({ onLogout }) => (
  <header className="header">
    <div className="header-logo">
      <svg className="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h1>HealthCard | Digital Health Identity</h1>
    </div>
    {onLogout && (
      <button onClick={onLogout} className="btn btn-danger">
        Logout 🚪
      </button>
    )}
  </header>
);

/**
 * 2. Login/Authentication Component
 */
const AuthScreen = ({ onLogin }) => {
  const [healthCardId, setHealthCardId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (healthCardId.trim() && password.trim()) {
      onLogin(healthCardId);
    } else {
      alert('Please enter ID and Password.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Access HealthCard Records</h2>
        <p className="auth-subtitle">Authorized Medical Personnel Login</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            id="healthCardId"
            type="text"
            required
            value={healthCardId}
            onChange={(e) => setHealthCardId(e.target.value)}
            placeholder="Your Hospital/Doctor ID"
            className="input-field"
          />
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Secure Password"
            className="input-field"
          />
          <button type="submit" className="btn btn-primary btn-full">
            Authenticate & Proceed
          </button>
          <p className="auth-note">
            Records are **Encrypted** and access is **Logged** for transparency.
          </p>
        </form>
      </div>
    </div>
  );
};


/**
 * 3. Dashboard Component (Main View)
 */
const Dashboard = ({ loggedInId }) => {
  const [searchId, setSearchId] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data to simulate API response
 const mockPatientData = {
  // --- PERSON 1: Chronic Condition Example ---
  'PRIYA': {
    name: 'Priya Sharma',
    dob: '15/05/1985',
    bloodGroup: 'A+',
    allergies: ['Penicillin', 'Dust Mites'], // Critical Allergy
    currentMedications: ['Metformin (Diabetes)', 'Aspirin (Cardio)'],
    lastVisit: '2025-09-10 (City Hospital, Mumbai)',
    records: [
      { date: '2025-09-10', type: 'Consultation', details: 'Routine Diabetes Check-up. HbA1c: 6.8%', doctor: 'Dr. A. Kumar' },
      { date: '2024-03-20', type: 'Surgery', details: 'Appendectomy performed successfully under general anesthesia.', doctor: 'Dr. S. Patel' },
      { date: '2023-11-05', type: 'Lab Report', details: 'Complete Blood Count (CBC) - Normal results.', doctor: 'Lab Corp' },
    ],
  },

  // --- PERSON 2: Emergency & Recent Injury Example ---
  'PRINCE': {
    name: 'prince',
    dob: '03/11/1998',
    bloodGroup: 'O-', // Rare Blood Group highlighted for emergency
    allergies: ['No Known Drug Allergies (NKDA)'],
    currentMedications: ['Painkiller (as needed)'],
    lastVisit: '2025-10-25 (Trauma Center, Delhi)',
    records: [
      { date: '2025-10-25', type: 'Consultation', details: 'Emergency room visit for fractured wrist after bike accident.', doctor: 'Dr. N. Singh' },
      { date: '2025-02-15', type: 'Vaccination', details: 'Seasonal Influenza Vaccine administered.', doctor: 'Govt. Clinic' },
      { date: '2019-07-01', type: 'Lab Report', details: 'Initial health screening, cholesterol levels normal.', doctor: 'Health Check Labs' },
    ],
  },

  // --- PERSON 3: Pediatric/Simple History Example ---
  'MEENA': {
    name: 'Meena Reddy',
    dob: '01/01/2015',
    bloodGroup: 'B+',
    allergies: ['Peanuts'], // Severe Food Allergy
    currentMedications: ['Montelukast (Asthma maintenance)'],
    lastVisit: '2025-08-01 (Children\'s Hospital, Chennai)',
    records: [
      { date: '2025-08-01', type: 'Consultation', details: 'Routine pediatric check-up. Confirmed asthma status.', doctor: 'Dr. V. Iyer' },
      { date: '2020-05-10', type: 'Vaccination', details: 'MMR and DTaP boosters completed.', doctor: 'Local Health Dept.' },
    ],
  },
};

  const handleSearch = (e) => {
    e.preventDefault();
    setError(null);
    setPatientData(null);
    if (!searchId.trim()) return;

    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const data = mockPatientData[searchId.toUpperCase()];
      if (data) {
        setPatientData(data);
        setError(null);
      } else {
        setError(`No records found for HealthCard ID: ${searchId}`);
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">
        Welcome, {loggedInId} | Instant Patient History Access 🩺
      </h2>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="search-bar-form">
        <input
          type="text"
          placeholder="Enter Patient HealthCard ID to Search (e.g., HC-12345678)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value.toUpperCase())}
          className="input-field search-input"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary search-button"
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              Search Record
            </>
          )}
        </button>
      </form>

      {/* Display Area */}
      {error && (
        <div className="alert-error">
          <p>Access Denied / Not Found: {error}.</p>
        </div>
      )}

      {patientData && (
        <div className="patient-data-area">
          {/* Patient Summary Card */}
          <div className="card summary-card">
            <div className="summary-header">
              <h3 className="patient-name">{patientData.name}</h3>
              <div className="healthcard-id">
                <p className="id-label">HealthCard ID</p>
                <p className="id-number">{searchId}</p>
              </div>
            </div>

            <div className="summary-info-grid">
              <InfoBox title="Date of Birth" value={patientData.dob} icon="🎂"/>
              <InfoBox title="Blood Group" value={patientData.bloodGroup} icon="🩸" customClass="info-box-alert"/>
              <InfoBox title="Last Visit" value={patientData.lastVisit} icon="🏥"/>
            </div>

            <div className="critical-alerts">
              <h4 className="alerts-title">
                CRITICAL MEDICAL ALERTS
              </h4>
              <PillList title="Allergies" items={patientData.allergies} color="red"/>
              <PillList title="Current Medications" items={patientData.currentMedications} color="green"/>
            </div>
          </div>
          

          {/* Detailed Records Section */}
          <div className="card records-card">
            <h3 className="records-title">Complete Treatment History</h3>
            <div className="records-list">
              {patientData.records.map((record, index) => (
                <RecordItem key={index} record={record} />
              ))}
            </div>
            <div className="add-record-area">
              <button className="btn btn-secondary">
                + Add New Consultation/Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper Components ---

const InfoBox = ({ title, value, icon, customClass = 'info-box-default' }) => (
  <div className={`info-box ${customClass}`}>
    <p className="info-title">
      <span className="info-icon">{icon}</span> {title}
    </p>
    <p className="info-value">{value}</p>
  </div>
);

const PillList = ({ title, items, color }) => (
  <div className="pill-list-group">
    <span className="pill-list-title">{title}:</span>
    <div className="pill-list-items">
      {items.map((item, index) => (
        <span key={index} className={`pill pill-${color}`}>
          {item}
        </span>
      ))}
      {items.length === 0 && <span className="no-data">None Reported</span>}
    </div>
  </div>
);

const RecordItem = ({ record }) => (
  <div className="record-item">
    <div className={`record-type record-type-${record.type.toLowerCase().split(' ')[0]}`}>
      {record.type === 'Surgery' && '🔪 Surgery'}
      {record.type === 'Lab Report' && '🧪 Lab'}
      {record.type === 'Consultation' && '📝 Consult'}
    </div>
    <div className="record-details">
      <p className="record-summary">{record.details}</p>
      <p className="record-date">Date: {record.date}</p>
    </div>
    <div className="record-source">
      <p className="source-label">Source</p>
      <p className="source-name">{record.doctor}</p>
    </div>
  </div>
);

// --- Main App Component ---

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInId, setLoggedInId] = useState('');

  const handleLogin = (id) => {
    setLoggedInId(id);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInId('');
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <>
          <Header onLogout={handleLogout} />
          <Dashboard loggedInId={loggedInId} />
        </>
      ) : (
        <AuthScreen onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App; 
