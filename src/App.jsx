import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Importación de páginas (las crearemos a continuación)
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import LoyaltyCard from './pages/LoyaltyCard';
import BarberPanel from './pages/BarberPanel';

export const BLESSINGS_CONFIG = {
  ADMIN_EMAIL: 'atakirumba99@gmail.com', // Asegúrate de usar el correo real del admin
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
        {/* Ruta Pública Principal */}
        <Route path="/" element={<LandingPage user={user} />} />
        
        {/* Ruta de Login / Registro */}
        <Route path="/login" element={user ? <Navigate to="/mi-tarjeta" /> : <AuthPage />} />

        {/* Rutas Protegidas */}
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