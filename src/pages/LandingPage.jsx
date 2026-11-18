import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../LandingPage.css';

const galeriaFotos = [
  { src: '/img/g1.jpeg',   cat: 'diseno', tag: 'diseno de escudo del vida', size: 'wide' },
  { src: '/img/g2.jpeg',   cat: 'diseno', tag: 'Diseño',          size: ''     },
  { src: '/img/g3.jpeg',   cat: 'corte',  tag: 'Degradado',       size: ''     },
  { src: '/img/g4.jpeg',   cat: 'corte',  tag: 'Taper Fade',      size: ''     },
  { src: '/img/g5.jpeg',   cat: 'tinte',  tag: 'Tinte',           size: 'tall' },
  { src: '/img/g6.jpeg',   cat: 'corte',  tag: 'Corte & Barba',   size: ''     },
  { src: '/img/g7.jpeg',   cat: 'tinte',  tag: 'Skin Fade',       size: ''     },
  { src: '/img/g8.jpeg',   cat: 'diseno', tag: 'Fade Clásico',    size: 'wide' },
  { src: '/img/g9.jpeg',   cat: 'tinte',  tag: 'Corte',           size: ''     },
  { src: '/img/g10.jpeg',  cat: 'corte',  tag: 'Degradado',       size: ''     },
  { src: '/img/g11.jpeg',  cat: 'corte',  tag: 'Corte',           size: ''     },
  { src: '/img/g12.jpeg',  cat: 'corte',  tag: 'Fade',            size: ''     },
  { src: '/img/g13.jpeg',  cat: 'diseno', tag: 'Skin Fade',       size: 'tall' },
  { src: '/img/g14.jpeg',  cat: 'corte',  tag: 'Corte & Barba',   size: ''     },
  { src: '/img/g15.jpeg',  cat: 'diseno', tag: 'Degradado',       size: ''     },
  { src: '/img/g16.jpeg',  cat: 'diseno', tag: 'Tinte',           size: 'wide' },
  { src: '/img/g17.jpeg',  cat: 'corte',  tag: 'Corte Infantil',  size: ''     },
  { src: '/img/g18.jpeg',  cat: 'diseno', tag: 'diseno',          size: ''     },
  { src: '/img/g19.jpeg',  cat: 'corte',  tag: 'Corte & Diseño',  size: ''     },
  { src: '/img/g20.jpeg',  cat: 'diseno', tag: 'Fade Clásico',    size: ''     },
  { src: '/img2/g1.jpeg',  cat: 'tinte',  tag: 'Corte & Fade',    size: 'wide' },
  { src: '/img2/g2.jpeg',  cat: 'tinte',  tag: 'Degradado',       size: ''     },
  { src: '/img2/g3.jpeg',  cat: 'tinte',  tag: 'Fade',            size: ''     },
  { src: '/img2/g4.jpeg',  cat: 'tinte',  tag: 'Corte',           size: ''     },
  { src: '/img2/g5.jpeg',  cat: 'corte',  tag: 'Ambiente',        size: 'wide' },
  { src: '/img2/g6.jpeg',  cat: 'corte',  tag: 'Skin Fade',       size: ''     },
  { src: '/img2/g7.jpeg',  cat: 'corte',  tag: 'Corte & Barba',   size: ''     },
  { src: '/img2/g8.jpeg',  cat: 'corte',  tag: 'Corte',           size: ''     },
  { src: '/img2/g9.jpeg',  cat: 'corte',  tag: 'Fade',            size: ''     },
  { src: '/img2/g10.jpeg', cat: 'corte',  tag: 'Ambiente',        size: 'tall' },
  { src: '/img2/g11.jpeg', cat: 'corte',  tag: 'Local',           size: ''     },
  { src: '/img2/g12.jpeg', cat: 'corte',  tag: 'Local',           size: ''     },
  { src: '/img3/e1.jpeg',  cat: 'corte',  tag: 'Barber',          size: ''     },
  { src: '/img3/g2.jpeg',  cat: 'corte',  tag: 'fade',            size: ''     },
  { src: '/img3/g3.jpeg',  cat: 'corte',  tag: 'fade',            size: ''     },
  { src: '/img3/g4.jpeg',  cat: 'tinte',  tag: 'tinte blanco',    size: ''     },
  { src: '/img3/g5.jpeg',  cat: 'tinte',  tag: 'diseno de azul',  size: ''     },
];

export default function LandingPage({ user }) {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // Estados de la UI
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  
  // Estados del Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Estados del Formulario
  const [formData, setFormData] = useState({ nombre: '', gmail: '', telefono: '', categorias: [] });
  const [formError, setFormError] = useState('');

  // Estados del Anuncio Dinámico
  const [anuncioData, setAnuncioData] = useState(null);
  const [showAnuncio, setShowAnuncio] = useState(false);
  const [annSlide, setAnnSlide] = useState(0);

  // Efecto para el movimiento del mouse en el Hero
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const handleMouseMove = (e) => {
      heroEl.style.setProperty('--mouse-x', e.clientX + 'px');
      heroEl.style.setProperty('--mouse-y', e.clientY + 'px');
    };
    heroEl.addEventListener('mousemove', handleMouseMove);
    return () => heroEl.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Efecto para bloquear el scroll cuando hay modales abiertos
  useEffect(() => {
    if (mobileMenuOpen || formOpen || lightboxOpen || showAnuncio) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen, formOpen, lightboxOpen, showAnuncio]);

  // Cargar Anuncio desde Firebase
  useEffect(() => {
    const fetchAnuncio = async () => {
      const docRef = doc(db, 'settings', 'anuncio');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAnuncioData(data);
        if (data.activo) {
          setTimeout(() => setShowAnuncio(true), 1000);
        }
      }
    };
    fetchAnuncio();
  }, []);

  const navGo = (id) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckbox = (cat) => {
    setFormData(prev => {
      const isChecked = prev.categorias.includes(cat);
      return {
        ...prev,
        categorias: isChecked 
          ? prev.categorias.filter(c => c !== cat)
          : [...prev.categorias, cat]
      };
    });
  };

  const enviarInscripcion = (e) => {
    e.preventDefault();
    setFormError('');

    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(formData.gmail)) {
      setFormError('Ingresa un correo @gmail.com válido');
      return;
    }
    if (formData.categorias.length === 0) {
      setFormError('Selecciona al menos una categoría');
      return;
    }

    const categoriasTexto = formData.categorias.join(', ');
    const mensaje = `Hola, quiero inscribirme al Barber Talent Evento:%0A` +
      `Nombre: ${encodeURIComponent(formData.nombre)}%0A` +
      `Gmail: ${encodeURIComponent(formData.gmail)}%0A` +
      `Teléfono: ${encodeURIComponent(formData.telefono)}%0A` +
      `Categorías: ${encodeURIComponent(categoriasTexto)}`;

    window.open(`https://wa.me/50497592085?text=${mensaje}`, '_blank');
    
    setFormOpen(false);
    setFormData({ nombre: '', gmail: '', telefono: '', categorias: [] });
  };

  const filteredPhotos = filterCat === 'all' ? galeriaFotos : galeriaFotos.filter(p => p.cat === filterCat);

  const openLB = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const shiftLB = (dir) => {
    setLightboxIndex((prev) => (prev + dir + filteredPhotos.length) % filteredPhotos.length);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <a href="#" className="nav-brand">
          <img className="brand-logo" src="/img/logo.jpeg" alt="Blessing's Barbershop" />
          <div className="brand-text-block">
            <span className="brand-name">Blessing's</span>
            <span className="brand-sub">Barbershop</span>
          </div>
        </a>

        <div className="nav-pill">
          <button className="nav-btn active" onClick={() => navGo('#hero')}>Inicio</button>
          <button className="nav-btn" onClick={() => navGo('#membresia')}>Membresía</button>
          <button className="nav-btn" onClick={() => navGo('#galeria')}>Galería</button>
          <button className="nav-btn" onClick={() => navGo('#contacto')}>Contacto</button>
        </div>

        <div className="nav-actions">
          <button 
            onClick={() => navigate(user ? (user.email === 'tatakirumba99@gmail.com' ? '/admin' : '/mi-tarjeta') : '/login')}
            style={{ background: 'rgba(200,169,110,0.15)', color: '#C8A96E', border: '1px solid #C8A96E', padding: '0.5rem 1rem', borderRadius: '9999px', cursor: 'pointer', marginRight: '10px' }}
          >
            {user ? 'Mi Perfil' : 'Mi Tarjeta'}
          </button>

          <a className="btn-book" href="https://wa.me/50497592085?text=Hola%2C%20quiero%20reservar%20una%20cita%20en%20Blessing's%20Barbershop" target="_blank" rel="noopener noreferrer">
            Reservar Cita
          </a>
          <button className="btn-menu" onClick={() => setMobileMenuOpen(true)} aria-label="Menú">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* MENÚ MÓVIL */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
        <button className="mobile-nav-btn" onClick={() => navGo('#hero')}>Inicio</button>
        <button className="mobile-nav-btn" onClick={() => navGo('#membresia')}>Membresía</button>
        <button className="mobile-nav-btn" onClick={() => navGo('#galeria')}>Galería</button>
        <button className="mobile-nav-btn" onClick={() => navGo('#contacto')}>Contacto</button>
        <a className="mobile-wa-btn" href="https://wa.me/50497592085?text=Hola%2C%20quiero%20reservar%20una%20cita%20en%20Blessing's%20Barbershop" target="_blank" rel="noopener noreferrer">
          Reservar Cita
        </a>
      </div>

      {/* HERO SECTION */}
      <div className="hero" id="hero" ref={heroRef}>
        <div className="scanline"></div>
        <div className="base-bg"></div>
        <div className="reveal-layer"></div>

        <div className="heading-wrapper">
          <p className="eyebrow">Más que un corte, una experiencia</p>
          <h1>
            <span className="title-line-1">Blessing's</span>
            <span className="title-line-2">Barbershop</span>
          </h1>
          <div className="title-divider"></div>
        </div>

        <div className="bottom-left">
          <p className="hours-label">Horario</p>
          <p className="hours-text">
            Lun – Vie: 9 AM – 6 PM<br />
            Sábado: 8 AM – 6 PM<br />
            Domingo: Cerrado
          </p>
        </div>

        <div className="bottom-right">
          <p className="desc-text">Precisión en cada trazo. Arte en cada degradado. Únete a nuestra membresía y vive una experiencia VIP.</p>
          <a className="btn-cta" href="https://wa.me/50497592085?text=Hola%2C%20quiero%20reservar%20una%20cita%20en%20Blessing's%20Barbershop" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Reservar Cita
          </a>
        </div>

        <p className="cursor-hint">Mueve el cursor para revelar el color</p>
      </div>

      {/* MEMBRESÍA */}
      <section className="membership" id="membresia">
        <div className="section-inner">
          <p className="section-eyebrow">Acceso exclusivo</p>
          <h2 className="section-title">Membresía</h2>
          <p className="section-sub">Beneficios de la membresía</p>
          <div className="section-divider"></div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
              <div><p className="benefit-title">Reserva semanal</p><p className="benefit-desc">La reservación de <strong>un cupo por semana</strong> garantizado para ti.</p></div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><svg viewBox="0 0 24 24"><path d="M20.59 13.41L13.42 20.58a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div>
              <div><p className="benefit-title">40% Descuento</p><p className="benefit-desc"><strong>40% de descuento</strong> en corte y barba completa.</p></div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><svg viewBox="0 0 24 24"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg></div>
              <div><p className="benefit-title">30% Descuento</p><p className="benefit-desc"><strong>30% de descuento</strong> en cortes normales.</p></div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <div><p className="benefit-title">Horario extendido</p><p className="benefit-desc">Reserva antes de las <strong>9:00 AM</strong> y hasta una hora después de las <strong>6:00 PM</strong>.</p></div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <div><p className="benefit-title">Skin Care</p><p className="benefit-desc">Mascarilla negra + exfoliación + hidratación de la piel con <strong>Vitamina-E</strong>.</p></div>
            </div>
          </div>

          <h3 className="other-title">Otros Beneficios</h3>
          <div className="other-grid">
            <div className="benefit-card">
              <div className="benefit-icon"><svg viewBox="0 0 24 24"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg></div>
              <div><p className="benefit-title">Cumpleaños</p><p className="benefit-desc">Atención totalmente <strong>gratis</strong> el día de tu cumpleaños.</p></div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg></div>
              <div><p className="benefit-title">Días festivos</p><p className="benefit-desc">Precios normales y reservación en <strong>días festivos</strong> del año.</p></div>
            </div>
          </div>

          <div className="vip-banner">
            <p className="vip-label">Club exclusivo</p>
            <h2 className="vip-title">Sé parte del <span>Club VIP</span></h2>
            <p className="vip-desc">Disfruta de una experiencia exclusiva con todos los beneficios de la membresía Blessing's Barbershop.</p>
            <a className="btn-vip" href="https://wa.me/50497592085?text=Hola%2C%20quiero%20unirme%20al%20Club%20VIP%20de%20Blessing's%20Barbershop" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Unirme al Club VIP
            </a>
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section className="gallery" id="galeria">
        <div className="section-inner">
          <p className="section-eyebrow">Nuestro trabajo</p>
          <h2 className="section-title">Galería</h2>
          <p className="section-sub">Cada corte, una obra</p>
          <div className="section-divider"></div>

          <div className="filter-bar">
            <button className={`filter-btn ${filterCat === 'all' ? 'active' : ''}`} onClick={() => setFilterCat('all')}>Todos</button>
            <button className={`filter-btn ${filterCat === 'corte' ? 'active' : ''}`} onClick={() => setFilterCat('corte')}>✂&nbsp; Cortes</button>
            <button className={`filter-btn ${filterCat === 'tinte' ? 'active' : ''}`} onClick={() => setFilterCat('tinte')}>🎨&nbsp; Tintes</button>
            <button className={`filter-btn ${filterCat === 'diseno' ? 'active' : ''}`} onClick={() => setFilterCat('diseno')}>⚡&nbsp; Diseños</button>
          </div>

          <div className="gallery-grid">
            <div className="gallery-item g-wide" style={{ cursor: 'default' }}>
              <span className="video-badge">▶ En vivo</span>
              <video src="/img/clip1.mp4" autoPlay loop muted playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}></video>
              <div className="gallery-overlay" style={{ opacity: 1, background: 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 40%)' }}>
                <span className="gallery-tag">Nuestro trabajo</span>
              </div>
            </div>
            <div className="gallery-item g-wide" style={{ cursor: 'default' }}>
              <span className="video-badge">▶ En vivo</span>
              <video src="/img/clip2.mp4" autoPlay loop muted playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}></video>
              <div className="gallery-overlay" style={{ opacity: 1, background: 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 40%)' }}>
                <span className="gallery-tag">Nuestro trabajo</span>
              </div>
            </div>

            {filteredPhotos.map((foto, i) => {
              const sizeClass = foto.size === 'wide' ? ' g-wide' : foto.size === 'tall' ? ' g-tall' : '';
              return (
                <div key={i} className={`gallery-item${sizeClass}`} onClick={() => openLB(i)}>
                  <div className="photo-skeleton"></div>
                  <img src={foto.src} alt={`Foto ${i+1}`} loading="lazy" />
                  <div className="gallery-overlay">
                    <span className="gallery-tag">{foto.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section className="contact" id="contacto">
        <div className="contact-inner">
          <p className="section-eyebrow">Encuéntranos</p>
          <h2 className="section-title">Contacto</h2>
          <p className="section-sub">Reserva tu cita hoy</p>
          <div className="section-divider"></div>

          <div className="contact-cards">
            <a className="contact-card" href="https://wa.me/50497592085" target="_blank" rel="noopener noreferrer">
              <div className="contact-card-icon">
                <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
              </div>
              <p className="contact-card-label">WhatsApp · Teléfono</p>
              <p className="contact-card-value">+504 9759-2085</p>
              <p className="contact-card-sub">Escríbenos para reservar</p>
            </a>

            <a className="contact-card" href="https://www.instagram.com/_elnegrobarberhn?igsh=MTZseTNxZmI4NjdmNw==" target="_blank" rel="noopener noreferrer">
              <div className="contact-card-icon">
                <svg className="ig-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <p className="contact-card-label">Instagram</p>
              <p className="contact-card-value">@_elnegrobarberhn</p>
              <p className="contact-card-sub">Síguenos para ver más trabajo</p>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">
          <img src="/img/logo.jpeg" alt="Logo" />
          <span className="footer-logo-name">Blessing's Barbershop</span>
        </div>
        <p className="footer-text">© 2026 <span className="footer-gold">Blessing's Barbershop</span> · Más que un corte, una experiencia.</p>
      </footer>

      {/* MODAL LIGHTBOX */}
      {lightboxOpen && (
        <div className="lightbox open" onClick={(e) => { if(e.target === e.currentTarget) setLightboxOpen(false); }}>
          <button className="lb-close" onClick={() => setLightboxOpen(false)}>✕</button>
          <button className="lb-arrow lb-prev" onClick={() => shiftLB(-1)}>&#8592;</button>
          <img src={filteredPhotos[lightboxIndex].src} alt="" />
          <button className="lb-arrow lb-next" onClick={() => shiftLB(1)}>&#8594;</button>
          <span className="lb-counter">{lightboxIndex + 1} / {filteredPhotos.length}</span>
        </div>
      )}

      {/* MODAL BARBER TALENT FORM */}
      {formOpen && (
        <div className="form-overlay" onClick={(e) => { if(e.target.className === 'form-overlay') setFormOpen(false); }}>
          <div className="form-modal">
            <button className="form-close" onClick={() => setFormOpen(false)}>✕</button>
            <span className="form-badge">✦ Inscripción</span>
            <h2 className="form-title">Regístrate al <span>Evento</span></h2>
            <p className="form-desc">Completa tus datos para asegurar tu cupo en el Barber Talent.</p>
            <p className="form-desc">Metodo de pago Transferencia a BAC</p>

            <form onSubmit={enviarInscripcion}>
              <div className="form-field">
                <label className="form-label">Nombre completo</label>
                <input className="form-input" type="text" placeholder="Ej. Juan Pérez" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div className="form-field">
                <label className="form-label">Correo Gmail</label>
                <input className="form-input" type="email" placeholder="ejemplo@gmail.com" required value={formData.gmail} onChange={(e) => setFormData({...formData, gmail: e.target.value})} />
              </div>
              <div className="form-field">
                <label className="form-label">Número de teléfono</label>
                <input className="form-input" type="tel" placeholder="Ej. 9759-2085" required value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
              </div>
              <div className="form-field">
                <label className="form-label">Categoría (puedes elegir varias)</label>
                <div className="form-categories">
                  {['Corte Rapido', 'Corte y Barba', 'Freestyle', 'Impacto Visual'].map(cat => (
                    <label key={cat} className={`cat-option ${formData.categorias.includes(cat) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={formData.categorias.includes(cat)} onChange={() => handleCheckbox(cat)} />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              {formError && <p className="form-error show">{formError}</p>}
              <button type="submit" className="btn-form-submit">Enviar inscripción</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ANUNCIO DINÁMICO */}
      {showAnuncio && anuncioData && (
        <div className="announce-overlay" onClick={(e) => { if(e.target.className === 'announce-overlay') setShowAnuncio(false); }}>
          <div className="announce-modal">
            <button className="announce-close" onClick={() => setShowAnuncio(false)}>✕</button>

            <div className="announce-carousel">
              <div className="announce-slides" style={{ transform: `translateX(-${annSlide * 50}%)` }}>
                <div className="announce-slide"><img src={anuncioData.imagen1} alt="Evento 1" /></div>
                <div className="announce-slide"><img src={anuncioData.imagen2} alt="Evento 2" /></div>
              </div>
              <button className="announce-arr announce-arr-l" onClick={() => setAnnSlide((prev) => (prev === 0 ? 1 : 0))}>&#8592;</button>
              <button className="announce-arr announce-arr-r" onClick={() => setAnnSlide((prev) => (prev === 0 ? 1 : 0))}>&#8594;</button>
              <div className="announce-dots">
                <button className={`announce-dot ${annSlide === 0 ? 'active' : ''}`} onClick={() => setAnnSlide(0)}></button>
                <button className={`announce-dot ${annSlide === 1 ? 'active' : ''}`} onClick={() => setAnnSlide(1)}></button>
              </div>
            </div>

            <div className="announce-body">
              <span className="announce-badge">{anuncioData.badge}</span>
              <h2 className="announce-title" dangerouslySetInnerHTML={{ __html: anuncioData.titulo.replace('Evento', '<span>Evento</span>') }}></h2>
              <p className="announce-desc">{anuncioData.descripcion}</p>
              
              <div className="announce-actions">
                <button className="btn-announce-main" onClick={() => { setShowAnuncio(false); setFormOpen(true); }}>
                  Inscribirse
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </button>
                <button className="btn-announce-skip" onClick={() => setShowAnuncio(false)}>Omitir por ahora</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}