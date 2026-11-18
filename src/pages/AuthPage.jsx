import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const BRAND = { NAME: "BLESSING'S", SLOGAN: 'Estilo minimalista, elegancia moderna', CLIENT_PREFIX: 'BLESSINGS-' };

const getFirebaseErrorMessage = (code) => {
  const errorMap = {
    'auth/email-already-in-use': 'Este correo ya está registrado.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-not-found': 'No existe una cuenta con este correo.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/invalid-credential': 'Credenciales incorrectas.',
  };
  return errorMap[code] || 'Ocurrió un error inesperado.';
};

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Completa todos los campos.'); return; }
    if (mode === 'register' && !name.trim()) { setError('Ingresa tu nombre.'); return; }

    setLoading(true);
    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name.trim() });
        await setDoc(doc(db, 'clients', userCredential.user.uid), {
          name: name.trim(), email: email.toLowerCase(), stamps: 0, createdAt: new Date().toISOString(),
          clientId: `${BRAND.CLIENT_PREFIX}${userCredential.user.uid.substring(0, 8).toUpperCase()}`,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const glassInput = {
    width: '100%', padding: '13px 16px', background: 'rgba(0, 0, 0, 0.35)', 
    border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '12px', 
    color: '#fff', fontSize: '14px', outline: 'none', transition: 'all 0.3s'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Video de Fondo */}
      <video autoPlay loop muted playsInline style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: -2 }}>
        <source src="/img/clipq.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(rgba(10, 10, 12, 0.78), rgba(10, 10, 12, 0.88))', zIndex: -1 }} />

      {/* Contenedor Glass */}
      <div style={{ 
        width: '100%', maxWidth: '380px', background: 'rgba(18, 18, 24, 0.65)', backdropFilter: 'blur(20px)', 
        WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '24px', padding: '36px 28px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)', zIndex: 1
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <img src="/img/logo.jpeg" alt="Logo" style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block', border: '2px solid #d4af37', boxShadow: '0 0 20px rgba(212,175,55,0.3)' }} />
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 700, color: '#fcfcfc', letterSpacing: '0.05em' }}>{BRAND.NAME}</h1>
          <p style={{ color: '#a1a1aa', fontSize: '12px', marginTop: '4px' }}>{BRAND.SLOGAN}</p>
        </div>

        <div style={{ display: 'flex', marginBottom: '22px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(212,175,55,0.1)' }}>
          <button onClick={() => { setMode('login'); setError(''); }} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', background: mode === 'login' ? 'rgba(212, 175, 55, 0.2)' : 'transparent', color: mode === 'login' ? '#f3e5ab' : '#a1a1aa', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>Entrar</button>
          <button onClick={() => { setMode('register'); setError(''); }} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', background: mode === 'register' ? 'rgba(212, 175, 55, 0.2)' : 'transparent', color: mode === 'register' ? '#f3e5ab' : '#a1a1aa', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>Registrarse</button>
        </div>

        {error && <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid #f87171', color: '#f87171', borderRadius: '10px', padding: '10px', fontSize: '11px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <input type="text" placeholder="Nombre Completo" value={name} onChange={e => setName(e.target.value)} style={glassInput} 
              onFocus={(e) => e.target.style.borderColor = '#d4af37'} onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.25)'} />
          )}
          <input type="email" placeholder="Correo Electrónico" value={email} onChange={e => setEmail(e.target.value)} style={glassInput} 
            onFocus={(e) => e.target.style.borderColor = '#d4af37'} onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.25)'} />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} style={glassInput} 
            onFocus={(e) => e.target.style.borderColor = '#d4af37'} onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.25)'} />
          
          <button onClick={handleSubmit} disabled={loading} style={{ 
            marginTop: '8px', padding: '14px', background: 'linear-gradient(135deg, #d4af37, #aa7c11)', color: '#0a0a0c', 
            border: 'none', borderRadius: '12px', fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 700, 
            cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)', transition: 'all 0.2s' 
          }}>
            {loading ? 'Cargando...' : (mode === 'register' ? 'Crear Cuenta' : 'Entrar')}
          </button>
        </div>
      </div>
    </div>
  );
}
