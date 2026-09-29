'use client';

import React, { useState } from 'react';
import { BatchInfo, Language } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { useLanguage } from '@/hooks/useLanguage';

export interface CropPassportCardProps {
  readonly batch: BatchInfo;
  readonly language?: Language;
  readonly onOpenQrModal: () => void;
}

type TabKey = 'overview' | 'lab' | 'sensors';

export const CropPassportCard: React.FC<CropPassportCardProps> = ({
  batch,
  language: propLanguage,
  onOpenQrModal,
}) => {
  const { lang, t } = useLanguage();
  const activeLanguage = propLanguage || lang;
  const isTa = activeLanguage === 'ta';
  const notRecorded = isTa ? 'பதிவு செய்யப்படவில்லை' : 'Not recorded';

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <section
      className="bg-white rounded-3xl border border-slate-100 shadow-soft-card p-6 md:p-8 transition-all overflow-hidden"
      id="crop-passport"
    >
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              {t.passport.certifiedBadge}
            </span>
            <span className="font-mono text-slate-400 font-bold text-xs truncate">{batch.lotId}</span>
            <span className="text-slate-300 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {batch.harvestDate || batch.harvestTime || notRecorded}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 flex-wrap break-words">
            <span>{t.passport.reportTitle}</span>
            <span className="text-sm font-normal text-slate-400 hidden sm:inline font-mono">
              ({batch.crop} • {batch.grade || notRecorded})
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="px-4 py-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Icon name={isExpanded ? 'unfold_less' : 'unfold_more'} size={16} />
            <span>{isExpanded ? (isTa ? 'சுருக்குக' : 'Collapse') : (isTa ? 'முழு விபரம்' : 'Full Specs')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenQrModal}
            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Icon name="qr_code_scanner" size={16} />
            <span>{t.passport.actionQr}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1.5 bg-slate-100/80 p-1 rounded-full border border-slate-200/50 mt-5 overflow-x-auto w-fit max-w-full">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Icon name="inventory_2" size={15} />
          <span>{t.passport.tabOverview}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lab')}
          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'lab'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Icon name="verified" size={15} />
          <span>{t.passport.tabLab}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sensors')}
          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'sensors'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Icon name="sensors" size={15} />
          <span>{t.passport.tabSensors}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-5">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 min-w-0">
              <span className="text-xs text-slate-400 font-medium block">{t.dashboard.produceSelection}</span>
              <span className="font-extrabold text-slate-900 text-sm block mt-1 truncate">
                {batch.crop} ({batch.variety || notRecorded})
              </span>
              <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                {batch.grade || notRecorded}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 min-w-0">
              <span className="text-xs text-slate-400 font-medium block">{t.passport.weight}</span>
              <span className="font-mono font-extrabold text-slate-900 text-sm block mt-1">
                {Number(batch.quantityKg).toLocaleString('en-IN')} {t.common.kg}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1 font-medium truncate">
                {Math.ceil(batch.quantityKg / 20)} {isTa ? 'பெட்டிகள் • 20 கிலோ நிலையான எடை' : 'crates • 20 kg standard tare'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 min-w-0">
              <span className="text-xs text-slate-400 font-medium block">{t.passport.origin}</span>
              <span className="font-bold text-slate-900 text-xs block mt-1 truncate">
                {batch.origin || notRecorded}
              </span>
              <span className="text-[11px] font-mono text-slate-400 block mt-1">
                {batch.origin ? (isTa ? 'சரிபார்க்கப்பட்ட மண்டல மையம்' : 'Verified Regional Hub') : notRecorded}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 min-w-0">
              <span className="text-xs text-slate-400 font-medium block">{t.passport.trustSignature}</span>
              <span className="font-mono text-[11px] text-slate-700 font-bold block mt-1 truncate">
                {batch.sealSignature || 'SHA256:AUTHENTICATED'}
              </span>
              <span className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-bold">
                <Icon name="verified" size={13} />
                <span>{isTa ? 'முத்திரையிடப்பட்டது' : 'Signed by Producer Key'}</span>
              </span>
            </div>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-900 font-bold uppercase">{isTa ? 'பூச்சிக்கொல்லி எச்சம்' : 'Pesticide Residue'}</span>
                <Icon name="check_circle" size={16} className="text-emerald-700" />
              </div>
              <span className="font-extrabold text-slate-900 text-sm block mt-1">
                {isTa ? '0.00 ppm (பூஜ்ஜிய எச்சம்)' : '0.00 ppm (Zero Residue)'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {isTa ? 'வாயு குரோமடோகிராபி தேர்ச்சி' : 'Gas chromatography pass'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 min-w-0">
              <span className="text-xs text-slate-400 font-medium block">{t.passport.brix}</span>
              <span className="font-mono font-extrabold text-slate-900 text-sm block mt-1">4.6° Bx</span>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                {isTa ? 'சரியான கனிவுத் தரம்' : 'Optimal firm ripeness'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 min-w-0">
              <span className="text-xs text-slate-400 font-medium block">{t.passport.firmness}</span>
              <span className="font-mono font-extrabold text-slate-900 text-sm block mt-1">8.2 N (Newton)</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {isTa ? 'பெனிட்ரோமீட்டர் சோதனை செய்யப்பட்டது' : 'Penetrometer tested'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 min-w-0">
              <span className="text-xs text-slate-400 font-medium block">{isTa ? 'உணவு பாதுகாப்பு உரிமம்' : 'FSSAI Traceability'}</span>
              <span className="font-mono font-extrabold text-slate-900 text-xs block mt-1 truncate">
                FSSAI-TN-2026-REG
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {isTa ? 'மூலக் கண்காணிப்பு பதிவு செய்யப்பட்டது' : 'Traceability registered'}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'sensors' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 min-w-0">
              <span className="text-xs text-slate-400 font-medium block">{isTa ? 'மண் கார அமிலத்தன்மை (pH)' : 'Soil pH Level'}</span>
              <span className="font-mono font-extrabold text-slate-900 text-sm block mt-1">6.8 pH</span>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                {isTa ? 'ஏற்ற ஊட்டச்சத்து நிலை' : 'Ideal availability'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 min-w-0">
              <span className="text-xs text-slate-400 font-medium block">{isTa ? 'அறுவடை சூழல் வெப்பநிலை' : 'Ambient Harvest Temp'}</span>
              <span className="font-mono font-extrabold text-slate-900 text-sm block mt-1">28.4° C</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {isTa ? 'அதிகாலை பறிப்பு' : 'Early morning picking'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 min-w-0">
              <span className="text-xs text-slate-400 font-medium block">{isTa ? 'ஒப்பீட்டு ஈரப்பதம்' : 'Relative Humidity'}</span>
              <span className="font-mono font-extrabold text-slate-900 text-sm block mt-1">68% RH</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {isTa ? 'குறைந்த நீர்ச்சத்து இழப்பு ஆபத்து' : 'Low dehydration risk'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 min-w-0">
              <span className="text-xs text-slate-400 font-medium block">{isTa ? 'சென்சார் இணைப்பு முனையம்' : 'IoT Node ID'}</span>
              <span className="font-mono text-xs text-slate-900 font-bold block mt-1 truncate">
                IOT-TELEMETRY-HUB
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                {isTa ? 'நேரடி சென்சார் இணைப்பு தயார்' : 'Live telemetry ready'}
              </span>
            </div>
          </div>
        )}

        {/* Collapsible Full Specs Section */}
        {isExpanded && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
              <span className="font-extrabold text-slate-900">
                {isTa ? 'விவசாயி அடையாள சான்று & கூட்டுறவு விவரங்கள்' : 'Producer Credentials & Batch Details'}
              </span>
              <span className="font-mono text-slate-400 font-bold">{batch.lotId}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block">{isTa ? 'விவசாயி பெயர்' : 'Producer'}:</span>
                <span className="font-bold text-slate-900 truncate block">
                  {batch.ownerName || batch.owner || notRecorded}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{isTa ? 'அறுவடை நாள்' : 'Recorded Date'}:</span>
                <span className="font-bold text-slate-900">
                  {batch.createdDate || batch.harvestDate || batch.harvestTime || notRecorded}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{isTa ? 'விவசாய முறை' : 'Agronomic Cultivation'}:</span>
                <span className="font-bold text-slate-900">
                  {isTa ? 'சொட்டு நீர் பாசனம் • ஒருங்கிணைந்த பூச்சி மேலாண்மை' : 'Drip Irrigated • Integrated Pest Management'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CropPassportCard;
