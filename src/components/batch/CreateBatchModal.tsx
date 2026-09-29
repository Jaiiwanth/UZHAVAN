'use client';

import React, { useState } from 'react';
import { localService, DbCropBatch } from '@/lib/service';
import { Language } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'next/navigation';

export interface CreateBatchModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onBatchCreated?: (batch: DbCropBatch) => void;
  readonly language?: Language;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  onBatchCreated,
  language = 'en',
}) => {
  const router = useRouter();
  const [cropName, setCropName] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [variety, setVariety] = useState('');
  const [grade, setGrade] = useState('Grade A');
  const [farmLocation, setFarmLocation] = useState('Salem Agro Cluster');
  const [harvestDate, setHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [initialNote, setInitialNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isTa = language === 'ta';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const qty = parseFloat(quantityKg);
    if (!cropName.trim()) {
      setErrorMessage(isTa ? 'பயிர் / விளைபொருள் பெயர் தேவை' : 'Produce / Crop name is required.');
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      setErrorMessage(isTa ? 'சரியான அளவை (கிலோ) உள்ளிடவும்' : 'Please enter a valid positive quantity in kg.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await localService.createBatch({
        cropName: cropName.trim(),
        quantityKg: qty,
        variety: variety.trim() || undefined,
        grade,
        harvestDate,
        farmLocation: farmLocation.trim() || undefined,
        initialNote: initialNote.trim() || undefined,
      });

      if (res.error || !res.batch) {
        setErrorMessage(res.error || (isTa ? 'தொகுதியை உருவாக்க முடியவில்லை.' : 'Failed to create crop batch.'));
        return;
      }

      if (onBatchCreated) {
        onBatchCreated(res.batch);
      }

      onClose();
      // Navigate to batch dashboard
      router.push(`/batch/${res.batch.batch_id}`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error creating batch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="createBatchTitle"
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-950 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <Icon name="plus" size={18} className="text-amber-800" />
            </span>
            <div>
              <h3 id="createBatchTitle" className="text-xl font-extrabold text-slate-900 tracking-tight">
                {isTa ? 'புதிய பயிர் தொகுதி' : 'Create New Batch'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isTa ? 'நேரடி சேமிப்பு → தொகுதி எண் உருவாக்கம் → பணித்தளம்' : 'PostgreSQL Record → Auto Batch ID → Batch Dashboard'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
            <Icon name="warning" size={16} className="text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Primary Field 1: Produce / Fruit / Vegetable */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              {isTa ? 'விளைபொருள் / பழம் / காய்கறி' : 'Produce / Fruit / Vegetable'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder={isTa ? 'எ.கா. தக்காளி, வெங்காயம், வாழை, மாம்பழம்...' : 'Enter name (e.g. Tomato, Onion, Banana...)'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Primary Field 2: Quantity in kg */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              {isTa ? 'அளவு (கிலோ)' : 'Quantity'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                step="any"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                placeholder={isTa ? 'எடையை உள்ளிடவும் (கிலோ)' : 'Enter kg (e.g. 800)'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono font-bold placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 pr-12"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-slate-500">
                {isTa ? 'கிலோ' : 'kg'}
              </span>
            </div>
          </div>

          {/* Optional Toggle for Additional Details */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Icon name={showAdvanced ? 'expand_less' : 'expand_more'} size={16} />
              <span>{showAdvanced ? (isTa ? 'கூடுதல் விவரங்களை மறைக்க' : 'Hide Optional Details') : (isTa ? '+ கூடுதல் விவரங்கள் (வகை, தரம், அமைவிடம்)' : '+ Optional Details (Variety, Grade, Location)')}</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    {isTa ? 'விதை வகை / வீரிய ரகம்' : 'Variety / Hybrid'}
                  </label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder={isTa ? 'எ.கா. நாம்தாரி சிவம்' : 'e.g. Namdhari Shivam'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    {isTa ? 'தர நிலை' : 'Quality Grade'}
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                  >
                    <option value="Grade A">{isTa ? 'Grade A (உயர்தரம்)' : 'Grade A (Premium)'}</option>
                    <option value="Grade B">{isTa ? 'Grade B (சாதாரண மண்டி)' : 'Grade B (Standard)'}</option>
                    <option value="Grade C">{isTa ? 'Grade C (பதப்படுத்துதல்)' : 'Grade C (Processing)'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    {isTa ? 'பண்ணை அமைவிடம்' : 'Farm Location'}
                  </label>
                  <input
                    type="text"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    placeholder="Salem Agro Cluster"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    {isTa ? 'அறுவடை தேதி' : 'Harvest Date'}
                  </label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  {isTa ? 'ஆரம்ப குறிப்பு (விருப்பத்தேர்வு)' : 'Field Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  placeholder={isTa ? 'விளைபொருள் தரம் அல்லது பேக்கிங் பற்றிய குறிப்பு...' : 'Quality or packing notes...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              {isTa ? 'ரத்து செய்க' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-soft-card flex items-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              <Icon name="check" size={16} className="text-amber-400" />
              <span>
                {isSubmitting
                  ? (isTa ? 'பதிவாகிறது...' : 'Saving to Database...')
                  : (isTa ? 'தொகுதியை உருவாக்கு' : 'Create Batch')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBatchModal;
