'use client';

import React, { useState } from 'react';
import { DecisionOption, Language } from '@/types';
import { DecisionOptionCard } from './DecisionOptionCard';
import { Icon } from '@/components/ui/Icon';

export interface AutonomousDecisionCockpitProps {
  readonly options: readonly DecisionOption[];
  readonly fpoCalculatedNet: number;
  readonly onOpenQrModal: () => void;
  readonly language: Language;
}

export const AutonomousDecisionCockpit: React.FC<AutonomousDecisionCockpitProps> = ({
  options,
  fpoCalculatedNet,
  onOpenQrModal,
  language,
}) => {
  const isTa = language === 'ta';

  const [selectedLetter, setSelectedLetter] = useState<'A' | 'B' | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string>(() =>
    isTa
      ? 'வரைவு சேலம் FPO முனையத்தில் தானாக சேமிக்கப்பட்டது. எந்தவொரு ஒப்பந்தமும் செய்யப்படவில்லை.'
      : 'Draft snapshot autosaved to Salem FPO node. No binding commitment made.'
  );

  const handleSelect = (letter: 'A' | 'B') => {
    setSelectedLetter(letter);
    if (letter === 'A') {
      setStatusFeedback(
        isTa
          ? 'தேர்வு பதியப்பட்டது: உள்ளூர் வியாபாரி (K. ராமநாதன்). எடை சீட்டு தயாரிப்புக்கு தயார்.'
          : 'Choice recorded: Local Trader Path (K. Ramanathan). Ready for weighment slip generation.'
      );
    } else {
      setStatusFeedback(
        isTa
          ? 'தேர்வு பதியப்பட்டது: சேலம் FPO நேரடி மையம். போக்குவரத்து பாஸ் வரைவு உருவாக்கப்பட்டது.'
          : 'Choice recorded: Salem FPO Direct Dispatch. Transport gate pass draft generated.'
      );
    }
  };

  return (
    <section
      className="bg-white rounded-3xl border border-slate-100 shadow-soft-card p-6 md:p-8"
      id="you-decide"
    >
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="px-3.5 py-1 bg-slate-100 rounded-full text-xs font-bold tracking-widest uppercase text-slate-500 border border-slate-200/50">
          {isTa ? 'சுயாதீன முடிவெடுக்கும் மையம்' : 'Autonomous Decision Cockpit'}
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
          {isTa ? 'விவசாயி தீர்மானிக்கிறார்' : 'The Farmer Decides'}
        </h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {isTa
            ? 'தானியங்கி "வெற்றி" பரிந்துரைகள் இல்லை. இரு வழிகளிலும் தனித்தனி நன்மைகளும் சமரசங்களும் உள்ளன. முடிவெடுப்பது நீங்களே.'
            : 'No automated "winner" algorithms. Both paths possess legitimate logistical and relational merits. Review the verified evidence and confirm your operational route.'}
        </p>
      </div>

      {/* Two Neutral Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((option) => (
          <DecisionOptionCard
            key={option.letter}
            option={option}
            netAmount={option.letter === 'B' ? fpoCalculatedNet : option.baselineNet}
            isSelected={selectedLetter === option.letter}
            onSelect={() => handleSelect(option.letter)}
            language={language}
          />
        ))}
      </div>

      {/* Secondary Neutral Action Bar */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Icon name="history" className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{statusFeedback}</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() =>
              setStatusFeedback(
                isTa
                  ? 'வரைவு சேமிக்கப்பட்டது. வண்டியில் ஏற்றுவதற்கு முன் எப்போது வேண்டுமானாலும் மாற்றலாம்.'
                  : 'Lot preserved as draft. You can revisit anytime before loading.'
              )
            }
            className="px-5 py-2.5 rounded-full border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
          >
            {isTa ? 'வரைவாக சேமித்து பின் முடிவெடு' : 'Keep As Draft & Decide Later'}
          </button>
          <button
            type="button"
            onClick={onOpenQrModal}
            className="px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            <Icon name="qr_code" className="w-4 h-4 text-white" />
            <span>{isTa ? 'QR பாஸ்போர்ட் உருவாக்குக' : 'Generate Lot QR Passport'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default AutonomousDecisionCockpit;
