import { ArrowUpRight, ArrowRight, BookOpen } from 'lucide-react';
import './hero.css';

interface HeroSectionProps {
  productCount: number;
  onExploreCatalog: () => void;
  onMakeup: () => void;
  onOpenCatalogs: () => void;
}

export function HeroSection({ productCount, onExploreCatalog, onMakeup, onOpenCatalogs }: HeroSectionProps) {
  return (
    <section className="beauty-hero" aria-labelledby="hero-title">
      <div className="beauty-hero-copy">
        <div className="beauty-eyebrow"><span /> TU MOMENTO, TU BELLEZA</div>
        <h1 id="hero-title">Tan única<br />como <em>tú.</em></h1>
        <p>Esos pequeños favoritos que hacen tu día.<br className="hidden sm:block" /> Encuentra los tuyos con Natura y Avon.</p>
        <div className="beauty-hero-actions">
          <button className="beauty-button" onClick={onExploreCatalog}>Descubrir productos <ArrowUpRight size={18} /></button>
          <button className="beauty-text-button" onClick={onOpenCatalogs}><BookOpen size={16} /> Ver revistas</button>
        </div>
        <div className="beauty-hero-note"><strong>{productCount.toLocaleString('es-CL')}</strong> productos y variantes <span>·</span> Ciclo 14 / 2026</div>
      </div>
      <div className="beauty-hero-photo">
        <img src="https://www.avon.cl/cdn/shop/collections/avon.cl_favorito-labios-80.jpg?v=1781112849" alt="Maquillaje Avon: labios luminosos y un acabado natural" fetchPriority="high" width="820" height="1092" />
        <span className="beauty-photo-caption">BELLEZA A TU MANERA</span>
        <button className="beauty-photo-link" onClick={onMakeup}><span>Un toque de color.<br /><strong>Muchas formas de ser tú.</strong></span><ArrowUpRight size={23} /></button>
      </div>
      <div className="beauty-hero-bottom"><span>NATURA + AVON</span><span>Tu rutina empieza con algo que te encanta.</span><ArrowRight size={16} /></div>
    </section>
  );
}
