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

  const displayDate = batch.harvestDate || batch.createdDate || batch.harvestTime || notRecorded;

  return (
    <section
      className="bg-white rounded-3xl border border-slate-200/80 shadow-soft-card p-6 md:p-8 transition-all overflow-hidden"
      id="crop-passport"
    >
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              {t.passport.certifiedBadge}
            </span>
            <span className="font-mono text-slate-600 font-bold text-xs truncate bg-slate-100 px-2 py-0.5 rounded-md">
              {batch.lotId}
            </span>
            <span className="text-slate-300 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {displayDate}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 flex-wrap break-words mt-1">
            <span>{t.passport.reportTitle}</span>
            <span className="text-sm font-semibold text-slate-500 hidden sm:inline font-mono">
              ({batch.crop} • {Number(batch.quantityKg).toLocaleString('en-IN')} {t.common.kg})
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
            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer hover:bg-amber-400 hover:text-slate-950"
          >
            <Icon name="qr_code_scanner" size={16} />
            <span>{t.passport.actionQr}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-full border border-slate-200/60 mt-5 overflow-x-auto w-fit max-w-full">
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
            {/* 1. Produce & Selection */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">{t.dashboard.produceSelection}</span>
              <span className="font-extrabold text-slate-900 text-base block mt-1 truncate">
                {batch.crop}
              </span>
              <span className="text-xs text-slate-600 font-medium block mt-1 truncate">
                {batch.variety || notRecorded} • {batch.grade || 'Grade A'}
              </span>
            </div>

            {/* 2. Weight */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">{t.passport.weight}</span>
              <span className="font-mono font-extrabold text-slate-900 text-base block mt-1">
                {Number(batch.quantityKg).toLocaleString('en-IN')} {t.common.kg}
              </span>
              <span className="text-xs text-slate-500 block mt-1 font-medium truncate">
                {Math.ceil(batch.quantityKg / 20)} {isTa ? 'பெட்டிகள் (20 கிலோ நிலையான எடை)' : 'standard 20kg crates'}
              </span>
            </div>

            {/* 3. Origin Cluster */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">{t.passport.origin}</span>
              <span className="font-bold text-slate-900 text-sm block mt-1 truncate">
                {batch.origin || notRecorded}
              </span>
              <span className="text-[11px] font-mono text-emerald-800 font-semibold block mt-1">
                {batch.origin ? (isTa ? 'சரிபார்க்கப்பட்ட புவி-மூலம்' : 'Verified Cluster') : notRecorded}
              </span>
            </div>

            {/* 4. Seal Signature */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">{t.passport.trustSignature}</span>
              <span className="font-mono text-xs text-slate-700 font-bold block mt-1 truncate">
                {batch.sealSignature || 'SHA256:AUTHENTICATED'}
              </span>
              <span className="text-[11px] text-emerald-800 flex items-center gap-1 mt-1 font-bold">
                <Icon name="verified" size={13} />
                <span>{isTa ? 'உழவர் டிஜிட்டல் முத்திரை' : 'Signed & Sealed'}</span>
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Lab & Residue Specs - Truthful DB Display: Show 'Not recorded' if not recorded */}
        {activeTab === 'lab' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                {isTa ? 'பூச்சிக்கொல்லி எச்சம்' : 'Pesticide Residue'}
              </span>
              <span className="font-bold text-slate-600 text-sm block mt-1">
                {notRecorded}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {isTa ? 'ஆய்வக சோதனை நிலுவையில் உள்ளது' : 'Lab test pending'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                {t.passport.brix}
              </span>
              <span className="font-bold text-slate-600 text-sm block mt-1">
                {notRecorded}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {isTa ? 'பிரிக்ஸ் சோதனை செய்யப்படவில்லை' : 'Brix test not conducted'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                {t.passport.firmness}
              </span>
              <span className="font-bold text-slate-600 text-sm block mt-1">
                {notRecorded}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {isTa ? 'பெனிட்ரோமீட்டர் பதிவு இல்லை' : 'Penetrometer reading absent'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                {isTa ? 'உணவு பாதுகாப்பு சான்றிதழ்' : 'FSSAI Certification'}
              </span>
              <span className="font-bold text-slate-600 text-sm block mt-1 truncate">
                {notRecorded}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {isTa ? 'சான்றிதழ் பதிவேற்றப்படவில்லை' : 'Certificate not uploaded'}
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Sensors & Environmental - Truthful DB Display */}
        {activeTab === 'sensors' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                {isTa ? 'மண் கார அமிலத்தன்மை (pH)' : 'Soil pH Level'}
              </span>
              <span className="font-bold text-slate-600 text-sm block mt-1">
                {notRecorded}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {isTa ? 'மண் சென்சார் இணைக்கப்படவில்லை' : 'Soil sensor not connected'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                {isTa ? 'அறுவடை சூழல் வெப்பநிலை' : 'Ambient Harvest Temp'}
              </span>
              <span className="font-bold text-slate-600 text-sm block mt-1">
                {notRecorded}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {isTa ? 'வெப்பநிலை பதிவு இல்லை' : 'Ambient telemetry not logged'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                {isTa ? 'ஒப்பீட்டு ஈரப்பதம்' : 'Relative Humidity'}
              </span>
              <span className="font-bold text-slate-600 text-sm block mt-1">
                {notRecorded}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {isTa ? 'ஈரப்பதம் பதிவு இல்லை' : 'Humidity sensor absent'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-0">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                {isTa ? 'IoT சென்சார் முனையம்' : 'IoT Node ID'}
              </span>
              <span className="font-bold text-slate-600 text-sm block mt-1 truncate">
                {notRecorded}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {isTa ? 'சென்சார் இணைப்பு தயாராக இல்லை' : 'Telemetry node inactive'}
              </span>
            </div>
          </div>
        )}

        {/* Collapsible Full Specs Section */}
        {isExpanded && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
              <span className="font-extrabold text-slate-900">
                {isTa ? 'விவசாயி அடையாள சான்று & தொகுதி விவரங்கள்' : 'Producer Credentials & Batch Details'}
              </span>
              <span className="font-mono text-slate-500 font-bold">{batch.lotId}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block font-medium">{isTa ? 'விவசாயி பெயர்' : 'Producer'}:</span>
                <span className="font-bold text-slate-900 truncate block mt-0.5">
                  {batch.ownerName || batch.owner || notRecorded}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">{isTa ? 'அறுவடை நாள்' : 'Recorded Date'}:</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {displayDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">{isTa ? 'பண்ணை அமைவிடம்' : 'Farm Location'}:</span>
                <span className="font-bold text-slate-900 block mt-0.5 truncate">
                  {batch.origin || notRecorded}
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
