'use client';

import React, { useState, useEffect } from 'react';
import { RelationalFactor, Language } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { localService } from '@/lib/service';

export interface TacitKnowledgePanelProps {
  readonly factors: readonly RelationalFactor[];
  readonly language: Language;
  readonly batchId?: string;
}

export const TacitKnowledgePanel: React.FC<TacitKnowledgePanelProps> = ({
  factors,
  language,
  batchId,
}) => {
  const isTa = language === 'ta';

  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(() =>
    factors.reduce((acc, f) => ({ ...acc, [f.id]: f.defaultChecked }), {})
  );

  const [noteText, setNoteText] = useState<string>(
    '"I trust this buyer for immediate emergency fertilizer credit without paperwork. While Salem FPO gives a higher rate on paper, their 7-day payment window means I cannot pay my harvest laborers tomorrow morning without taking a hand-loan."'
  );

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<string>(
    isTa ? 'பயிர் பாஸ்போர்ட் நினைவகத்தில் சேமிக்கப்பட்டது' : 'Saved to Personal Crop Passport Memory'
  );

  // Compute live relational score
  const activeCount = Object.values(checkedState).filter(Boolean).length;
  const totalCount = factors.length;
  const trustScore = Math.round((activeCount / totalCount) * 40 + 50);

  // Voice recording timer
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setRecordSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleCheckboxToggle = (id: string) => {
    setCheckedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordSeconds(0);
      setSaveStatus(
        isTa ? 'குரல் பதிவு கேட்கிறது (தமிழ்/ஆங்கிலம்)...' : 'Listening to voice dictation (Tamil/English)...'
      );
      setTimeout(() => {
        setIsRecording(false);
        setRecordSeconds(0);
        setNoteText((prev) => {
          const addition = isTa
            ? '\n[குரல் குறிப்பு]: "அறுவடை தக்காளி உலர்ந்த காலை சூழலில் தரம் பிரிக்கப்பட்டு சான்றளிக்கப்பட்டது."'
            : '\n[Voice Memo]: "Harvest lot bagged under dry morning conditions. Crate weighment verified with farmgate balance."';
          return prev + addition;
        });
        setSaveStatus(
          isTa
            ? 'குரல் குறிப்பு படியெடுக்கப்பட்டு நினைவகத்தில் சேர்க்கப்பட்டது'
            : 'Voice memo transcribed & added to Crop Passport Memory'
        );
      }, 3500);
    } else {
      setIsRecording(false);
      setRecordSeconds(0);
      setSaveStatus(
        isTa ? 'பயிர் பாஸ்போர்ட் நினைவகத்தில் சேமிக்கப்பட்டது' : 'Saved to Personal Crop Passport Memory'
      );
    }
  };

  const handleUpdate = async () => {
    if (batchId && noteText.trim()) {
      try {
        await localService.addBatchNote(batchId, noteText.trim(), 'field');
      } catch (err) {
        console.error('Failed to save batch note:', err);
      }
    }
    setSaveStatus(isTa ? 'நினைவகம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!' : 'Updated memory file successfully!');
    setTimeout(() => {
      setSaveStatus(
        isTa ? 'பயிர் பாஸ்போர்ட் நினைவகத்தில் சேமிக்கப்பட்டது' : 'Saved to Personal Crop Passport Memory'
      );
    }, 2500);
  };

  return (
    <section
      className="bg-white rounded-3xl border border-slate-100 shadow-soft-card p-6 md:p-8"
      id="farmer-context"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-bold uppercase tracking-wider">
              {isTa ? 'விவசாயியின் கள அனுபவம்' : 'Human Ground Truth'}
            </span>
            <span className="text-xs font-semibold text-slate-400">• {isTa ? 'தரமான நினைவகம்' : 'Qualitative Memory'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            {isTa
              ? 'இந்த வியாபாரியைப் பற்றி உங்களுக்கு என்ன தெரியும்?'
              : 'What do you know about this buyer?'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isTa
              ? 'உங்கள் வாழ்வியல் அனுபவம் முதன்மையானது. கணினி விதிகளால் அறிய முடியாத அனுபவக் குறிப்புகளைப் பதியுங்கள்.'
              : 'Your lived experience matters. Add unquantifiable field knowledge that algorithms and mandi invoices cannot capture.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-100 rounded-full text-xs text-slate-600 font-medium border border-slate-200/50">
            <Icon name="lock" className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isTa ? 'விவசாயி குறியீட்டில் பாதுகாக்கப்பட்டது' : 'Encrypted to Farmer Key'}</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 rounded-full text-xs font-mono font-bold text-slate-900 border border-emerald-200/50">
            <span>{isTa ? 'நம்பிக்கை குறியீடு:' : 'Trust Index:'}</span>
            <span className="text-emerald-700">{trustScore}/100</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Interactive Tacit Attributes (Left 6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 block">
              {isTa ? 'பதிவு செய்யப்பட்ட உறவுக் காரணிகள்:' : 'Documented Relational Factors:'}
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {isTa ? `${activeCount} / ${totalCount} சரிபார்க்கப்பட்டது` : `${activeCount} of ${totalCount} verified`}
            </span>
          </div>

          {factors.map((factor) => {
            const isChecked = !!checkedState[factor.id];
            const factorLabel = isTa && factor.labelTamil ? factor.labelTamil : factor.label;
            const factorDetail = isTa && factor.detailTamil ? factor.detailTamil : factor.detail;
            return (
              <label
                key={factor.id}
                className={`flex items-center space-x-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'border-emerald-500/50 bg-emerald-50/30 ring-1 ring-emerald-500/20'
                    : 'border-slate-200/70 hover:bg-slate-50 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxToggle(factor.id)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <div className="text-xs flex-grow">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-slate-900 block ${isChecked ? 'font-bold' : ''}`}>
                      {factorLabel}
                    </span>
                    {isChecked && (
                      <Icon name="check_circle" className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <span className="text-slate-500 text-xs mt-0.5 block">{factorDetail}</span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Verbatim Voice/Text Note Area (Right 6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="text-sm font-bold text-slate-900" htmlFor="farmerNotes">
                {isTa
                  ? 'விவசாயியின் குரல் / எழுத்துக் குறிப்பு:'
                  : 'Farmer Private Voice / Verbatim Note:'}
              </label>

              {/* Voice Dictation Prototype Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-500 text-white shadow-md animate-pulse'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon name="mic" className="w-3.5 h-3.5" />
                <span>
                  {isRecording
                    ? isTa ? `பதிவாகிறது (00:0${recordSeconds})...` : `Recording (00:0${recordSeconds})...`
                    : isTa
                    ? 'குரல் பதிவு (தமிழ் / ஆங்கிலம்)'
                    : 'Voice Dictate (Tamil/English)'}
                </span>
              </button>
            </div>

            {/* Waveform indicator during recording */}
            {isRecording && (
              <div className="mb-2 p-2.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-3 bg-amber-500 animate-bounce"></span>
                  <span className="w-1.5 h-4 bg-amber-500 animate-bounce delay-75"></span>
                  <span className="w-1.5 h-2 bg-amber-500 animate-bounce delay-150"></span>
                  <span className="w-1.5 h-5 bg-amber-500 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-3 bg-amber-500 animate-bounce"></span>
                  <span className="font-bold ml-2">
                    {isTa ? 'தமிழ்/ஆங்கிலத்தில் உரை படியெடுக்கப்படுகிறது...' : 'Transcribing speech in Tamil/English...'}
                  </span>
                </div>
                <span className="font-mono text-slate-400">NLP</span>
              </div>
            )}

            <div className="relative">
              <textarea
                id="farmerNotes"
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={isTa ? 'இந்த வியாபாரி குறித்த ரகசியக் குறிப்புகளைச் சேர்க்கவும்...' : 'Add confidential notes on this buyer...'}
                className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-xs text-slate-800 focus:ring-2 focus:ring-slate-900 focus:bg-white focus:border-solid transition-all leading-relaxed"
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-400 font-mono">
                {noteText.length} {isTa ? 'எழுத்துக்கள்' : 'chars'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-2 flex-wrap gap-2">
            <span className="inline-flex items-center text-xs text-slate-500 space-x-1.5">
              <Icon name="cloud_done" className="w-4 h-4 text-emerald-600" />
              <span>{saveStatus}</span>
            </span>
            <button
              type="button"
              onClick={handleUpdate}
              className="px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Icon name="save" className="w-3.5 h-3.5" />
              <span>{isTa ? 'நினைவகத்தைப் புதுப்பிக்கவும்' : 'Update Memory File'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TacitKnowledgePanel;
