import { useState } from 'react';
import type { Product } from './types';

export function ProductImage({ product, className = '', loading = 'lazy' }: {
  product: Product;
  className?: string;
  loading?: 'lazy' | 'eager';
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const src = failedSource === product.image ? product.imageFallback : product.image;
  return (
    <img
      src={src}
      alt={product.imageSource === 'catalog' || failedSource === product.image
        ? `${product.name} — referencia en la página ${product.page} del catálogo`
        : product.name}
      className={`object-contain ${className}`}
      loading={loading}
      decoding="async"
      onError={() => {
        if (failedSource !== product.image) setFailedSource(product.image);
      }}
    />
  );
}
