import { useState, useEffect, useMemo } from 'react';
export type { Product, CartItem, CatalogItem, OrderConfirmation } from './types';
import type { CatalogItem, CartItem, Product, OrderConfirmation } from './types';
import { PRODUCTS } from './data/products';

// --- CATALOG DATA ---
const CATALOGS: CatalogItem[] = [
  {
    id: 'natura-c14',
    slug: 'natura',
    title: 'Revista Interactiva Natura',
    subtitle: 'Ciclo 14 / 2026 Chile',
    brand: 'Natura',
    campaign: 'Ciclo 14 / 2026',
    totalPages: 194,
    coverImage: '/covers/natura-c14.jpg',
    pdfUrl: '/pdf/natura-c14.pdf',
    badge: 'Hasta 40% OFF',
    badgeColor: 'bg-orange-500 text-white',
    description:
      'Lanzamiento exclusivo Kaiak 21k, Tododia ciruela y flor de vainilla, Ekos Amazonía Viva y Chronos.',
    tagline: 'hace bien estar bien',
    sections: [
      { title: 'Imperdibles del Ciclo', startPage: 2 },
      { title: 'Perfumería & Kaiak 21k', startPage: 6 },
      { title: 'Cuidados Diarios & Tododia', startPage: 48 },
      { title: 'Ekos Amazonía', startPage: 80 },
      { title: 'Rostro & Chronos', startPage: 110 },
      { title: 'Maquillaje UNA & Faces', startPage: 136 },
      { title: 'Lumina Capilar', startPage: 165 },
    ],
  },
  {
    id: 'avon-c14',
    slug: 'avon',
    title: 'Revista Digital Avon',
    subtitle: 'Ciclo 14 / 2026 Chile',
    brand: 'Avon',
    campaign: 'Ciclo 14 / 2026',
    totalPages: 164,
    coverImage: '/covers/avon-c14.jpg',
    pdfUrl: '/pdf/avon-c14.pdf',
    badge: 'Mega Ofertas',
    badgeColor: 'bg-pink-600 text-white',
    description:
      'Perfumes 300 Km/h Surfer, Max Turbo, Máscara Efecto Abanico y Labiales Power Stay 16 horas.',
    tagline: 'vive al límite',
    sections: [
      { title: 'Imperdibles del Ciclo', startPage: 2 },
      { title: 'Maquillaje & Rostro', startPage: 6 },
      { title: 'Perfumería 300 Km/h', startPage: 46 },
      { title: 'Cuidado Facial Anew', startPage: 84 },
      { title: 'Cuidados Diarios Care', startPage: 110 },
      { title: 'Bienestar & Cabello', startPage: 138 },
    ],
  },
  {
    id: 'casa-estilo-c14',
    slug: 'casa-estilo',
    title: 'Casa y Estilo Outlet',
    subtitle: 'Ciclo 14 / 2026 Chile',
    brand: 'Casa & Estilo',
    campaign: 'Ciclo 14 / 2026',
    totalPages: 22,
    coverImage: '/covers/casa-estilo-c14.jpg',
    pdfUrl: '/pdf/casa-estilo-c14.pdf',
    badge: 'Hasta 70% OFF',
    badgeColor: 'bg-blue-600 text-white',
    description:
      'Outlet imperdible con hasta 70% de descuento en organizadores RPET, posavasos con destapador y cocina.',
    tagline: '¡Los mejores productos a precios únicos!',
    sections: [
      { title: 'Imperdibles', startPage: 2 },
      { title: 'Organizadores y Hogar', startPage: 4 },
      { title: 'Cocina & Accesorios', startPage: 10 },
      { title: 'Estilo y Moda', startPage: 16 },
    ],
  },
  {
    id: 'ciclo-14',
    slug: 'ciclo-14',
    title: 'Mi Consultoría Natura & Avon',
    subtitle: 'Guía de Negocio Ciclo 14',
    brand: 'Mi Consultoría',
    campaign: 'Ciclo 14 / 2026',
    totalPages: 58,
    coverImage: '/covers/ciclo-14.jpg',
    pdfUrl: '/pdf/ciclo-14.pdf',
    badge: 'Exclusivo Consultoras',
    badgeColor: 'bg-purple-700 text-white',
    description:
      'Franjas de puntaje (55 pts Avon / 80 pts Natura), kits promocionales de lanzamiento y herramientas de venta.',
    tagline: 'Gana más según tu nivel de consultoría',
    sections: [
      { title: 'Plataforma de Belleza', startPage: 2 },
      { title: 'Franjas de Puntaje', startPage: 3 },
      { title: 'Promociones Únicas', startPage: 4 },
      { title: 'Kits de Negocio', startPage: 16 },
    ],
  },
];

const CATEGORIES = [
  'Todos los Productos',
  'Perfumería',
  'Cuidado Facial',
  'Cuerpo & Baño',
  'Maquillaje',
  'Cabello',
  'Hogar & Cocina',
  'Kits & Ofertas',
];

const BRANDS = ['Todas las Marcas', 'Natura', 'Avon', 'Casa & Estilo', 'Mi Consultoría'];

// Currency formatter
const formatCLP = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'store' | 'catalogs'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos los Productos');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas las Marcas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under10k' | '10k-20k' | 'over20k'>('all');

  // Favorites
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Quick Code Search Bar
  const [quickCodeInput, setQuickCodeInput] = useState<string>('');

  // Pagination / Load More
  const [visibleCount, setVisibleCount] = useState<number>(16);

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeCatalog, setActiveCatalog] = useState<CatalogItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<string>('');

  // Checkout
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerRut, setCustomerRut] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('+56912345678');
  const [shippingType, setShippingType] = useState<'delivery' | 'pickup'>('delivery');
  const [shippingRegion, setShippingRegion] = useState<string>('Región Metropolitana');
  const [shippingCommune, setShippingCommune] = useState<string>('Santiago');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'webpay' | 'transfer' | 'whatsapp'>('webpay');

  // Order Confirmed
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmation | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Toggle Favorite
  const toggleFavorite = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        triggerToast('Eliminado de tus favoritos');
        return prev.filter((id) => id !== productId);
      } else {
        triggerToast('❤️ Guardado en tus favoritos');
        return [...prev, productId];
      }
    });
  };

  // Cart totals
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const freeShippingThreshold = 35000;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const shippingFee = cartSubtotal === 0 || shippingType === 'pickup' || isFreeShipping ? 0 : 3990;
  const discountAmount = Math.round(cartSubtotal * appliedDiscount);
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  // Add to cart
  const handleAddToCart = (product: Product, quantity = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    triggerToast(`✓ "${product.name}" agregado al carrito`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Quick code search/add
  const handleQuickCodeAdd = () => {
    const code = quickCodeInput.trim();
    if (!code) return;
    const found = PRODUCTS.find((p) => p.code === code);
    if (found) {
      handleAddToCart(found, 1);
      setQuickCodeInput('');
      setIsCartOpen(true);
    } else {
      setSearchQuery(code);
      setSelectedCategory('Todos los Productos');
      setSelectedBrand('Todas las Marcas');
      triggerToast(`Buscando código ${code}...`);
    }
  };

  // Coupons
  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'CICLO14' || code === 'NATURA10' || code === 'AVON10') {
      setAppliedDiscount(0.1);
      setCouponSuccess('¡Cupón aplicado! 10% de descuento adicional');
    } else {
      setCouponError('Cupón inválido. Prueba con: CICLO14');
    }
  };

  // Filtering
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (showOnlyFavorites && !favorites.includes(p.id)) return false;

      const matchesCategory =
        selectedCategory === 'Todos los Productos' || p.category === selectedCategory;
      const matchesBrand =
        selectedBrand === 'Todas las Marcas' || p.brand === selectedBrand;
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.includes(searchQuery);

      let matchesPrice = true;
      if (priceFilter === 'under10k') matchesPrice = p.price < 10000;
      else if (priceFilter === '10k-20k') matchesPrice = p.price >= 10000 && p.price <= 20000;
      else if (priceFilter === 'over20k') matchesPrice = p.price > 20000;

      return matchesCategory && matchesBrand && matchesSearch && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      return b.rating - a.rating;
    });
  }, [selectedCategory, selectedBrand, searchQuery, sortBy, priceFilter, showOnlyFavorites, favorites]);

  // Open Catalog at page
  const handleOpenCatalog = (catalog: CatalogItem, page = 1) => {
    setActiveCatalog(catalog);
    setCurrentPage(page);
    setZoomLevel(1);
    setShowThumbnails(false);
  };

  // Viewer keyboard controls
  useEffect(() => {
    if (!activeCatalog) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => Math.min(activeCatalog.totalPages, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else if (e.key === 'Escape') {
        setActiveCatalog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCatalog]);

  // Lock scroll
  useEffect(() => {
    if (activeCatalog || isCartOpen || isCheckoutOpen || quickViewProduct || confirmedOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeCatalog, isCartOpen, isCheckoutOpen, quickViewProduct, confirmedOrder]);

  // Complete Order
  const handleCompleteOrder = () => {
    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderConfirmation = {
      orderNumber: orderId,
      customerName: customerName.trim() || 'Cliente Ciclo 14',
      customerPhone: customerPhone.trim() || '+56912345678',
      customerEmail: customerEmail.trim() || 'cliente@ejemplo.cl',
      shippingType,
      address: shippingAddress.trim() || 'Retiro coordinado con Consultora',
      city: `${shippingCommune}, ${shippingRegion}`,
      paymentMethod,
      subtotal: cartSubtotal,
      discount: discountAmount,
      shippingFee,
      total: finalTotal,
      items: [...cart],
      date: new Date().toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setConfirmedOrder(newOrder);
    setIsCheckoutOpen(false);
    setCart([]);
  };

  const buildWhatsAppOrderLink = (order: OrderConfirmation) => {
    const phoneClean = order.customerPhone.replace(/[^0-9]/g, '');
    let text = `🛍️ *¡Hola! Te comparto mi pedido confirmado en el Ecommerce Ciclo 14:*\n\n`;
    text += `🔖 *Orden:* #${order.orderNumber}\n`;
    text += `👤 *Cliente:* ${order.customerName}\n`;
    text += `📍 *Entrega:* ${order.shippingType === 'delivery' ? `Domicilio en ${order.address}, ${order.city}` : 'Retiro con Consultora'}\n`;
    text += `💳 *Método de Pago:* ${order.paymentMethod === 'webpay' ? 'Webpay Plus' : order.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 'Coordinar con Consultora'}\n\n`;
    text += `📦 *Detalle de Productos:*\n`;

    order.items.forEach((item, idx) => {
      text += `${idx + 1}. *${item.product.name}* [Cód: ${item.product.code}] x${item.quantity} = ${formatCLP(item.product.price * item.quantity)}\n`;
    });

    if (order.discount > 0) text += `\n🏷️ *Descuento:* -${formatCLP(order.discount)}`;
    if (order.shippingFee > 0) text += `\n🚚 *Envío:* ${formatCLP(order.shippingFee)}`;
    text += `\n💰 *TOTAL A PAGAR:* ${formatCLP(order.total)}\n\n`;
    text += `✨ _Generado desde la Tienda Digital Natura & Avon Chile_`;

    return `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 selection:bg-orange-200">
      {/* 1. ANNOUNCEMENT BAR */}
      <div className="bg-stone-950 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-between sm:justify-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>🚚 <strong>Envío GRATIS</strong> a todo Chile en compras sobre $35.000</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-stone-300">
          <span>|</span>
          <span>🎟️ Cupón 10% OFF: <strong className="text-orange-400 bg-stone-900 px-1.5 py-0.5 rounded border border-orange-500/40">CICLO14</strong></span>
          <span>|</span>
          <span>💳 Webpay Plus • Débito • Crédito • WhatsApp</span>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => {
              setActiveTab('store');
              setShowOnlyFavorites(false);
            }}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-pink-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              C14
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-stone-950 leading-none">
                  BEAUTY & STORE
                </span>
                <span className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-orange-200">
                  {PRODUCTS.length} Productos
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-semibold tracking-wide">
                Natura • Avon • Casa & Estilo Chile
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar entre más de 680+ productos, códigos (ej: 135849, 114201) o marcas..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-inner"
              />
              <svg className="w-4 h-4 absolute left-3.5 top-2.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 text-xs font-bold">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist button */}
            <button
              onClick={() => {
                setShowOnlyFavorites((prev) => !prev);
                setActiveTab('store');
              }}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                showOnlyFavorites
                  ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
              }`}
              title="Ver mis favoritos"
            >
              <span className="text-rose-500">❤️</span>
              <span className="hidden sm:inline">Favoritos</span>
              {favorites.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Catalogs toggle button */}
            <button
              onClick={() => {
                setActiveTab(activeTab === 'store' ? 'catalogs' : 'store');
                setShowOnlyFavorites(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                activeTab === 'catalogs'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
              }`}
            >
              <span>📖</span>
              <span className="hidden sm:inline">Revistas Digitales</span>
              <span className="sm:hidden">Revistas</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline font-bold">{formatCLP(cartSubtotal)}</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-orange-700 font-black text-xs flex items-center justify-center shadow">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Product Code Search Strip */}
        <div className="border-t border-stone-200 bg-orange-50/60 px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-stone-700 font-semibold">
              <span>⚡</span>
              <span><strong>Pedido Rápido por Código:</strong> Inscribe el código de cualquier revista:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickCodeInput}
                onChange={(e) => setQuickCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickCodeAdd()}
                placeholder="Ej: 114201"
                className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs font-mono w-28 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                onClick={handleQuickCodeAdd}
                className="px-2.5 py-1 bg-stone-900 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Buscar / Pedir
              </button>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="border-t border-stone-100 bg-white overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2">
            {CATEGORIES.map((cat) => {
              const count =
                cat === 'Todos los Productos'
                  ? PRODUCTS.length
                  : PRODUCTS.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveTab('store');
                    setShowOnlyFavorites(false);
                  }}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat && activeTab === 'store' && !showOnlyFavorites
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-200/60 border border-stone-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat && activeTab === 'store' && !showOnlyFavorites
                        ? 'bg-white/30 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 3. TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-800 flex items-center gap-3 animate-bounce">
          <span className="text-emerald-400 font-bold">🛒</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setIsCartOpen(true)}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 underline ml-2"
          >
            Ver Carrito
          </button>
        </div>
      )}

      {/* 4. CONTENT */}
      {activeTab === 'store' ? (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* E-Commerce Promotional Hero Banner */}
          {!showOnlyFavorites && (
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-pink-600 to-purple-800 text-white p-6 sm:p-12 mb-8 shadow-xl">
              <div className="max-w-2xl relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-3">
                  🔥 Campaña Ciclo 14 / 2026 Chile • Más de 50 Productos Oficiales
                </span>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-4">
                  Gran Tienda Online Natura, Avon y Casa & Estilo
                </h1>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-6 font-medium">
                  Encuentra todas las fragancias, cremas, maquillaje y productos de hogar extraídos directamente de los catálogos del Ciclo 14 con descuentos de hasta el 70%.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedCategory('Kits & Ofertas')}
                    className="px-5 py-3 rounded-xl bg-white text-stone-900 font-black text-xs sm:text-sm shadow-md hover:bg-stone-100 transition-all hover:scale-105 active:scale-95"
                  >
                    Ver Kits & Outlet (-70%)
                  </button>
                  <button
                    onClick={() => setActiveTab('catalogs')}
                    className="px-5 py-3 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/30 transition-all"
                  >
                    Hojea las 4 Revistas Digitales
                  </button>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-300 via-pink-500 to-transparent" />
            </div>
          )}

          {/* Filtering & Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              <span className="text-xs font-bold text-stone-400 mr-2 uppercase tracking-wider hidden lg:inline">
                Marca:
              </span>
              {BRANDS.map((brand) => {
                const count =
                  brand === 'Todas las Marcas'
                    ? PRODUCTS.length
                    : PRODUCTS.filter((p) => p.brand === brand).length;
                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                      selectedBrand === brand
                        ? 'bg-stone-950 text-white'
                        : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700'
                    }`}
                  >
                    <span>{brand}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Price Filter & Sort */}
            <div className="flex items-center justify-between w-full md:w-auto gap-3 text-xs">
              {/* Price range */}
              <div className="flex items-center gap-1">
                <span className="text-stone-400 font-semibold">Precio:</span>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                  className="bg-stone-100 border border-stone-200 rounded-xl px-2 py-1.5 font-bold text-stone-700 focus:outline-none"
                >
                  <option value="all">Todos los precios</option>
                  <option value="under10k">Menos de $10.000</option>
                  <option value="10k-20k">$10.000 - $20.000</option>
                  <option value="over20k">Más de $20.000</option>
                </select>
              </div>

              {/* Sort by */}
              <div className="flex items-center gap-1">
                <span className="text-stone-400 font-semibold">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-stone-100 border border-stone-200 rounded-xl px-2.5 py-1.5 font-bold text-stone-700 focus:outline-none"
                >
                  <option value="featured">Destacados</option>
                  <option value="discount">Mayor Descuento</option>
                  <option value="price-asc">Menor Precio</option>
                  <option value="price-desc">Mayor Precio</option>
                </select>
              </div>
            </div>
          </div>

          {/* Favorites Banner if active */}
          {showOnlyFavorites && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-800 text-sm font-bold">
                <span>❤️</span>
                <span>Mostrando tus {favorites.length} productos favoritos guardados</span>
              </div>
              <button
                onClick={() => setShowOnlyFavorites(false)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 underline"
              >
                Ver todos los productos
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-extrabold text-lg text-stone-800">No encontramos productos con estos filtros</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
                Prueba buscando con otro término, limpiando el rango de precios o explorando otra categoría.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Todos los Productos');
                  setSelectedBrand('Todas las Marcas');
                  setSearchQuery('');
                  setPriceFilter('all');
                  setShowOnlyFavorites(false);
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.slice(0, visibleCount).map((product) => {
                  const matchedCatalog = CATALOGS.find((c) => c.slug === product.catalogSlug);
                  const isFav = favorites.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative"
                    >
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-transform hover:scale-110 ${
                          isFav ? 'bg-rose-50 text-rose-600' : 'bg-white/80 hover:bg-white text-stone-400'
                        }`}
                        title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                      >
                        {isFav ? '❤️' : '🤍'}
                      </button>

                      {/* Image Box */}
                      <div
                        className="relative aspect-square bg-stone-50 overflow-hidden cursor-pointer"
                        onClick={() => setQuickViewProduct(product)}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />

                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
                          {product.discountPercent > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-black shadow">
                              -{product.discountPercent}%
                            </span>
                          )}
                          {product.badge && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow ${product.badgeColor || 'bg-stone-900 text-white'}`}>
                              {product.badge}
                            </span>
                          )}
                        </div>

                        {/* Brand Tag */}
                        <div className="absolute bottom-2 left-2 pointer-events-none">
                          <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-extrabold uppercase tracking-wider text-stone-800 shadow-sm">
                            {product.brand}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Rating & Code */}
                          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                            <div className="flex items-center text-amber-500 font-bold">
                              <span>★</span>
                              <span className="text-stone-700 ml-1">{product.rating}</span>
                              <span className="text-stone-400 ml-0.5">({product.reviewsCount})</span>
                            </div>
                            <span className="font-mono text-stone-500">Cód: {product.code}</span>
                          </div>

                          {/* Title */}
                          <h3
                            onClick={() => setQuickViewProduct(product)}
                            className="font-bold text-sm text-stone-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors cursor-pointer mb-2"
                          >
                            {product.name}
                          </h3>

                          {/* Prices */}
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="font-black text-base sm:text-lg text-stone-950">
                              {formatCLP(product.price)}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="text-xs text-stone-400 line-through">
                                {formatCLP(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          {/* Magazine page jump link */}
                          {matchedCatalog && (
                            <button
                              onClick={() => handleOpenCatalog(matchedCatalog, product.page)}
                              className="w-full text-left text-[11px] text-orange-600 hover:text-orange-700 font-semibold mb-3 flex items-center justify-between py-1 px-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                            >
                              <span>📖 Ver en Revista (Pág. {product.page})</span>
                              <span>→</span>
                            </button>
                          )}

                          {/* Add button */}
                          <button
                            onClick={(e) => handleAddToCart(product, 1, e)}
                            className="w-full py-2.5 px-3 rounded-xl bg-stone-950 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Agregar al Carrito</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {visibleCount < filteredProducts.length && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 16)}
                    className="px-6 py-3 rounded-2xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-extrabold text-sm shadow-sm transition-all hover:scale-105"
                  >
                    Cargar más productos ({filteredProducts.length - visibleCount} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      ) : (
        /* 5. DIGITAL CATALOGS TAB */
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                Catálogos Digitales Oficiales
              </span>
              <h2 className="text-3xl font-black text-stone-900 tracking-tight mt-0.5">
                Revistas Interactivas Ciclo 14 / 2026 Chile
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Hojea todas las páginas en alta definición. Haz clic en cualquier portada para abrir el visor interactivo.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('store')}
              className="px-4 py-2 rounded-xl bg-stone-950 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow"
            >
              Volver a la Tienda
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATALOGS.map((catalog) => (
              <div
                key={catalog.id}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div
                  onClick={() => handleOpenCatalog(catalog, 1)}
                  className="relative aspect-[3/4] bg-stone-100 cursor-pointer overflow-hidden"
                >
                  <img
                    src={catalog.coverImage}
                    alt={catalog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow ${catalog.badgeColor}`}>
                      {catalog.badge}
                    </span>
                    <span className="bg-black/75 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                      {catalog.totalPages} págs
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <span className="px-4 py-2 rounded-full bg-white text-stone-900 font-bold text-xs shadow-lg">
                      Abrir Revista
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">
                      {catalog.brand} • {catalog.campaign}
                    </span>
                    <h3
                      onClick={() => handleOpenCatalog(catalog, 1)}
                      className="font-bold text-lg text-stone-900 hover:text-orange-600 transition-colors cursor-pointer leading-snug mb-1"
                    >
                      {catalog.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
                      {catalog.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                      <button
                        onClick={() => handleOpenCatalog(catalog, 1)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        Ver Revista
                      </button>
                      <a
                        href={catalog.pdfUrl}
                        download
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
                        title="Descargar PDF"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* 6. QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-scale-in relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="aspect-square bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 relative">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
                {quickViewProduct.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-red-600 text-white text-xs font-black shadow">
                    -{quickViewProduct.discountPercent}% OFF
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
                    {quickViewProduct.brand}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-stone-500 font-mono">
                    Cód: {quickViewProduct.code}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug mb-2">
                  {quickViewProduct.name}
                </h2>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center text-amber-500 font-bold text-sm">
                    <span>★ {quickViewProduct.rating}</span>
                  </div>
                  <span className="text-xs text-stone-400">
                    ({quickViewProduct.reviewsCount} opiniones)
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl sm:text-3xl font-black text-stone-950">
                    {formatCLP(quickViewProduct.price)}
                  </span>
                  {quickViewProduct.originalPrice > quickViewProduct.price && (
                    <span className="text-sm text-stone-400 line-through">
                      {formatCLP(quickViewProduct.originalPrice)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {quickViewProduct.description}
                </p>

                <div className="space-y-1.5 mb-6">
                  {quickViewProduct.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-stone-700">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleAddToCart(quickViewProduct);
                      setQuickViewProduct(null);
                      setIsCartOpen(true);
                    }}
                    className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Agregar al Carrito
                  </button>

                  <button
                    onClick={() => {
                      const matched = CATALOGS.find((c) => c.slug === quickViewProduct.catalogSlug);
                      if (matched) {
                        setQuickViewProduct(null);
                        handleOpenCatalog(matched, quickViewProduct.page);
                      }
                    }}
                    className="w-full py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors"
                  >
                    📖 Abrir página en Revista (Pág. {quickViewProduct.page})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-left">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base leading-none">
                    Mi Carrito de Compras
                  </h3>
                  <span className="text-xs text-stone-500">
                    {totalCartCount} {totalCartCount === 1 ? 'producto' : 'productos'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Free shipping bar */}
            <div className="bg-orange-50 border-b border-orange-100 p-3 text-xs">
              {isFreeShipping ? (
                <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <span>🎉</span>
                  <span>¡Felicidades! Tienes Envío Gratis a todo Chile</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between font-semibold text-stone-700 mb-1">
                    <span>Agrega {formatCLP(freeShippingThreshold - cartSubtotal)} más para <strong>Envío Gratis</strong></span>
                    <span>{Math.round((cartSubtotal / freeShippingThreshold) * 100)}%</span>
                  </div>
                  <div className="w-full bg-orange-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (cartSubtotal / freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-5xl mb-3">🛒</div>
                  <h4 className="font-extrabold text-stone-800 text-base">Tu carrito está vacío</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 mb-5">
                    Explora nuestra tienda o revistas digitales para encontrar los mejores productos y ofertas del Ciclo 14.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow hover:bg-orange-700"
                  >
                    Empezar a Comprar
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-white flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-orange-600 uppercase">
                          {item.product.brand}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          #{item.product.code}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-stone-900 truncate">
                        {item.product.name}
                      </h4>

                      <div className="font-extrabold text-xs text-stone-950 mt-1">
                        {formatCLP(item.product.price * item.quantity)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden text-xs">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                          className="px-2 py-1 hover:bg-stone-100 text-stone-600 font-bold"
                        >
                          −
                        </button>
                        <span className="px-2 font-bold text-stone-900">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
                          className="px-2 py-1 hover:bg-stone-100 text-stone-600 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Cupón (ej: CICLO14)"
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold"
                  >
                    Aplicar
                  </button>
                </div>

                {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-600 font-bold">{couponSuccess}</p>}

                <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-200">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-stone-900">{formatCLP(cartSubtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Descuento cupón:</span>
                      <span>-{formatCLP(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Despacho:</span>
                    <span className="font-semibold text-stone-900">
                      {isFreeShipping ? 'GRATIS' : formatCLP(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-stone-950 pt-1 border-t border-stone-200">
                    <span>Total a Pagar:</span>
                    <span className="text-base text-orange-600">{formatCLP(finalTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Continuar a Pagar</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-scale-in relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                  Paso {checkoutStep} de 3
                </span>
                <h3 className="text-xl font-black text-stone-900">
                  {checkoutStep === 1 && 'Datos de Contacto'}
                  {checkoutStep === 2 && 'Dirección y Tipo de Entrega'}
                  {checkoutStep === 3 && 'Método de Pago y Confirmación'}
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-1.5 rounded-full ${checkoutStep >= 1 ? 'bg-orange-600' : 'bg-stone-200'}`} />
              <div className={`flex-1 h-1.5 rounded-full ${checkoutStep >= 2 ? 'bg-orange-600' : 'bg-stone-200'}`} />
              <div className={`flex-1 h-1.5 rounded-full ${checkoutStep >= 3 ? 'bg-orange-600' : 'bg-stone-200'}`} />
            </div>

            {/* Step 1 */}
            {checkoutStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Carolina Rojas Valenzuela"
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      RUT / DNI *
                    </label>
                    <input
                      type="text"
                      value={customerRut}
                      onChange={(e) => setCustomerRut(e.target.value)}
                      placeholder="12.345.678-9"
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Teléfono WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+56912345678"
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Correo Electrónico (para boleta y seguimiento) *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="carolina.rojas@gmail.com"
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  onClick={() => setCheckoutStep(2)}
                  disabled={!customerName.trim() || !customerPhone.trim()}
                  className="w-full mt-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black text-sm transition-all"
                >
                  Continuar a Entrega →
                </button>
              </div>
            )}

            {/* Step 2 */}
            {checkoutStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setShippingType('delivery')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      shippingType === 'delivery'
                        ? 'border-orange-600 bg-orange-50/50'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-stone-900">🚚 Despacho a Domicilio</div>
                    <div className="text-xs text-stone-500 mt-1">
                      {isFreeShipping ? 'Envío Gratis' : '$3.990 en todo Chile'}
                    </div>
                  </div>

                  <div
                    onClick={() => setShippingType('pickup')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      shippingType === 'pickup'
                        ? 'border-orange-600 bg-orange-50/50'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-stone-900">🤝 Retiro Consultora</div>
                    <div className="text-xs text-stone-500 mt-1">Gratis coordinado</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Región
                    </label>
                    <select
                      value={shippingRegion}
                      onChange={(e) => setShippingRegion(e.target.value)}
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option>Región Metropolitana</option>
                      <option>Valparaíso</option>
                      <option>Biobío</option>
                      <option>Antofagasta</option>
                      <option>Coquimbo</option>
                      <option>Maule</option>
                      <option>La Araucanía</option>
                      <option>Los Lagos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Comuna / Ciudad
                    </label>
                    <input
                      type="text"
                      value={shippingCommune}
                      onChange={(e) => setShippingCommune(e.target.value)}
                      placeholder="Ej: Providencia, Las Condes, Viña..."
                      className="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Dirección, Número y Depto *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Ej: Av. Providencia 1234, Depto 402"
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="w-1/3 py-3 rounded-xl border border-stone-200 font-bold text-xs text-stone-700 hover:bg-stone-50"
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={() => setCheckoutStep(3)}
                    disabled={shippingType === 'delivery' && !shippingAddress.trim()}
                    className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black text-sm"
                  >
                    Continuar al Pago →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {checkoutStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <div
                    onClick={() => setPaymentMethod('webpay')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === 'webpay'
                        ? 'border-orange-600 bg-orange-50/50'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm text-stone-900">💳 Webpay Plus (Transbank)</div>
                      <div className="text-xs text-stone-500">Tarjetas de Débito, Crédito y Redcompra</div>
                    </div>
                    <span className="text-xs font-bold text-orange-600 bg-white px-2 py-1 rounded border border-orange-200">
                      Recomendado
                    </span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-orange-600 bg-orange-50/50'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm text-stone-900">🏦 Transferencia Bancaria Directa</div>
                      <div className="text-xs text-stone-500">Banco Santander / Estado - Datos automáticos</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === 'whatsapp'
                        ? 'border-orange-600 bg-orange-50/50'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm text-stone-900">💬 Coordinar y Pagar por WhatsApp</div>
                      <div className="text-xs text-stone-500">Envía el pedido directamente a tu consultora</div>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Productos ({totalCartCount}):</span>
                    <span className="font-bold text-stone-900">{formatCLP(cartSubtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Descuento Cupón:</span>
                      <span>-{formatCLP(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Despacho:</span>
                    <span className="font-bold text-stone-900">
                      {shippingFee === 0 ? 'GRATIS' : formatCLP(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-stone-950 pt-2 border-t border-stone-200">
                    <span>Total a Pagar:</span>
                    <span className="text-orange-600">{formatCLP(finalTotal)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="w-1/3 py-3 rounded-xl border border-stone-200 font-bold text-xs text-stone-700 hover:bg-stone-50"
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={handleCompleteOrder}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Confirmar y Pagar ({formatCLP(finalTotal)})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. ORDER CONFIRMATION */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-3xl flex items-center justify-center mx-auto mb-4 font-black">
              ✓
            </div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              ¡Compra Confirmada con Éxito!
            </span>
            <h3 className="text-2xl font-black text-stone-950 mt-1 mb-2">
              Orden #{confirmedOrder.orderNumber}
            </h3>
            <p className="text-xs text-stone-500 mb-6 max-w-sm mx-auto leading-relaxed">
              Gracias <strong>{confirmedOrder.customerName}</strong> por tu compra. Hemos registrado tu pedido con entrega en{' '}
              <strong>{confirmedOrder.city}</strong>.
            </p>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left space-y-2 text-xs mb-6">
              <div className="flex justify-between text-stone-500">
                <span>Fecha:</span>
                <span className="font-semibold text-stone-800">{confirmedOrder.date}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Método de Pago:</span>
                <span className="font-semibold text-stone-800 uppercase">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Total Pagado:</span>
                <span className="font-black text-stone-950 text-sm">{formatCLP(confirmedOrder.total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={buildWhatsAppOrderLink(confirmedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>📲 Compartir Comprobante por WhatsApp</span>
              </a>
              <button
                onClick={() => setConfirmedOrder(null)}
                className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50"
              >
                Seguir Comprando en la Tienda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. CATALOG VIEWER */}
      {activeCatalog && (
        <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col animate-fade-in">
          <div className="bg-stone-900 border-b border-stone-800 px-4 py-2.5 flex items-center justify-between text-white select-none">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setActiveCatalog(null)}
                className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                title="Cerrar visor (ESC)"
              >
                ✕
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate">{activeCatalog.title}</span>
                  <span className="hidden sm:inline text-xs text-stone-400">• {activeCatalog.campaign}</span>
                </div>
                <div className="text-xs text-stone-400">
                  Página <strong className="text-white">{currentPage}</strong> de {activeCatalog.totalPages}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
                <button onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))} className="px-2 py-1 text-xs text-stone-300 hover:text-white font-bold">
                  −
                </button>
                <span className="px-2 text-xs font-mono text-stone-400">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))} className="px-2 py-1 text-xs text-stone-300 hover:text-white font-bold">
                  +
                </button>
              </div>

              <button
                onClick={() => setShowThumbnails((prev) => !prev)}
                className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                  showThumbnails ? 'bg-orange-600 text-white border-orange-500' : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                }`}
                title="Miniaturas"
              >
                📑
              </button>

              <a
                href={activeCatalog.pdfUrl}
                download
                className="hidden md:flex p-2 rounded-lg bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700 text-xs font-bold"
                title="Descargar PDF"
              >
                ⬇️ PDF
              </a>

              <button
                onClick={() => setActiveCatalog(null)}
                className="p-2 rounded-lg bg-stone-800 hover:bg-red-600 text-stone-300 hover:text-white text-xs font-bold"
              >
                ✕ Salir
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-auto p-2 sm:p-4 bg-stone-950">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className={`absolute left-3 z-10 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-black text-white shadow-xl backdrop-blur-md transition-all ${
                currentPage <= 1 ? 'opacity-20 cursor-not-allowed' : 'opacity-80 hover:opacity-100 hover:scale-110'
              }`}
            >
              ◀
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(activeCatalog.totalPages, p + 1))}
              disabled={currentPage >= activeCatalog.totalPages}
              className={`absolute right-3 z-10 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-black text-white shadow-xl backdrop-blur-md transition-all ${
                currentPage >= activeCatalog.totalPages ? 'opacity-20 cursor-not-allowed' : 'opacity-80 hover:opacity-100 hover:scale-110'
              }`}
            >
              ▶
            </button>

            <div
              className="relative max-h-full max-w-full flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                key={`${activeCatalog.slug}-${currentPage}`}
                src={`/catalogs/${activeCatalog.slug}/${currentPage}.webp`}
                alt={`Página ${currentPage} - ${activeCatalog.title}`}
                className="max-h-[78vh] sm:max-h-[82vh] w-auto object-contain rounded-lg shadow-2xl select-none"
              />
            </div>
          </div>

          {showThumbnails && (
            <div className="bg-stone-900 border-t border-stone-800 p-2 sm:p-3 overflow-x-auto flex gap-2 h-28 sm:h-32 select-none">
              {Array.from({ length: activeCatalog.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <div
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 relative transition-all ${
                    currentPage === pageNum ? 'border-orange-500 scale-105 shadow-md' : 'border-stone-700 opacity-60 hover:opacity-100'
                  }`}
                  style={{ width: '60px' }}
                >
                  <img
                    src={`/catalogs/${activeCatalog.slug}/${pageNum}.webp`}
                    alt={`Pág. ${pageNum}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[10px] text-center text-white py-0.5 font-bold">
                    {pageNum}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-stone-900 border-t border-stone-800 px-4 py-3 flex items-center justify-between gap-3 text-white">
            <div className="flex-1 flex items-center justify-center gap-3 max-w-md mx-auto">
              <span className="text-xs text-stone-400">1</span>
              <input
                type="range"
                min={1}
                max={activeCatalog.totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-full accent-orange-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              />
              <span className="text-xs text-stone-400">{activeCatalog.totalPages}</span>
              <div className="flex items-center gap-1 bg-stone-800 rounded-lg px-2 py-1 border border-stone-700 text-xs">
                <span>Pág.</span>
                <input
                  type="number"
                  min={1}
                  max={activeCatalog.totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 1 && val <= activeCatalog.totalPages) setCurrentPage(val);
                  }}
                  className="w-10 bg-transparent text-center font-bold text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. FOOTER */}
      <footer className="bg-stone-950 text-stone-400 py-12 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-orange-600 text-white font-black text-xs flex items-center justify-center">
                  C14
                </span>
                <span className="font-black text-sm text-white tracking-tight">
                  BEAUTY & STORE CHILE
                </span>
              </div>
              <p className="text-stone-500 leading-relaxed">
                Tienda oficial digital con más de 50 productos de catálogo en stock para todo Chile. Natura Cosméticos, Avon y Casa & Estilo.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Garantías de Compra
              </h4>
              <ul className="space-y-1.5 text-stone-400">
                <li>✓ Productos 100% Originales</li>
                <li>✓ Envío Seguro a todo Chile</li>
                <li>✓ Garantía de Satisfacción Total</li>
                <li>✓ Pagos encriptados con Webpay</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Revistas Digitales
              </h4>
              <ul className="space-y-1.5 text-stone-400">
                {CATALOGS.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => handleOpenCatalog(c, 1)}
                      className="hover:text-white transition-colors"
                    >
                      {c.title} ({c.totalPages} págs)
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
                Medios de Pago Aceptados
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded text-[11px] text-stone-300 font-mono">
                  Webpay Plus
                </span>
                <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded text-[11px] text-stone-300 font-mono">
                  Redcompra
                </span>
                <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded text-[11px] text-stone-300 font-mono">
                  Visa / Mastercard
                </span>
                <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded text-[11px] text-stone-300 font-mono">
                  Transferencia
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Atención personalizada y pedidos por WhatsApp 24/7.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
            <div>
              © 2026 Beauty & Store Chile • Campaña Ciclo 14. Todos los derechos reservados.
            </div>
            <div>
              Desarrollado sobre Vite + React + TypeScript + Tailwind CSS
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
