import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import './hero.css';

interface HeroSectionProps {
  onExploreCatalog?: () => void;
  onOpenMenu?: () => void;
  isScrolled?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCatalog,
  onOpenMenu,
  isScrolled,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const customEase = [0.16, 1, 0.3, 1] as const;

  return (
    <section className="hero-container">
      {/* 1. FIXED NAVBAR AT TOP */}
      <motion.nav
        className={`hero-navbar ${isScrolled ? 'hero-navbar-hidden' : ''}`}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: customEase }}
      >
        {/* Left side */}
        <div className="hero-nav-left">
          {/* Logo Group */}
          <div
            className="hero-logo-group"
            onClick={onExploreCatalog}
            role="button"
            tabIndex={0}
          >
            {/* Custom SVG icon: two rotated rounded rectangles at -35deg, black fill */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Logo Natura & Avon"
            >
              <g transform="rotate(-35 12 12)">
                <rect x="5.5" y="3.5" width="4.5" height="17" rx="2.25" fill="#000000" />
                <rect x="14" y="3.5" width="4.5" height="17" rx="2.25" fill="#000000" />
              </g>
            </svg>
            <span className="hero-brand-text">Natura & Avon</span>
          </div>

          {/* Menu button: black pill with white circle containing Plus icon + Menú text */}
          <button
            className="hero-menu-pill"
            onClick={onOpenMenu || onExploreCatalog}
            type="button"
            aria-label="Abrir menú"
          >
            <div className="hero-menu-circle">
              <Plus size={12} strokeWidth={3} color="#000000" />
            </div>
            <span className="hero-menu-label">Menú</span>
          </button>

          {/* Tags pill: light gray container with two text labels */}
          <div className="hero-tags-pill">
            <span>Belleza Natural</span>
            <span className="hero-tag-dot" />
            <span>Skincare</span>
          </div>
        </div>

        {/* Right side */}
        <div className="hero-nav-right">
          <button
            className="hero-right-pill"
            onClick={onExploreCatalog}
            type="button"
            aria-label="Ciclo 14 · 2026"
          >
            <div className="hero-grid-circle">
              {/* 4-dot grid SVG icon */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="3.2" cy="3.2" r="1.3" fill="#ffffff" />
                <circle cx="8.8" cy="3.2" r="1.3" fill="#ffffff" />
                <circle cx="3.2" cy="8.8" r="1.3" fill="#ffffff" />
                <circle cx="8.8" cy="8.8" r="1.3" fill="#ffffff" />
              </svg>
            </div>
            <span className="hero-right-label">Ciclo 14 · 2026</span>
          </button>
        </div>
      </motion.nav>

      {/* 2. ABSOLUTELY POSITIONED FULL-SCREEN VIDEO BEHIND EVERYTHING */}
      <motion.div
        className="hero-video-wrapper"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: customEase }}
      >
        <video
          className="hero-video"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      </motion.div>

      {/* 3. FOOTER CONTENT PINNED TO BOTTOM OVER GRADIENT */}
      <motion.footer
        className="hero-footer"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, ease: customEase }}
      >
        {/* Left block */}
        <div className="hero-footer-left">
          {/* Subtitle line: small black dot (8px circle) + text */}
          <motion.div
            className="hero-subtitle-line"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: customEase }}
          >
            <span className="hero-subtitle-dot" />
            <span className="hero-subtitle-text">
              Catálogos digitales Ciclo 14 2026
            </span>
          </motion.div>

          {/* Heading: two lines, font-weight 300 */}
          <motion.h1
            className="hero-heading"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: customEase }}
          >
            Belleza sin<br />
            Límites. En Chile.
          </motion.h1>

          {/* Two buttons */}
          <motion.div
            className="hero-buttons-group"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8, ease: customEase }}
          >
            <button
              className="hero-btn-primary"
              onClick={onExploreCatalog}
              type="button"
            >
              Ver Catálogo
            </button>
            <button
              className="hero-btn-secondary"
              onClick={() => setShowHowItWorks(true)}
              type="button"
            >
              Cómo Funciona
            </button>
          </motion.div>
        </div>

        {/* Right block: Three tag pills */}
        <motion.div
          className="hero-footer-right"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8, ease: customEase }}
        >
          <span className="hero-tag-pill">Natura</span>
          <span className="hero-tag-pill">Avon</span>
          <span className="hero-tag-pill">Chile</span>
        </motion.div>
      </motion.footer>

      {/* Optional "Cómo Funciona" Modal */}
      {showHowItWorks && (
        <div
          className="hero-modal-overlay"
          onClick={() => setShowHowItWorks(false)}
        >
          <div
            className="hero-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hero-modal-header">
              <h3 className="hero-modal-title">Cómo Funciona el Catálogo</h3>
              <button
                className="hero-modal-close"
                onClick={() => setShowHowItWorks(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="hero-modal-steps">
              <div className="hero-modal-step">
                <div className="hero-modal-step-number">1</div>
                <div>
                  <div className="hero-modal-step-title">Explora las Revistas y Productos</div>
                  <div className="hero-modal-step-desc">
                    Revisa los catálogos oficiales de Natura, Avon y Casa & Estilo Ciclo 14 con más de 680 productos interactivos.
                  </div>
                </div>
              </div>
              <div className="hero-modal-step">
                <div className="hero-modal-step-number">2</div>
                <div>
                  <div className="hero-modal-step-title">Agrega por Código o Clic</div>
                  <div className="hero-modal-step-desc">
                    Escribe el código de 5 o 6 dígitos de la revista o añade directamente al carrito con precios oficiales en CLP.
                  </div>
                </div>
              </div>
              <div className="hero-modal-step">
                <div className="hero-modal-step-number">3</div>
                <div>
                  <div className="hero-modal-step-title">Pide por WhatsApp o Webpay</div>
                  <div className="hero-modal-step-desc">
                    Confirma tu pedido con tu consultora oficial para despacho a domicilio en todo Chile o retiro coordinado.
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                className="hero-btn-primary"
                onClick={() => {
                  setShowHowItWorks(false);
                  if (onExploreCatalog) onExploreCatalog();
                }}
                type="button"
              >
                Empezar a Comprar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
