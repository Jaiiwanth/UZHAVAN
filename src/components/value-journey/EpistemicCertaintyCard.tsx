'use client';

import React, { useState } from 'react';
import { EpistemicAuditSection, Language } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { useLanguage } from '@/hooks/useLanguage';

export interface EpistemicCertaintyCardProps {
  readonly auditSections: readonly EpistemicAuditSection[];
  readonly language?: Language;
}

type FilterType = 'ALL' | 'VERIFIED' | 'ESTIMATED' | 'UNCERTAINTY';

export const EpistemicCertaintyCard: React.FC<EpistemicCertaintyCardProps> = ({
  auditSections,
  language: propLanguage,
}) => {
  const { lang, t } = useLanguage();
  const activeLanguage = propLanguage || lang;
  const isTa = activeLanguage === 'ta';

  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [selectedItemIndex, setSelectedItemIndex] = useState<string | null>(null);

  const filterTabs: Array<{ id: FilterType; label: string }> = [
    { id: 'ALL', label: t.journey.epistemic.tabAll },
    { id: 'VERIFIED', label: t.journey.epistemic.tabDoc },
    { id: 'ESTIMATED', label: t.journey.epistemic.tabEst },
    { id: 'UNCERTAINTY', label: t.journey.epistemic.tabUnk },
  ];

  const getSectionType = (idx: number): 'VERIFIED' | 'ESTIMATED' | 'UNCERTAINTY' => {
    if (idx === 0) return 'VERIFIED';
    if (idx === 1) return 'ESTIMATED';
    return 'UNCERTAINTY';
  };

  const filteredSections = auditSections.filter((_, idx) => {
    if (activeFilter === 'ALL') return true;
    return getSectionType(idx) === activeFilter;
  });

  return (
    <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-soft-card p-6 md:p-7 flex flex-col transition-all overflow-hidden">
      <div className="pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t.journey.epistemic.badge}
          </span>
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/50 shrink-0">
            {t.journey.epistemic.auditLevel}
          </span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mt-1">
          {t.journey.epistemic.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {t.journey.epistemic.subtitle}
        </p>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 mt-3.5 bg-slate-100/80 p-1 rounded-full border border-slate-200/40 overflow-x-auto max-w-full">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3.5 flex-grow">
        {filteredSections.map((section, sIdx) => {
          const sectionTitle = isTa && section.titleTamil ? section.titleTamil : section.title;

          return (
            <div
              key={section.type}
              className={`p-4 rounded-2xl border transition-all ${section.containerClass}`}
            >
              <div className={`flex items-center space-x-2 font-bold text-sm ${section.headerClass}`}>
                <Icon name={section.icon} size={18} />
                <span>{sectionTitle}</span>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs text-slate-800">
                {section.items.map((item, idx) => {
                  const itemKey = `${section.type}-${idx}`;
                  const isSelected = selectedItemIndex === itemKey;
                  const itemText = isTa && section.itemsTamil && section.itemsTamil[idx] ? section.itemsTamil[idx] : item;

                  return (
                    <li
                      key={idx}
                      onClick={() => setSelectedItemIndex(isSelected ? null : itemKey)}
                      className={`flex flex-col p-2 rounded-xl transition-all cursor-pointer ${
                        isSelected ? 'bg-white ring-1 ring-slate-300 shadow-xs' : 'hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={section.bulletColor}>•</span>
                        <span className={`break-words ${isSelected ? 'font-bold text-slate-900' : 'font-medium'}`}>{itemText}</span>
                        <Icon
                          name={isSelected ? 'expand_less' : 'expand_more'}
                          size={16}
                          className="text-slate-400 ml-auto shrink-0"
                        />
                      </div>

                      {isSelected && (
                        <div className="mt-2 pl-3 border-l-2 border-emerald-500 text-[11px] text-slate-600 animate-in fade-in duration-150 leading-relaxed">
                          {sIdx === 0 && (
                            <span>
                              <strong>{t.journey.epistemic.cryptoVerify}</strong> {t.journey.epistemic.cryptoVerifyText}
                            </span>
                          )}
                          {sIdx === 1 && (
                            <span>
                              <strong>{t.journey.epistemic.algoEst}</strong> {t.journey.epistemic.algoEstText}
                            </span>
                          )}
                          {sIdx >= 2 && (
                            <span>
                              <strong>{t.journey.epistemic.uncertaintyNote}</strong> {t.journey.epistemic.uncertaintyNoteText}
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpistemicCertaintyCard;
