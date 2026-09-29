'use client';

import React, { useState, useEffect } from 'react';
import { BatchInfo } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { useLanguage } from '@/hooks/useLanguage';

export interface QrPassportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly batch: BatchInfo;
  readonly defaultMode?: 'show' | 'scan';
}

export const QrPassportModal: React.FC<QrPassportModalProps> = ({
  isOpen,
  onClose,
  batch,
  defaultMode = 'show',
}) => {
  const [activeTab, setActiveTab] = useState<'show' | 'scan'>(defaultMode);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const { lang } = useLanguage();
  const isTa = lang === 'ta';

  const handleClose = () => {
    setScannedResult(null);
    setIsScanning(false);
    onClose();
  };

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScannedResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScannedResult(
        isTa
          ? `தொகுதி ${batch.lotId} சரிபார்க்கப்பட்டது! விளைவித்த இடம்: ${batch.origin}, உழவர்: ${batch.owner || 'அங்கீகரிக்கப்பட்ட உழவர்'}. தரம்: ${batch.grade || 'சரிபார்க்கப்பட்டது'}, வம்சாவளி: டிஜிட்டல் முத்திரையிடப்பட்டது.`
          : `Lot ${batch.lotId} Verified! Origin: ${batch.origin}, Producer: ${batch.owner || 'Authenticated Producer'}. Grade: ${batch.grade || 'Verified'}, Traceability: Cryptographically Signed.`
      );
    }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-950 flex items-center justify-center border border-amber-200/50">
              <Icon name="qr_code_scanner" className="w-5 h-5 text-amber-900" />
            </span>
            <h3 id="modalTitle" className="text-xl font-extrabold text-slate-900">
              {isTa ? 'டிஜிட்டல் பயிர் பாஸ்போர்ட் சான்றிதழ்' : 'Digital Crop Passport Asset'}
            </h3>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={handleClose}
            aria-label={isTa ? 'மூடு (Esc)' : 'Close modal (Esc)'}
            title={isTa ? 'மூட Esc அழுத்தவும்' : 'Press Esc to close'}
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center space-x-1.5 mt-5 bg-slate-100/80 p-1 rounded-full border border-slate-200/50">
          <button
            type="button"
            onClick={() => setActiveTab('show')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'show'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon name="qr_code" className="w-4 h-4" />
            <span>{isTa ? 'தொகுதி பாஸ்போர்ட் காட்டு' : 'Show Lot Passport'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon name="photo_camera" className="w-4 h-4" />
            <span>{isTa ? 'விளைபொருள் QR ஸ்கேன் செய்க' : 'Scan Produce QR'}</span>
          </button>
        </div>

        {/* Tab 1: Show QR Passport */}
        {activeTab === 'show' && (
          <div className="mt-5 flex flex-col items-center text-center">
            {/* QR Representation Box */}
            <div className="w-48 h-48 bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative group">
              {/* Stylized QR Pattern using Grid */}
              <div className="w-full h-full bg-white rounded-xl p-2 flex flex-col items-center justify-center shadow-xs">
                <div className="grid grid-cols-6 gap-1 w-32 h-32">
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-200 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-200 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-400 rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-200 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                  <div className="bg-slate-900 rounded-xs"></div>
                </div>
              </div>
              <span className="absolute bottom-1 bg-slate-100 px-2 py-0.5 rounded-full text-[9px] font-mono text-slate-500 border border-slate-200">
                {isTa ? 'SHA-256 சரிபார்க்கப்பட்டது' : 'SHA-256 VERIFIED'}
              </span>
            </div>

            <div className="mt-4">
              <span className="font-mono font-bold text-base text-slate-900">{batch.lotId}</span>
              <p className="text-xs text-slate-500 mt-1">
                {batch.crop} • {batch.quantityKg} {isTa ? 'கிலோ' : 'kg'} • {batch.grade || 'Standard'} • {batch.origin}
              </p>
              <span className="inline-block mt-2 text-[11px] font-mono text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-bold">
                {isTa ? 'முத்திரை கையொப்பம்' : 'Signature'}: {batch.sealSignature}
              </span>
            </div>

            {simulationActive && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-left text-xs text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="font-bold flex items-center gap-1.5">
                  <Icon name="verified_user" className="w-4 h-4 text-emerald-700" />
                  {isTa ? 'நுகர்வோர் சரிபார்ப்பு வெற்றி பெற்றது' : 'Consumer Verification Succeeded'}
                </div>
                <p className="mt-1 text-slate-700">
                  {isTa ? (
                    <>
                      <strong>{batch.owner || 'அங்கீகரிக்கப்பட்ட உழவர்'}</strong> அவர்களால் {batch.origin} பகுதியில் விளைவிக்கப்பட்டது. வம்சாவளி டிஜிட்டல் சான்று சரிபார்க்கப்பட்டது.
                    </>
                  ) : (
                    <>
                      Produce grown by <strong>{batch.owner || 'Authenticated Producer'}</strong> at {batch.origin}. Traceability cryptographic root verified against immutable ledger.
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 w-full">
              <button
                type="button"
                onClick={() => alert(isTa ? `தொகுதி ${batch.lotId}-க்கான QR சான்றிதழ் பதிவிறக்கப்படுகிறது...` : `Downloading QR Certificate for Lot ${batch.lotId}...`)}
                className="py-2.5 px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Icon name="download" className="w-4 h-4" />
                <span>{isTa ? 'பதிவிறக்கு (PDF / SVG)' : 'Download (PDF / SVG)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSimulationActive((prev) => !prev)}
                className="py-2.5 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Icon name="smartphone" className="w-4 h-4" />
                <span>{simulationActive ? (isTa ? 'முடிவை மறை' : 'Hide Scan Result') : (isTa ? 'நுகர்வோர் ஸ்கேன் உருவகப்படுத்து' : 'Simulate Consumer Scan')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Scan Produce QR Camera Simulation */}
        {activeTab === 'scan' && (
          <div className="mt-5 flex flex-col items-center text-center">
            {/* Camera Viewfinder Mockup */}
            <div className="w-full h-56 bg-slate-900 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center border-2 border-slate-800 shadow-inner">
              {/* Corner Viewfinder Reticles */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400"></div>

              {/* Scanning Laser Line */}
              {isScanning && (
                <div className="absolute left-0 right-0 h-1 bg-amber-400 shadow-[0_0_12px_#F59E0B] animate-pulse"></div>
              )}

              <Icon name="photo_camera" className="w-10 h-10 text-slate-500 mb-1" />
              <span className="text-slate-400 text-xs font-mono">
                {isScanning ? (isTa ? 'விளைபொருள் QR குறியீட்டைப் படிக்கிறது...' : 'Decoding Produce QR Code...') : (isTa ? 'கேமராவை விளைபொருள் QR-ல் காட்டவும்' : 'Point Camera at Crate Tag or QR Code')}
              </span>
            </div>

            {/* Scanned Result Readout */}
            {scannedResult && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-left text-xs text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-150 w-full">
                <div className="font-bold flex items-center gap-1.5">
                  <Icon name="verified" className="w-4 h-4 text-emerald-700" />
                  <span>{isTa ? 'தொகுதியின் நம்பகத்தன்மை உறுதி செய்யப்பட்டது' : 'Batch Authenticity Confirmed'}</span>
                </div>
                <p className="mt-1 text-slate-700">{scannedResult}</p>
              </div>
            )}

            {/* Scan Action Controls */}
            <div className="mt-5 w-full flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="flex-1 py-2.5 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Icon name="qr_code_scanner" className="w-4 h-4" />
                <span>{isScanning ? (isTa ? 'ஸ்கேன் செய்கிறது...' : 'Scanning...') : (isTa ? 'விளைபொருள் QR-ஐ ஸ்கேன் செய்க' : 'Simulate Scanning Produce QR')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrPassportModal;
