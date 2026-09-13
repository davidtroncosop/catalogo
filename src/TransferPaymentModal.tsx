import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Settings,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import type {
  BankDetails,
  TransferVerificationResult,
} from './services/transferVerifier';
import {
  getBankDetails,
  saveBankDetails,
  getStoredApiKey,
  saveStoredApiKey,
  verifyTransferReceipt,
  generateSampleReceiptImage,
} from './services/transferVerifier';

interface TransferPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  cartItemsCount: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
  shippingCity?: string;
  onConfirmOrder: (verification: TransferVerificationResult) => void;
}

const formatCLP = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
};

export function TransferPaymentModal({
  isOpen,
  onClose,
  amount,
  cartItemsCount,
  customerName,
  customerPhone,
  customerEmail: _customerEmail,
  shippingAddress,
  shippingCity,
  onConfirmOrder,
}: TransferPaymentModalProps) {
  const [step, setStep] = useState<'info' | 'verify'>('info');
  const [bankDetails, setBankDetails] = useState<BankDetails>(getBankDetails());
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [editedBank, setEditedBank] = useState<BankDetails>(bankDetails);

  const [copied, setCopied] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<TransferVerificationResult | null>(null);

  const [apiKey, setApiKey] = useState<string>(getStoredApiKey());
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      const currentBank = getBankDetails();
      setBankDetails(currentBank);
      setEditedBank(currentBank);
      setApiKey(getStoredApiKey());
      setStep('info');
      setImagePreview(null);
      setVerificationResult(null);
      setIsVerifying(false);
    }
  }, [isOpen]);

  const handleCopyBankDetails = () => {
    const text = `🏦 DATOS PARA TRANSFERENCIA BANCARIA:
Titular: ${bankDetails.holderName}
RUT: ${bankDetails.rut}
Banco: ${bankDetails.bank}
Tipo de Cuenta: ${bankDetails.accountType}
N° de Cuenta: ${bankDetails.accountNumber}
Correo: ${bankDetails.email}
Monto exacto a transferir: ${formatCLP(amount)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2600);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen (PNG, JPG o WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setVerificationResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Support paste (Ctrl+V) anywhere on modal when on verify step
  useEffect(() => {
    if (!isOpen || step !== 'verify') return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, step]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartVerification = async (customImage?: string) => {
    const imageToVerify = customImage || imagePreview;
    if (!imageToVerify) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyTransferReceipt({
        imageBase64: imageToVerify,
        expectedAmount: amount,
        bankDetails,
        userApiKey: apiKey,
      });

      setVerificationResult(result);
    } catch (err: any) {
      alert('Ocurrió un error al verificar el comprobante: ' + (err?.message || err));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLoadSample = (type: 'valid' | 'wrong-amount' | 'wrong-recipient') => {
    const sampleDataUrl = generateSampleReceiptImage(type, amount, bankDetails.holderName);
    setImagePreview(sampleDataUrl);
    setVerificationResult(null);
    // Automatically trigger verification with the sample
    handleStartVerification(sampleDataUrl);
  };

  const handleSaveBankSettings = () => {
    saveBankDetails(editedBank);
    setBankDetails(editedBank);
    setIsEditingBank(false);
  };

  const handleSaveApiKey = () => {
    saveStoredApiKey(apiKey);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-black/10 animate-scale-in relative max-h-[94vh] flex flex-col my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-black/8 bg-[#FAF8F6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-black">
                  Pago con Transferencia Bancaria
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <Sparkles size={10} />
                  <span>Verificación IA</span>
                </span>
              </div>
              <p className="text-xs text-black/50">
                Catálogo Camila Browne · Validación inteligente en segundos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full hover:bg-black/5 text-black/60 transition-colors ${
                showSettings ? 'bg-black/10 text-black' : ''
              }`}
              title="Configurar datos bancarios o API"
            >
              <Settings size={17} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 text-black/60 hover:text-black transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Settings Drawer (collapsible) */}
          {showSettings && (
            <div className="p-4 bg-[#F4F4F6] rounded-2xl border border-black/10 space-y-3 text-xs animate-fadeIn">
              <div className="flex items-center justify-between border-b border-black/8 pb-2">
                <span className="font-bold text-black flex items-center gap-1.5">
                  <Settings size={14} />
                  <span>Configuración de Transferencia & Modelo IA</span>
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-black/50 hover:text-black"
                >
                  ✕
                </button>
              </div>

              {/* MiniMax / Gemini API Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-black">
                    Motor IA de Visión (MiniMax AI / Gemini):
                  </label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Servidor Cloudflare con MiniMax Vision Activo
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-cp-... (MiniMax) o AIzaSy... (Gemini)"
                    className="flex-1 px-3 py-1.5 bg-white border border-black/15 rounded-lg text-xs font-mono text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg font-medium text-xs"
                  >
                    {apiKeySaved ? '✓ Guardada' : 'Guardar'}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-black/50">
                  <span>El servidor valida automáticamente con MiniMax Vision. Puedes sobreescribir con tu propia clave.</span>
                </div>
              </div>

              {/* Edit bank details toggle */}
              <div className="pt-2 border-t border-black/8">
                <button
                  onClick={() => setIsEditingBank(!isEditingBank)}
                  className="text-xs font-semibold text-black underline"
                >
                  {isEditingBank ? 'Cancelar edición de datos bancarios' : '✏️ Editar datos de la cuenta de Camila Browne'}
                </button>

                {isEditingBank && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-black/8">
                    <div>
                      <span className="text-[10px] text-black/50 font-bold uppercase">Titular</span>
                      <input
                        type="text"
                        value={editedBank.holderName}
                        onChange={(e) => setEditedBank({ ...editedBank, holderName: e.target.value })}
                        className="w-full px-2.5 py-1 bg-white border border-black/15 rounded text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-black/50 font-bold uppercase">RUT</span>
                      <input
                        type="text"
                        value={editedBank.rut}
                        onChange={(e) => setEditedBank({ ...editedBank, rut: e.target.value })}
                        className="w-full px-2.5 py-1 bg-white border border-black/15 rounded text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-black/50 font-bold uppercase">Banco</span>
                      <input
                        type="text"
                        value={editedBank.bank}
                        onChange={(e) => setEditedBank({ ...editedBank, bank: e.target.value })}
                        className="w-full px-2.5 py-1 bg-white border border-black/15 rounded text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-black/50 font-bold uppercase">N° Cuenta</span>
                      <input
                        type="text"
                        value={editedBank.accountNumber}
                        onChange={(e) => setEditedBank({ ...editedBank, accountNumber: e.target.value })}
                        className="w-full px-2.5 py-1 bg-white border border-black/15 rounded text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
                      <button
                        onClick={handleSaveBankSettings}
                        className="px-4 py-1 bg-black text-white rounded text-xs font-medium"
                      >
                        Guardar datos bancarios
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stepper Header */}
          <div className="flex items-center justify-between border-b border-black/8 pb-3 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 'info' ? 'bg-black text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                1
              </span>
              <span className={step === 'info' ? 'font-bold text-black' : 'text-black/60'}>
                Datos para transferir
              </span>
            </div>

            <span className="text-black/30">→</span>

            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 'verify' ? 'bg-black text-white' : 'bg-black/10 text-black/50'
                }`}
              >
                2
              </span>
              <span className={step === 'verify' ? 'font-bold text-black' : 'text-black/60'}>
                Subir pantallazo y verificar con IA
              </span>
            </div>
          </div>

          {/* Customer Summary Banner */}
          {customerName && (
            <div className="bg-[#FAF8F6] p-3.5 rounded-2xl border border-black/8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-black/50 text-[11px] block">Comprador(a) registrado(a):</span>
                <strong className="text-black">{customerName}</strong>
                {customerPhone && (
                  <span className="text-black/60 font-mono ml-1.5 font-medium">
                    ({customerPhone})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-black/60 sm:text-right">
                <span className="block text-black/40">Entrega:</span>
                <span className="font-medium text-black">
                  {shippingAddress
                    ? `${shippingAddress}${shippingCity ? `, ${shippingCity}` : ''}`
                    : 'Retiro acordado con consultora'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 1: Bank Transfer Details */}
          {step === 'info' && (
            <div className="space-y-4">
              {/* Order total banner */}
              <div className="p-4 rounded-2xl bg-black text-white flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs text-white/70 block">Monto exacto a transferir ({cartItemsCount} productos):</span>
                  <span className="text-2xl sm:text-3xl font-black tracking-tight">
                    {formatCLP(amount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-white/20 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Pago 100% Seguro
                  </span>
                </div>
              </div>

              {/* Bank Account Details Card */}
              <div className="bg-[#FAF8F6] p-5 rounded-2xl border border-black/10 space-y-3 relative">
                <div className="flex items-center justify-between border-b border-black/8 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏦</span>
                    <span className="font-bold text-sm text-black">Datos de la cuenta bancaria</span>
                  </div>
                  <button
                    onClick={handleCopyBankDetails}
                    className="px-3 py-1 bg-white hover:bg-neutral-100 border border-black/10 rounded-full text-xs font-medium text-black flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copied ? '¡Copiado!' : 'Copiar datos'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-black/50 block text-[11px]">Titular:</span>
                    <strong className="text-black text-sm">{bankDetails.holderName}</strong>
                  </div>
                  <div>
                    <span className="text-black/50 block text-[11px]">RUT:</span>
                    <strong className="text-black text-sm font-mono">{bankDetails.rut}</strong>
                  </div>
                  <div>
                    <span className="text-black/50 block text-[11px]">Banco:</span>
                    <strong className="text-black text-sm">{bankDetails.bank}</strong>
                  </div>
                  <div>
                    <span className="text-black/50 block text-[11px]">Tipo de Cuenta:</span>
                    <strong className="text-black text-sm">{bankDetails.accountType}</strong>
                  </div>
                  <div>
                    <span className="text-black/50 block text-[11px]">Número de Cuenta:</span>
                    <strong className="text-black text-sm font-mono">{bankDetails.accountNumber}</strong>
                  </div>
                  <div>
                    <span className="text-black/50 block text-[11px]">Correo para comprobante:</span>
                    <strong className="text-black text-sm">{bankDetails.email}</strong>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <span className="text-base">💡</span>
                <p className="leading-relaxed">
                  Haz la transferencia desde tu banco por <strong>{formatCLP(amount)}</strong> a nombre de{' '}
                  <strong>{bankDetails.holderName}</strong>. Luego guarda una captura o pantallazo del comprobante para verificarlo automáticamente.
                </p>
              </div>

              {/* Next Step Action */}
              <button
                onClick={() => setStep('verify')}
                className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Ya realicé la transferencia, subir pantallazo</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: Upload Screenshot & LLM Verification */}
          {step === 'verify' && (
            <div className="space-y-4">
              {/* Back to details button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('info')}
                  className="text-xs text-black/60 hover:text-black font-medium underline flex items-center gap-1"
                >
                  ← Ver datos bancarios nuevamente
                </button>
                <span className="text-xs text-black/40 font-mono">
                  Monto esperado: <strong>{formatCLP(amount)}</strong>
                </span>
              </div>

              {/* Drag and drop / Paste area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-black bg-stone-50 scale-[1.01]'
                    : imagePreview
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-black/15 hover:border-black/30 bg-[#FAF8F6]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="relative inline-block max-w-xs max-h-56 rounded-xl overflow-hidden shadow-md border border-black/10">
                      <img
                        src={imagePreview}
                        alt="Comprobante cargado"
                        className="w-full h-full object-contain max-h-56"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-black/60">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>Pantallazo cargado listo para verificar</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setVerificationResult(null);
                        }}
                        className="text-black font-bold underline ml-2 hover:text-red-600"
                      >
                        Cambiar imagen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-black/5 text-black flex items-center justify-center mx-auto">
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">
                        Arrastra aquí tu comprobante o haz clic para seleccionarlo
                      </p>
                      <p className="text-xs text-black/50 mt-0.5">
                        También puedes pegar directamente con <kbd className="px-1.5 py-0.5 bg-white rounded border border-black/15 font-mono">Ctrl + V</kbd> o <kbd className="px-1.5 py-0.5 bg-white rounded border border-black/15 font-mono">Cmd + V</kbd>
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full bg-black text-white text-xs font-medium mt-2">
                      Seleccionar Archivo (PNG, JPG)
                    </span>
                  </div>
                )}
              </div>

              {/* Sample receipts for instant 1-click testing */}
              <div className="p-3 bg-[#F4F4F6] rounded-xl border border-black/8 text-xs">
                <span className="font-semibold text-black block mb-1.5 flex items-center gap-1">
                  <span>🧪</span>
                  <span>Prueba rápida (Generar comprobante de prueba):</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('valid')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-black/10 rounded-lg font-medium text-[11px] text-black transition-colors"
                  >
                    ✓ Comprobante Válido ({formatCLP(amount)})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('wrong-amount')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 border border-black/10 rounded-lg font-medium text-[11px] text-black/80 transition-colors"
                  >
                    ⚠ Monto Insuficiente
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('wrong-recipient')}
                    className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-red-800 border border-black/10 rounded-lg font-medium text-[11px] text-black/80 transition-colors"
                  >
                    ✕ Destinatario Erróneo
                  </button>
                </div>
              </div>

              {/* Action: Verify with AI */}
              {imagePreview && !verificationResult && (
                <button
                  type="button"
                  onClick={() => handleStartVerification()}
                  disabled={isVerifying}
                  className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw size={17} className="animate-spin text-white" />
                      <span>Analizando comprobante con modelo LLM...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} className="text-amber-300" />
                      <span>Verificar Comprobante con IA</span>
                    </>
                  )}
                </button>
              )}

              {/* Verification Results Card */}
              {verificationResult && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border-2 space-y-4 animate-scale-in ${
                    verificationResult.isValid
                      ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950'
                      : 'bg-red-50/70 border-red-500 text-red-950'
                  }`}
                >
                  {/* Status Banner */}
                  <div className="flex items-center justify-between pb-3 border-b border-black/10">
                    <div className="flex items-center gap-2.5">
                      {verificationResult.isValid ? (
                        <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle size={24} className="text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base">
                          {verificationResult.isValid
                            ? '¡Transferencia Verificada con Éxito!'
                            : 'No pudimos verificar la transferencia'}
                        </h4>
                        <p className="text-xs opacity-80">
                          {verificationResult.modelUsed}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        verificationResult.isValid
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {verificationResult.confidence}% confianza
                    </span>
                  </div>

                  {/* Criteria Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {/* 1. Fecha */}
                    <div className="p-3 bg-white rounded-xl border border-black/5 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-black/60">📅 Fecha</span>
                        {verificationResult.dateValid ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <Check size={13} /> Válida
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-0.5">
                            <X size={13} /> Antigua
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-black truncate" title={verificationResult.dateText}>
                        {verificationResult.dateText}
                      </p>
                    </div>

                    {/* 2. Destinatario */}
                    <div className="p-3 bg-white rounded-xl border border-black/5 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-black/60">👤 Destinatario</span>
                        {verificationResult.recipientValid ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <Check size={13} /> Coincide
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-0.5">
                            <X size={13} /> No coincide
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-black truncate" title={verificationResult.recipientText}>
                        {verificationResult.recipientText}
                      </p>
                    </div>

                    {/* 3. Monto */}
                    <div className="p-3 bg-white rounded-xl border border-black/5 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-black/60">💰 Monto</span>
                        {verificationResult.amountValid ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <Check size={13} /> Correcto
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-0.5">
                            <X size={13} /> Insuficiente
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-black">
                        {formatCLP(verificationResult.amountDetected)}
                        <span className="text-[10px] text-black/40 font-normal ml-1">
                          (esperado: {formatCLP(amount)})
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Folio & Notes */}
                  <div className="p-3 bg-white/80 rounded-xl text-xs space-y-1">
                    {verificationResult.transactionId && (
                      <p className="font-mono text-black/70">
                        <strong>N° Operación / Folio:</strong> {verificationResult.transactionId} •{' '}
                        <strong>Banco:</strong> {verificationResult.bank}
                      </p>
                    )}
                    <p className="leading-relaxed">
                      <strong>Análisis del LLM:</strong> {verificationResult.analysisNotes}
                    </p>
                  </div>

                  {/* Actions depending on result */}
                  <div className="pt-2">
                    {verificationResult.isValid ? (
                      <button
                        onClick={() => onConfirmOrder(verificationResult)}
                        className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      >
                        <CheckCircle2 size={18} />
                        <span>Confirmar Pedido y Notificar por WhatsApp</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setVerificationResult(null);
                            setImagePreview(null);
                          }}
                          className="w-full py-2.5 rounded-full bg-black text-white font-medium text-xs hover:bg-neutral-800"
                        >
                          Subir otro pantallazo
                        </button>
                        <button
                          onClick={() => onConfirmOrder(verificationResult)}
                          className="w-full py-2 text-center text-xs text-black/60 hover:text-black underline"
                        >
                          Enviar a revisión manual por WhatsApp de todas formas
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-black/8 bg-[#FAF8F6] flex items-center justify-between text-xs text-black/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Verificador Inteligente de Transferencias · Camila Browne</span>
          </div>

          <button
            onClick={onClose}
            className="text-black/60 hover:text-black font-medium underline"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
