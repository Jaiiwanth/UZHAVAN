'use client';

import React from 'react';
import { DecisionOption, Language } from '@/types';
import { Icon } from '@/components/ui/Icon';

export interface DecisionOptionCardProps {
  readonly option: DecisionOption;
  readonly netAmount: number;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
  readonly language: Language;
}

export const DecisionOptionCard: React.FC<DecisionOptionCardProps> = ({
  option,
  netAmount,
  isSelected,
  onSelect,
  language,
}) => {
  const isTa = language === 'ta';

  return (
    <div
      onClick={onSelect}
      className={`rounded-3xl border-2 p-6 flex flex-col justify-between transition-all cursor-pointer ${
        isSelected
          ? 'border-slate-900 ring-4 ring-slate-900/10 bg-white shadow-soft-card scale-[1.01]'
          : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300'
      }`}
    >
      <div>
        {/* Card Top Row */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {option.letter}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {isTa ? option.titleTamil : option.title}
              </h3>
              {isSelected && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1 mt-0.5">
                  <Icon name="check_circle" className="w-3.5 h-3.5" />
                  <span>{isTa ? 'தேர்ந்தெடுக்கப்பட்ட வழி' : 'Selected Route (Draft)'}</span>
                </span>
              )}
            </div>
          </div>
          <span
            className={`font-mono font-bold text-lg ${
              option.letter === 'B' ? 'text-emerald-700' : 'text-slate-900'
            }`}
          >
            {isTa ? `மதிப்பீடு ₹${netAmount.toLocaleString('en-IN')} நிகரம்` : `Est. ₹${netAmount.toLocaleString('en-IN')} Net`}
          </span>
        </div>

        {/* Positives */}
        <div className="mt-5 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
            {isTa ? 'செயல்பாட்டு நன்மைகள்:' : 'Operational Advantages:'}
          </span>
          <ul className="text-xs space-y-2 text-slate-800">
            {(isTa && option.advantagesTamil ? option.advantagesTamil : option.advantages).map((adv, idx) => {
              const colonIndex = adv.indexOf(':');
              const prefix = colonIndex !== -1 ? adv.substring(0, colonIndex + 1) : '';
              const rest = colonIndex !== -1 ? adv.substring(colonIndex + 1) : adv;
              return (
                <li key={idx} className="flex items-start gap-2">
                  <Icon name="check" className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {prefix && <strong>{prefix}</strong>}
                    {rest}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Trade-offs */}
        <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            {isTa ? 'ஏற்க வேண்டிய சமரசங்கள்:' : 'Factors to Accept:'}
          </span>
          <ul className="text-xs space-y-2 text-slate-500">
            {(isTa && option.tradeOffsTamil ? option.tradeOffsTamil : option.tradeOffs).map((to, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Icon name="remove" className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{to}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100">
        {option.letter === 'A' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`w-full py-3.5 rounded-full border-2 font-bold transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer ${
              isSelected
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Icon
              name={isSelected ? 'check_circle' : 'check_circle_outline'}
              className="w-4 h-4"
            />
            <span>{isTa ? option.actionLabelTamil : option.actionLabel}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`w-full py-3.5 rounded-full font-bold transition-all text-xs flex items-center justify-center space-x-2 shadow-xs cursor-pointer ${
              isSelected
                ? 'bg-slate-900 text-white ring-2 ring-slate-900'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
            }`}
          >
            <Icon name="explore" className="w-4 h-4" />
            <span>{isTa ? option.actionLabelTamil : option.actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DecisionOptionCard;
