import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';

const generateToken = () => Math.random().toString(36).substr(2, 16).toUpperCase();

export default function LoyaltyCard({ user }) {
  const [clientData, setClientData] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [justUsed, setJustUsed] = useState(false);
  const prevToken = useRef(null);

  useEffect(() => {
    const ref = doc(db, 'clients', user.uid);
    const unsub = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (!data.qrToken) { await updateDoc(ref, { qrToken: generateToken() }); return; }
        if (prevToken.current && prevToken.current !== data.qrToken) setJustUsed(true);
        prevToken.current = data.qrToken;
        setClientData(data);
      }
      setDbLoading(false);
    });
    return () => unsub();
  }, [user.uid]);

  const stamps = clientData?.stamps || 0;
  const isComplete = stamps >= 5;
  const qrUrl = `${window.location.origin}/voucher?uid=${user.uid}&token=${clientData?.qrToken}`;

  if (dbLoading) return <div style={{ color: '#d4af37', textAlign: 'center', marginTop: '20vh', background: '#0a0a0c' }}>Cargando...</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Video de Fondo */}
      <video autoPlay loop muted playsInline style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: -2 }}>
        <source src="/img/clip1.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(rgba(10, 10, 12, 0.78), rgba(10, 10, 12, 0.88))', zIndex: -1 }} />

      {/* Tarjeta Glass */}
      <div style={{ 
        width: '100%', maxWidth: '380px', 
        background: 'rgba(18, 18, 24, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '28px', padding: '36px 28px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)', zIndex: 1
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <img src="/img/logo.jpeg" alt="Logo" style={{ width: 75, height: 75, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d4af37', margin: '0 auto 12px', display: 'block', boxShadow: '0 0 25px rgba(212, 175, 55, 0.3)' }} />
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 700, color: '#fcfcfc', letterSpacing: '0.08em' }}>BLESSING'S</h1>
          <p style={{ color: '#a1a1aa', fontSize: '12px', marginTop: '4px' }}>Tarjeta de Fidelización</p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '18px', padding: '20px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fcfcfc', fontSize: '15px' }}>{user.displayName || 'Cliente'}</div>
              <div style={{ fontSize: '11px', color: '#a1a1aa' }}>{user.email}</div>
            </div>
            <button onClick={() => signOut(auth)} style={{ background: 'transparent', border: '1px solid rgba(212, 175, 55, 0.25)', color: '#a1a1aa', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}>Salir</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ 
                width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: i < stamps ? '1.5px solid #d4af37' : '1.5px solid rgba(255,255,255,0.1)',
                background: i < stamps ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                color: i < stamps ? '#f3e5ab' : '#a1a1aa',
                boxShadow: i < stamps ? '0 0 12px rgba(212, 175, 55, 0.3)' : 'none',
                transition: 'all 0.3s'
              }}>
                {i < stamps ? '★' : ''}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 700, color: '#d4af37' }}>
            {stamps} / 5
          </div>
        </div>

        {isComplete && (
          <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '14px', padding: '16px', textAlign: 'center', marginTop: '16px' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎁</div>
            <div style={{ fontWeight: 700, color: '#34d399', fontSize: '14px' }}>¡Premio Disponible!</div>
          </div>
        )}

        <button onClick={() => setShowQR(!showQR)} style={{ 
          width: '100%', padding: '14px', marginTop: '16px', 
          background: 'rgba(212, 175, 55, 0.12)', color: '#f3e5ab', border: '1px solid #d4af37', borderRadius: '14px', 
          fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s' 
        }}>
          {showQR ? 'Ocultar QR' : 'Mostrar mi QR'}
        </button>

        {showQR && (
          <div style={{ background: '#fff', padding: '18px', borderRadius: '16px', marginTop: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <QRCodeSVG value={qrUrl} size={150} level="H" />
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', fontFamily: 'monospace' }}>{clientData.qrToken}</div>
          </div>
        )}

      </div>
    </div>
  );
}
