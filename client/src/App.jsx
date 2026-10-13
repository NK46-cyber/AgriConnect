import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Smartphone, Monitor } from 'lucide-react';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import HomeFarmer from './pages/HomeFarmer';
import AddListing from './pages/AddListing';
import FarmerEnquiries from './pages/FarmerEnquiries';
import BrowseBuyer from './pages/BrowseBuyer';
import BuyerEnquiries from './pages/BuyerEnquiries';
import MandiPricesPage from './pages/MandiPricesPage';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole && user.role !== 'admin') {
    return <Navigate to={user.role === 'farmer' ? '/farmer' : '/buyer'} replace />;
  }
  return children;
}

export default function App() {
  const { user, isFarmer } = useAuth();
  const location = useLocation();
  const [mobileFrame, setMobileFrame] = useState(false);

  // Determine active view mode
  const isLoginPage = location.pathname === '/login';

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col items-center ${mobileFrame ? 'py-4 sm:py-8' : ''}`}>
      {/* Top Banner Frame Toggle (Demo Feature for Judges) */}
      <div className="w-full bg-slate-900 text-white px-4 py-1.5 flex items-center justify-between text-xs font-semibold shadow-inner">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">AgriConnect Prototype • Nashik Pilot</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Preview Mode:</span>
          <button
            onClick={() => setMobileFrame(!mobileFrame)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors"
          >
            {mobileFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{mobileFrame ? 'Full Width' : 'Mobile Frame'}</span>
          </button>
        </div>
      </div>

      {/* Main Container Wrapper */}
      <div className={`w-full flex-1 flex flex-col bg-slate-50 transition-all ${
        mobileFrame
          ? 'max-w-[420px] my-auto rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-slate-800 overflow-hidden min-h-[820px]'
          : 'max-w-full'
      }`}>
        <Navbar />

        <main className="flex-1 w-full">
          <Routes>
            {/* Default root path redirects to appropriate role view */}
            <Route
              path="/"
              element={
                user ? (
                  isFarmer ? <Navigate to="/farmer" replace /> : <Navigate to="/buyer" replace />
                ) : (
                  <Navigate to="/buyer" replace />
                )
              }
            />

            <Route path="/login" element={<Login />} />

            {/* Farmer Routes */}
            <Route
              path="/farmer"
              element={
                <ProtectedRoute allowedRole="farmer">
                  <HomeFarmer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/add"
              element={
                <ProtectedRoute allowedRole="farmer">
                  <AddListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/enquiries"
              element={
                <ProtectedRoute allowedRole="farmer">
                  <FarmerEnquiries />
                </ProtectedRoute>
              }
            />

            {/* Buyer Routes */}
            <Route path="/buyer" element={<BrowseBuyer />} />
            <Route
              path="/buyer/enquiries"
              element={
                <ProtectedRoute allowedRole="buyer">
                  <BuyerEnquiries />
                </ProtectedRoute>
              }
            />

            {/* Shared Mandi Prices Tab */}
            <Route path="/mandi-prices" element={<MandiPricesPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile Bottom Navigation */}
        {!isLoginPage && <BottomNav />}
      </div>
    </div>
  );
}
