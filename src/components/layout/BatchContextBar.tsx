'use client';

import React from 'react';
import { BatchInfo } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { useLanguage } from '@/hooks/useLanguage';

export interface BatchContextBarProps {
  readonly batch: BatchInfo;
  readonly ethosText: string;
}

const getCropEmoji = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('tomato') || lower.includes('தக்காளி')) return '🍅';
  if (lower.includes('onion') || lower.includes('வெங்காயம்')) return '🧅';
  if (lower.includes('banana') || lower.includes('வாழை')) return '🍌';
  if (lower.includes('brinjal') || lower.includes('eggplant') || lower.includes('கத்தரி')) return '🍆';
  if (lower.includes('mango') || lower.includes('மாம்பழம்')) return '🥭';
  if (lower.includes('potato') || lower.includes('உருளை')) return '🥔';
  if (lower.includes('chilli') || lower.includes('pepper') || lower.includes('மிளகாய்')) return '🌶️';
  return '🌱';
};

export const BatchContextBar: React.FC<BatchContextBarProps> = ({ batch, ethosText }) => {
  const { t, isTamil } = useLanguage();
  const emoji = getCropEmoji(batch.crop);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 text-center overflow-hidden">
      {/* Active Lot Identifier Chip */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 mb-3 shadow-xs flex-wrap justify-center max-w-full">
        <span className="text-base shrink-0">{emoji}</span>
        <span className="font-bold text-slate-900 font-mono truncate">{batch.crop} {batch.lotId}</span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shrink-0 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          {isTamil ? 'சரிபார்க்கப்பட்ட புவி-மூலம்' : 'Verified Geo-Lineage'}
        </span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="font-mono text-slate-600 truncate">{Number(batch.quantityKg).toLocaleString('en-IN')} {t.common.kg} ({batch.grade || t.dashboard.standardGrade})</span>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
        CropChain Lens
      </h1>
      <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto mt-2 font-normal leading-relaxed">
        {isTamil
          ? 'விவசாய மதிப்புப் பகிர்வில் முழு வெளிப்படைத்தன்மையை உணருங்கள்'
          : 'Embrace Transparency in Agricultural Value Distribution'}
      </p>

      {/* Epistemic Ethos Subtitle */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-3 flex-wrap">
        <Icon name="verified_user" size={15} className="text-slate-400" />
        <span className="italic">{ethosText}</span>
      </div>
    </div>
  );
};

export default BatchContextBar;
