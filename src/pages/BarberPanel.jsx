import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, updateDoc, doc, addDoc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const SYSTEM_CONFIG = {
  TOTAL_STAMPS: 5,
  ADMIN_EMAIL: 'atakirumba99@gmail.com', 
  BRAND_NAME: "BLESSING'S"
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@400;500;600;700&display=swap');
    
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --bg-base: #0a0a0c;
      --gold: #d4af37;
      --gold-light: #f3e5ab;
      --gold-glow: rgba(212, 175, 55, 0.25);
      --gold-dim: rgba(212, 175, 55, 0.1);
      --glass-bg: rgba(18, 18, 24, 0.65);
      --glass-border: rgba(212, 175, 55, 0.18);
      --text-main: #fcfcfc;
      --text-muted: #a1a1aa;
      --green: #34d399;
      --red: #f87171;
      --font-head: 'Outfit', sans-serif;
      --font-body: 'Inter', sans-serif;
    }

    body { 
      background-color: var(--bg-base); 
      background-image: linear-gradient(rgba(10, 10, 12, 0.85), rgba(10, 10, 12, 0.92)), url('/img/fondo.jpeg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      color: var(--text-main); 
      font-family: var(--font-body); 
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    /* HEADER GLASS */
    .admin-header { 
      background: rgba(10, 10, 12, 0.8); 
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--glass-border); 
      padding: 16px 28px; 
      display: flex; align-items: center; justify-content: space-between; 
      position: sticky; top: 0; z-index: 50;
    }
    .header-title { font-family: var(--font-head); font-size: 22px; font-weight: 700; color: var(--text-main); letter-spacing: 0.08em; }
    .header-sub { font-size: 10px; color: var(--gold); font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; }

    .logout-btn { 
      background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-muted); 
      padding: 8px 16px; border-radius: 10px; font-family: var(--font-body); font-size: 12px; font-weight: 500; 
      cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(10px);
    }
    .logout-btn:hover { border-color: var(--red); color: var(--red); background: rgba(248, 113, 113, 0.1); }

    /* TABS */
    .tabs-container { display: flex; justify-content: center; gap: 8px; margin: 24px auto 0; max-width: 800px; padding: 0 24px; flex-wrap: wrap; }
    .tab-btn { 
      flex: 1; min-width: 100px; padding: 11px; 
      background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-muted); 
      font-family: var(--font-body); font-size: 12px; font-weight: 500; letter-spacing: 0.05em; border-radius: 12px; 
      cursor: pointer; transition: all 0.3s; backdrop-filter: blur(10px);
    }
    .tab-btn.active { 
      background: var(--gold-dim); border-color: var(--gold); color: var(--gold-light); 
      box-shadow: 0 0 15px var(--gold-glow); font-weight: 600;
    }

    /* STATS CARDS */
    .stats-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 24px; max-width: 800px; margin: 0 auto; }
    .stat-card { 
      background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 18px; padding: 20px; 
      display: flex; flex-direction: column; gap: 6px; backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .stat-label { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
    .stat-value { font-family: var(--font-head); font-size: 28px; font-weight: 700; color: var(--text-main); line-height: 1; }

    /* SEARCH */
    .search-wrap { padding: 0 24px; max-width: 800px; margin: 0 auto; }
    .search-box { 
      display: flex; align-items: center; gap: 12px; 
      background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 14px; padding: 12px 18px; 
      backdrop-filter: blur(10px); transition: border-color 0.3s;
    }
    .search-box:focus-within { border-color: var(--gold); box-shadow: 0 0 12px var(--gold-dim); }
    .search-input { flex: 1; background: none; border: none; outline: none; color: var(--text-main); font-family: var(--font-body); font-size: 14px; }
    .search-input::placeholder { color: var(--text-muted); }

    /* CLIENTS */
    .clients-wrap { padding: 20px 24px; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
    .client-card { 
      background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 18px 20px; 
      display: flex; align-items: center; gap: 16px; transition: all 0.3s; cursor: pointer; backdrop-filter: blur(10px);
    }
    .client-card:hover { border-color: rgba(212, 175, 55, 0.4); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
    .client-card.expanded { border-color: var(--gold); background: rgba(22, 22, 30, 0.85); border-radius: 16px 16px 0 0; }

    .avatar { 
      width: 44px; height: 44px; border-radius: 12px; 
      background: var(--gold-dim); border: 1px solid var(--gold); 
      display: flex; align-items: center; justify-content: center; 
      font-family: var(--font-head); font-size: 18px; font-weight: 700; color: var(--gold); flex-shrink: 0;
    }
    .avatar.complete { background: rgba(52, 211, 153, 0.15); border-color: var(--green); color: var(--green); }

    .client-info { flex: 1; min-width: 0; }
    .client-name { font-size: 15px; font-weight: 600; color: var(--text-main); }
    .client-email { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

    .mini-stamps { display: flex; gap: 6px; flex-shrink: 0; }
    .mini-dot { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid var(--text-muted); transition: all 0.2s; }
    .mini-dot.on { background: var(--gold); border-color: var(--gold); box-shadow: 0 0 8px var(--gold-glow); }
    .mini-dot.done { background: var(--green); border-color: var(--green); box-shadow: 0 0 8px rgba(52, 211, 153, 0.4); }

    .badge { font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 20px; flex-shrink: 0; }
    .badge.complete { background: rgba(52, 211, 153, 0.15); color: var(--green); border: 1px solid rgba(52, 211, 153, 0.3); }
    .badge.progress { background: var(--gold-dim); color: var(--gold); border: 1px solid var(--glass-border); }

    /* EXPANDED */
    .client-detail { 
      background: rgba(22, 22, 30, 0.85); border: 1px solid var(--gold); border-top: none; 
      border-radius: 0 0 16px 16px; padding: 20px 24px; backdrop-filter: blur(16px);
    }

    .stamps-row { display: flex; gap: 12px; justify-content: center; margin: 16px 0; }
    .stamp-lg { 
      width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;
      border: 1.5px solid var(--glass-border); background: rgba(255,255,255,0.02); transition: all 0.3s;
    }
    .stamp-lg.on { border-color: var(--gold); background: var(--gold-dim); box-shadow: 0 0 15px var(--gold-glow); color: var(--gold); }

    .action-row { display: flex; gap: 10px; }
    .btn-add { 
      flex: 1; padding: 12px; background: linear-gradient(135deg, #d4af37, #aa7c11); color: #0a0a0c; border: none; border-radius: 10px; 
      font-family: var(--font-body); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s; 
      box-shadow: 0 4px 15px var(--gold-glow);
    }
    .btn-add:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-add:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(100%); }
    
    .btn-reset { 
      padding: 12px 18px; background: transparent; color: var(--text-muted); border: 1px solid var(--glass-border); border-radius: 10px; 
      font-family: var(--font-body); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .btn-reset:hover { border-color: var(--red); color: var(--red); background: rgba(248, 113, 113, 0.1); }

    /* CITAS Y PRODUCTOS */
    .list-item { 
      background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 18px; margin-bottom: 12px; 
      backdrop-filter: blur(10px); display: flex; align-items: center; gap: 16px;
    }
    .form-producto { 
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: var(--glass-bg); padding: 24px; 
      border-radius: 18px; border: 1px solid var(--glass-border); margin-bottom: 24px; backdrop-filter: blur(10px);
    }
    .input-dark { 
      width: 100%; padding: 12px 16px; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); border-radius: 10px; 
      color: var(--text-main); font-family: var(--font-body); outline: none; transition: border 0.3s; font-size: 14px;
    }
    .input-dark:focus { border-color: var(--gold); }
    textarea.input-dark { resize: vertical; min-height: 100px; }

    .toast { 
      position: fixed; top: 24px; left: 50%; transform: translateX(-50%); 
      background: rgba(52, 211, 153, 0.15); backdrop-filter: blur(10px); border: 1px solid var(--green); color: var(--green); 
      padding: 10px 20px; border-radius: 20px; font-size: 12px; font-weight: 600; z-index: 300; 
    }
    .empty { text-align: center; padding: 60px 20px; color: var(--text-muted); font-size: 13px; }
  `}</style>
);

export default function BarberPanel({ user }) {
  const [activeTab, setActiveTab] = useState('clientes');
  const [clients, setClients] = useState([]);
  const [citas, setCitas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', stock: '' });

  const [anuncioData, setAnuncioData] = useState({
    activo: false,
    badge: '✦ Evento Especial',
    titulo: 'BARBER TALENT Evento',
    descripcion: '💈 ¡El evento más esperado del año ya tiene fecha! 💈\n\nEste 30 de agosto, celebramos el Día del Barbero con el encuentro más prestigioso del país.',
    imagen1: '/img/anuncio3.jpeg',
    imagen2: '/img/anuncio2.jpeg'
  });

  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.email !== SYSTEM_CONFIG.ADMIN_EMAIL).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setClients(data);
    });
    const unsubCitas = onSnapshot(collection(db, 'citas'), (snap) => {
      setCitas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const unsubProductos = onSnapshot(collection(db, 'productos'), (snap) => {
      setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const fetchAnuncio = async () => {
      const docRef = doc(db, 'settings', 'anuncio');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setAnuncioData(docSnap.data());
    };
    fetchAnuncio();

    return () => { unsubClients(); unsubCitas(); unsubProductos(); };
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const addStamp = async (client) => {
    if (client.stamps >= SYSTEM_CONFIG.TOTAL_STAMPS) return;
    try {
      await updateDoc(doc(db, 'clients', client.id), { stamps: (client.stamps || 0) + 1 });
      showToast(`Sello asignado a ${client.name}`);
    } catch { showToast('Error al actualizar'); }
  };

  const resetStamps = async (client) => {
    if (!window.confirm(`¿Reiniciar tarjeta de ${client.name}?`)) return;
    try {
      await updateDoc(doc(db, 'clients', client.id), { stamps: 0 });
      showToast('Tarjeta reiniciada');
    } catch { showToast('Error al reiniciar'); }
  };

  const crearProducto = async (e) => {
    e.preventDefault();
    if (!nuevoProducto.nombre || !nuevoProducto.precio) return;
    try {
      await addDoc(collection(db, 'productos'), {
        nombre: nuevoProducto.nombre, precio: Number(nuevoProducto.precio), stock: Number(nuevoProducto.stock) || 0, fecha: new Date().toISOString()
      });
      showToast('Producto agregado');
      setNuevoProducto({ nombre: '', precio: '', stock: '' });
    } catch { showToast('Error al crear producto'); }
  };

  const guardarAnuncio = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'anuncio'), anuncioData);
      showToast('Anuncio actualizado correctamente');
    } catch { showToast('Error al guardar'); }
  };

  const filteredClients = clients.filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase()));
  const totalClients = clients.length;
  const completedRewards = clients.filter(c => c.stamps >= SYSTEM_CONFIG.TOTAL_STAMPS).length;
  const totalStampsGiven = clients.reduce((acc, c) => acc + (c.stamps || 0), 0);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', background: '#0a0a0c' }}>Cargando panel...</div>;

  return (
    <>
      <GlobalStyles />
      {toast && <div className="toast">{toast}</div>}

      <div style={{ paddingBottom: '60px' }}>
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/img/logo.jpeg" alt="Logo" style={{ width: 40, height: 40, borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(212,175,55,0.4)' }} />
            <div>
              <div className="header-title">{SYSTEM_CONFIG.BRAND_NAME}</div>
              <div className="header-sub">Admin Panel</div>
            </div>
          </div>
          <button className="logout-btn" onClick={() => signOut(auth)}>Salir</button>
        </div>

        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === 'clientes' ? 'active' : ''}`} onClick={() => setActiveTab('clientes')}>Clientes</button>
          <button className={`tab-btn ${activeTab === 'citas' ? 'active' : ''}`} onClick={() => setActiveTab('citas')}>Citas</button>
          <button className={`tab-btn ${activeTab === 'productos' ? 'active' : ''}`} onClick={() => setActiveTab('productos')}>Productos</button>
          <button className={`tab-btn ${activeTab === 'anuncio' ? 'active' : ''}`} onClick={() => setActiveTab('anuncio')}>Anuncio</button>
        </div>

        {activeTab === 'clientes' && (
          <>
            <div className="stats-bar">
              <div className="stat-card"><div className="stat-label">Clientes</div><div className="stat-value">{totalClients}</div></div>
              <div className="stat-card"><div className="stat-label">Premios</div><div className="stat-value" style={{ color: 'var(--green)' }}>{completedRewards}</div></div>
              <div className="stat-card"><div className="stat-label">Sellos</div><div className="stat-value" style={{ color: '#d4af37' }}>{totalStampsGiven}</div></div>
            </div>

            <div className="search-wrap">
              <div className="search-box">
                <span style={{ color: 'var(--text-muted)' }}>🔍</span>
                <input className="search-input" placeholder="Buscar cliente..." value={search} onChange={e => { setSearch(e.target.value); setExpanded(null); }} />
              </div>
            </div>

            <div className="clients-wrap">
              {filteredClients.map((client) => {
                const isExpanded = expanded === client.id;
                const isComplete = client.stamps >= SYSTEM_CONFIG.TOTAL_STAMPS;
                return (
                  <div key={client.id}>
                    <div className={`client-card ${isExpanded ? 'expanded' : ''}`} onClick={() => setExpanded(isExpanded ? null : client.id)}>
                      <div className={`avatar ${isComplete ? 'complete' : ''}`}>{isComplete ? '★' : (client.name || '?')[0].toUpperCase()}</div>
                      <div className="client-info">
                        <div className="client-name">{client.name || 'Sin nombre'}</div>
                        <div className="client-email">{client.email}</div>
                      </div>
                      <div className="mini-stamps">
                        {Array.from({ length: SYSTEM_CONFIG.TOTAL_STAMPS }).map((_, i) => (
                          <div key={i} className={`mini-dot ${i < client.stamps ? (isComplete ? 'done' : 'on') : ''}`} />
                        ))}
                      </div>
                      <div className={`badge ${isComplete ? 'complete' : 'progress'}`}>{client.stamps || 0}/5</div>
                    </div>

                    {isExpanded && (
                      <div className="client-detail">
                        <div className="stamps-row">
                          {Array.from({ length: SYSTEM_CONFIG.TOTAL_STAMPS }).map((_, i) => (
                            <div key={i} className={`stamp-lg ${i < client.stamps ? 'on' : ''}`}>{i < client.stamps ? '★' : ''}</div>
                          ))}
                        </div>
                        <div className="action-row">
                          <button className="btn-add" disabled={isComplete} onClick={(e) => { e.stopPropagation(); addStamp(client); }}>{isComplete ? 'Completado' : 'Asignar Sello'}</button>
                          <button className="btn-reset" onClick={(e) => { e.stopPropagation(); resetStamps(client); }}>Reiniciar</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'citas' && (
          <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 24px' }}>
            {citas.length === 0 ? <div className="empty">No hay citas pendientes.</div> : (
              citas.map(cita => (
                <div key={cita.id} className="list-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#d4af37' }}>{cita.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {cita.telefono}</div>
                    <div style={{ marginTop: '6px', fontSize: '13px' }}>Servicios: {cita.servicios?.join(', ')}</div>
                  </div>
                  <div className="badge progress">{cita.estado || 'Pendiente'}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'productos' && (
          <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 24px' }}>
            <form onSubmit={crearProducto} className="form-producto">
              <input className="input-dark" type="text" placeholder="Nombre del producto" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
              <input className="input-dark" type="number" placeholder="Precio (L)" value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} required />
              <input className="input-dark" type="number" placeholder="Stock" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} />
              <button type="submit" className="btn-add">Guardar Producto</button>
            </form>

            {productos.map(prod => (
              <div key={prod.id} className="list-item" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{prod.nombre}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stock: {prod.stock}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--green)' }}>L {prod.precio}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'anuncio' && (
          <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 24px' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', color: 'var(--text-main)', fontSize: '20px', marginBottom: '16px' }}>Configuración del Anuncio</h2>
            
            <form onSubmit={guardarAnuncio} className="form-producto" style={{ gridTemplateColumns: '1fr' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                <label style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '13px' }}>Mostrar anuncio en la página web</label>
                <input 
                  type="checkbox" 
                  checked={anuncioData.activo} 
                  onChange={e => setAnuncioData({...anuncioData, activo: e.target.checked})}
                  style={{ width: '18px', height: '18px', accentColor: '#d4af37', cursor: 'pointer' }}
                />
              </div>

              <input className="input-dark" type="text" placeholder="Badge (Ej: ✦ Evento Especial)" value={anuncioData.badge} onChange={e => setAnuncioData({...anuncioData, badge: e.target.value})} required />
              <input className="input-dark" type="text" placeholder="Título del anuncio" value={anuncioData.titulo} onChange={e => setAnuncioData({...anuncioData, titulo: e.target.value})} required />
              <textarea className="input-dark" placeholder="Descripción" value={anuncioData.descripcion} onChange={e => setAnuncioData({...anuncioData, descripcion: e.target.value})} rows="4" required />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input className="input-dark" type="text" placeholder="Imagen 1" value={anuncioData.imagen1} onChange={e => setAnuncioData({...anuncioData, imagen1: e.target.value})} />
                <input className="input-dark" type="text" placeholder="Imagen 2" value={anuncioData.imagen2} onChange={e => setAnuncioData({...anuncioData, imagen2: e.target.value})} />
              </div>
              
              <button type="submit" className="btn-add">Guardar Cambios del Anuncio</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}