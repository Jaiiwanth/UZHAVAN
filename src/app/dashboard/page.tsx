'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { supabaseService, DbCropBatch } from '@/lib/supabase/service';
import { Icon } from '@/components/ui/Icon';
import { CreateBatchModal } from '@/components/batch/CreateBatchModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  const [batches, setBatches] = useState<DbCropBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const isTa = lang === 'ta';

  // Protect route: redirect to login if unauthenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const loadBatches = useCallback(async () => {
    if (!user) return;
    setLoadingBatches(true);
    try {
      const data = await supabaseService.getBatchesForCurrentUser();
      setBatches(data);
    } catch (err) {
      console.error('Failed to load user batches:', err);
    } finally {
      setLoadingBatches(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      supabaseService.getBatchesForCurrentUser().then((data) => {
        if (isMounted) {
          setBatches(data);
          setLoadingBatches(false);
        }
      }).catch((err) => {
        console.error('Failed to load user batches:', err);
        if (isMounted) setLoadingBatches(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">
            {isTa ? 'அங்கீகரிக்கிறது...' : 'Verifying authenticated session...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* 1. Header with UZHAVAR OS Branding, Identity, Language & Logout */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              U
            </div>
            <div>
              <Link href="/dashboard" className="font-extrabold text-slate-900 tracking-tight text-lg flex items-center gap-1.5">
                <span>UZHAVAR</span>
                <span className="text-amber-500">OS</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 ml-1 hidden sm:inline">
                  {isTa ? 'பணித்தளம்' : 'Workstation'}
                </span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
            {/* User Identity Chip */}
            <div className="flex items-center space-x-2 bg-slate-100/80 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs">
              <Icon name="user" size={14} className="text-slate-500" />
              <span className="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[180px]">
                {user.fullName || user.email}
              </span>
            </div>

            {/* Bilingual Selector */}
            <div className="flex items-center space-x-0.5 bg-slate-100/80 p-0.5 rounded-full border border-slate-200">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('ta')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  lang === 'ta'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Logout Action */}
            <button
              type="button"
              onClick={logout}
              title={isTa ? 'வெளியேறு' : 'Sign Out'}
              className="p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center"
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* Dashboard Title & Create Batch Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {isTa ? 'விவசாயி மேசைக் கண்ணோட்டம்' : 'Authenticated Farmer Workspace'}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
              {isTa ? 'எனது பயிர் தொகுதிகள்' : 'My Crop Batches'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isTa
                ? 'உங்கள் உண்மையான விளைபொருள் தொகுதிகளை பதிவு செய்து அதன் மதிப்புப் பயணத்தை கண்காணிக்கவும்.'
                : 'Manage verified crop consignments, inspect supply chain provenance, and simulate alternative dispatch channels.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="self-start sm:self-auto px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-soft-card flex items-center space-x-2 cursor-pointer"
          >
            <Icon name="plus" size={16} className="text-amber-400" />
            <span>{isTa ? 'புதிய பயிர் தொகுதியை உருவாக்கு' : 'Create New Batch'}</span>
          </button>
        </div>

        {/* 3. Batches Listing / Zero State */}
        <div className="mt-8">
          {loadingBatches ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
              <span className="text-xs text-slate-400 mt-3 block font-medium">
                {isTa ? 'தரவுத்தளத்திலிருந்து தொகுதிகள் பெறப்படுகின்றன...' : 'Loading crop batches from Supabase...'}
              </span>
            </div>
          ) : batches.length === 0 ? (
            /* Explicit Empty State - Strictly NO fabricated mock data! */
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-card p-10 sm:p-14 text-center max-w-2xl mx-auto my-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-950 flex items-center justify-center mx-auto mb-4 border border-amber-200/60 shadow-xs">
                <Icon name="sprout" size={32} className="text-amber-700" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {isTa ? 'பயிர் தொகுதிகள் எதுவும் இதுவரை இல்லை' : 'No crop batches yet.'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                {isTa
                  ? 'உங்கள் விளைபொருளைக் கண்காணிக்க முதல் பயிர் தொகுதியை உருவாக்குங்கள். உங்கள் காய் மற்றும் பழத்தின் எடை, அறுவடை தேதி மற்றும் தரத்தை உள்ளிடவும்.'
                  : 'Create your first batch to begin tracking your produce. Enter your fruit or vegetable name and quantity in kg to start verified CropChain provenance.'}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs inline-flex items-center space-x-2 cursor-pointer"
                >
                  <Icon name="plus" size={16} className="text-amber-400" />
                  <span>{isTa ? 'முதல் தொகுதியை உருவாக்கவும்' : 'Create Your First Batch'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Real User Batches Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-soft-card p-6 flex flex-col justify-between hover:border-slate-300 transition-all group"
                >
                  <div>
                    {/* Top Row: Batch ID & Status */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        {batch.batch_id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {isTa && batch.status.toLowerCase() === 'active' ? 'செயலில்' : batch.status}
                      </span>
                    </div>

                    {/* Produce Name & Quantity */}
                    <div className="mt-4">
                      <span className="text-xs text-slate-400 font-medium block">
                        {isTa ? 'விளைபொருள்' : 'Produce & Selection'}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                        {isTa && batch.crop_name_tamil ? batch.crop_name_tamil : batch.crop_name}
                      </h3>
                      <div className="flex items-baseline space-x-2 mt-2">
                        <span className="font-mono text-2xl font-extrabold text-slate-900">
                          {Number(batch.quantity_kg).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{isTa ? 'கிலோ' : 'kg'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-slate-600">{batch.grade}</span>
                      </div>
                    </div>

                    {/* Meta: Harvest & Location */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Icon name="calendar" size={14} className="text-slate-400" />
                        <span>{isTa ? 'அறுவடை:' : 'Harvest:'} {batch.harvest_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon name="map_pin" size={14} className="text-slate-400" />
                        <span className="truncate">{batch.farm_location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Open Workstation Action Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href={`/batch/${batch.batch_id}`}
                      className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-xs group-hover:bg-amber-400 group-hover:text-slate-950"
                    >
                      <span>{isTa ? 'பணித்தளத்தைத் திறக்க' : 'Open CropChain Workstation'}</span>
                      <Icon name="arrow_forward" size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-12 border-t border-slate-200 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <strong className="text-slate-900 font-extrabold">UZHAVAR OS</strong>
          <span>•</span>
          <span>{isTa ? 'தமிழ்நாடு வேளாண் வம்சாவளி நெறிமுறை (TNOALP-2026)' : 'Tamil Nadu Open Agronomic Lineage Protocol (TNOALP-2026)'}</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            {isTa ? 'Supabase இணைப்பு: இணைக்கப்பட்டது' : 'Supabase State: Connected'}
          </span>
          <span>•</span>
          <span>{isTa ? 'உழவர் பூட்டுதல் அற்றது' : 'Zero Farmer Lock-In'}</span>
        </div>
      </footer>

      {/* Create Batch Modal */}
      <CreateBatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBatchCreated={() => loadBatches()}
        language={lang}
      />
    </div>
  );
}
