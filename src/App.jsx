import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import LoyaltyCard from './pages/LoyaltyCard';
import BarberPanel from './pages/BarberPanel';
import VoucherPage from './pages/VoucherPage'; // <-- 1. Importar aquí

export const BLESSINGS_CONFIG = {
  ADMIN_EMAIL: 'tatakirumba99@gmail.com', // Revisa si lleva 't' al inicio como en BarberPanel
  BRAND_NAME: "BLESSING'S"
};

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '20vh' }}>Cargando sistema...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route path="/login" element={user ? <Navigate to="/mi-tarjeta" /> : <AuthPage />} />
        
        {/* 2. Agregar la ruta del QR aquí */}
        <Route path="/voucher" element={<VoucherPage user={user} />} />

        <Route 
          path="/mi-tarjeta" 
          element={
            user ? (
              user.email === BLESSINGS_CONFIG.ADMIN_EMAIL ? <Navigate to="/admin" /> : <LoyaltyCard user={user} />
            ) : <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            user && user.email === BLESSINGS_CONFIG.ADMIN_EMAIL ? <BarberPanel user={user} /> : <Navigate to="/login" />
          } 
        />
      </Routes>
    </Router>
  );
}
