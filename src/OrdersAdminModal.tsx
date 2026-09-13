import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react';
import type { OrderConfirmation } from './types';
import {
  getStoredOrders,
  exportOrdersToCSV,
  getGoogleSheetsWebhookUrl,
  saveGoogleSheetsWebhookUrl,
  GOOGLE_APPS_SCRIPT_CODE,
  verifyAdminPassword,
  saveAdminPassword,
  isAdminSessionActive,
  setAdminSessionActive,
} from './services/ordersService';

interface OrdersAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrdersAdminModal: React.FC<OrdersAdminModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Change password modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangedSuccess, setPasswordChangedSuccess] = useState(false);

  // Orders data
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const authActive = isAdminSessionActive();
      setIsAuthenticated(authActive);
      if (authActive) {
        setOrders(getStoredOrders());
        setWebhookUrl(getGoogleSheetsWebhookUrl());
      }
    } else {
      setPasswordInput('');
      setPasswordError(false);
      setShowChangePassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setIsAuthenticated(true);
      setAdminSessionActive(true);
      setPasswordError(false);
      setPasswordInput('');
      setOrders(getStoredOrders());
      setWebhookUrl(getGoogleSheetsWebhookUrl());
    } else {
      setPasswordError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminSessionActive(false);
    setPasswordInput('');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput.trim().length >= 4) {
      saveAdminPassword(newPasswordInput.trim());
      setPasswordChangedSuccess(true);
      setTimeout(() => {
        setPasswordChangedSuccess(false);
        setShowChangePassword(false);
        setNewPasswordInput('');
      }, 2000);
    } else {
      alert('La nueva contraseña debe tener al menos 4 caracteres.');
    }
  };

  const handleSaveWebhook = () => {
    saveGoogleSheetsWebhookUrl(webhookUrl);
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 2500);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // 1. PASSWORD GATE SCREEN (If not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-black/10 animate-scale-in relative text-center space-y-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors"
          >
            <X size={18} />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mx-auto shadow-md">
            <Lock size={26} className="text-amber-400" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
              Acceso Exclusivo Camila Browne
            </span>
            <h3 className="text-xl font-black text-black">
              Planilla de Ventas y Compradores
            </h3>
            <p className="text-xs text-black/55 mt-1.5 leading-relaxed">
              Ingresa tu contraseña de administradora para ver el listado de clientes, direcciones de entrega y descargar las planillas en Excel.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 text-left">
            <div>
              <label className="block text-xs font-bold text-black/80 mb-1">
                Contraseña de Administradora:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  autoFocus
                  placeholder="Ingresa tu contraseña..."
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 border rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black ${
                    passwordError ? 'border-red-500 bg-red-50/50' : 'border-black/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  Contraseña incorrecta. Por favor intenta de nuevo.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Lock size={15} />
              <span>Ingresar al Panel de Ventas</span>
            </button>
          </form>

          <div className="p-3 bg-neutral-50 rounded-xl border border-black/5 text-[11px] text-black/50 leading-relaxed text-center">
            💡 Contraseña por defecto: <strong className="font-mono text-black font-bold">camila</strong> (puedes cambiarla una vez que ingreses).
          </div>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q)
    );
  });

  const totalSales = orders.reduce((acc, curr) => acc + curr.total, 0);

  // 2. MAIN ADMIN DASHBOARD (When authenticated)
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-black/10 animate-scale-in relative max-h-[94vh] flex flex-col my-auto overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-black/8 bg-[#FAF8F6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-black">
                  Registro de Ventas y Compradores
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Excel & Google Sheets
                </span>
              </div>
              <p className="text-xs text-black/50">
                Catálogo Camila Browne · {orders.length} pedidos registrados · Total:{' '}
                <strong className="text-black">${totalSales.toLocaleString('es-CL')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportOrdersToCSV(orders)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Download size={14} />
              <span>Descargar Excel (.csv)</span>
            </button>
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="p-2 text-black/60 hover:text-black hover:bg-black/5 rounded-xl text-xs font-medium border border-black/10 flex items-center gap-1"
              title="Cambiar contraseña de acceso"
            >
              <KeyRound size={15} />
              <span className="hidden md:inline">Clave</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium border border-red-200 flex items-center gap-1"
              title="Bloquear sesión / Salir"
            >
              <LogOut size={15} />
              <span className="hidden md:inline">Salir</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Change Password Form (Accordion) */}
          {showChangePassword && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <div className="flex items-center gap-1.5">
                  <KeyRound size={15} className="text-amber-700" />
                  <span>Cambiar Contraseña de Acceso al Panel</span>
                </div>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="text-amber-800 hover:text-black"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleChangePassword} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Nueva contraseña (mínimo 4 caracteres)..."
                  className="flex-1 px-3 py-2 bg-white border border-black/15 rounded-lg text-xs font-mono text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold rounded-lg text-xs"
                >
                  {passwordChangedSuccess ? '✓ Cambiada con Éxito' : 'Guardar Nueva Clave'}
                </button>
              </form>
            </div>
          )}

          {/* Action Row & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, teléfono, email, orden o ciudad..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-black/15 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScriptGuide(!showScriptGuide)}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-semibold rounded-xl border border-black/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={13} />
                <span>Conectar Google Sheets</span>
              </button>
              <button
                onClick={() => exportOrdersToCSV(orders)}
                className="sm:hidden px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Download size={13} />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* Google Sheets Integration Accordion */}
          {showScriptGuide && (
            <div className="p-4 bg-neutral-50 rounded-2xl border border-black/10 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-black text-sm">
                  <FileSpreadsheet size={16} className="text-emerald-700" />
                  <span>Sincronización Automática con tu Google Sheet</span>
                </div>
                <button
                  onClick={() => setShowScriptGuide(false)}
                  className="text-black/50 hover:text-black font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 text-black/70 leading-relaxed">
                <p>
                  <strong>Paso 1:</strong> Crea una planilla en blanco en{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-emerald-700 font-bold"
                  >
                    Google Sheets
                  </a>
                  .
                </p>
                <p>
                  <strong>Paso 2:</strong> En el menú superior de tu hoja, entra a:{' '}
                  <code className="bg-neutral-200 px-1.5 py-0.5 rounded font-mono">
                    Extensiones → Apps Script
                  </code>
                  .
                </p>
                <p>
                  <strong>Paso 3:</strong> Borra todo el código que aparece y pega el script de abajo.
                </p>
                <p>
                  <strong>Paso 4:</strong> Haz clic en <strong>Implementar</strong> →{' '}
                  <strong>Nueva implementación</strong> → Selecciona tipo:{' '}
                  <strong>Aplicación web</strong> → En <em>"Quién tiene acceso"</em> elige:{' '}
                  <strong>"Cualquier usuario" (Anyone)</strong> → Haz clic en Implementar y copia la URL.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="px-3 py-2 bg-black hover:bg-neutral-800 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedScript ? '¡Código Copiado!' : 'Copiar Código Apps Script'}</span>
                </button>

                <div className="flex-1 flex gap-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="Pega aquí la URL de la Aplicación Web de Google..."
                    className="flex-1 px-3 py-2 bg-white border border-black/15 rounded-lg font-mono text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={handleSaveWebhook}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors"
                  >
                    {webhookSaved ? '✓ Guardada' : 'Guardar URL'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-black/15 space-y-2">
              <FileSpreadsheet size={36} className="mx-auto text-black/30" />
              <h4 className="font-bold text-sm text-black">Aún no hay compras registradas</h4>
              <p className="text-xs text-black/50 max-w-sm mx-auto">
                Cuando los compradores realicen un pedido por Transferencia Bancaria o WhatsApp, sus
                datos (nombre, WhatsApp, dirección y productos) aparecerán aquí y en tu Excel.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold text-black/60 uppercase tracking-wider">
                Mostrando {filteredOrders.length} pedido(s)
              </div>

              <div className="space-y-2.5">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrder === order.orderNumber;
                  const isTransfer = order.paymentMethod === 'transfer';

                  return (
                    <div
                      key={order.orderNumber}
                      className="border border-black/10 rounded-2xl p-4 bg-white hover:border-black/25 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs bg-black text-white px-2 py-0.5 rounded-md">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs text-black/50">{order.date}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isTransfer
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : order.paymentMethod === 'webpay'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-stone-100 text-stone-800 border-stone-200'
                            }`}
                          >
                            {isTransfer
                              ? '🏦 Transferencia Validada IA'
                              : order.paymentMethod === 'webpay'
                              ? '💳 Webpay Plus'
                              : '💬 WhatsApp'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-black">
                            ${order.total.toLocaleString('es-CL')} CLP
                          </span>
                          <button
                            onClick={() =>
                              setExpandedOrder(isExpanded ? null : order.orderNumber)
                            }
                            className="text-black/50 hover:text-black text-xs font-semibold flex items-center gap-0.5"
                          >
                            <span>{isExpanded ? 'Ocultar' : 'Ver Detalle'}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Customer Details Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-[#F9F9FB] p-3 rounded-xl border border-black/5">
                        <div>
                          <span className="text-black/50 block text-[11px]">👤 Comprador(a):</span>
                          <strong className="text-black">{order.customerName}</strong>
                        </div>
                        <div>
                          <span className="text-black/50 block text-[11px]">📱 WhatsApp:</span>
                          <a
                            href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                          >
                            <span>{order.customerPhone}</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                        <div>
                          <span className="text-black/50 block text-[11px]">📍 Entrega:</span>
                          <span className="text-black">
                            {order.shippingType === 'delivery'
                              ? `${order.address}, ${order.city}`
                              : 'Retiro acordado con consultora'}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-black/8 space-y-2.5 text-xs animate-fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-black/70">
                            <div>
                              <span className="text-black/50 block">Correo Electrónico:</span>
                              <span className="font-mono">{order.customerEmail}</span>
                            </div>
                            {order.transferVerification && (
                              <div>
                                <span className="text-black/50 block">Datos de Transferencia:</span>
                                <span>
                                  Banco: <strong>{order.transferVerification.bank}</strong> ·
                                  Folio:{' '}
                                  <strong className="font-mono">
                                    {order.transferVerification.transactionId}
                                  </strong>
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="text-black/50 block mb-1">
                              Productos ({order.items.length}):
                            </span>
                            <div className="space-y-1">
                              {order.items.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between bg-neutral-50 px-2.5 py-1 rounded-lg text-xs"
                                >
                                  <span>
                                    {item.product.name}{' '}
                                    <span className="text-black/40 font-mono">
                                      [Cód: {item.product.code}]
                                    </span>{' '}
                                    <strong className="text-black">x{item.quantity}</strong>
                                  </span>
                                  <span className="font-bold text-black">
                                    ${(item.product.price * item.quantity).toLocaleString('es-CL')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-black/8 bg-[#FAF8F6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-black/50">
            Los datos se almacenan de forma segura y se pueden exportar a Excel en cualquier momento.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => exportOrdersToCSV(orders)}
              className="flex-1 sm:flex-initial py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Download size={14} />
              <span>Descargar Planilla Excel (.csv)</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 border border-black/15 text-black hover:bg-black/5 font-semibold rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
