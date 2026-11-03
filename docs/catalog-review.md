# Revisión de catálogos C17

Fuentes del ciclo 17/2026 (en `inputs/c17/`, fuera del repositorio):

- `Catalogos_Natura_Avon_Ciclo17.xlsx`: nombres, precios, categorías, promociones, stock y descripciones.
- `Natura c17.pdf` (descargado de la revista digital oficial), `Avon c17.pdf` y `Outlet Casa y Estilo c17.pdf`: páginas, tonos y verificación de precios.

| Revista | Páginas | Productos | Fotos oficiales | Sin stock | Con promoción |
| --- | ---: | ---: | ---: | ---: | ---: |
| Natura | 214 | 875 | 856 | 7 | 7 |
| Avon | 154 | 615 | 255 | 0 | 9 |
| Casa y Estilo Outlet | 19 | 22 | 0 | 0 | 0 |
| **Total** | **387** | **1.512** | **1.111** | **7** | **16** |

## Precios

El precio de venta es el «Precio final» del Excel y el precio tachado es el «Precio normal». Cada precio se comprobó contra el PDF: 1.508 de 1.509 filas del Excel tienen ese importe impreso en su página. Las diferencias encontradas se corrigieron en `scripts/catalog-overrides-c17.json`, cada una con la página que la justifica:

- `avon-161762` (Exxtravert, pág. 27): el Excel repetía el precio del kit 279655. Queda en $9.990, precio regular $13.990.
- `casa-estilo-172907` (anillo para yoga): se muestra en la pág. 12. En la pág. 13 el código está en una capa oculta del PDF.
- Códigos impresos con precio que faltaban en el Excel: `natura-200645` (Lumina repuesto máscara, $7.890), `avon-184840` (delineador Rosa Verano, $3.390) y `avon-245293` (Power Stay Vermelho Mais Quente, $6.290).

`avon-199158` (máscara Make Up + Care, $5.990) viene en el Excel pero su código no está como texto en el PDF. El producto y el precio sí aparecen en la pág. 14, así que se mantiene.

Las promociones por cantidad («Lleva 2 o más…», bolsa de regalo gratis) se muestran como beneficio del producto y con la insignia «Promoción». Los productos marcados «Sin stock» llevan esa insignia y no se pueden agregar al carrito.

## Nombres, categorías y fotos

Los tonos que comparten nombre se distinguen con la variante oficial o con el tono impreso junto al código en el PDF. Las categorías del Excel se agrupan en las 7 de la tienda (`CATEGORIES` en `scripts/build-catalog-xlsx.py`), y los kits van a «Kits & Ofertas». Las fotos se asocian por código con Natura Chile, Avon Chile y Avon Brasil y se verifican por respuesta HTTP ([product-image-sources.json](product-image-sources.json)). Cuando no hay foto oficial, se muestra la página de la revista.

Las copias descargables de Avon y Casa y Estilo se recomprimieron (solo las imágenes, el texto queda intacto) para quedar bajo el límite de 25 MiB de Cloudflare Pages. La de Natura es el PDF original.

## Regenerar

```
python3 scripts/render-pages.py 17
python3 scripts/audit-catalog.py
node scripts/fetch-official-products.mjs && node scripts/resolve-official-images.mjs
python3 scripts/build-catalog-xlsx.py
python3 scripts/check-pdf-copies.py && npm run check:catalog
```
