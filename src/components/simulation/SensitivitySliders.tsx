'use client';

import React from 'react';
import { DispatchChannel, Language } from '@/types';
import { Icon } from '@/components/ui/Icon';

export interface SensitivitySlidersProps {
  readonly transportCost: number;
  readonly wastagePercent: number;
  readonly batchQuantityKg: number;
  readonly holdingHours: number;
  readonly selectedChannel: DispatchChannel;
  readonly netOutcome: number;
  readonly netDifference: number;
  readonly isSurplus: boolean;
  readonly onTransportChange: (val: number) => void;
  readonly onWastageChange: (val: number) => void;
  readonly onQuantityChange: (val: number) => void;
  readonly onHoldingChange: (val: number) => void;
  readonly onChannelSelect: (channel: DispatchChannel) => void;
  readonly onResetDefaults?: () => void;
  readonly language?: Language;
}

export const SensitivitySliders: React.FC<SensitivitySlidersProps> = ({
  transportCost,
  wastagePercent,
  batchQuantityKg,
  holdingHours,
  selectedChannel,
  netOutcome,
  netDifference,
  isSurplus,
  onTransportChange,
  onWastageChange,
  onQuantityChange,
  onHoldingChange,
  onChannelSelect,
  onResetDefaults,
  language = 'en',
}) => {
  const isTa = language === 'ta';

  return (
    <div className="mt-8 p-5 md:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60">
      {/* Top Controls Bar: Channel Tabs & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/70">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-bold uppercase text-slate-400 mr-1 whitespace-nowrap">
            {isTa ? 'விற்பனை வழி:' : 'Target Channel:'}
          </span>
          <button
            type="button"
            onClick={() => onChannelSelect('fpo')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedChannel === 'fpo'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {isTa ? 'சேலம் FPO நேரடி (மாற்று 1)' : 'Salem FPO Direct (Alt 1)'}
          </button>
          <button
            type="button"
            onClick={() => onChannelSelect('trader')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedChannel === 'trader'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {isTa ? 'உள்ளூர் வியாபாரி (அடிப்படை)' : 'Local Trader (Baseline)'}
          </button>
          <button
            type="button"
            onClick={() => onChannelSelect('rythu')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedChannel === 'rythu'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {isTa ? 'உழவர் சந்தை (மாற்று 2)' : 'Rythu Bazaar (Alt 2)'}
          </button>
        </div>

        {onResetDefaults && (
          <button
            type="button"
            onClick={onResetDefaults}
            className="self-end sm:self-auto text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs"
          >
            <Icon name="restart_alt" className="w-3.5 h-3.5" />
            <span>{isTa ? 'மீட்டமைக்க' : 'Reset Defaults'}</span>
          </button>
        )}
      </div>

      {/* Sliders Grid: 4 Interactive Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Slider 1: Transport Cost adjustment */}
        <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <label
              className="font-bold text-slate-800 flex items-center gap-2"
              htmlFor="transportSlider"
            >
              <Icon name="route" className="w-4 h-4 text-emerald-600" />
              <span>{isTa ? 'சேலம் FPO போக்குவரத்து செலவு:' : 'FPO Transport Haulage Cost:'}</span>
            </label>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50 text-xs">
              ₹<span id="sliderValDisplay">{transportCost.toFixed(2)}</span>/{isTa ? 'கிலோ' : 'kg'}
            </span>
          </div>
          <input
            className="custom-slider w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            id="transportSlider"
            max="6.0"
            min="1.0"
            step="0.2"
            type="range"
            value={transportCost}
            onChange={(e) => onTransportChange(parseFloat(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{isTa ? '₹1.00 (கூட்டு வண்டி)' : '₹1.00 (Shared Cart)'}</span>
            <span>{isTa ? '₹3.50 (சொந்த வேன்)' : '₹3.50 (Own Van)'}</span>
            <span>{isTa ? '₹6.00 (அவசர தனி பயணம்)' : '₹6.00 (Urgent Single Trip)'}</span>
          </div>
        </div>

        {/* Slider 2: Wastage Variance */}
        <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <label
              className="font-bold text-slate-800 flex items-center gap-2"
              htmlFor="wastageSlider"
            >
              <Icon name="thermostat" className="w-4 h-4 text-emerald-600" />
              <span>{isTa ? 'போக்குவரத்து சேதாரம் & கழிவு ஆபத்து:' : 'Transit Wastage & Culling Risk:'}</span>
            </label>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50 text-xs">
              <span id="wastageValDisplay">{wastagePercent.toFixed(1)}</span>%
            </span>
          </div>
          <input
            className="custom-slider w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            id="wastageSlider"
            max="8.0"
            min="1.0"
            step="0.5"
            type="range"
            value={wastagePercent}
            onChange={(e) => onWastageChange(parseFloat(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{isTa ? '1.0% (இரவுப் போக்குவரத்து)' : '1.0% (Night run)'}</span>
            <span>{isTa ? '4.0% (சாதாரண பகல்)' : '4.0% (Standard day)'}</span>
            <span>{isTa ? '8.0% (அதிக வெப்பம் / மழை)' : '8.0% (High heat / rain)'}</span>
          </div>
        </div>

        {/* Slider 3: Batch Quantity (kg) */}
        <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <label
              className="font-bold text-slate-800 flex items-center gap-2"
              htmlFor="quantitySlider"
            >
              <Icon name="scale" className="w-4 h-4 text-emerald-600" />
              <span>{isTa ? 'தொகுதி சரக்கு அளவு:' : 'Batch Consignment Quantity:'}</span>
            </label>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-xs">
              {batchQuantityKg} {isTa ? 'கிலோ' : 'kg'}
            </span>
          </div>
          <input
            className="custom-slider w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            id="quantitySlider"
            max="2000"
            min="400"
            step="100"
            type="range"
            value={batchQuantityKg}
            onChange={(e) => onQuantityChange(parseInt(e.target.value, 10))}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{isTa ? '400 கிலோ (அரை வேன்)' : '400 kg (Half Van)'}</span>
            <span>{isTa ? '800 கிலோ (அடிப்படை தொகுதி)' : '800 kg (Baseline Lot)'}</span>
            <span>{isTa ? '2,000 கிலோ (கூட்டு உழவர் குழு)' : '2,000 kg (Multi-Farmer Pool)'}</span>
          </div>
        </div>

        {/* Slider 4: Holding / Delay Hours */}
        <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <label
              className="font-bold text-slate-800 flex items-center gap-2"
              htmlFor="holdingSlider"
            >
              <Icon name="schedule" className="w-4 h-4 text-emerald-600" />
              <span>{isTa ? 'அனுப்பும் முன் சேமிப்பு தாமதம்:' : 'Pre-Dispatch Holding Delay:'}</span>
            </label>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-xs">
              {holdingHours} {isTa ? 'மணிகள்' : 'hrs'} ({holdingHours === 0 ? (isTa ? 'புதியது' : 'Fresh') : `-${(holdingHours * 0.02).toFixed(1)}% ${isTa ? 'ஈரப்பதம்' : 'moisture'}`})
            </span>
          </div>
          <input
            className="custom-slider w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            id="holdingSlider"
            max="36"
            min="0"
            step="4"
            type="range"
            value={holdingHours}
            onChange={(e) => onHoldingChange(parseInt(e.target.value, 10))}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{isTa ? '0 மணி (உடனடி ஏற்றுதல்)' : '0h (Immediate loading)'}</span>
            <span>{isTa ? '16 மணி (இரவு சேமிப்பு)' : '16h (Overnight yard)'}</span>
            <span>{isTa ? '36 மணி (மண்டி விடுமுறை)' : '36h (Mandi holiday)'}</span>
          </div>
        </div>
      </div>

      {/* Calculated Net Outcome Box & Comparison Summary */}
      <div className="mt-5 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
            {isTa ? 'கணக்கிடப்பட்ட நிகர வரவு' : 'Calculated Net Realization'} ({selectedChannel.toUpperCase()})
          </span>
          <div className="flex items-baseline space-x-3 mt-1.5">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              ₹<span id="calculatedFpoTotal">{netOutcome.toLocaleString('en-IN')}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({batchQuantityKg} {isTa ? 'கிகி நிகர சரக்கு' : 'kg net consignment'})
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
            <span>{isTa ? 'அடிப்படை வியாபாரி நிகர வரவு: ' : 'Baseline Trader Net: '}<strong className="font-mono text-slate-700">₹13,600</strong></span>
            <span>•</span>
            <span>{isTa ? 'விலை: ' : 'Rate: '}₹{selectedChannel === 'fpo' ? '20.10' : selectedChannel === 'rythu' ? '22.50' : '18.20'}/{isTa ? 'கிலோ' : 'kg'}</span>
          </div>
        </div>

        <div className="text-left md:text-right">
          <span
            id="netDifferenceBadge"
            className={`inline-block px-4 py-2 rounded-full text-xs font-mono font-bold transition-all shadow-xs ${
              isSurplus
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            {isSurplus
              ? (isTa ? `+₹${netDifference.toLocaleString('en-IN')} சாத்திய உபரி வரவு` : `+₹${netDifference.toLocaleString('en-IN')} Net Potential Surplus`)
              : (isTa ? `-₹${Math.abs(netDifference).toLocaleString('en-IN')} அடிப்படை விட பற்றாக்குறை` : `-₹${Math.abs(netDifference).toLocaleString('en-IN')} Net Deficit vs Baseline`)}
          </span>
          <span className="text-xs text-slate-400 block mt-1.5 font-medium">
            {isSurplus ? (isTa ? 'நேரடி அனுப்புதல் அதிக லாபம் தரும்' : 'Direct dispatch yields higher return') : (isTa ? 'அடிப்படை வியாபாரி சிறந்த லாப வரம்பு வழங்குகிறார்' : 'Baseline trader offers superior margin')}
          </span>
        </div>
      </div>

      {/* Strict Non-Coercive Trade-Off Disclosure Banner */}
      <div className="mt-5 pt-4 border-t border-slate-200/70 flex items-start space-x-3 text-xs text-slate-700">
        <Icon name="balance" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold text-slate-900">
            {isTa ? 'வெளிப்படையான சமரசக் குறிப்பு:' : 'Explicit Trade-Off Context:'}
          </strong>{' '}
          {selectedChannel === 'fpo' ? (
            isTa ? (
              <>
                மாற்று 1 ₹{transportCost.toFixed(2)}/கிலோ சரக்குக் கட்டணத்தில் மதிப்பிடப்பட்ட{' '}
                <strong>{isSurplus ? `+₹${netDifference.toLocaleString('en-IN')} உபரி` : `-₹${Math.abs(netDifference).toLocaleString('en-IN')} பற்றாக்குறை`}</strong> அளிக்கிறது; ஆனால் <strong>7 நாட்கள் தாமதமான வங்கிப் பணப்பரிவர்த்தனை சுழற்சி</strong>, சேலத்திற்கு 18 கிமீ நீங்களே கொண்டு செல்லுதல் மற்றும் 1,000 கிலோ அளவை எட்ட <strong>அண்டை விவசாயியுடன் 200 கிலோ கூட்டு சேர்த்தல்</strong> கட்டாயமாகும்.
              </>
            ) : (
              <>
                Alternative 1 yields an estimated{' '}
                <strong>{isSurplus ? `+₹${netDifference.toLocaleString('en-IN')} surplus` : `-₹${Math.abs(netDifference).toLocaleString('en-IN')} deficit`}</strong> at ₹{transportCost.toFixed(2)}/kg freight,
                but introduces a <strong>7-day deferred bank payment cycle</strong>, requires transporting
                produce yourself 18 km to Salem, and mandates pooling{' '}
                <strong>200 kg with an adjacent producer</strong> to satisfy the 1,000 kg batch threshold.
              </>
            )
          ) : selectedChannel === 'rythu' ? (
            isTa ? (
              <>
                மாற்று 2 உடனடி ரொக்கமும் அதிக மொத்த விலையும் (₹22.50/கிலோ) அளிக்கிறது; ஆனால் கடுமையான <strong>300 கிலோ தினசரி வரம்பு</strong>, 5.5% போக்குவரத்து இழப்பு ஆபத்து மற்றும் தினசரி ஆட்டோ வாடகை (₹4.10/கிலோ) தேவைப்படுகிறது.
              </>
            ) : (
              <>
                Alternative 2 offers spot cash and highest gross rate (₹22.50/kg), but has a <strong>strict 300 kg daily quota limit</strong>, 5.5% exposed transit wastage risk, and requires renting daily passenger auto (₹4.10/kg).
              </>
            )
          ) : (
            isTa ? (
              <>
                அடிப்படை உள்ளூர் வியாபாரி <strong>உடனடி 48-மணி நேர ரொக்கமும்</strong> இலவச களஞ்சிய எடுப்பும் வழங்குகிறார்; ஆனால் குறைவான மொத்த வரவும் (₹18.20/கிலோ) மற்றும் ₹0.50/கிலோ கணக்கில் வராத இடைத்தரகர் விநியோக வித்தியாசமும் கொண்டது.
              </>
            ) : (
              <>
                Baseline Local Trader offers <strong>instant 48-hour spot cash</strong> and free packhouse pickup, but captures lower gross realization (₹18.20/kg) with ₹0.50/kg unrecorded spread variance.
              </>
            )
          )}
        </p>
      </div>
    </div>
  );
};

export default SensitivitySliders;
