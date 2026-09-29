'use client';

import React, { useState } from 'react';
import { SupplyChainNode, Language } from '@/types';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { Icon } from '@/components/ui/Icon';
import { useLanguage } from '@/hooks/useLanguage';

export interface CropChainVisualizerProps {
  readonly nodes: readonly SupplyChainNode[];
  readonly activeNodeId: SupplyChainNode['id'];
  readonly activeNode: SupplyChainNode;
  readonly isHighlighted: boolean;
  readonly onSelectNode: (id: SupplyChainNode['id']) => void;
  readonly language?: Language;
  readonly hasRecordedStages?: boolean;
  readonly onAddStageEvent?: () => void;
}

export const CropChainVisualizer: React.FC<CropChainVisualizerProps> = ({
  nodes,
  activeNodeId,
  activeNode,
  isHighlighted,
  onSelectNode,
  language: propLanguage,
  hasRecordedStages = true,
  onAddStageEvent,
}) => {
  const { lang, t } = useLanguage();
  const activeLanguage = propLanguage || lang;
  const isTa = activeLanguage === 'ta';
  const [showDemoAnatomy, setShowDemoAnatomy] = useState(false);

  const categoryPills: Record<SupplyChainNode['id'], { label: string; labelTamil: string; badgeClass: string }> = {
    farm: {
      label: 'Top Documented',
      labelTamil: 'முழு ஆவணம்',
      badgeClass: 'bg-slate-100 text-slate-700',
    },
    trader: {
      label: 'Audited Focus',
      labelTamil: 'தணிக்கை மையம்',
      badgeClass: 'bg-amber-100 text-amber-950',
    },
    wholesaler: {
      label: 'Transit Hub',
      labelTamil: 'போக்குவரத்து மையம்',
      badgeClass: 'bg-slate-100 text-slate-700',
    },
    retail: {
      label: 'Consumer Shelf',
      labelTamil: 'நுகர்வோர் தட்டு',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
  };

  const stageSubheads: Record<SupplyChainNode['id'], { sub: string; subTamil: string }> = {
    farm: {
      sub: 'Stage 01 • Salem, TN',
      subTamil: 'நிலை 01 • சேலம், தமிழ்நாடு',
    },
    trader: {
      sub: 'Stage 02 • Dharmapuri Hub',
      subTamil: 'நிலை 02 • தர்மபுரி மையம்',
    },
    wholesaler: {
      sub: 'Stage 03 • Koyambedu, Chennai',
      subTamil: 'நிலை 03 • கோயம்பேடு, சென்னை',
    },
    retail: {
      sub: 'Stage 04 • Adyar Fresh, Chennai',
      subTamil: 'நிலை 04 • அடையாறு, சென்னை',
    },
  };

  // Requirement 14: When no real chain stages exist yet, show truthful empty state
  if (!hasRecordedStages && !showDemoAnatomy) {
    return (
      <section className="bg-white rounded-3xl border border-slate-100 shadow-soft-card p-8 sm:p-10 text-center" id="cropchain-lens">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-950 flex items-center justify-center mx-auto mb-3 border border-amber-200/60 shadow-xs">
          <Icon name="hub" size={28} className="text-amber-800" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">
          {t.lens.emptyTitle}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
          {t.lens.emptyDesc}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {onAddStageEvent && (
            <button
              type="button"
              onClick={onAddStageEvent}
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Icon name="plus" size={16} className="text-amber-400" />
              <span>{t.lens.logEventBtn}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowDemoAnatomy(true)}
            className="px-5 py-2.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            {t.lens.previewModelBtn}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4" id="cropchain-lens">
      {/* Section Header with category navigation controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {t.lens.title}
            </h2>
            {!hasRecordedStages && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full border border-amber-200">
                {t.lens.referenceModelBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.lens.subtitle}
          </p>
        </div>

        {/* Category Filter & Nav Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-900 shadow-xs">
            {t.lens.auditedStagesCount}
          </span>
          <div className="flex items-center space-x-1 pl-1">
            <button
              type="button"
              onClick={() => {
                const order: SupplyChainNode['id'][] = ['farm', 'trader', 'wholesaler', 'retail'];
                const curIdx = order.indexOf(activeNodeId);
                const prevIdx = (curIdx - 1 + order.length) % order.length;
                onSelectNode(order[prevIdx]);
              }}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs cursor-pointer"
              title={t.lens.prevStage}
            >
              <Icon name="expand_less" size={16} className="-rotate-90" />
            </button>
            <button
              type="button"
              onClick={() => {
                const order: SupplyChainNode['id'][] = ['farm', 'trader', 'wholesaler', 'retail'];
                const curIdx = order.indexOf(activeNodeId);
                const nextIdx = (curIdx + 1) % order.length;
                onSelectNode(order[nextIdx]);
              }}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs cursor-pointer"
              title={t.lens.nextStage}
            >
              <Icon name="expand_more" size={16} className="-rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Stage Category Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((node) => {
          const isSelected = activeNodeId === node.id;
          const catPill = categoryPills[node.id] || {
            label: 'Stage',
            labelTamil: 'நிலை',
            badgeClass: 'bg-slate-100 text-slate-700',
          };
          const stageSub = stageSubheads[node.id] || { sub: '', subTamil: '' };

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              className={`bg-white rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between cursor-pointer min-w-0 ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-soft-card scale-[1.01]'
                  : 'border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-soft-card'
              }`}
            >
              <div>
                {/* Top Row: Icon Box & Category Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center border border-slate-200/60 shadow-xs shrink-0">
                    <Icon name={node.icon} size={22} className="text-slate-900" />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${catPill.badgeClass}`}
                  >
                    {isTa ? catPill.labelTamil : catPill.label}
                  </span>
                </div>

                {/* Node Title & Stage Subtitle */}
                <div className="mt-4 min-w-0">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug truncate">
                    {isTa ? node.titleTamil : node.title}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5 truncate">
                    {isTa ? stageSub.subTamil : stageSub.sub}
                  </span>
                </div>

                {/* Numeric Metric Price */}
                <div className="mt-3 flex items-baseline space-x-1">
                  <span className="font-mono text-2xl font-extrabold text-slate-900">
                    ₹{node.pricePerKg.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">{t.common.perKg}</span>
                </div>
              </div>

              {/* Card Footer: Delta Surplus Pill & Selected State Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs min-w-0">
                {node.delta ? (
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200/60 truncate">
                    +₹{node.delta.amount.toFixed(2)}{' '}
                    <span className="font-sans font-medium text-[10px] text-emerald-700 hidden sm:inline">
                      {isTa ? node.delta.labelTamil : node.delta.label}
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px] font-mono">{t.lens.farmgateBase}</span>
                )}

                <span
                  className={`text-xs font-bold transition-colors shrink-0 ml-1 ${
                    isSelected ? 'text-slate-900 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  {isSelected ? t.lens.activeBtn : t.lens.inspectBtn}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deconstructed Anatomy Drawer */}
      <NodeDetailDrawer
        node={activeNode}
        isHighlighted={isHighlighted}
        language={activeLanguage}
        onSelectStage={onSelectNode}
      />
    </section>
  );
};

export default CropChainVisualizer;
