import { ArrowUpRight } from 'lucide-react';
import type { Product } from './types';

const collections: { title: string; category: Product['category']; image: string; caption: string }[] = [
  {title:'Maquillaje', category:'Maquillaje', caption:'Color sin reglas', image:'https://www.avon.cl/cdn/shop/collections/avon.cl_favorito-ojos-80.jpg?v=1781112945'},
  {title:'Perfumería', category:'Perfumería', caption:'Deja tu huella', image:'https://www.avon.cl/cdn/shop/collections/avon.cl_favorito-perfumes-80.jpg?v=1781113065'},
  {title:'Cuerpo & baño', category:'Cuerpo & Baño', caption:'Un ratito para ti', image:'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-cl-storefront-catalog/default/dwae2ac0b7/produtos/NATCHL-163706_1.jpg'},
  {title:'Cuidado facial', category:'Cuidado Facial', caption:'Tu piel, protagonista', image:'https://www.avon.cl/cdn/shop/collections/avon.cl_favorito-ampollas-80.jpg?v=1781113303'},
];

export function CategoryDiscovery({onSelect}: {onSelect: (category: Product['category']) => void}) {
  return (
    <section className="beauty-discovery" aria-labelledby="discovery-title">
      <div className="beauty-section-heading"><div><span className="beauty-kicker">ENCUENTRA LO QUE VA CONTIGO</span><h2 id="discovery-title">Un mundo de <em>favoritos.</em></h2></div><p>Pequeños rituales. Grandes sensaciones.</p></div>
      <div className="beauty-collections">
        {collections.map((c,i)=><button key={c.category} className="beauty-collection" onClick={()=>onSelect(c.category)}>
          <div className="beauty-collection-image"><img src={c.image} alt={c.title} loading="lazy" width="400" height="500"/><span>0{i+1}</span><span className="beauty-collection-arrow"><ArrowUpRight size={19}/></span></div>
          <span className="beauty-collection-caption">{c.caption}</span><h3>{c.title}</h3>
        </button>)}
      </div>
    </section>
  );
}
