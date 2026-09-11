export interface Product {
  id: string;
  name: string;
  brand: 'Natura' | 'Avon' | 'Casa & Estilo' | 'Mi Consultoría';
  category: 'Perfumería' | 'Cuidado Facial' | 'Cuerpo & Baño' | 'Maquillaje' | 'Cabello' | 'Hogar & Cocina' | 'Kits & Ofertas';
  code: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewsCount: number;
  image: string;
  catalogSlug: string;
  catalogTitle: string;
  page: number;
  badge?: string;
  badgeColor?: string;
  description: string;
  benefits: string[];
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CatalogItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  brand: 'Natura' | 'Avon' | 'Casa & Estilo' | 'Mi Consultoría';
  campaign: string;
  totalPages: number;
  coverImage: string;
  pdfUrl: string;
  badge: string;
  badgeColor: string;
  description: string;
  tagline: string;
  sections: { title: string; startPage: number }[];
}

export interface OrderConfirmation {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingType: 'delivery' | 'pickup';
  address: string;
  city: string;
  paymentMethod: 'webpay' | 'transfer' | 'whatsapp';
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  items: CartItem[];
  date: string;
}
