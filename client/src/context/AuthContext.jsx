import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  { name: 'Ramesh Patil', role: 'farmer', mobile: '9822011111', taluka: 'Niphad', village: 'Kundewadi', cropDesc: 'Onion & Tomato Grower' },
  { name: 'Sunita Shinde', role: 'farmer', mobile: '9822022222', taluka: 'Sinnar', village: 'Musalgaon', cropDesc: 'Pomegranate & Soybean Farmer' },
  { name: 'Anand Mess & Hostel', role: 'buyer', buyer_type: 'hostel', mobile: '9822044444', taluka: 'Nashik', village: 'Gangapur Road', cropDesc: 'College Hostel Mess Buyer' },
  { name: 'Hotel Panchavati', role: 'buyer', buyer_type: 'hotel', mobile: '9822055555', taluka: 'Nashik', village: 'Panchavati', cropDesc: 'Hotel & Dining Buyer' }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agriconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('agriconnect_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getMyProfile()
        .then((profile) => {
          setUser(profile);
          localStorage.setItem('agriconnect_user', JSON.stringify(profile));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const loginWithSession = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('agriconnect_user', JSON.stringify(userData));
    localStorage.setItem('agriconnect_token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agriconnect_user');
    localStorage.removeItem('agriconnect_token');
  };

  const quickLoginAs = async (mobile) => {
    const res = await api.verifyOtp({ mobile, otp: '123456' });
    loginWithSession(res.user, res.token);
    return res.user;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      role: user?.role || null,
      isFarmer: user?.role === 'farmer',
      isBuyer: user?.role === 'buyer',
      isAdmin: user?.role === 'admin',
      loginWithSession,
      logout,
      quickLoginAs,
      demoAccounts: DEMO_ACCOUNTS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
