'use client';

import React from 'react';
import { Language } from '@/types';
import { Icon } from '@/components/ui/Icon';

export interface AnomalyAlertCardProps {
  readonly onVerifyClick?: () => void;
  readonly language?: Language;
}

export const AnomalyAlertCard: React.FC<AnomalyAlertCardProps> = ({
  onVerifyClick,
  language = 'en',
}) => {
  const isTa = language === 'ta';

  return (
    <section className="bg-amber-50/70 rounded-3xl border border-amber-200/80 p-6 md:p-7 shadow-xs">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/60 shadow-xs">
          <Icon name="warning" className="w-6 h-6 text-amber-800" />
        </div>
        <div className="flex-grow space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2.5 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-900">
                {isTa
                  ? 'அருகிலுள்ள சந்தையில் அசாதாரண பரிவர்த்தனை கண்டறியப்பட்டது'
                  : 'Unusual Transaction Pattern Flagged in Adjacent Dataset'}
              </h3>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-200 text-amber-950 border border-amber-300/50">
                Audit Flag #TN-DHP-08
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {isTa ? '14 நிமிடங்களுக்கு முன் கண்டறியப்பட்டது' : 'Detected: 14 mins ago'}
            </span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed">
            {isTa ? (
              <>
                ஓமலூர் துணை மண்டியில் <strong className="font-mono text-red-600 font-bold">₹11.00/kg</strong> விலை பதிவாகியுள்ளது. சேலம் மண்டல தரநிலை விலை வரம்பு <strong className="font-mono text-slate-900 font-bold">₹20.00 – ₹24.00/kg</strong> ஆகும்.
              </>
            ) : (
              <>
                Recorded price of <strong className="font-mono text-red-600 font-bold">₹11.00/kg</strong> flagged at Omallur sub-mandi (Adjacent Taluk). The prevailing Salem regional benchmark band is{' '}
                <strong className="font-mono text-slate-900 font-bold">₹20.00 – ₹24.00/kg</strong>.
              </>
            )}
          </p>
          <div className="bg-white/90 p-4 rounded-2xl border border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Icon name="check_box" className="w-4 h-4 text-slate-400" />
              <span>{isTa ? 'Grade C அவசர விற்பனை வாய்ப்பு' : 'Possible Grade C distress lot'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check_box" className="w-4 h-4 text-slate-400" />
              <span>{isTa ? 'மழை ஈரப்பதம் அழுகல் அறிக்கை' : 'Post-rain moisture rot reported'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check_box" className="w-4 h-4 text-slate-400" />
              <span>{isTa ? 'மண்டி எழுத்தர் தட்டச்சு பிழை' : 'APMC data-entry clerical typo'}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800">
              <Icon name="call" className="w-4 h-4 text-emerald-700" />
              <button
                type="button"
                onClick={onVerifyClick}
                className="underline font-bold hover:text-emerald-950 transition-colors cursor-pointer text-left"
              >
                {isTa ? 'ஓமலூர் மண்டி பிரதிநிதியை தொடர்பு கொள்' : 'Verify with Omallur Mandi Rep'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnomalyAlertCard;
