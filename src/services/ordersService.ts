import type { OrderConfirmation } from '../types';

const ORDERS_STORAGE_KEY = 'camila_orders_db_v1';
const GOOGLE_SHEETS_STORAGE_KEY = 'camila_google_sheets_webhook_url';

export const GOOGLE_APPS_SCRIPT_CODE = `// ========================================================
// SCRIPT DE INTEGRACIÓN GOOGLE SHEETS PARA CAMILA BROWNE
// ========================================================
// 1. En tu Google Sheet, ve a: Extensiones -> Apps Script
// 2. Borra todo el código y pega este archivo completo.
// 3. Haz clic en "Implementar" -> "Nueva implementación".
// 4. Tipo: "Aplicación web".
// 5. En "Quién tiene acceso", selecciona: "Cualquier usuario" (Anyone).
// 6. Haz clic en "Implementar" y copia la URL generada.
// 7. Pega esa URL en el panel de Camila en la tienda.
// ========================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Si la hoja está vacía, agregar encabezados en la primera fila
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "N° Pedido",
        "Fecha",
        "Nombre Cliente",
        "Teléfono WhatsApp",
        "Email",
        "Tipo Entrega",
        "Dirección",
        "Ciudad / Comuna",
        "Método de Pago",
        "Total (CLP)",
        "Estado Transferencia",
        "Banco Emisor",
        "Folio Transacción",
        "Productos"
      ]);
      
      // Dar estilo a encabezados
      var headerRange = sheet.getRange(1, 1, 1, 14);
      headerRange.setBackground("#000000");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
    }

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.orderNumber || "",
      data.date || new Date().toLocaleString("es-CL"),
      data.customerName || "",
      data.customerPhone || "",
      data.customerEmail || "",
      data.shippingType === "delivery" ? "Despacho a Domicilio" : "Retiro Consultora",
      data.address || "",
      data.city || "",
      data.paymentMethod || "",
      data.total || 0,
      data.transferStatus || "Confirmado",
      data.bank || "",
      data.transactionId || "",
      data.itemsSummary || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Fila agregada correctamente" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export function getStoredOrders(): OrderConfirmation[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading orders from localStorage', err);
  }
  return [];
}

export function getGoogleSheetsWebhookUrl(): string {
  try {
    return localStorage.getItem(GOOGLE_SHEETS_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveGoogleSheetsWebhookUrl(url: string): void {
  try {
    localStorage.setItem(GOOGLE_SHEETS_STORAGE_KEY, url.trim());
  } catch (err) {
    console.error('Error saving Google Sheets webhook', err);
  }
}

/**
 * Saves order in local storage, dispatches to backend API, and syncs to Google Sheets webhook
 */
export async function recordNewOrder(order: OrderConfirmation): Promise<void> {
  // 1. Save in local storage
  try {
    const existing = getStoredOrders();
    const updated = [order, ...existing.filter((o) => o.orderNumber !== order.orderNumber)];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving order to localStorage', err);
  }

  // Format products summary string
  const itemsSummary = order.items
    .map((item) => `${item.product.name} (x${item.quantity}) [Cód: ${item.product.code}]`)
    .join(' | ');

  const payload = {
    orderNumber: order.orderNumber,
    date: order.date,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    shippingType: order.shippingType,
    address: order.address,
    city: order.city,
    paymentMethod:
      order.paymentMethod === 'transfer'
        ? 'Transferencia Bancaria (Validada IA)'
        : order.paymentMethod === 'webpay'
        ? 'Webpay Plus'
        : 'Coordinado por WhatsApp',
    subtotal: order.subtotal,
    discount: order.discount,
    shippingFee: order.shippingFee,
    total: order.total,
    itemsSummary,
    items: order.items,
    transferStatus: order.transferVerification ? 'Validada con IA' : 'Confirmada',
    bank: order.transferVerification?.bank || '',
    transactionId: order.transferVerification?.transactionId || '',
    amountDetected: order.transferVerification?.amountDetected || order.total,
  };

  // 2. Notify backend Cloudflare Functions endpoint
  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-blocking in client
  }

  // 3. Post to Google Sheets Webhook if configured
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight in Google Apps Script
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });
    } catch (sheetErr) {
      console.warn('Google Sheets Webhook dispatch failed', sheetErr);
    }
  }
}

/**
 * Exports all orders into a formatted CSV file compatible with Microsoft Excel and Google Sheets
 */
export function exportOrdersToCSV(orders: OrderConfirmation[]): void {
  if (!orders || orders.length === 0) {
    alert('No hay órdenes registradas aún para exportar.');
    return;
  }

  const headers = [
    'N° Pedido',
    'Fecha',
    'Nombre Cliente',
    'Teléfono WhatsApp',
    'Correo Electrónico',
    'Tipo Entrega',
    'Dirección',
    'Ciudad / Comuna',
    'Método de Pago',
    'Subtotal',
    'Descuento',
    'Envío',
    'Total Pagado (CLP)',
    'Estado Transferencia',
    'Banco Emisor',
    'Folio Transacción',
    'Productos Comprados',
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = orders.map((order) => {
    const itemsSummary = order.items
      .map((item) => `${item.product.name} (x${item.quantity}) - Cód:${item.product.code}`)
      .join('; ');

    const paymentText =
      order.paymentMethod === 'transfer'
        ? 'Transferencia Bancaria (IA)'
        : order.paymentMethod === 'webpay'
        ? 'Webpay Plus'
        : 'WhatsApp';

    return [
      escapeCSV(order.orderNumber),
      escapeCSV(order.date),
      escapeCSV(order.customerName),
      escapeCSV(order.customerPhone),
      escapeCSV(order.customerEmail),
      escapeCSV(order.shippingType === 'delivery' ? 'Despacho a Domicilio' : 'Retiro Consultora'),
      escapeCSV(order.address),
      escapeCSV(order.city),
      escapeCSV(paymentText),
      escapeCSV(order.subtotal),
      escapeCSV(order.discount),
      escapeCSV(order.shippingFee),
      escapeCSV(order.total),
      escapeCSV(order.transferVerification ? 'Validada con IA' : 'Confirmada'),
      escapeCSV(order.transferVerification?.bank || 'N/A'),
      escapeCSV(order.transferVerification?.transactionId || 'N/A'),
      escapeCSV(itemsSummary),
    ].join(',');
  });

  // UTF-8 BOM so Excel opens with correct accents and Spanish characters
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `Ventas_Catalogo_Camila_Browne_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
