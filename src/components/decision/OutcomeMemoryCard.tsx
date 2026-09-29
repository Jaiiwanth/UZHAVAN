'use client';

import React, { useState } from 'react';
import { Language } from '@/types';
import { Icon } from '@/components/ui/Icon';

export interface OutcomeMemoryCardProps {
  readonly language: Language;
}

interface HistoricalLot {
  readonly lotId: string;
  readonly date: string;
  readonly produce: string;
  readonly quantityKg: number;
  readonly chosenRoute: 'FPO Direct' | 'Local Trader';
  readonly netRealization: number;
  readonly varianceVsEstimate: string;
  readonly settlementTime: string;
  readonly farmerNote: string;
  readonly farmerNoteTamil: string;
}

const HISTORICAL_LOTS: readonly HistoricalLot[] = [
  {
    lotId: 'LOT-2026-TN-00118',
    date: 'Aug 24, 2026',
    produce: 'Tomato (Namdhari)',
    quantityKg: 1200,
    chosenRoute: 'FPO Direct',
    netRealization: 23800,
    varianceVsEstimate: '+₹1,400 surplus vs trader',
    settlementTime: 'Bank NEFT credited in 6 days',
    farmerNote: 'FPO electronic weighbridge was accurate to the gram. The 6-day payment wait was manageable because I had planned diesel expenses ahead.',
    farmerNoteTamil: 'FPO எலக்ட்ரானிக் எடை மிகச் சரியாக இருந்தது. 6 நாள் காத்திருப்பு இருந்தபோதும் ₹1,400 கூடுதல் லாபம் டீசல் செலவை ஈடுசெய்தது.',
  },
  {
    lotId: 'LOT-2026-TN-00109',
    date: 'Jul 30, 2026',
    produce: 'Tomato (Shivam)',
    quantityKg: 650,
    chosenRoute: 'Local Trader',
    netRealization: 10400,
    varianceVsEstimate: 'Prompt farmgate cash',
    settlementTime: '100% Cash in 24 hours',
    farmerNote: 'Needed immediate wages for weeders next morning. Ramanathan brought cash at farmgate before sundown with zero transport hassle.',
    farmerNoteTamil: 'மறுநாள் களையெடுக்கும் கூலிக்கு உடனடி பணம் தேவைப்பட்டது. ராமநாதன் சூரியன் மறைவதற்குள் பண்ணைக்கே பணத்தை நேரில் தந்தார்.',
  },
  {
    lotId: 'LOT-2026-TN-00094',
    date: 'Jun 18, 2026',
    produce: 'Tomato (Hybrid)',
    quantityKg: 900,
    chosenRoute: 'FPO Direct',
    netRealization: 18900,
    varianceVsEstimate: '+₹950 surplus',
    settlementTime: 'Bank NEFT in 7 days',
    farmerNote: 'Pooled crates with neighbor Murugesan to satisfy the mini-van load threshold. Worth the coordination effort.',
    farmerNoteTamil: 'அண்டை விவசாயி முருகேசனுடன் வாகனத்தைப் பகிர்ந்துகொண்டு மினி வேனில் அனுப்பினோம். கூட்டு முயற்சி பலனளித்தது.',
  },
  {
    lotId: 'LOT-2026-TN-00078',
    date: 'May 12, 2026',
    produce: 'Tomato (Country/Nattu)',
    quantityKg: 500,
    chosenRoute: 'Local Trader',
    netRealization: 8200,
    varianceVsEstimate: 'Full lot accepted',
    settlementTime: 'Instant spot settlement',
    farmerNote: 'Pre-monsoon shower softened the crop; trader accepted all crates without severe distress discount.',
    farmerNoteTamil: 'மழை பெய்ததால் தக்காளி மென்மையாகியது; வியாபாரி அதிக தள்ளுபடி இன்றி முழு தொகுதியையும் ஏற்றுக்கொண்டார்.',
  },
];

export const OutcomeMemoryCard: React.FC<OutcomeMemoryCardProps> = ({ language }) => {
  const [filter, setFilter] = useState<'ALL' | 'FPO Direct' | 'Local Trader'>('ALL');
  const [expandedLotId, setExpandedLotId] = useState<string | null>(null);

  const isTa = language === 'ta';

  const filteredLots = HISTORICAL_LOTS.filter((lot) => {
    if (filter === 'ALL') return true;
    return lot.chosenRoute === filter;
  });

  return (
    <section
      className="bg-white rounded-3xl border border-slate-100 shadow-soft-card p-6 md:p-8"
      id="outcome-memory"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-950 text-xs rounded-full font-bold uppercase tracking-wider">
              {isTa ? 'வரலாற்று முடிவு நினைவகம்' : 'Outcome Memory'}
            </span>
            <span className="text-xs font-semibold text-slate-400">• {isTa ? 'கடந்தகால நுண்ணறிவு' : 'Retrospective Intelligence'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            {isTa ? 'முந்தைய விற்பனை முடிவுகள் & அனுபவப் பதிவுகள்' : 'Past Lot Decisions & Realized Outcomes'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isTa ? 'கடந்த கால முடிவுகளின் உண்மையான வரவு மற்றும் அனுபவக் குறிப்புகள். எதிர்கால முடிவுகளுக்கு வழிகாட்டுகிறது.' : 'Audited retrospective record of prior lots. What was projected vs what actually materialized.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100/80 p-1 rounded-full border border-slate-200/50 self-start md:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isTa ? 'அனைத்தும் (4)' : 'All Lots (4)'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('FPO Direct')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'FPO Direct'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isTa ? 'FPO நேரடி (2)' : 'FPO Direct (2)'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('Local Trader')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'Local Trader'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isTa ? 'உள்ளூர் வியாபாரி (2)' : 'Local Trader (2)'}
          </button>
        </div>
      </div>

      {/* Historical Lots Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLots.map((lot) => {
          const isFpo = lot.chosenRoute === 'FPO Direct';
          const isExpanded = expandedLotId === lot.lotId;

          const translatedRoute = isTa
            ? isFpo ? 'FPO நேரடி' : 'உள்ளூர் வியாபாரி'
            : lot.chosenRoute;

          const translatedVariance = isTa
            ? lot.varianceVsEstimate.includes('+₹1,400') ? '+₹1,400 வியாபாரியை விட உபரி'
            : lot.varianceVsEstimate.includes('Prompt') ? 'பண்ணை வாசலில் உடனடி ரொக்கம்'
            : lot.varianceVsEstimate.includes('+₹950') ? '+₹950 உபரி'
            : 'முழு தொகுதியும் ஏற்கப்பட்டது'
            : lot.varianceVsEstimate;

          const translatedSettlement = isTa
            ? lot.settlementTime.includes('6 days') ? '6 நாட்களில் வங்கி NEFT வரவு'
            : lot.settlementTime.includes('24 hours') ? '24 மணி நேரத்தில் 100% ரொக்கம்'
            : lot.settlementTime.includes('7 days') ? '7 நாட்களில் வங்கி NEFT'
            : 'உடனடி ரொக்கப் பட்டுவாடா'
            : lot.settlementTime;

          return (
            <div
              key={lot.lotId}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isExpanded
                  ? 'border-slate-900 ring-2 ring-slate-900/10 bg-white shadow-soft-card'
                  : 'border-slate-200/70 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
              }`}
              onClick={() => setExpandedLotId(isExpanded ? null : lot.lotId)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {lot.lotId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isFpo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {translatedRoute}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">
                    {lot.date} • {lot.produce} ({lot.quantityKg} {isTa ? 'கிலோ' : 'kg'})
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-base text-slate-900 block">
                    ₹{lot.netRealization.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`text-[11px] font-medium block mt-0.5 ${
                      isFpo ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {translatedVariance}
                  </span>
                </div>
              </div>

              {/* Settlement Detail */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Icon name="schedule" className="w-4 h-4 text-slate-400" />
                  {translatedSettlement}
                </span>
                <span className="text-slate-800 text-xs font-bold flex items-center gap-0.5">
                  <span>{isExpanded ? (isTa ? 'மறை' : 'Hide Note') : (isTa ? 'அனுபவக் குறிப்பு' : 'Farmer Note')}</span>
                  <Icon name={isExpanded ? 'expand_less' : 'expand_more'} className="w-4 h-4" />
                </span>
              </div>

              {/* Expanded Farmer Retrospective Note */}
              {isExpanded && (
                <div className="mt-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                    <Icon name="edit_note" className="w-4 h-4 text-amber-600" />
                    <span>{isTa ? 'விவசாயியின் அனுபவப் பதிவு:' : 'Farmer Retrospective Note:'}</span>
                  </div>
                  <p className="italic text-xs leading-relaxed text-slate-600">
                    &ldquo;{isTa ? lot.farmerNoteTamil : lot.farmerNote}&rdquo;
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OutcomeMemoryCard;
