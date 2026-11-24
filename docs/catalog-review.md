# Revisión de catálogos C18

Fuentes del ciclo 18/2026 (en `inputs/c18/`, fuera del repositorio), descargadas de las revistas digitales oficiales que compartió la consultora el 23/11/2026:

- `Natura c18.pdf` (cl.natura.digital-catalogue.com, revista «Ciclo 18»)
- `Avon c18.pdf` (cl.natura-avon.digital-catalogue.com, revista «avon»)
- `Outlet Casa y Estilo c18.pdf` (cl.natura-avon.digital-catalogue.com, revista «outlet-casa-estilo»)

Este ciclo no hay Excel: nombres, precios y páginas salen de los PDF, como en el C16 (`scripts/build-catalog.py`).

| Revista | Páginas | Productos | Fotos oficiales |
| --- | ---: | ---: | ---: |
| Natura | 204 | 902 | 881 |
| Avon | 173 | 605 | 247 |
| Casa y Estilo Outlet | 17 | 18 | 0 |
| **Total** | **394** | **1.525** | **1.128** |

Se vende cada código impreso en los PDF y ningún otro. Todos tienen precio; no queda ninguno «a consultar».

## Precios

Los precios salen siempre del PDF del ciclo, nunca del C17 ni de las tiendas web. Hay tres orígenes, registrados por fila en `catalog-audit.json` (`priceProvenance`):

- `pdf-layout` (758): el precio está junto al código en la página y no hay otro importe que compita.
- `reviewed-pdf` (683): leídos a mano de la página en `scripts/catalog-reviewed-rules-c18.py`. Cubren las grillas de tonos, los repuestos que comparten grilla con el producto completo (bases HD, cremas Chronos, Ekos Frescor), regalos y kits con el precio en otra página (Chronos p. 41, precio en p. 40) y todas las páginas de maquillaje.
- `pdf-name-match` (84): grillas donde el bloque de precio está rotulado con el mismo nombre que el producto. Los 84 coinciden con el precio o el precio regular del C17.

Ofertas por cantidad («llevando 2», 2x1, 3x2): el precio de la tienda es el de una unidad y el precio regular es el tachado. Por ejemplo, Kiss Hidra (2x1, p. 51) queda en $6.990 y los repuestos de jabón Tododia (p. 160) en $4.990.

Control cruzado: los precios del C18 se compararon con el C17 del mismo código. Cada diferencia se revisó en la página. Las que eran errores de lectura se corrigieron con una regla; las demás son cambios reales de precio del ciclo (por ejemplo, TTA a $25.990, Imari a $13.490). Los 104 códigos nuevos sin referencia en el C17 se revisaron por muestreo (regalos de Navidad Natura y Avon, colección Alicia, Casa y Estilo).

## Nombres, categorías y fotos

Los nombres vienen de Natura Chile, Avon Chile o Avon Brasil por código. Si no hay ficha, se usa el nombre del C17 o el de la regla revisada. Las categorías siguen las secciones de cada revista (`category()` en `scripts/build-catalog.py`). Las fotos se verifican por respuesta HTTP ([product-image-sources.json](product-image-sources.json)); sin foto oficial se muestra la página de la revista.

La copia descargable de Avon se recomprimió (solo imágenes, el texto queda intacto) para quedar bajo el límite de 25 MiB de Cloudflare Pages. Las de Natura y Casa y Estilo son los PDF originales.

## Regenerar

```
python3 scripts/render-pages.py 18
python3 scripts/audit-catalog.py
node scripts/fetch-official-products.mjs && node scripts/resolve-official-images.mjs
python3 scripts/build-catalog.py
python3 scripts/check-pdf-copies.py && npm run check:catalog
```
