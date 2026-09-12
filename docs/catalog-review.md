# Revisión de catálogos C14

Se contrastaron los códigos impresos en las 438 páginas de los cuatro PDF de `inputs/` con las fichas de la tienda. El catálogo resultante contiene 1.569 fichas: 1.568 códigos distintos y una oferta con el mismo código en dos revistas. Esa oferta se conserva por separado porque su composición y condiciones difieren.

| Revista | Páginas | Códigos incluidos | Faltantes | Fotos públicas verificadas | Referencia de revista |
| --- | ---: | ---: | ---: | ---: | ---: |
| Natura | 194 | 882 | 0 | 858 | 24 |
| Avon | 164 | 598 | 0 | 255 | 343 |
| Casa y Estilo | 22 | 33 | 0 | 0 | 33 |
| Mi Consultoría | 58 | 56 | 0 | 0 | 56 |
| **Total** | **438** | **1.569** | **0** | **1.113** | **456** |

Se incorporaron 914 códigos ausentes y se retiraron 31 fichas iniciales cuyos códigos no figuraban en sus PDF (25 de Natura y 6 de Casa y Estilo). Los tonos y repuestos tienen fichas propias. Cada producto conserva el número de página y todas sus apariciones en la revista.

## Fotografías

Las imágenes usan directamente URL HTTPS públicas de Natura Chile, Avon Chile y el catálogo oficial de Avon Brasil servido por la infraestructura de Natura. La asociación se realiza por código de producto. Se verificaron las respuestas HTTP, el tipo de contenido y el tamaño; se registró una huella SHA-256 por imagen en [product-image-sources.json](product-image-sources.json).

Se excluyeron las imágenes genéricas «pronto» de Avon Chile. Para los 456 códigos sin foto oficial verificable se muestra una página del catálogo, identificada como referencia en la vista de detalle. Esa misma página sirve de respaldo si una URL externa falla posteriormente. Las imágenes usan `object-contain` para mostrar el producto completo.

Fuentes públicas: [Natura Chile](https://www.natura.cl/), [Avon Chile](https://www.avon.cl/), [Avon Brasil](https://www.avon.com.br/).

## Precios y condiciones

Los nuevos precios provienen del PDF C14. No se importaron precios de las tiendas oficiales actuales. Se revisaron explícitamente los grupos de tonos de maquillaje, los precios de repuestos y varias promociones. Los descuentos por compra múltiple no se aplican como precio unitario: por ejemplo, el roll-on Tododia mantiene $8.390 por unidad y el brillo labial Avon $8.590 por unidad.

Las 49 promociones condicionales de consultoría indican «Consultar en revista» y no permiten agregar un importe de comisión como precio minorista. Los materiales de apoyo con precio unitario explícito sí pueden agregarse al carrito.

Esta es una revisión completa de cobertura por código, con correcciones de nombres y precios puntuales. Los precios previos de Avon que no se revisaron expresamente se conservaron. [catalog-audit.json](catalog-audit.json) identifica cada precio como `retained-existing`, `reviewed-pdf`, `pdf-layout` o `consultancy-conditions`, y registra la cobertura y el origen de imagen de cada ficha. El stock real requiere confirmación de campaña; los PDF no prueban inventario en tiempo real.

## Comprobaciones

- Cobertura de los cuatro PDF, IDs únicos, páginas válidas e imágenes de respaldo existentes.
- 1.113 respuestas de imagen oficiales comprobadas y 16 ejemplos de precio/página leídos del PDF.
- Búsqueda por código, carrito, variantes, ofertas condicionales, navegación a la revista y respaldo ante error de imagen.
- Vista de escritorio y móvil; se habilitó el buscador también en móvil.
- Copias descargables de los PDF comprobadas por texto o miniaturas renderizadas. Natura es una copia rasterizada: se compararon sus 194 páginas visualmente mediante miniaturas. Las otras revistas conservaron el texto de todas sus páginas. Resultados y huellas en [pdf-source-checks.json](pdf-source-checks.json).

Se quitaron las valoraciones sintéticas de las fichas importadas. Los contadores de la portada y de la tienda usan el tamaño real del catálogo.

## Mantenimiento

La habilidad de diseño de interfaz guio el ajuste de las fotografías y del buscador móvil, respetando el diseño existente.

Validación local:

```sh
npm run check:catalog
npm run build
npm run lint
```

Para actualizar desde los mismos PDF, con Python, PyMuPDF, Pillow y acceso a Internet:

```sh
python3 scripts/audit-catalog.py
node scripts/fetch-official-products.mjs
node scripts/resolve-official-images.mjs
python3 scripts/build-catalog.py
python3 scripts/check-pdf-copies.py
npm run check:catalog
```

Los ajustes revisados están en `catalog-overrides.json`, `catalog-reviewed-rules.py`, `avon-reviewed.json` y `consultancy-names.json`, dentro de `scripts/`. La descarga guarda evidencia intermedia en `tmp/catalog-audit/`, excluida de Git. La tienda consume `src/data/catalog.json`; no descarga metadatos durante la navegación.

Los cambios se realizaron en el proyecto local. No se ejecutó un despliegue.
