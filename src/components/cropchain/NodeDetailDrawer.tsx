'use client';

import React from 'react';
import { SupplyChainNode, Language } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { useLanguage } from '@/hooks/useLanguage';

export interface NodeDetailDrawerProps {
  readonly node: SupplyChainNode;
  readonly isHighlighted: boolean;
  readonly language?: Language;
  readonly onSelectStage?: (id: SupplyChainNode['id']) => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  isHighlighted,
  language: propLanguage,
  onSelectStage,
}) => {
  const { lang, t } = useLanguage();
  const activeLanguage = propLanguage || lang;
  const isTa = activeLanguage === 'ta';

  const stages: Array<{ id: SupplyChainNode['id']; name: string }> = [
    { id: 'farm', name: isTa ? 'பண்ணை' : 'Farm Gate' },
    { id: 'trader', name: isTa ? 'வியாபாரி' : 'Local Trader' },
    { id: 'wholesaler', name: isTa ? 'மொத்தவிற்பனை' : 'Wholesaler' },
    { id: 'retail', name: isTa ? 'சில்லறை' : 'Retail Shelf' },
  ];

  return (
    <div
      id="nodeDetailDrawer"
      className={`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft-card transition-all duration-300 overflow-hidden ${
        isHighlighted ? 'ring-2 ring-slate-900/20' : ''
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
              {isTa ? `நிலை ${node.stageNumber} தணிக்கை விவரம்` : `Node ${node.stageNumber} Detailed Anatomy`}
            </span>
            <span className="text-xs text-slate-400 font-mono truncate">{node.auditTxnId}</span>
            <span className="text-slate-300 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline truncate">{node.operatorRole}</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2 flex-wrap">
            <span className="truncate">{node.operatorName}</span>
            {node.isVerified && (
              <Icon
                name="verified"
                size={20}
                className="text-emerald-600"
              />
            )}
          </h3>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80 flex-wrap shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {t.lens.drawer.acquisition}
            </span>
            <span className="font-mono font-bold text-slate-800 text-base">
              ₹{node.acquisitionPrice.toFixed(2)}
              <span className="text-xs text-slate-400 font-normal">{t.common.perKg}</span>
            </span>
          </div>
          <Icon name="arrow_forward" size={16} className="text-slate-400 hidden sm:inline-flex" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {t.lens.drawer.gateTransfer}
            </span>
            <span className="font-mono font-bold text-slate-900 text-base">
              ₹{node.transferPrice.toFixed(2)}
              <span className="text-xs text-slate-400 font-normal">{t.common.perKg}</span>
            </span>
          </div>
          <div className="border-l border-slate-200 pl-3 ml-1">
            <span className="text-[10px] text-emerald-800 uppercase font-bold block">
              {t.lens.drawer.stageDelta}
            </span>
            <span className="font-mono font-extrabold text-emerald-700 text-base">
              +₹{node.stageDelta.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Deconstructed 4-Item Anatomy Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {node.breakdown.map((item, idx) => {
          const isVariance = idx === 3;
          return (
            <div
              key={item.label}
              className={`p-4 rounded-2xl border transition-all min-w-0 ${
                isVariance
                  ? 'bg-amber-50/60 border-amber-200/60'
                  : 'bg-slate-50/70 border-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] block font-medium truncate ${
                    isVariance ? 'text-amber-950 font-bold' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
                {isVariance && (
                  <Icon name="help_outline" size={14} className="text-amber-600" />
                )}
              </div>
              <span
                className={`text-lg font-mono font-extrabold mt-0.5 block ${
                  isVariance ? 'text-amber-950' : 'text-slate-900'
                }`}
              >
                ₹{item.amount.toFixed(2)}
                <span className="text-xs font-normal text-slate-400">{t.common.perKg}</span>
              </span>
              <span
                className={`text-[11px] block mt-1 leading-snug break-words ${
                  isVariance ? 'text-amber-900/90' : 'text-slate-500'
                }`}
              >
                {item.note}
              </span>
            </div>
          );
        })}
      </div>

      {/* Explanatory notice */}
      <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
        <Icon name="info" size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 font-bold">{node.explainQuestion}</strong>
          <span> {node.explainAnswer}</span>
        </div>
      </div>

      {/* Quick Stage Switcher Pills */}
      {onSelectStage && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-400">
            {t.lens.drawer.inspectOtherNodes}
          </span>
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            {stages.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectStage(s.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  node.id === s.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {idx + 1}. {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeDetailDrawer;
