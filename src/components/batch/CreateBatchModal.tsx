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
      setErrorMessage(isTa ? 'பயிர் பெயர் தேவை' : 'Produce / Crop name is required.');
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
        setErrorMessage(res.error || 'Failed to create crop batch.');
        return;
      }

      if (onBatchCreated) {
        onBatchCreated(res.batch);
      }

      onClose();
      router.push(`/batch/${res.batch.batch_id}`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error creating batch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="createBatchTitle"
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-950 flex items-center justify-center border border-amber-200/50">
              <Icon name="plus" size={18} />
            </span>
            <h3 id="createBatchTitle" className="text-xl font-extrabold text-slate-900">
              {isTa ? 'புதிய பயிர் தொகுதியை உருவாக்குக' : 'Register New Crop Batch'}
            </h3>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
            <Icon name="warning" size={16} className="text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Required: Crop Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isTa ? 'பயிர் / விளைபொருள் பெயர்' : 'Crop / Produce Name'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder={isTa ? 'எ.கா. தக்காளி, வெங்காயம், வாழை, கத்தரி, மாம்பழம்...' : 'e.g. Tomato, Onion, Banana, Brinjal, Mango...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              {isTa ? 'எந்தவொரு காய் அல்லது பழப் பெயரையும் உள்ளிடலாம்.' : 'Enter any fruit, vegetable, or grain produce name.'}
            </span>
          </div>

          {/* Required: Quantity (kg) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isTa ? 'தொகுதியின் அளவு (கிலோ)' : 'Consignment Quantity (kg)'}{' '}
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
                  placeholder="e.g. 800"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-mono font-bold"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                  {isTa ? 'கிலோ' : 'kg'}
                </span>
              </div>
            </div>

            {/* Optional: Grade Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isTa ? 'தர நிலை' : 'Quality Grade'}
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
              >
                <option value="Grade A">{isTa ? 'Grade A (உயர்தரம் / ஏற்றுமதி)' : 'Grade A (Premium / Export)'}</option>
                <option value="Grade B">{isTa ? 'Grade B (சாதாரண மண்டி தரம்)' : 'Grade B (Standard Mandi)'}</option>
                <option value="Grade C">{isTa ? 'Grade C (பதப்படுத்துதல் / அவசர விற்பனை)' : 'Grade C (Processing / Distress)'}</option>
              </select>
            </div>
          </div>

          {/* Optional: Variety & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isTa ? 'விதை வகை / வீரிய ரகம்' : 'Variety / Hybrid'}
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder={isTa ? 'எ.கா. நாம்தாரி 5005, சிவம்...' : 'e.g. Namdhari 5005, Shivam...'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isTa ? 'அறுவடை தேதி' : 'Harvest Date'}
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isTa ? 'பண்ணை அமைவிடம் / கிராமம்' : 'Farm Location / Cluster'}
            </label>
            <input
              type="text"
              value={farmLocation}
              onChange={(e) => setFarmLocation(e.target.value)}
              placeholder={isTa ? 'எ.கா. ஓமலூர் ஒன்றியம், சேலம் பகுதி' : 'e.g. Omalur Block, Salem Cluster'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
            />
          </div>

          {/* Optional: Initial Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isTa ? 'ஆரம்ப குறிப்பு (விருப்பத்தேர்வு)' : 'Initial Field / Quality Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              placeholder={isTa ? 'எ.கா. 20 கிலோ பெட்டிகளில் உலர்ந்த காலை நேரத்தில் பேக் செய்யப்பட்டது...' : 'e.g. Packed in 20kg crates under dry morning conditions...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>

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
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              <Icon name="check" size={16} />
              <span>{isSubmitting ? (isTa ? 'உருவாக்குகிறது...' : 'Creating...') : (isTa ? 'தொகுதியை உருவாக்கு' : 'Create Batch')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBatchModal;
