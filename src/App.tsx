import { useState, useEffect, useMemo } from 'react';
export type { Product, CartItem, CatalogItem, OrderConfirmation } from './types';
import type { CatalogItem, CartItem, Product, OrderConfirmation } from './types';
import { PRODUCTS } from './data/products';
import { HeroSection } from './HeroSection';
import { ProductImage } from './ProductImage';
import { CategoryDiscovery } from './CategoryDiscovery';
import { Heart, BookOpen, SlidersHorizontal, ArrowUpDown, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import './storefront.css';

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'discount'
  | 'name-asc'
  | 'name-desc'
  | 'page-asc';

export type PriceFilterOption =
  | 'all'
  | 'under5k'
  | '5k-15k'
  | '15k-30k'
  | 'over30k'
  | 'custom';

export type DiscountFilterOption =
  | 'all'
  | 'any'
  | '20plus'
  | '30plus'
  | '40plus';

export type CatalogFilterOption =
  | 'all'
  | 'natura'
  | 'avon'
  | 'casa-estilo'
  | 'ciclo-14';

export type PriceStatusOption =
  | 'all'
  | 'with-price'
  | 'consult';


const FEATURED = ['natura-228525', 'avon-135847', 'natura-187709', 'natura-110181', 'natura-163706', 'natura-97701', 'natura-116582', 'natura-174032'];
const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

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
    badgeColor: 'bg-black text-white',
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
    badgeColor: 'bg-black text-white',
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
    badgeColor: 'bg-black text-white',
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
    badgeColor: 'bg-black text-white',
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
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'store' | 'catalogs'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos los Productos');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas las Marcas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [priceFilter, setPriceFilter] = useState<PriceFilterOption>('all');
  const [customMinPrice, setCustomMinPrice] = useState<string>('');
  const [customMaxPrice, setCustomMaxPrice] = useState<string>('');
  const [discountFilter, setDiscountFilter] = useState<DiscountFilterOption>('all');
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilterOption>('all');
  const [priceStatusFilter, setPriceStatusFilter] = useState<PriceStatusOption>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

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
        triggerToast('Guardado en tus favoritos');
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
    if (product.priceStatus === 'consult') {
      setQuickViewProduct(product);
      triggerToast('Consulta el precio y las condiciones en la página de la revista.');
      return;
    }
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


  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (showOnlyFavorites && !favorites.includes(p.id)) return false;

      const matchesCategory =
        selectedCategory === 'Todos los Productos' || p.category === selectedCategory;
      const matchesBrand =
        selectedBrand === 'Todas las Marcas' || p.brand === selectedBrand;
      const matchesSearch = normalizeSearch([p.name, p.description, p.brand, p.code].join(' ')).includes(normalizeSearch(searchQuery.trim()));

      // Price Presets
      let matchesPrice = true;
      if (priceFilter === 'under5k') matchesPrice = p.price < 5000;
      else if (priceFilter === '5k-15k') matchesPrice = p.price >= 5000 && p.price <= 15000;
      else if (priceFilter === '15k-30k') matchesPrice = p.price > 15000 && p.price <= 30000;
      else if (priceFilter === 'over30k') matchesPrice = p.price > 30000;

      // Custom price min & max
      if (customMinPrice.trim()) {
        const minVal = parseFloat(customMinPrice.replace(/[^0-9]/g, ''));
        if (!isNaN(minVal) && p.price < minVal) matchesPrice = false;
      }
      if (customMaxPrice.trim()) {
        const maxVal = parseFloat(customMaxPrice.replace(/[^0-9]/g, ''));
        if (!isNaN(maxVal) && p.price > maxVal) matchesPrice = false;
      }

      // Hide price consult items when filtering by specific prices
      if ((priceFilter !== 'all' || customMinPrice.trim() || customMaxPrice.trim()) && p.priceStatus === 'consult') {
        matchesPrice = false;
      }

      // Discount / Offers Filter
      let matchesDiscount = true;
      if (discountFilter === 'any') matchesDiscount = p.discountPercent > 0;
      else if (discountFilter === '20plus') matchesDiscount = p.discountPercent >= 20;
      else if (discountFilter === '30plus') matchesDiscount = p.discountPercent >= 30;
      else if (discountFilter === '40plus') matchesDiscount = p.discountPercent >= 40;

      // Catalog origin filter
      let matchesCatalog = true;
      if (catalogFilter !== 'all') matchesCatalog = p.catalogSlug === catalogFilter;

      // Price Status filter
      let matchesPriceStatus = true;
      if (priceStatusFilter === 'with-price') matchesPriceStatus = p.priceStatus !== 'consult';
      else if (priceStatusFilter === 'consult') matchesPriceStatus = p.priceStatus === 'consult';

      return (
        matchesCategory &&
        matchesBrand &&
        matchesSearch &&
        matchesPrice &&
        matchesDiscount &&
        matchesCatalog &&
        matchesPriceStatus
      );
    }).sort((a, b) => {
      // Sort by price (ascending - menor a mayor)
      if (sortBy === 'price-asc') {
        if ((a.priceStatus === 'consult') !== (b.priceStatus === 'consult')) {
          return a.priceStatus === 'consult' ? 1 : -1;
        }
        return a.price - b.price;
      }
      // Sort by price (descending - mayor a menor)
      if (sortBy === 'price-desc') {
        if ((a.priceStatus === 'consult') !== (b.priceStatus === 'consult')) {
          return a.priceStatus === 'consult' ? 1 : -1;
        }
        return b.price - a.price;
      }
      // Sort by discount %
      if (sortBy === 'discount') {
        if (b.discountPercent !== a.discountPercent) {
          return b.discountPercent - a.discountPercent;
        }
        return b.price - a.price;
      }
      // Sort by Name A-Z
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      }
      // Sort by Name Z-A
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name, 'es', { sensitivity: 'base' });
      }
      // Sort by Catalog page
      if (sortBy === 'page-asc') {
        return a.page - b.page;
      }
      // Default: Featured
      const idxA = FEATURED.indexOf(a.id);
      const idxB = FEATURED.indexOf(b.id);
      return (idxA < 0 ? 999 : idxA) - (idxB < 0 ? 999 : idxB);
    });
  }, [
    selectedCategory,
    selectedBrand,
    searchQuery,
    sortBy,
    priceFilter,
    customMinPrice,
    customMaxPrice,
    discountFilter,
    catalogFilter,
    priceStatusFilter,
    showOnlyFavorites,
    favorites,
  ]);

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

  const hasActiveFilterOrSearch =
    showOnlyFavorites ||
    Boolean(searchQuery.trim()) ||
    selectedCategory !== 'Todos los Productos' ||
    selectedBrand !== 'Todas las Marcas' ||
    priceFilter !== 'all' ||
    discountFilter !== 'all' ||
    catalogFilter !== 'all' ||
    priceStatusFilter !== 'all' ||
    Boolean(customMinPrice.trim()) ||
    Boolean(customMaxPrice.trim());

  const showDiscovery = !hasActiveFilterOrSearch;

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'Todos los Productos') count++;
    if (selectedBrand !== 'Todas las Marcas') count++;
    if (priceFilter !== 'all' || customMinPrice.trim() || customMaxPrice.trim()) count++;
    if (discountFilter !== 'all') count++;
    if (catalogFilter !== 'all') count++;
    if (priceStatusFilter !== 'all') count++;
    if (searchQuery.trim()) count++;
    if (showOnlyFavorites) count++;
    return count;
  }, [
    selectedCategory,
    selectedBrand,
    priceFilter,
    customMinPrice,
    customMaxPrice,
    discountFilter,
    catalogFilter,
    priceStatusFilter,
    searchQuery,
    showOnlyFavorites,
  ]);

  const advancedFiltersActiveCount = useMemo(() => {
    let count = 0;
    if (discountFilter !== 'all') count++;
    if (catalogFilter !== 'all') count++;
    if (priceStatusFilter !== 'all') count++;
    if (customMinPrice.trim() || customMaxPrice.trim()) count++;
    return count;
  }, [discountFilter, catalogFilter, priceStatusFilter, customMinPrice, customMaxPrice]);

  const activeFilterChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (searchQuery.trim()) {
      chips.push({
        label: `Búsqueda: "${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(''),
      });
    }
    if (selectedCategory !== 'Todos los Productos') {
      chips.push({
        label: `Categoría: ${selectedCategory}`,
        onRemove: () => setSelectedCategory('Todos los Productos'),
      });
    }
    if (selectedBrand !== 'Todas las Marcas') {
      chips.push({
        label: `Marca: ${selectedBrand}`,
        onRemove: () => setSelectedBrand('Todas las Marcas'),
      });
    }
    if (priceFilter !== 'all' && priceFilter !== 'custom') {
      const priceLabels: Record<string, string> = {
        under5k: 'Hasta $5.000',
        '5k-15k': '$5.000 - $15.000',
        '15k-30k': '$15.000 - $30.000',
        over30k: 'Más de $30.000',
      };
      chips.push({
        label: `Precio: ${priceLabels[priceFilter] || priceFilter}`,
        onRemove: () => setPriceFilter('all'),
      });
    }
    if (customMinPrice.trim() || customMaxPrice.trim()) {
      const minTxt = customMinPrice.trim() ? formatCLP(+customMinPrice.replace(/[^0-9]/g, '')) : '$0';
      const maxTxt = customMaxPrice.trim() ? formatCLP(+customMaxPrice.replace(/[^0-9]/g, '')) : 'Sin tope';
      chips.push({
        label: `Rango: ${minTxt} - ${maxTxt}`,
        onRemove: () => {
          setCustomMinPrice('');
          setCustomMaxPrice('');
          setPriceFilter('all');
        },
      });
    }
    if (discountFilter !== 'all') {
      const discountLabels: Record<string, string> = {
        any: 'En Oferta',
        '20plus': '≥ 20% OFF',
        '30plus': '≥ 30% OFF',
        '40plus': '≥ 40% OFF',
      };
      chips.push({
        label: `Oferta: ${discountLabels[discountFilter] || discountFilter}`,
        onRemove: () => setDiscountFilter('all'),
      });
    }
    if (catalogFilter !== 'all') {
      const cat = CATALOGS.find((c) => c.slug === catalogFilter);
      chips.push({
        label: `Revista: ${cat ? cat.brand : catalogFilter}`,
        onRemove: () => setCatalogFilter('all'),
      });
    }
    if (priceStatusFilter !== 'all') {
      chips.push({
        label: priceStatusFilter === 'with-price' ? 'Precio publicado' : 'Precio a consultar',
        onRemove: () => setPriceStatusFilter('all'),
      });
    }
    if (showOnlyFavorites) {
      chips.push({
        label: 'Solo Favoritos',
        onRemove: () => setShowOnlyFavorites(false),
      });
    }
    return chips;
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    priceFilter,
    customMinPrice,
    customMaxPrice,
    discountFilter,
    catalogFilter,
    priceStatusFilter,
    showOnlyFavorites,
  ]);

  const scrollToProducts = () => requestAnimationFrame(() => document.getElementById('product-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

  const resetFilters = () => {
    setSelectedCategory('Todos los Productos');
    setSelectedBrand('Todas las Marcas');
    setSearchQuery('');
    setSortBy('featured');
    setPriceFilter('all');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setDiscountFilter('all');
    setCatalogFilter('all');
    setPriceStatusFilter('all');
    setShowOnlyFavorites(false);
    setVisibleCount(16);
  };

  const browseCategory = (category: string) => {
    setActiveTab('store');
    setSelectedCategory(category);
    setSelectedBrand('Todas las Marcas');
    setPriceFilter('all');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setDiscountFilter('all');
    setCatalogFilter('all');
    setPriceStatusFilter('all');
    setSearchQuery('');
    setShowOnlyFavorites(false);
    setVisibleCount(16);
    scrollToProducts();
  };


  return (
    <div className="beauty-store min-h-screen flex flex-col text-black">
      <div id="catalogo-store">
        {/* 1. ANNOUNCEMENT BAR */}
      <div className="beauty-announcement">Un nuevo ciclo para descubrir tus favoritos · Natura & Avon</div>

      {/* 2. NAVBAR */}
      <header className="beauty-header sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
          {/* Brand Logo */}
          <div
            onClick={() => {
              setActiveTab('store');
              setShowOnlyFavorites(false);
            }}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <g transform="rotate(-35 12 12)">
                  <rect x="5.5" y="3.5" width="4.5" height="17" rx="2.25" fill="#ffffff" />
                  <rect x="14" y="3.5" width="4.5" height="17" rx="2.25" fill="#ffffff" />
                </g>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base tracking-tight text-black leading-none">
                  Natura & Avon
                </span>
                <span className="hidden lg:inline bg-[#F4F4F6] text-black text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-black/8">
                  {PRODUCTS.length} Productos
                </span>
              </div>
              <p className="text-[11px] text-black/50 font-normal tracking-wide mt-0.5">
                Ciclo 14 · 2026 Chile
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="order-last w-full md:order-none md:flex-1 md:max-w-md">
            <div className="relative">
              <input
                type="text"
                aria-label="Buscar productos por nombre o código"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveTab('store'); }}
                placeholder="Busca tu favorito, marca o código..."
                className="w-full pl-10 pr-4 py-2 bg-[#F4F4F6] border border-black/8 rounded-full text-xs font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              />
              <svg className="w-4 h-4 absolute left-3.5 top-2.5 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button aria-label="Limpiar búsqueda" onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-black/40 hover:text-black text-xs font-bold">
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
              className={`px-3 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                showOnlyFavorites
                  ? 'bg-black text-white border-black'
                  : 'bg-white hover:bg-[#F4F4F6] text-black border-black/10'
              }`}
              title="Ver mis favoritos"
            >
              <Heart size={17} fill={showOnlyFavorites ? "currentColor" : "none"} />
              <span className="hidden sm:inline">Favoritos</span>
              {favorites.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
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
              className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                activeTab === 'catalogs'
                  ? 'bg-black text-white border-black'
                  : 'bg-white hover:bg-[#F4F4F6] text-black border-black/10'
              }`}
            >
              <BookOpen size={17} />
              <span className="hidden sm:inline">Revistas Digitales</span>
              <span className="sr-only sm:hidden">Revistas</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              aria-label="Abrir carrito"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-black hover:bg-neutral-900 text-white font-medium text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline font-mono">{formatCLP(cartSubtotal)}</span>
              <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center">
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Product Code Search Strip */}
        <details className="beauty-quick-order border-t border-black/8 px-4 py-2 text-xs">
          <summary>¿Ya tienes tus códigos? Haz tu pedido rápido</summary>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-black/75 font-medium">
              <span>⚡</span>
              <span><strong>Pedido Rápido por Código:</strong> Inscribe el código de catálogo para agregarlo:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickCodeInput}
                onChange={(e) => setQuickCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickCodeAdd()}
                placeholder="Ej: 135849"
                className="px-3 py-1 bg-white border border-black/15 rounded-full text-xs font-mono w-28 text-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button
                onClick={handleQuickCodeAdd}
                className="px-4 py-1 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-medium transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </details>

        {/* Categories Bar */}
        <div className="border-t border-stone-100 bg-white overflow-x-auto no-scrollbar">
          <div className="beauty-category-nav max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2">
            {CATEGORIES.map((cat) => {
              const count =
                cat === 'Todos los Productos'
                  ? PRODUCTS.length
                  : PRODUCTS.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => browseCategory(cat)}
                  aria-pressed={selectedCategory === cat && activeTab === 'store' && !showOnlyFavorites}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat && activeTab === 'store' && !showOnlyFavorites
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-[#F4F4F6] text-black/70 hover:bg-[#EAEAEA] border border-black/8'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat && activeTab === 'store' && !showOnlyFavorites
                        ? 'bg-white/30 text-white'
                        : 'bg-stone-200 text-black/60'
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
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-800 flex items-center gap-3 animate-bounce">
          <span className="text-white font-bold">✓</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setIsCartOpen(true)}
            className="text-xs font-medium text-white hover:text-white/80 underline ml-2"
          >
            Ver Carrito
          </button>
        </div>
      )}

      {/* 4. CONTENT */}
      {activeTab === 'store' ? (
        <main className="beauty-main flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {showDiscovery && <>
            <HeroSection productCount={PRODUCTS.length} onExploreCatalog={scrollToProducts} onMakeup={() => browseCategory('Maquillaje')} onOpenCatalogs={() => setActiveTab('catalogs')} />
            <CategoryDiscovery onSelect={browseCategory} />
          </>}
          <div id="product-results" className="beauty-section-heading beauty-results-heading">
            <div>
              <span className="beauty-kicker">{showDiscovery ? 'SELECCIONADOS PARA TI' : 'TU CATÁLOGO'}</span>
              <h2>{showOnlyFavorites ? 'Tus favoritos' : searchQuery ? `Resultados para “${searchQuery}”` : selectedCategory !== 'Todos los Productos' ? selectedCategory : 'Encuentra tu próximo favorito'}</h2>
            </div>
            <div className="beauty-results-count">
              <p role="status">{filteredProducts.length.toLocaleString('es-CL')} productos</p>
              {hasActiveFilterOrSearch && (
                <button onClick={resetFilters}>Limpiar filtros</button>
              )}
            </div>
          </div>

          {/* Filtering & Toolbar */}
          <div className="beauty-filters bg-white rounded-2xl p-4 border border-black/8 shadow-xs mb-4">
            {/* Top Row: Brand Pills & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/8">
              {/* Brand Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full no-scrollbar py-0.5">
                <span className="text-xs font-semibold text-black/40 mr-1 uppercase tracking-wider hidden lg:inline">
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
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        selectedBrand === brand
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-[#F4F4F6] hover:bg-[#EAEAEA] text-black/70 border border-black/8'
                      }`}
                    >
                      <span>{brand}</span>
                      <span className="text-[10px] opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick action buttons on right: Solo Ofertas + Más Filtros */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Solo Ofertas toggle */}
                <button
                  onClick={() => setDiscountFilter((prev) => (prev === 'any' ? 'all' : 'any'))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    discountFilter === 'any'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-[#F4F4F6] hover:bg-[#EAEAEA] text-black/80 border border-black/8'
                  }`}
                  title="Mostrar solo productos con descuento"
                >
                  <span>🔥</span>
                  <span>Solo Ofertas</span>
                  <span className="text-[10px] opacity-60">
                    ({PRODUCTS.filter((p) => p.discountPercent > 0).length})
                  </span>
                </button>

                {/* Más Filtros toggle */}
                <button
                  onClick={() => setShowAdvancedFilters((prev) => !prev)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    showAdvancedFilters || advancedFiltersActiveCount > 0
                      ? 'bg-black text-white border-black'
                      : 'bg-[#F4F4F6] hover:bg-[#EAEAEA] text-black border-black/8'
                  }`}
                >
                  <SlidersHorizontal size={13} />
                  <span>Más Filtros</span>
                  {advancedFiltersActiveCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                      {advancedFiltersActiveCount}
                    </span>
                  )}
                  {showAdvancedFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            {/* Bottom Row: Quick Price Sort & Price Range */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              {/* Quick Sort Controls */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-black/50 font-medium flex items-center gap-1 mr-1">
                  <ArrowUpDown size={13} />
                  <span>Ordenar:</span>
                </span>
                {/* Quick Sort buttons */}
                <button
                  onClick={() => setSortBy('featured')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    sortBy === 'featured'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-[#F4F4F6] hover:bg-[#EAEAEA] text-black/70 border border-black/8'
                  }`}
                >
                  Destacados
                </button>
                <button
                  onClick={() => setSortBy('price-asc')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    sortBy === 'price-asc'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-[#F4F4F6] hover:bg-[#EAEAEA] text-black/70 border border-black/8'
                  }`}
                  title="Ordenar precio de menor a mayor"
                >
                  <span>Precio: Menor</span>
                  <span className="text-[11px]">↑</span>
                </button>
                <button
                  onClick={() => setSortBy('price-desc')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    sortBy === 'price-desc'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-[#F4F4F6] hover:bg-[#EAEAEA] text-black/70 border border-black/8'
                  }`}
                  title="Ordenar precio de mayor a menor"
                >
                  <span>Precio: Mayor</span>
                  <span className="text-[11px]">↓</span>
                </button>
                <button
                  onClick={() => setSortBy('discount')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    sortBy === 'discount'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-[#F4F4F6] hover:bg-[#EAEAEA] text-black/70 border border-black/8'
                  }`}
                >
                  <span>Mayor Descuento %</span>
                </button>

                {/* Additional Sort Options Dropdown */}
                <select
                  id="sort-products"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Más opciones de ordenamiento"
                  className="bg-[#F4F4F6] border border-black/10 rounded-full px-2.5 py-1 font-medium text-black focus:outline-none focus:ring-1 focus:ring-black text-xs"
                >
                  <option value="featured">Destacados</option>
                  <option value="price-asc">Precio: menor a mayor ↑</option>
                  <option value="price-desc">Precio: mayor a menor ↓</option>
                  <option value="discount">Mayor Descuento (%)</option>
                  <option value="name-asc">Nombre: A - Z</option>
                  <option value="name-desc">Nombre: Z - A</option>
                  <option value="page-asc">Página de Revista (1-194)</option>
                </select>
              </div>

              {/* Price Range Dropdown */}
              <div className="flex items-center gap-1.5 text-xs ml-auto">
                <label htmlFor="price-filter" className="text-black/50 font-medium">Rango Precio:</label>
                <select
                  id="price-filter"
                  value={priceFilter}
                  onChange={(e) => {
                    const val = e.target.value as PriceFilterOption;
                    setPriceFilter(val);
                    if (val !== 'custom') {
                      setCustomMinPrice('');
                      setCustomMaxPrice('');
                    } else {
                      setShowAdvancedFilters(true);
                    }
                  }}
                  className="bg-[#F4F4F6] border border-black/10 rounded-full px-3 py-1 font-medium text-black focus:outline-none focus:ring-1 focus:ring-black text-xs"
                >
                  <option value="all">Todos los precios</option>
                  <option value="under5k">Hasta $5.000 (377)</option>
                  <option value="5k-15k">$5.000 - $15.000 (826)</option>
                  <option value="15k-30k">$15.000 - $30.000 (246)</option>
                  <option value="over30k">Más de $30.000 (71)</option>
                  <option value="custom">Personalizado...</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Panel (collapsible) */}
            {showAdvancedFilters && (
              <div className="mt-4 pt-4 border-t border-black/8 bg-[#FAF8F6] -mx-4 -mb-4 p-4 rounded-b-2xl animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* 1. Rango Personalizado */}
                  <div>
                    <h4 className="font-semibold text-black mb-2 flex items-center gap-1">
                      <span>💰</span>
                      <span>Precio Personalizado (CLP)</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1.5 text-black/40">$</span>
                        <input
                          type="number"
                          placeholder="Mínimo"
                          aria-label="Precio mínimo en pesos chilenos"
                          value={customMinPrice}
                          onChange={(e) => {
                            setCustomMinPrice(e.target.value);
                            setPriceFilter('custom');
                          }}
                          className="w-full pl-6 pr-2 py-1.5 bg-white border border-black/15 rounded-lg text-xs font-mono text-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <span className="text-black/40">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1.5 text-black/40">$</span>
                        <input
                          type="number"
                          placeholder="Máximo"
                          aria-label="Precio máximo en pesos chilenos"
                          value={customMaxPrice}
                          onChange={(e) => {
                            setCustomMaxPrice(e.target.value);
                            setPriceFilter('custom');
                          }}
                          className="w-full pl-6 pr-2 py-1.5 bg-white border border-black/15 rounded-lg text-xs font-mono text-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>
                    {(customMinPrice || customMaxPrice) && (
                      <button
                        onClick={() => {
                          setCustomMinPrice('');
                          setCustomMaxPrice('');
                          setPriceFilter('all');
                        }}
                        className="text-[11px] text-black/50 hover:text-black mt-1.5 underline"
                      >
                        Limpiar precio personalizado
                      </button>
                    )}
                  </div>

                  {/* 2. Nivel de Descuento */}
                  <div>
                    <h4 className="font-semibold text-black mb-2 flex items-center gap-1">
                      <span>🏷️</span>
                      <span>Descuentos & Promociones</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { val: 'all', label: 'Todos' },
                        { val: 'any', label: 'Cualquier oferta' },
                        { val: '20plus', label: '≥ 20% OFF' },
                        { val: '30plus', label: '≥ 30% OFF' },
                        { val: '40plus', label: '≥ 40% OFF' },
                      ].map((d) => (
                        <button
                          key={d.val}
                          onClick={() => setDiscountFilter(d.val as DiscountFilterOption)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                            discountFilter === d.val
                              ? 'bg-black text-white'
                              : 'bg-white hover:bg-neutral-100 text-black/70 border border-black/10'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Catálogo de Origen */}
                  <div>
                    <h4 className="font-semibold text-black mb-2 flex items-center gap-1">
                      <span>📖</span>
                      <span>Revista / Catálogo</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { val: 'all', label: 'Todos' },
                        { val: 'natura', label: 'Revista Natura' },
                        { val: 'avon', label: 'Revista Avon' },
                        { val: 'casa-estilo', label: 'Casa & Estilo' },
                        { val: 'ciclo-14', label: 'Mi Consultoría' },
                      ].map((c) => (
                        <button
                          key={c.val}
                          onClick={() => setCatalogFilter(c.val as CatalogFilterOption)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                            catalogFilter === c.val
                              ? 'bg-black text-white'
                              : 'bg-white hover:bg-neutral-100 text-black/70 border border-black/10'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Disponibilidad de Precio */}
                  <div>
                    <h4 className="font-semibold text-black mb-2 flex items-center gap-1">
                      <span>👁️</span>
                      <span>Visibilidad de Precio</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { val: 'all', label: 'Todos' },
                        { val: 'with-price', label: 'Precio publicado' },
                        { val: 'consult', label: 'A consultar' },
                      ].map((ps) => (
                        <button
                          key={ps.val}
                          onClick={() => setPriceStatusFilter(ps.val as PriceStatusOption)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                            priceStatusFilter === ps.val
                              ? 'bg-black text-white'
                              : 'bg-white hover:bg-neutral-100 text-black/70 border border-black/10'
                          }`}
                        >
                          {ps.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced panel footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/8 text-xs">
                  <span className="text-black/50">
                    {filteredProducts.length.toLocaleString('es-CL')} productos encontrados
                  </span>
                  <div className="flex items-center gap-2">
                    {advancedFiltersActiveCount > 0 && (
                      <button
                        onClick={() => {
                          setDiscountFilter('all');
                          setCatalogFilter('all');
                          setPriceStatusFilter('all');
                          setCustomMinPrice('');
                          setCustomMaxPrice('');
                          if (priceFilter === 'custom') setPriceFilter('all');
                        }}
                        className="text-black/60 hover:text-black underline font-medium"
                      >
                        Restablecer filtros avanzados
                      </button>
                    )}
                    <button
                      onClick={() => setShowAdvancedFilters(false)}
                      className="px-3 py-1 rounded-full bg-black text-white font-medium text-xs hover:bg-neutral-800"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Filter Chips Bar */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-black/40 mr-1">
                Filtros activos ({activeFiltersCount}):
              </span>
              {activeFilterChips.map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/15 text-black text-xs font-medium shadow-2xs"
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={chip.onRemove}
                    className="w-4 h-4 rounded-full bg-black/5 hover:bg-black/15 text-black flex items-center justify-center text-[10px] font-bold transition-colors ml-0.5"
                    title="Eliminar este filtro"
                    aria-label={`Eliminar filtro ${chip.label}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <button
                onClick={resetFilters}
                className="text-xs text-black/60 hover:text-black underline font-medium ml-1 flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>Limpiar todos ({activeFiltersCount})</span>
              </button>
            </div>
          )}

          {/* Favorites Banner if active */}
          {showOnlyFavorites && (
            <div className="bg-[#F4F4F6] border border-black/8 rounded-2xl p-4 mb-6 flex items-center justify-between text-black">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>★</span>
                <span>Mostrando tus {favorites.length} productos favoritos guardados</span>
              </div>
              <button
                onClick={() => setShowOnlyFavorites(false)}
                className="text-xs font-medium text-black hover:text-black/60 underline"
              >
                Ver todos los productos
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-black/10">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-extrabold text-lg text-stone-800">No encontramos productos con estos filtros</h3>
              <p className="text-xs text-black/50 max-w-sm mx-auto mt-1 mb-5">
                Prueba buscando con otro término, limpiando el rango de precios o explorando otra categoría.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-full bg-black text-white font-medium text-xs hover:bg-neutral-800 transition-colors"
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
                      className="beauty-product group bg-white rounded-2xl border border-black/8 overflow-hidden hover:border-black/25 hover:shadow-sm transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5 relative"
                    >
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-105 border ${
                          isFav
                            ? 'bg-black text-white border-black'
                            : 'bg-white/90 hover:bg-white text-black/40 border-black/10'
                        }`}
                        title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                      >
                        <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                      </button>

                      {/* Image Box */}
                      <div
                        className="beauty-product-photo relative aspect-square bg-[#F4F4F6] overflow-hidden cursor-pointer"
                        onClick={() => setQuickViewProduct(product)}
                      >
                        <ProductImage
                          product={product}
                          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
                          {product.discountPercent > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-medium shadow-xs">
                              -{product.discountPercent}%
                            </span>
                          )}
                          {product.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-900 text-white shadow-xs">
                              {product.badge}
                            </span>
                          )}
                        </div>

                        {/* Brand Tag */}
                        <div className="absolute bottom-2 left-2 pointer-events-none">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-medium uppercase tracking-wider text-black border border-black/8 shadow-xs">
                            {product.brand}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Rating & Code */}
                          <div className="flex items-center justify-between text-[11px] text-black/40 mb-1">
                            {product.reviewsCount > 0 && <div className="flex items-center text-black font-medium">
                              <span>★</span>
                              <span className="text-black ml-1">{product.rating}</span>
                              <span className="text-black/40 ml-0.5">({product.reviewsCount})</span>
                            </div>}
                            <span className="font-mono text-black/50">Cód: {product.code}</span>
                          </div>

                          {/* Title */}
                          <h3
                            onClick={() => setQuickViewProduct(product)}
                            className="font-medium text-sm text-black line-clamp-2 leading-snug group-hover:text-black/70 transition-colors cursor-pointer mb-2"
                          >
                            {product.name}
                          </h3>

                          {/* Prices */}
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="font-semibold text-base sm:text-lg text-black">
                              {product.priceStatus === 'consult' ? 'Consultar en revista' : formatCLP(product.price)}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="text-xs text-black/40 line-through">
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
                              className="w-full text-left text-[11px] text-black/60 hover:text-black font-medium mb-3 flex items-center justify-between py-1.5 px-2.5 rounded-full bg-[#F4F4F6] hover:bg-[#EAEAEA] transition-colors"
                            >
                              <span>📖 Ver en Revista (Pág. {product.page})</span>
                              <span>→</span>
                            </button>
                          )}

                          {/* Add button */}
                          <button
                            onClick={(e) => handleAddToCart(product, 1, e)}
                            className="w-full py-2.5 px-3 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>{product.priceStatus === 'consult' ? 'Ver condiciones' : 'Agregar al Carrito'}</span>
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
                    className="px-6 py-2.5 rounded-full bg-white border border-black/15 hover:bg-[#F4F4F6] text-black font-medium text-xs shadow-xs transition-all hover:scale-105"
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
              <span className="text-xs font-bold text-black font-semibold uppercase tracking-widest">
                Catálogos Digitales Oficiales
              </span>
              <h2 className="text-3xl font-black text-black tracking-tight mt-0.5">
                Revistas Interactivas Ciclo 14 / 2026 Chile
              </h2>
              <p className="text-sm text-black/50 mt-1">
                Hojea todas las páginas en alta definición. Haz clic en cualquier portada para abrir el visor interactivo.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('store')}
              className="px-4 py-2 rounded-full bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Volver a la Tienda
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATALOGS.map((catalog) => (
              <div
                key={catalog.id}
                className="group bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div
                  onClick={() => handleOpenCatalog(catalog, 1)}
                  className="relative aspect-[3/4] bg-[#FAFAFA] cursor-pointer overflow-hidden"
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
                    <span className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs shadow-lg">
                      Abrir Revista
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-black font-semibold block mb-1">
                      {catalog.brand} • {catalog.campaign}
                    </span>
                    <h3
                      onClick={() => handleOpenCatalog(catalog, 1)}
                      className="font-bold text-lg text-black hover:text-black font-semibold transition-colors cursor-pointer leading-snug mb-1"
                    >
                      {catalog.title}
                    </h3>
                    <p className="text-xs text-black/50 line-clamp-2 leading-relaxed mb-4">
                      {catalog.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                      <button
                        onClick={() => handleOpenCatalog(catalog, 1)}
                        className="flex-1 py-2.5 px-3 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        Ver Revista
                      </button>
                      <a
                        href={catalog.pdfUrl}
                        download
                        className="p-2.5 rounded-full border border-black/10 hover:bg-[#F4F4F6] text-black/60 transition-colors"
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
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-black/10 animate-scale-in relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#FAFAFA] text-black/40 hover:text-black/80 transition-colors"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="aspect-square bg-[#F4F4F6] rounded-2xl overflow-hidden border border-black/10 relative">
                <ProductImage
                  product={quickViewProduct}
                  className="w-full h-full"
                  loading="eager"
                />
                {quickViewProduct.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black text-white text-xs font-medium shadow-xs">
                    -{quickViewProduct.discountPercent}% OFF
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-black font-semibold">
                    {quickViewProduct.brand}
                  </span>
                  <span className="text-white/80">•</span>
                  <span className="text-xs text-black/50 font-mono">
                    Cód: {quickViewProduct.code}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-black leading-snug mb-2">
                  {quickViewProduct.name}
                </h2>

                {quickViewProduct.reviewsCount > 0 && <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center text-black font-medium text-sm">
                    <span>★ {quickViewProduct.rating}</span>
                  </div>
                  <span className="text-xs text-black/40">
                    ({quickViewProduct.reviewsCount} opiniones)
                  </span>
                </div>}

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl sm:text-3xl font-black text-black">
                    {quickViewProduct.priceStatus === 'consult' ? 'Consultar en revista' : formatCLP(quickViewProduct.price)}
                  </span>
                  {quickViewProduct.originalPrice > quickViewProduct.price && (
                    <span className="text-sm text-black/40 line-through">
                      {formatCLP(quickViewProduct.originalPrice)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-black/60 leading-relaxed mb-4">
                  {quickViewProduct.description}
                </p>
                {quickViewProduct.imageSource === 'catalog' && (
                  <p className="text-xs text-black/50 mb-4">Imagen de referencia: página del catálogo.</p>
                )}
                {(quickViewProduct.sourceUrl || quickViewProduct.imageSourceUrl) && (
                  <a href={quickViewProduct.sourceUrl || quickViewProduct.imageSourceUrl!} target="_blank" rel="noreferrer"
                    className="inline-block text-xs underline mb-4">{quickViewProduct.sourceUrl ? 'Ver producto en el sitio oficial' : 'Ver imagen oficial'}</a>
                )}

                <div className="space-y-1.5 mb-6">
                  {quickViewProduct.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-black/80">
                      <span className="text-black font-semibold">✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {quickViewProduct.priceStatus !== 'consult' && <button
                    onClick={() => {
                      handleAddToCart(quickViewProduct);
                      setQuickViewProduct(null);
                      setIsCartOpen(true);
                    }}
                    className="w-full py-3 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Agregar al Carrito
                  </button>}

                  <button
                    onClick={() => {
                      const matched = CATALOGS.find((c) => c.slug === quickViewProduct.catalogSlug);
                      if (matched) {
                        setQuickViewProduct(null);
                        handleOpenCatalog(matched, quickViewProduct.page);
                      }
                    }}
                    className="w-full py-2.5 rounded-full border border-black/15 hover:bg-[#F4F4F6] text-black font-medium text-xs transition-colors"
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
            <div className="p-4 sm:p-5 border-b border-black/10 flex items-center justify-between bg-[#F4F4F6]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                <div>
                  <h3 className="font-extrabold text-black text-base leading-none">
                    Mi Carrito de Compras
                  </h3>
                  <span className="text-xs text-black/50">
                    {totalCartCount} {totalCartCount === 1 ? 'producto' : 'productos'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-black/40 hover:text-black/60 hover:bg-stone-200/60 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Free shipping bar */}
            <div className="bg-[#F4F4F6] border-b border-black/8 p-3 text-xs">
              {isFreeShipping ? (
                <div className="text-black font-semibold flex items-center gap-1.5">
                  <span>🎉</span>
                  <span>¡Felicidades! Tienes Envío Gratis a todo Chile</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between font-semibold text-black/80 mb-1">
                    <span>Agrega {formatCLP(freeShippingThreshold - cartSubtotal)} más para <strong>Envío Gratis</strong></span>
                    <span>{Math.round((cartSubtotal / freeShippingThreshold) * 100)}%</span>
                  </div>
                  <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-full rounded-full transition-all duration-300"
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
                  <p className="text-xs text-black/50 max-w-xs mx-auto mt-1 mb-5">
                    Explora nuestra tienda o revistas digitales para encontrar los mejores productos y ofertas del Ciclo 14.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-black text-white font-medium text-xs shadow-xs hover:bg-neutral-800"
                  >
                    Empezar a Comprar
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 bg-[#F4F4F6] rounded-2xl border border-black/10"
                  >
                    <ProductImage
                      product={item.product}
                      className="w-16 h-16 rounded-xl border border-black/10 bg-white flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-black font-semibold uppercase">
                          {item.product.brand}
                        </span>
                        <span className="text-[10px] text-black/40 font-mono">
                          #{item.product.code}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-black truncate">
                        {item.product.name}
                      </h4>

                      <div className="font-extrabold text-xs text-black mt-1">
                        {formatCLP(item.product.price * item.quantity)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center border border-black/15 rounded-lg bg-white overflow-hidden text-xs">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                          className="px-2 py-1 hover:bg-[#FAFAFA] text-black/60 font-bold"
                        >
                          −
                        </button>
                        <span className="px-2 font-bold text-black">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
                          className="px-2 py-1 hover:bg-[#FAFAFA] text-black/60 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="p-1 text-black/40 hover:text-red-600 transition-colors"
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
              <div className="p-4 sm:p-5 border-t border-black/10 bg-[#F4F4F6] space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Cupón (ej: CICLO14)"
                    className="flex-1 px-3.5 py-1.5 bg-white border border-black/15 rounded-full text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-medium"
                  >
                    Aplicar
                  </button>
                </div>

                {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-black font-semibold">{couponSuccess}</p>}

                <div className="space-y-1.5 text-xs text-black/60 pt-2 border-t border-black/10">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-black">{formatCLP(cartSubtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-black font-semibold">
                      <span>Descuento cupón:</span>
                      <span>-{formatCLP(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Despacho:</span>
                    <span className="font-semibold text-black">
                      {isFreeShipping ? 'GRATIS' : formatCLP(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-black pt-1 border-t border-black/10">
                    <span>Total a Pagar:</span>
                    <span className="text-base text-black font-semibold">{formatCLP(finalTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
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
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-black/10 animate-scale-in relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-5">
              <div>
                <span className="text-xs font-bold text-black font-semibold uppercase tracking-widest">
                  Paso {checkoutStep} de 3
                </span>
                <h3 className="text-xl font-black text-black">
                  {checkoutStep === 1 && 'Datos de Contacto'}
                  {checkoutStep === 2 && 'Dirección y Tipo de Entrega'}
                  {checkoutStep === 3 && 'Método de Pago y Confirmación'}
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-black/40 hover:text-black/60 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-1.5 rounded-full ${checkoutStep >= 1 ? 'bg-black' : 'bg-stone-200'}`} />
              <div className={`flex-1 h-1.5 rounded-full ${checkoutStep >= 2 ? 'bg-black' : 'bg-stone-200'}`} />
              <div className={`flex-1 h-1.5 rounded-full ${checkoutStep >= 3 ? 'bg-black' : 'bg-stone-200'}`} />
            </div>

            {/* Step 1 */}
            {checkoutStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black/80 uppercase tracking-wider mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Carolina Rojas Valenzuela"
                    className="w-full px-3.5 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black/80 uppercase tracking-wider mb-1">
                      RUT / DNI *
                    </label>
                    <input
                      type="text"
                      value={customerRut}
                      onChange={(e) => setCustomerRut(e.target.value)}
                      placeholder="12.345.678-9"
                      className="w-full px-3.5 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black/80 uppercase tracking-wider mb-1">
                      Teléfono WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+56912345678"
                      className="w-full px-3.5 py-2.5 border border-black/15 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/80 uppercase tracking-wider mb-1">
                    Correo Electrónico (para boleta y seguimiento) *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="carolina.rojas@gmail.com"
                    className="w-full px-3.5 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <button
                  onClick={() => setCheckoutStep(2)}
                  disabled={!customerName.trim() || !customerPhone.trim()}
                  className="w-full mt-4 py-3 rounded-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-medium text-sm transition-all"
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
                        ? 'border-black bg-[#F4F4F6]'
                        : 'border-black/10 hover:bg-[#F4F4F6]'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-black">🚚 Despacho a Domicilio</div>
                    <div className="text-xs text-black/50 mt-1">
                      {isFreeShipping ? 'Envío Gratis' : '$3.990 en todo Chile'}
                    </div>
                  </div>

                  <div
                    onClick={() => setShippingType('pickup')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      shippingType === 'pickup'
                        ? 'border-black bg-[#F4F4F6]'
                        : 'border-black/10 hover:bg-[#F4F4F6]'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-black">🤝 Retiro Consultora</div>
                    <div className="text-xs text-black/50 mt-1">Gratis coordinado</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black/80 uppercase tracking-wider mb-1">
                      Región
                    </label>
                    <select
                      value={shippingRegion}
                      onChange={(e) => setShippingRegion(e.target.value)}
                      className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
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
                    <label className="block text-xs font-bold text-black/80 uppercase tracking-wider mb-1">
                      Comuna / Ciudad
                    </label>
                    <input
                      type="text"
                      value={shippingCommune}
                      onChange={(e) => setShippingCommune(e.target.value)}
                      placeholder="Ej: Providencia, Las Condes, Viña..."
                      className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/80 uppercase tracking-wider mb-1">
                    Dirección, Número y Depto *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Ej: Av. Providencia 1234, Depto 402"
                    className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="w-1/3 py-3 rounded-full border border-black/15 font-medium text-xs text-black hover:bg-[#F4F4F6]"
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={() => setCheckoutStep(3)}
                    disabled={shippingType === 'delivery' && !shippingAddress.trim()}
                    className="flex-1 py-3 rounded-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-medium text-sm"
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
                        ? 'border-black bg-[#F4F4F6]'
                        : 'border-black/10 hover:bg-[#F4F4F6]'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm text-black">💳 Webpay Plus (Transbank)</div>
                      <div className="text-xs text-black/50">Tarjetas de Débito, Crédito y Redcompra</div>
                    </div>
                    <span className="text-xs font-bold text-black font-semibold bg-white px-2 py-1 rounded border border-black/10">
                      Recomendado
                    </span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-black bg-[#F4F4F6]'
                        : 'border-black/10 hover:bg-[#F4F4F6]'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm text-black">🏦 Transferencia Bancaria Directa</div>
                      <div className="text-xs text-black/50">Banco Santander / Estado - Datos automáticos</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === 'whatsapp'
                        ? 'border-black bg-[#F4F4F6]'
                        : 'border-black/10 hover:bg-[#F4F4F6]'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm text-black">💬 Coordinar y Pagar por WhatsApp</div>
                      <div className="text-xs text-black/50">Envía el pedido directamente a tu consultora</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F4F4F6] p-4 rounded-2xl border border-black/10 space-y-1.5 text-xs text-black/60">
                  <div className="flex justify-between">
                    <span>Productos ({totalCartCount}):</span>
                    <span className="font-bold text-black">{formatCLP(cartSubtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-black font-semibold">
                      <span>Descuento Cupón:</span>
                      <span>-{formatCLP(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Despacho:</span>
                    <span className="font-bold text-black">
                      {shippingFee === 0 ? 'GRATIS' : formatCLP(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-black pt-2 border-t border-black/10">
                    <span>Total a Pagar:</span>
                    <span className="text-black font-semibold">{formatCLP(finalTotal)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="w-1/3 py-3 rounded-full border border-black/15 font-medium text-xs text-black hover:bg-[#F4F4F6]"
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={handleCompleteOrder}
                    className="flex-1 py-3.5 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-sm shadow-xs flex items-center justify-center gap-2"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-black/10 text-center animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-black text-white text-2xl flex items-center justify-center mx-auto mb-4 font-semibold">
              ✓
            </div>
            <span className="text-xs font-medium text-black uppercase tracking-widest">
              ¡Compra Confirmada con Éxito!
            </span>
            <h3 className="text-2xl font-black text-black mt-1 mb-2">
              Orden #{confirmedOrder.orderNumber}
            </h3>
            <p className="text-xs text-black/50 mb-6 max-w-sm mx-auto leading-relaxed">
              Gracias <strong>{confirmedOrder.customerName}</strong> por tu compra. Hemos registrado tu pedido con entrega en{' '}
              <strong>{confirmedOrder.city}</strong>.
            </p>

            <div className="bg-[#F4F4F6] p-4 rounded-2xl border border-black/10 text-left space-y-2 text-xs mb-6">
              <div className="flex justify-between text-black/50">
                <span>Fecha:</span>
                <span className="font-semibold text-stone-800">{confirmedOrder.date}</span>
              </div>
              <div className="flex justify-between text-black/50">
                <span>Método de Pago:</span>
                <span className="font-semibold text-stone-800 uppercase">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-black/50">
                <span>Total Pagado:</span>
                <span className="font-black text-black text-sm">{formatCLP(confirmedOrder.total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={buildWhatsAppOrderLink(confirmedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <span>📲 Compartir Comprobante por WhatsApp</span>
              </a>
              <button
                onClick={() => setConfirmedOrder(null)}
                className="w-full py-2.5 rounded-full border border-black/15 text-black font-medium text-xs hover:bg-[#F4F4F6]"
              >
                Seguir Comprando en la Tienda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. CATALOG VIEWER */}
      {activeCatalog && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
          <div className="bg-black border-b border-neutral-800 px-4 py-2.5 flex items-center justify-between text-white select-none">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setActiveCatalog(null)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-white/60 hover:text-white transition-colors"
                title="Cerrar visor (ESC)"
              >
                ✕
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate">{activeCatalog.title}</span>
                  <span className="hidden sm:inline text-xs text-white/40">• {activeCatalog.campaign}</span>
                </div>
                <div className="text-xs text-white/50">
                  Página <strong className="text-white">{currentPage}</strong> de {activeCatalog.totalPages}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
                <button onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))} className="px-2 py-1 text-xs text-white/80 hover:text-white font-bold">
                  −
                </button>
                <span className="px-2 text-xs font-mono text-white/60">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))} className="px-2 py-1 text-xs text-white/80 hover:text-white font-bold">
                  +
                </button>
              </div>

              <button
                onClick={() => setShowThumbnails((prev) => !prev)}
                className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                  showThumbnails ? 'bg-black text-white border-black' : 'bg-neutral-900 text-white/80 border-neutral-800 hover:bg-stone-700'
                }`}
                title="Miniaturas"
              >
                📑
              </button>

              <a
                href={activeCatalog.pdfUrl}
                download
                className="hidden md:flex p-2 rounded-lg bg-neutral-900 text-white/80 border border-neutral-800 hover:bg-stone-700 text-xs font-bold"
                title="Descargar PDF"
              >
                ⬇️ PDF
              </a>

              <button
                onClick={() => setActiveCatalog(null)}
                className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white/80 hover:text-white text-xs font-medium px-3"
              >
                ✕ Salir
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-auto p-2 sm:p-4 bg-black">
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
            <div className="bg-black border-t border-neutral-800 p-2 sm:p-3 overflow-x-auto flex gap-2 h-28 sm:h-32 select-none">
              {Array.from({ length: activeCatalog.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <div
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 relative transition-all ${
                    currentPage === pageNum ? 'border-black scale-105 shadow-md' : 'border-neutral-800 opacity-60 hover:opacity-100'
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

          <div className="bg-black border-t border-neutral-800 px-4 py-3 flex items-center justify-between gap-3 text-white">
            <div className="flex-1 flex items-center justify-center gap-3 max-w-md mx-auto">
              <span className="text-xs text-white/40">1</span>
              <input
                type="range"
                min={1}
                max={activeCatalog.totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-full accent-white h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <span className="text-xs text-white/40">{activeCatalog.totalPages}</span>
              <div className="flex items-center gap-1 bg-neutral-900 rounded-lg px-2 py-1 border border-neutral-800 text-xs">
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
      <footer className="bg-black text-white/60 py-16 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 pb-12 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                    <rect x="8" y="4" width="8" height="28" rx="4" transform="rotate(-35 8 4)" fill="#000000" />
                    <rect x="20" y="4" width="8" height="28" rx="4" transform="rotate(-35 20 4)" fill="#000000" />
                  </svg>
                </div>
                <span className="font-semibold text-sm text-white tracking-tight">
                  Natura & Avon Chile
                </span>
              </div>
              <p className="text-white/60 leading-relaxed text-xs">
                Catálogo con {PRODUCTS.length.toLocaleString('es-CL')} productos y variantes del Ciclo 14 / 2026. Natura Cosméticos, Avon y Casa & Estilo.
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium text-xs uppercase tracking-wider mb-3">
                Garantías de Compra
              </h4>
              <ul className="space-y-2 text-white/60">
                <li>✓ Productos 100% Originales</li>
                <li>✓ Despacho rápido a todo Chile</li>
                <li>✓ Garantía de Satisfacción Total</li>
                <li>✓ Pagos encriptados y seguros</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium text-xs uppercase tracking-wider mb-3">
                Revistas Digitales
              </h4>
              <ul className="space-y-2 text-white/60">
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
              <h4 className="text-white font-medium text-xs uppercase tracking-wider mb-3">
                Medios de Pago
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[11px] text-white/90 font-mono">
                  Webpay Plus
                </span>
                <span className="bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[11px] text-white/90 font-mono">
                  Redcompra
                </span>
                <span className="bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[11px] text-white/90 font-mono">
                  Crédito / Débito
                </span>
                <span className="bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[11px] text-white/90 font-mono">
                  Transferencia
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Atención personalizada y pedidos por WhatsApp 24/7.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-[11px]">
            <div>
              © 2026 Natura & Avon Chile • Campaña Ciclo 14. Todos los derechos reservados.
            </div>
            <div>
              Tu belleza, a tu manera.
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
