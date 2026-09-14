import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Truck,
  Heart,
  Send,
  X,
  Plus,
  ThumbsUp,
} from 'lucide-react';

export interface CustomerReview {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
  product?: string;
  verified: boolean;
  avatarBg: string;
  likes?: number;
}

const INITIAL_REVIEWS: CustomerReview[] = [];

const REVIEWS_STORAGE_KEY = 'camila_customer_reviews_v2';
const LIKED_REVIEWS_STORAGE_KEY = 'camila_liked_reviews_v2';

export function ReviewsSection() {
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      // Limpiar datos heredados de versiones previas con reseñas de prueba
      localStorage.removeItem('camila_customer_reviews_v1');
      localStorage.removeItem('camila_liked_reviews_v1');

      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_REVIEWS;
  });

  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LIKED_REVIEWS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(5);
  const [product, setProduct] = useState('');
  const [comment, setComment] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Sync reviews to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  // Sync likes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LIKED_REVIEWS_STORAGE_KEY, JSON.stringify(likedIds));
    } catch {
      // ignore
    }
  }, [likedIds]);

  const handleToggleLike = (id: string) => {
    const isLiked = likedIds.includes(id);
    if (isLiked) {
      setLikedIds((prev) => prev.filter((item) => item !== id));
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, likes: Math.max(0, (r.likes || 0) - 1) } : r))
      );
    } else {
      setLikedIds((prev) => [...prev, id]);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r))
      );
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const colors = [
      'bg-rose-100 text-rose-700',
      'bg-purple-100 text-purple-700',
      'bg-emerald-100 text-emerald-800',
      'bg-amber-100 text-amber-800',
      'bg-pink-100 text-pink-700',
      'bg-blue-100 text-blue-700',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      city: city.trim() || 'Chile',
      rating,
      date: 'Recién publicada',
      comment: comment.trim(),
      product: product.trim() || undefined,
      verified: true,
      avatarBg: randomColor,
      likes: 1,
    };

    setReviews((prev) => [newReview, ...prev]);
    setSubmittedSuccess(true);

    setTimeout(() => {
      setName('');
      setCity('');
      setProduct('');
      setComment('');
      setRating(5);
      setSubmittedSuccess(false);
      setIsModalOpen(false);
    }, 1800);
  };

  const handleShareToWhatsApp = () => {
    const text = encodeURIComponent(
      `⭐ *¡Hola Camila! Te dejé una reseña en tu Catálogo Digital:* \n\n"${comment}"\n- *${name}* (${city || 'Chile'}), Calificación: ${rating}/5 estrellas.`
    );
    window.open(`https://wa.me/56988899999?text=${text}`, '_blank');
  };

  const hasReviews = reviews.length > 0;
  const averageRating = hasReviews
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : null;

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === filterRating;
  });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* 1. SECTION HEADER */}
      <div className="bg-white rounded-3xl border border-black/10 p-6 sm:p-10 shadow-sm mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={13} className="text-amber-600" />
              <span>Experiencias Reales de Clientas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Lo que dicen de comprar con Camila Browne
            </h2>
            <p className="text-sm text-black/60 mt-1 max-w-2xl leading-relaxed">
              Opiniones de clientas en todo Chile que han confiado en el catálogo digital de Natura y
              Avon. Transparencia, productos 100% originales y atención personalizada.
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#F4F4F6] p-5 rounded-2xl border border-black/8 self-start lg:self-auto w-full sm:w-auto">
            {hasReviews ? (
              <div className="text-center sm:text-left">
                <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                  <span className="text-4xl font-black text-black">{averageRating}</span>
                  <span className="text-xs text-black/50 font-bold uppercase tracking-wider">
                    de 5.0
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 justify-center sm:justify-start text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={17}
                      className={
                        Number(averageRating) >= s
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-stone-200 text-stone-200'
                      }
                    />
                  ))}
                </div>
                <p className="text-[11px] text-black/60 font-medium mt-1">
                  {reviews.length} {reviews.length === 1 ? 'opinión verificada' : 'opiniones verificadas'}
                </p>
              </div>
            ) : (
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-1 text-amber-500 mb-1 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-xs font-bold text-black">Tu opinión nos importa</div>
                <p className="text-[11px] text-black/60 font-medium mt-0.5">
                  ¿Compraste con Camila? Comparte tu experiencia
                </p>
              </div>
            )}

            <div className="h-10 w-px bg-black/10 hidden sm:block" />

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-xs transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Plus size={15} />
              <span>Dejar mi Reseña</span>
            </button>
          </div>
        </div>

        {/* Value Props / Guarantees Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-black/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-black">100% Original Sellado</div>
              <div className="text-[11px] text-black/50">Cosméticos y perfumes Natura & Avon</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800 flex-shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-black">Despacho Rápido $3.990</div>
              <div className="text-[11px] text-black/50">A todo Chile + Retiro Gratis coordinado</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-700 flex-shrink-0">
              <Heart size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-black">Atención Camila Browne</div>
              <div className="text-[11px] text-black/50">Asesoría directa y muestras de regalo</div>
            </div>
          </div>
        </div>
      </div>

      {hasReviews ? (
        <>
          {/* 2. REVIEWS FILTER TABS */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-black/70">Filtrar por:</span>
              <button
                onClick={() => setFilterRating('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterRating === 'all'
                    ? 'bg-black text-white'
                    : 'bg-white text-black/70 border border-black/10 hover:bg-[#F4F4F6]'
                }`}
              >
                Todas ({reviews.length})
              </button>
              <button
                onClick={() => setFilterRating(5)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                  filterRating === 5
                    ? 'bg-black text-white'
                    : 'bg-white text-black/70 border border-black/10 hover:bg-[#F4F4F6]'
                }`}
              >
                <span>5 Estrellas</span>
                <Star size={12} className="fill-amber-400 text-amber-400" />
              </button>
            </div>

            <div className="text-xs text-black/50 font-medium">
              Mostrando {filteredReviews.length} testimonio{filteredReviews.length === 1 ? '' : 's'}
            </div>
          </div>

          {/* 3. REVIEWS GRID */}
          {filteredReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReviews.map((rev) => {
                const isLiked = likedIds.includes(rev.id);

                return (
                  <div
                    key={rev.id}
                    className="bg-white rounded-2xl border border-black/10 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Header: Avatar, Name, Verified */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${rev.avatarBg} font-black text-xs flex items-center justify-center flex-shrink-0`}
                          >
                            {rev.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-black leading-snug">{rev.name}</div>
                            <div className="text-[11px] text-black/50">{rev.city}</div>
                          </div>
                        </div>

                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={11} className="text-emerald-800" />
                            <span>Verificada</span>
                          </span>
                        )}
                      </div>

                      {/* Stars & Date */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={
                                s <= rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-stone-200 text-stone-200'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-black/40">{rev.date}</span>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-black/75 leading-relaxed mb-4">"{rev.comment}"</p>
                    </div>

                    {/* Footer: Product badge & helpful button */}
                    <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-2">
                      {rev.product ? (
                        <span className="text-[11px] font-medium text-black/60 truncate max-w-[190px] bg-[#F4F4F6] px-2.5 py-1 rounded-md">
                          🛍️ {rev.product}
                        </span>
                      ) : (
                        <span className="text-[11px] text-black/40">Compra directa</span>
                      )}

                      <button
                        onClick={() => handleToggleLike(rev.id)}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full transition-colors ${
                          isLiked
                            ? 'text-rose-600 bg-rose-50'
                            : 'text-black/40 hover:text-black hover:bg-neutral-100'
                        }`}
                        title="Útil"
                      >
                        <ThumbsUp size={12} className={isLiked ? 'fill-rose-600' : ''} />
                        <span>{rev.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-black/10 p-6">
              <p className="text-xs text-black/60">No hay opiniones con esa calificación.</p>
              <button
                onClick={() => setFilterRating('all')}
                className="mt-2 text-xs font-bold text-black underline hover:text-black/70"
              >
                Ver todas las opiniones
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State when no reviews yet */
        <div className="text-center py-12 px-6 bg-white rounded-3xl border border-black/10 shadow-xs max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 mb-3">
            <MessageSquare size={22} />
          </div>
          <h3 className="text-base font-bold text-black mb-1">Aún no hay opiniones publicadas</h3>
          <p className="text-xs text-black/60 leading-relaxed mb-5">
            Tu opinión es muy valiosa para nosotras. Si ya has comprado con Camila Browne, sé la primera en calificar tu experiencia.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-semibold text-xs shadow-xs transition-all hover:scale-105"
          >
            <Plus size={15} />
            <span>Escribir la primera reseña</span>
          </button>
        </div>
      )}

      {/* 4. WRITE REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-black/10 relative max-h-[90vh] overflow-y-auto animate-scale-in">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-black/40 hover:text-black transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span>Tu Opinión Cuenta</span>
              </div>
              <h3 className="text-xl font-black text-black">Deja tu reseña para Camila</h3>
              <p className="text-xs text-black/50 mt-1">
                Comparte cómo fue tu experiencia de compra, atención y entrega.
              </p>
            </div>

            {submittedSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-bold text-black">¡Muchas gracias por tu reseña!</h4>
                <p className="text-xs text-black/60 max-w-xs mx-auto">
                  Tu testimonio ya aparece publicado en la tienda.
                </p>

                <div className="pt-4">
                  <button
                    onClick={handleShareToWhatsApp}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} />
                    <span>Compartir también con Camila por WhatsApp</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1.5">
                    Tu Calificación General *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setRating(starVal)}
                        className="p-1.5 rounded-lg hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          size={28}
                          className={
                            starVal <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300 fill-stone-100'
                          }
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-black/70 ml-2">
                      {rating === 5
                        ? '¡Excelente! (5/5)'
                        : rating === 4
                        ? 'Muy bueno (4/5)'
                        : `${rating}/5`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black/80 mb-1">
                      Tu Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Francisca Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black/80 mb-1">
                      Ciudad o Comuna
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Las Condes, Viña del Mar..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">
                    Producto comprado (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Perfume Kaiak, Crema Chronos, Labial Avon..."
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">
                    Tu Experiencia / Comentario *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Cuéntanos qué te pareció la rapidez, los productos y la atención de Camila..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-xs text-black focus:outline-none focus:border-black resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/3 py-3 rounded-xl border border-black/15 hover:bg-neutral-100 text-black/70 font-semibold text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    <span>Publicar Reseña</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// Sello de confianza para Carrito y Checkout
export function TrustReviewsBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 ${className}`}
    >
      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
        <ShieldCheck size={14} />
      </div>
      <div className="text-[11px] leading-tight text-emerald-900">
        <strong>Compra 100% segura y garantizada</strong> · Cosméticos y perfumes originales Natura & Avon
      </div>
    </div>
  );
}
