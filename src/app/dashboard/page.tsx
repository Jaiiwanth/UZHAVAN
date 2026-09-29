'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { localService, DbCropBatch } from '@/lib/service';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CREATED'>('ALL');

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
      const data = await localService.getBatchesForCurrentUser();
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
      localService
        .getBatchesForCurrentUser()
        .then((data) => {
          if (isMounted) {
            setBatches(data);
            setLoadingBatches(false);
          }
        })
        .catch((err) => {
          console.error('Failed to load user batches:', err);
          if (isMounted) setLoadingBatches(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Filter batches based on search and status
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchesSearch =
        !searchQuery.trim() ||
        b.batch_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.crop_name_tamil && b.crop_name_tamil.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        b.status === 'CREATED' ||
        (b.status as string).toLowerCase() === 'created';

      return matchesSearch && matchesStatus;
    });
  }, [batches, searchQuery, statusFilter]);

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

  const farmerName = user.fullName || user.email.split('@')[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-950">
      {/* 1. Top Header with Identity, Language & Logout */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Icon name="energy_savings_leaf" className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <Link href="/dashboard" className="font-extrabold text-slate-900 tracking-tight text-lg flex items-center gap-1.5">
                <span>UZHAVAR</span>
                <span className="text-amber-500">OS</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 ml-1 hidden sm:inline">
                  {isTa ? 'உழவர் பணித்தளம்' : 'Farmer OS'}
                </span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
            {/* User Identity Chip */}
            <div className="flex items-center space-x-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs">
              <Icon name="person" size={14} className="text-slate-600" />
              <span className="font-bold text-slate-900 truncate max-w-[130px] sm:max-w-[180px]">
                {farmerName}
              </span>
            </div>

            {/* Bilingual Selector */}
            <div className="flex items-center space-x-0.5 bg-slate-100 p-0.5 rounded-full border border-slate-200">
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
              className="p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center shadow-xs"
              aria-label="Logout"
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Welcome Banner & Action Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>{isTa ? 'அங்கீகரிக்கப்பட்ட உழவர் கணக்கு' : 'Verified Producer Workspace'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isTa ? `வணக்கம், ${farmerName}!` : `Welcome, ${farmerName}!`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {isTa
                ? 'உங்கள் உண்மையான விளைபொருள் தொகுதிகளைப் பதிவு செய்து, டிஜிட்டல் பயிர் பாஸ்போர்ட் மற்றும் மதிப்பு தொடர் வெளிப்படைத்தன்மையை கண்காணிக்கவும்.'
                : 'Track your real crop consignments, inspect digital crop passports, and analyze verified value distribution.'}
            </p>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="self-start md:self-auto px-6 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-soft-card flex items-center space-x-2.5 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon name="plus" size={18} className="text-amber-400" />
            <span>{isTa ? 'புதிய பயிர் தொகுதியை உருவாக்கு' : 'Create New Batch'}</span>
          </button>
        </div>

        {/* 3. Section Title & Search/Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {isTa ? 'எனது பயிர் தொகுதிகள்' : 'My Crop Batches'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {batches.length} {isTa ? 'தொகுதிகள் பதிவு செய்யப்பட்டுள்ளன' : 'verified batches registered'}
              </p>
            </div>

            {/* Search and Filters */}
            {batches.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Input */}
                <div className="relative min-w-[200px] sm:min-w-[240px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isTa ? 'பயிர் அல்லது தொகுதி எண் தேடுக...' : 'Search crop or batch ID...'}
                    className="w-full bg-white border border-slate-200 rounded-full px-3.5 py-1.5 pl-8 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-xs"
                  />
                  <Icon name="search" size={14} className="absolute left-2.5 top-2 text-slate-400" />
                </div>

                {/* Status Filter */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      statusFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {isTa ? 'அனைத்தும்' : 'All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('CREATED')}
                    className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      statusFilter === 'CREATED'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {isTa ? 'புதியவை' : 'Created'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Batches Display / Zero State */}
          {loadingBatches ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-soft-card">
              <div className="w-9 h-9 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
              <span className="text-xs text-slate-500 mt-3 block font-medium">
                {isTa ? 'தரவுத்தளத்திலிருந்து பயிர் தொகுதிகள் பெறப்படுகின்றன...' : 'Loading verified crop batches from PostgreSQL...'}
              </span>
            </div>
          ) : batches.length === 0 ? (
            /* Explicit Empty State - Strictly NO fabricated mock data! */
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft-card p-10 sm:p-14 text-center max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-950 flex items-center justify-center mx-auto mb-4 border border-amber-200/60 shadow-xs">
                <Icon name="sprout" size={32} className="text-amber-800" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {isTa ? 'பயிர் தொகுதிகள் எதுவும் இதுவரை இல்லை' : 'No crop batches yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                {isTa
                  ? 'உங்கள் முதல் விளைபொருளைப் பதிவு செய்து கண்காணிப்பைத் தொடங்கவும். உங்கள் பயிர் பெயர் மற்றும் அளவை உள்ளிடவும்.'
                  : 'Create your first batch to begin tracking your produce. Enter your fruit or vegetable name and quantity in kg to start verified CropChain provenance.'}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-soft-card inline-flex items-center space-x-2 cursor-pointer"
                >
                  <Icon name="plus" size={16} className="text-amber-400" />
                  <span>{isTa ? 'புதிய பயிர் தொகுதியை உருவாக்கு' : 'Create New Batch'}</span>
                </button>
              </div>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-card p-10 text-center">
              <p className="text-xs text-slate-500">
                {isTa ? 'தேடலுக்குரிய பயிர் தொகுதிகள் எதுவும் இல்லை.' : 'No batches match your filter criteria.'}
              </p>
            </div>
          ) : (
            /* Real User Batches Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBatches.map((batch) => {
                const displayName = isTa && batch.crop_name_tamil ? batch.crop_name_tamil : batch.crop_name;
                const formattedDate = batch.harvest_date
                  ? new Date(batch.harvest_date).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : new Date(batch.created_at).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                return (
                  <div
                    key={batch.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-soft-card p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Top Row: Batch ID & Status */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                          {batch.batch_id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200/80">
                          {isTa && batch.status.toLowerCase() === 'created'
                            ? 'உருவாக்கப்பட்டது'
                            : isTa && batch.status.toLowerCase() === 'active'
                            ? 'செயலில்'
                            : batch.status}
                        </span>
                      </div>

                      {/* Produce Name & Quantity */}
                      <div className="mt-4">
                        <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                          {isTa ? 'விளைபொருள்' : 'Produce & Crop'}
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-0.5 truncate">
                          {displayName}
                        </h3>
                        <div className="flex items-baseline space-x-2 mt-2">
                          <span className="font-mono text-2xl font-extrabold text-slate-900">
                            {Number(batch.quantity_kg).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{isTa ? 'கிலோ' : 'kg'}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-600 truncate">{batch.grade || 'Grade A'}</span>
                        </div>
                      </div>

                      {/* Meta Information */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Icon name="calendar" size={14} className="text-slate-400 shrink-0" />
                          <span>{isTa ? 'தேதி:' : 'Date:'} {formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Icon name="map_pin" size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{batch.farm_location || 'Salem Agro Cluster'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Open Workstation Action Button */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <Link
                        href={`/batch/${batch.batch_id}`}
                        className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-xs group-hover:bg-amber-400 group-hover:text-slate-950"
                      >
                        <span>{isTa ? 'பயிர் பணித்தளத்தைத் திறக்க' : 'Open Batch Dashboard'}</span>
                        <Icon name="arrow_forward" size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-12 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-wrap">
          <strong className="text-slate-900 font-extrabold">UZHAVAR OS</strong>
          <span>•</span>
          <span>{isTa ? 'தமிழ்நாடு வேளாண் வம்சாவளி நெறிமுறை (TNOALP-2026)' : 'Tamil Nadu Open Agronomic Lineage Protocol (TNOALP-2026)'}</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>{isTa ? 'PostgreSQL தரவுத்தளம்: இயக்கத்தில் உள்ளது' : 'PostgreSQL: Active'}</span>
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
