# Revisión de catálogos C16

Fuente: PDF oficiales del ciclo 16/2026 (`inputs/Natura c16.pdf`, `inputs/Avon c16.pdf`, `inputs/Casa y Estilo c16.pdf`). La revista Mi Consultoría no se incluye en este ciclo. Los PDF del C14 quedan en `inputs/c14/`.

| Revista | Páginas | Códigos | Con precio | A consultar | Fotos oficiales |
| --- | ---: | ---: | ---: | ---: | ---: |
| Natura | 200 | 866 | 865 | 1 | 843 |
| Avon | 166 | 603 | 602 | 1 | 258 |
| Casa y Estilo | 21 | 31 | 31 | 0 | 0 |
| **Total** | **387** | **1.500** | **1.498** | **2** | **1.101** |

## Precios

Todos los precios salen del PDF C16; no se reutilizan precios de ciclos anteriores. Origen de cada precio ([catalog-audit.json](catalog-audit.json)):

- **772 `pdf-layout`**: asociados automáticamente por la geometría del PDF (código cerca de un único precio).
- **726 `reviewed-pdf`**: leídos a mano página por página y registrados en `scripts/catalog-reviewed-rules-c16.py`. Son grillas de tonos con precio compartido, bloques con varios precios cercanos, kits y ofertas cuyo importe está dibujado como imagen. En estos últimos el precio se obtuvo del precio por 100 ml/g impreso y se contrastó con el porcentaje de descuento anunciado.
- **2 a consultar**: `natura-2179` solo se ofrece en una promoción 3×2 (sin precio unitario) y `avon-171027` está impreso en dos productos distintos de la página 135.

Las ofertas por cantidad usan el precio de una unidad («llevando 1»); cuando la revista solo da el precio combinado, el producto queda a consultar. Los importes de «ahorra $X» no se toman como precio.

Verificación: tres muestras aleatorias independientes de precios automáticos (40 en total) comparadas visualmente con la revista; los dos errores encontrados (total de un 3×2 y un monto «ahorra») se corrigieron con reglas generales. Además, cada precio manual se comparó con el automático: de 5 discrepancias en 726, una era un error de la revisión manual (`natura-140027`, corregido) y cuatro del extractor. Trece ejemplos quedan como regresiones en `scripts/check-catalog.mjs`. Los nombres de kits nuevos sin ficha oficial están en `scripts/catalog-overrides-c16.json`.

## Fotografías y archivos

Las fotos se asocian por código con Natura Chile, Avon Chile y Avon Brasil y se verifican por respuesta HTTP, tipo y huella SHA-256 ([product-image-sources.json](product-image-sources.json)). Sin foto oficial se muestra la página de la revista.

Las páginas (`public/catalogs/`) y portadas se renderizaron desde los PDF. Las copias descargables de Natura y Avon se comprimieron por debajo del límite de 25 MiB de Cloudflare Pages conservando el texto; la comparación visual está en [pdf-source-checks.json](pdf-source-checks.json).

## Regenerar

```
python3 scripts/audit-catalog.py
node scripts/fetch-official-products.mjs && node scripts/resolve-official-images.mjs
python3 scripts/build-catalog.py
python3 scripts/check-pdf-copies.py && npm run check:catalog
```
