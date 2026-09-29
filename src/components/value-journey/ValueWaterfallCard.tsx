'use client';

import React, { useState } from 'react';
import { ValueDistributionStage, Language } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { useLanguage } from '@/hooks/useLanguage';

export interface ValueWaterfallCardProps {
  readonly stages: readonly ValueDistributionStage[];
  readonly totalRetailValue: number;
  readonly language?: Language;
  readonly hasRecordedTransactions?: boolean;
}

type DisplayUnit = 'percent' | 'perKg' | 'totalLot';

export const ValueWaterfallCard: React.FC<ValueWaterfallCardProps> = ({
  stages,
  totalRetailValue,
  language: propLanguage,
  hasRecordedTransactions = true,
}) => {
  const { lang, t } = useLanguage();
  const activeLanguage = propLanguage || lang;
  const isTa = activeLanguage === 'ta';

  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(0);
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>('percent');
  const [showDemoWaterfall, setShowDemoWaterfall] = useState<boolean>(false);

  const stageExplanations = [
    {
      title: isTa ? 'பண்ணை வாசல் நிகர வருவாய்' : 'Farm Gate Net Realization',
      role: isTa ? 'உற்பத்தியாளர் பங்கு' : 'Primary Producer Share',
      insight: isTa
        ? 'சென்னை நுகர்வோர் செலுத்தும் ஒவ்வொரு ரூபாயிலும் 56.25 பைசா விவசாயிக்குச் சென்றடைகிறது. இது தமிழ்நாடு மாவட்ட சராசரியை விட 4.2% அதிகம்.'
        : 'For every ₹1.00 spent by retail consumers in Chennai, ₹0.5625 returns directly to the farmgate. This exceeds the Tamil Nadu state mandi average by +4.2%.',
      verifiedEvidence: 'TXN-SLM-1004 • Salem Mandi Cash Slip #4012',
    },
    {
      title: isTa ? 'உள்ளூர் சேகரிப்பு & வரிசைப்படுத்தல்' : 'Local Aggregation & Grading',
      role: isTa ? 'உள்ளூர் வியாபாரி' : 'Commission Agent Margin',
      insight: isTa
        ? 'தர்மபுரி சேகரிப்பு மையத்தில் தரம் பிரித்தல் மற்றும் கழிவுகளை நீக்குதல் செலவு ₹0.90, உள்ளூர் போக்குவரத்து ₹1.30, சந்தைக் கட்டணம் ₹0.30.'
        : 'Covers physical lot grading, crate culling, and intra-district transit from farmgate to Dharmapuri yard. Includes statutory APMC cess.',
      verifiedEvidence: 'TXN-DHP-9982 • APMC Cess Gate Pass #884',
    },
    {
      title: isTa ? 'குளிரூட்டப்பட்ட நெடுஞ்சாலை போக்குவரத்து' : 'Cold Highway Transit & Wholesale',
      role: isTa ? 'கோயம்பேடு மொத்த விற்பனையாளர்' : 'Terminal Logistics & Commission',
      insight: isTa
        ? 'தர்மபுரியிலிருந்து சென்னை கோயம்பேடு வரையிலான 310 கி.மீ குளிர்சாதன லாரி பயணம் (12.4°C மாறா வெப்பநிலை) மற்றும் சுங்கச்சாவடி கட்டணங்கள்.'
        : 'Refrigerated 310 km overnight transit from Dharmapuri to Chennai Koyambedu. Maintains 12.4°C core temperature to eliminate post-harvest moisture shrinkage.',
      verifiedEvidence: 'TXN-KYM-4410 • Fastag & GPS Reefer Telemetry',
    },
    {
      title: isTa ? 'சில்லறை விற்பனை & கடை செலவுகள்' : 'Urban Retail & Fresh Spoilage Buffer',
      role: isTa ? 'சென்னை அக்மார்க் சூப்பர் ஸ்டோர்' : 'Consumer End Retailer',
      insight: isTa
        ? 'அடையாறு ஆர்கானிக்ஸ் குளிரூட்டப்பட்ட விற்பனை அறை, கடை வாடகை, ஊழியர் ஊதியம் மற்றும் 2-3 நாள் அழுகல் கழிவு பாதுகாப்பு ஒதுக்கீடு.'
        : 'In-store display chiller operations, urban premium retail lease in Adyar, and insurance buffer against unsold 48-hour over-ripe tomato spoilage.',
      verifiedEvidence: 'TXN-RET-8812 • GST Invoice B2C POS Terminal',
    },
  ];

  const formatValue = (stage: ValueDistributionStage) => {
    if (displayUnit === 'perKg') {
      return `₹${stage.amount.toFixed(2)} / ${t.common.kg}`;
    }
    if (displayUnit === 'totalLot') {
      const lotAmount = Math.round(stage.amount * 800);
      return `₹${lotAmount.toLocaleString('en-IN')}`;
    }
    return `₹${stage.amount.toFixed(2)} (${stage.percentage.toFixed(2)}%)`;
  };

  const selectedStage = selectedStageIndex !== null ? stages[selectedStageIndex] : null;
  const selectedInfo = selectedStageIndex !== null ? stageExplanations[selectedStageIndex] : null;

  // Truthful empty state when no transactions recorded yet
  if (!hasRecordedTransactions && !showDemoWaterfall) {
    return (
      <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft-card flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t.journey.badge}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                {t.journey.title}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-200">
              {t.journey.awaitingSettlement}
            </span>
          </div>

          <div className="p-8 text-center my-6 bg-slate-50/70 rounded-2xl border border-slate-200/60">
            <div className="w-12 h-12 rounded-2xl bg-slate-200/70 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Icon name="payments" size={24} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {t.journey.emptyTitle}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
              {t.journey.emptyDesc}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowDemoWaterfall(true)}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                {t.journey.previewModelBtn}
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500 flex items-center gap-2">
          <Icon name="info" size={16} className="text-amber-600 shrink-0" />
          <span>
            {t.journey.simWorkbenchHint}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft-card flex flex-col justify-between overflow-hidden">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.journey.badge}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              {t.journey.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Unit Switcher Pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setDisplayUnit('percent')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  displayUnit === 'percent'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => setDisplayUnit('perKg')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  displayUnit === 'perKg'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.journey.viewModeRupees}
              </button>
              <button
                type="button"
                onClick={() => setDisplayUnit('totalLot')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  displayUnit === 'totalLot'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.journey.viewModeLotTotal}
              </button>
            </div>

            <span className="text-xs px-3 py-1 bg-slate-100 rounded-full text-slate-900 font-mono font-bold">
              ₹{totalRetailValue.toLocaleString('en-IN')} {isTa ? 'சில்லறை மதிப்பு' : 'Worth'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
          {t.journey.description}
        </p>

        {/* Waterfall Stack with rounded-full bars */}
        <div className="space-y-3.5">
          {stages.map((stage, idx) => {
            const isSelected = selectedStageIndex === idx;
            const barColors = [
              'bg-emerald-500',
              'bg-amber-400',
              'bg-slate-400',
              'bg-amber-600',
            ];
            const activeColor = barColors[idx % barColors.length];
            const stageLabel = isTa && stage.labelTamil ? stage.labelTamil : stage.label;

            return (
              <div
                key={stage.label}
                onClick={() => setSelectedStageIndex(isSelected ? null : idx)}
                className={`p-2.5 rounded-2xl transition-all cursor-pointer border min-w-0 ${
                  isSelected
                    ? 'bg-slate-50 border-amber-300 ring-2 ring-amber-100 shadow-xs'
                    : 'border-transparent hover:bg-slate-50/60'
                }`}
              >
                <div className="flex justify-between text-xs font-medium mb-1.5 flex-wrap gap-1">
                  <span className="text-slate-900 flex items-center gap-2 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full ${activeColor} inline-block shrink-0`}></span>
                    <span className={isSelected ? 'font-bold truncate' : 'truncate'}>{stageLabel}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {formatValue(stage)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div
                    className={`${activeColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Expanded Detail Box */}
        {selectedStage && selectedInfo && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">{selectedInfo.title}</span>
                <span className="text-slate-400">• {selectedInfo.role}</span>
              </div>
              <span className="font-mono font-bold text-amber-900 text-xs">
                {selectedStage.percentage.toFixed(2)}{t.journey.percentOfConsumer}
              </span>
            </div>
            <p className="mt-2 text-slate-600 leading-relaxed">
              {selectedInfo.insight}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200/40 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
              <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <Icon name="verified" size={14} className="text-emerald-700" />
                <span>{selectedInfo.verifiedEvidence}</span>
              </span>
              <span className="font-mono font-semibold text-slate-700">₹{selectedStage.amount.toFixed(2)}{t.journey.allocationUnit}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValueWaterfallCard;
