import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Layouts
import MobileLayout from './layouts/MobileLayout';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import DailySchedule from './pages/DailySchedule';
import PreJSA from './pages/PreJSA';
import PostJSA from './pages/PostJSA';
import AsBuilt from './pages/AsBuilt';
import VehicleWalkAround from './pages/VehicleWalkAround';
import Incidents from './pages/Incidents';
import Reminders from './pages/Reminders';
import Notifications from './pages/Notifications';
import MapView from './pages/MapView';

// Placeholder for missing pages
const Placeholder = ({ title }) => (
  <div className="p-8 text-center">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <p className="text-gray-500">Coming Soon...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Public/Unauthenticated access to Incidents allow? Usually requires auth or specific flow. 
          SOW says "Unauthenticated menu: Log In, Incident Reporting". 
          So we need a way to access Incidents without Auth. 
          For now, let's keep it simple: generic route. 
      */}
      <Route path="/public/incidents" element={<Incidents type="public" />} />

      {/* Authenticated Routes wrapped in Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <MobileLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="schedule" element={<DailySchedule />} />
        <Route path="map" element={<MapView />} />
        <Route path="vehicle-check" element={<VehicleWalkAround />} />

        {/* Job Workflow */}
        <Route path="job/:jobId/pre-jsa" element={<PreJSA />} />
        <Route path="job/:jobId/post-jsa" element={<PostJSA />} />
        <Route path="job/:jobId/as-built" element={<AsBuilt />} />

        <Route path="incidents" element={<Incidents />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
