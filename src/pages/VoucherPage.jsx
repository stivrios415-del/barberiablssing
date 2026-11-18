import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const generateToken = () => Math.random().toString(36).substr(2, 16).toUpperCase();

export default function VoucherPage({ user }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [client, setClient] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, valid, invalid, success
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    const verifyVoucher = async () => {
      if (!uid || !token) {
        setStatus('invalid');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'clients', uid));
        if (snap.exists() && snap.data().qrToken === token) {
          setClient({ id: snap.id, ...snap.data() });
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch {
        setStatus('invalid');
      }
    };
    verifyVoucher();
  }, [uid, token]);

  const handleAddStamp = async () => {
    const currentStamps = client.stamps || 0;
    if (currentStamps >= 5) return;
    await updateDoc(doc(db, 'clients', uid), {
      stamps: currentStamps + 1,
      qrToken: generateToken() // Regenera el token para evitar doble escaneo
    });
    setActionMsg('¡Sello agregado con éxito!');
    setStatus('success');
  };

  const handleRedeem = async () => {
    await updateDoc(doc(db, 'clients', uid), {
      stamps: 0,
      qrToken: generateToken()
    });
    setActionMsg('¡Premio canjeado y tarjeta reiniciada!');
    setStatus('success');
  };

  const containerStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    backgroundColor: '#0a0a0c',
    backgroundImage: "linear-gradient(rgba(10, 10, 12, 0.85), rgba(10, 10, 12, 0.92)), url('/img/fondo.jpeg')",
    backgroundSize: 'cover', backgroundPosition: 'center', color: '#fcfcfc', fontFamily: "'Inter', sans-serif"
  };

  const cardStyle = {
    width: '100%', maxWidth: '380px', background: 'rgba(18, 18, 24, 0.75)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '24px', padding: '32px 24px', textAlign: 'center'
  };

  if (status === 'loading') return <div style={containerStyle}>Verificando código QR...</div>;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <img src="/img/logo.jpeg" alt="Logo" style={{ width: 65, height: 65, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d4af37', margin: '0 auto 14px' }} />
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', marginBottom: '6px' }}>BLESSING'S</h2>

        {status === 'invalid' && (
          <>
            <div style={{ color: '#f87171', fontWeight: 600, margin: '20px 0' }}>❌ Código QR inválido o ya utilizado</div>
            <button onClick={() => navigate('/')} style={{ padding: '12px 20px', background: 'rgba(212,175,55,0.15)', border: '1px solid #d4af37', color: '#f3e5ab', borderRadius: '10px', cursor: 'pointer' }}>
              Volver al inicio
            </button>
          </>
        )}

        {status === 'valid' && client && (
          <>
            <p style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '20px' }}>Validación de Cliente</p>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(212,175,55,0.15)', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>{client.name || 'Cliente'}</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '12px' }}>{client.email}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#d4af37' }}>{client.stamps || 0} / 5 Sellos</div>
            </div>

            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(client.stamps || 0) < 5 ? (
                  <button onClick={handleAddStamp} style={{ padding: '14px', background: 'linear-gradient(135deg, #d4af37, #aa7c11)', color: '#0a0a0c', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    + Asignar 1 Sello
                  </button>
                ) : (
                  <button onClick={handleRedeem} style={{ padding: '14px', background: '#34d399', color: '#0a0a0c', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    🎁 Canjear Premio (Reiniciar)
                  </button>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: '#d4af37' }}>Inicia sesión como administrador para gestionar los sellos.</p>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ color: '#34d399', fontWeight: 600, fontSize: '16px', margin: '20px 0' }}>✅ {actionMsg}</div>
            <button onClick={() => navigate('/admin')} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #d4af37, #aa7c11)', color: '#0a0a0c', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
              Ir al Panel Admin
            </button>
          </>
        )}
      </div>
    </div>
  );
}