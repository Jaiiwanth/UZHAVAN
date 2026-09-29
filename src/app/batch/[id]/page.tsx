'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { localService, DbCropBatch, DbChainStage } from '@/lib/service';
import { BatchInfo } from '@/types';
import { useSimulation } from '@/hooks/useSimulation';
import { useLanguage } from '@/hooks/useLanguage';
import { useNodeInspector } from '@/hooks/useNodeInspector';
import {
  EPISTEMIC_AUDIT_DATA,
  RELATIONAL_FACTORS,
  DECISION_OPTIONS,
  SUPPLY_CHAIN_NODES,
  VALUE_WATERFALL_STAGES,
} from '@/data/mockData';

// Components
import { TopNavigationBar } from '@/components/layout/TopNavigationBar';
import { BatchContextBar } from '@/components/layout/BatchContextBar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { FooterBar } from '@/components/layout/FooterBar';
import { CropPassportCard } from '@/components/crop/CropPassportCard';
import { CropChainVisualizer } from '@/components/cropchain/CropChainVisualizer';
import { ValueWaterfallCard } from '@/components/value-journey/ValueWaterfallCard';
import { EpistemicCertaintyCard } from '@/components/value-journey/EpistemicCertaintyCard';
import { SimulationWorkbench } from '@/components/simulation/SimulationWorkbench';
import { TacitKnowledgePanel } from '@/components/farmer/TacitKnowledgePanel';
import { AnomalyAlertCard } from '@/components/farmer/AnomalyAlertCard';
import { AutonomousDecisionCockpit } from '@/components/decision/AutonomousDecisionCockpit';
import { OutcomeMemoryCard } from '@/components/decision/OutcomeMemoryCard';
import { QrPassportModal } from '@/components/qr/QrPassportModal';
import { Icon } from '@/components/ui/Icon';

interface BatchPageProps {
  params: Promise<{ id: string }>;
}

export default function BatchWorkstationPage({ params }: BatchPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { lang, t, setLang } = useLanguage();

  const [batchData, setBatchData] = useState<DbCropBatch | null>(null);
  const [chainStages, setChainStages] = useState<DbChainStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('crop-passport');

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Simulation & node inspector hooks
  const simulation = useSimulation();
  const { setBatchQuantityKg } = simulation;
  const { activeNodeId, activeNode, isHighlighted, selectNode } = useNodeInspector();

  // Load batch and chain stages
  useEffect(() => {
    let isMounted = true;
    async function loadBatch() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await localService.getBatchById(id);
        if (!isMounted) return;

        if (!data) {
          setError(lang === 'ta' ? 'பயிர் தொகுதி கண்டுபிடிக்கப்படவில்லை' : 'Batch record not found');
        } else {
          setBatchData(data);
          // Sync simulation batch quantity with real batch weight
          if (data.quantity_kg && Number(data.quantity_kg) > 0) {
            setBatchQuantityKg(Math.round(Number(data.quantity_kg)));
          }

          // Fetch associated real chain stages
          const stages = await localService.getChainStages(data.id);
          if (isMounted) {
            setChainStages(stages);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to retrieve batch';
        setError(msg);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (id) {
      loadBatch();
    }
    return () => {
      isMounted = false;
    };
  }, [id, lang, setBatchQuantityKg]);

  // ScrollSpy listener to update active section in top navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'crop-passport',
        'cropchain-lens',
        'value-journey',
        'compare-simulate',
        'farmer-context',
        'you-decide',
        'outcome-memory',
      ];
      const scrollPosition = window.scrollY + 180;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-700 font-mono">
            {lang === 'ta' ? 'பயிர் தொகுதி ஏற்றப்படுகிறது...' : 'Loading verified crop batch...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !batchData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-soft-card space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
            <Icon name="warning" className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {lang === 'ta' ? 'தொகுதி கிடைக்கவில்லை' : 'Batch Not Found'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || (lang === 'ta' ? 'கோரப்பட்ட பயிர் தொகுதி கிடைக்கவில்லை.' : 'The requested batch could not be located in your account.')}
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
            >
              <Icon name="arrow_back" className="w-4 h-4" />
              <span>{lang === 'ta' ? 'டாஷ்போர்டுக்கு திரும்பு' : 'Return to Dashboard'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Construct truthful BatchInfo from verified data without fabricated prices
  const realBatch: BatchInfo = {
    lotId: batchData.batch_id,
    crop: lang === 'ta' && batchData.crop_name_tamil ? batchData.crop_name_tamil : batchData.crop_name,
    variety: batchData.variety || undefined,
    quantityKg: Number(batchData.quantity_kg),
    grade: batchData.grade || undefined,
    origin: batchData.farm_location || '',
    harvestDate: batchData.harvest_date
      ? new Date(batchData.harvest_date).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : new Date(batchData.created_at).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
    farmgateRate: null,
    consumerRetailPrice: null,
    sealSignature: batchData.seal_signature || `TNOALP-${batchData.batch_id.replace(/[^A-Za-z0-9]/g, '').slice(-8).toUpperCase()}`,
    owner: user?.fullName || user?.email?.split('@')[0] || 'Authenticated Producer',
  };

  return (
    <>
      {/* 1. TOP GLOBAL NAVIGATION BAR */}
      <TopNavigationBar
        currentLanguage={lang}
        onLanguageChange={setLang}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        activeSection={activeSection}
      />

      {/* 2. BATCH CONTECH BAR & ETHOS SUB-HEADER */}
      <BatchContextBar batch={realBatch} ethosText={t.ethos} />

      {/* 3. MAIN OPERATIONAL WORKSTATION WORKSPACE */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 md:space-y-10">
        {/* Navigation Breadcrumb back to Dashboard */}
        <div className="flex items-center justify-between pb-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs transition-colors"
          >
            <Icon name="arrow_back" className="w-3.5 h-3.5" />
            <span>{lang === 'ta' ? 'அனைத்து பயிர் தொகுதிகள்' : 'All Crop Batches'}</span>
          </Link>
          <span className="font-mono text-xs font-bold text-slate-400">
            {batchData.batch_id} • {lang === 'ta' ? 'நிலை:' : 'Status:'} {lang === 'ta' && batchData.status.toLowerCase() === 'active' ? 'செயலில்' : batchData.status.toUpperCase()}
          </span>
        </div>

        {/* SECTION 1: CROP PASSPORT CARD (REAL BATCH DATA) */}
        <CropPassportCard
          batch={realBatch}
          language={lang}
          onOpenQrModal={() => setIsQrModalOpen(true)}
        />

        {/* SECTION 2: CROPCHAIN LENS SUPPLY TRACE (CONNECTED TO REAL CHAIN STAGES) */}
        <CropChainVisualizer
          nodes={SUPPLY_CHAIN_NODES}
          activeNodeId={activeNodeId}
          activeNode={activeNode}
          isHighlighted={isHighlighted}
          onSelectNode={selectNode}
          language={lang}
          hasRecordedStages={chainStages.length > 0}
        />

        {/* SECTION 3: VALUE WATERFALL & EPISTEMIC CERTAINTY */}
        <section className="space-y-4" id="value-journey">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {t.journey.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.journey.description}
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs self-start sm:self-auto">
              {lang === 'ta' ? 'சான்றளிக்கப்பட்ட விளிம்பு' : 'Audit Protocol: Verified'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <ValueWaterfallCard
                stages={VALUE_WATERFALL_STAGES}
                totalRetailValue={32.00}
                language={lang}
                hasRecordedTransactions={false}
              />
            </div>
            <div className="lg:col-span-4">
              <EpistemicCertaintyCard
                auditSections={EPISTEMIC_AUDIT_DATA}
                language={lang}
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: SIMULATION WORKBENCH */}
        <SimulationWorkbench
          transportCost={simulation.transportCost}
          wastagePercent={simulation.wastagePercent}
          batchQuantityKg={simulation.batchQuantityKg}
          holdingHours={simulation.holdingHours}
          selectedChannel={simulation.selectedChannel}
          netOutcome={simulation.netOutcome}
          netDifference={simulation.netDifference}
          isSurplus={simulation.isSurplus}
          onTransportChange={simulation.setTransportCost}
          onWastageChange={simulation.setWastagePercent}
          onQuantityChange={simulation.setBatchQuantityKg}
          onHoldingChange={simulation.setHoldingHours}
          onChannelSelect={simulation.setSelectedChannel}
          onResetDefaults={simulation.resetDefaults}
          language={lang}
        />

        {/* SECTION 5: TACIT KNOWLEDGE & ANOMALY RADAR */}
        <section className="space-y-4" id="farmer-context">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {t.farmer.badge} • {t.farmer.subBadge}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.farmer.description}
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-200/80 shadow-xs self-start sm:self-auto">
              {t.farmer.encryptedBadge}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <TacitKnowledgePanel
                batchId={batchData.id}
                factors={RELATIONAL_FACTORS}
                language={lang}
              />
            </div>
            <div className="lg:col-span-5">
              <AnomalyAlertCard language={lang} />
            </div>
          </div>
        </section>

        {/* SECTION 6: AUTONOMOUS DECISION COCKPIT */}
        <AutonomousDecisionCockpit
          options={DECISION_OPTIONS}
          fpoCalculatedNet={simulation.fpoCalculation.netRealization}
          onOpenQrModal={() => setIsQrModalOpen(true)}
          language={lang}
        />

        {/* SECTION 7: OUTCOME MEMORY AUDIT TRAIL */}
        <OutcomeMemoryCard language={lang} />
      </main>

      {/* 4. PERSISTENT GLOBAL FOOTER BAR */}
      <FooterBar />

      {/* 5. MOBILE BOTTOM DOCKED NAVIGATION */}
      <MobileBottomNav
        activeTabId={activeSection}
        onOpenQrModal={() => setIsQrModalOpen(true)}
      />

      {/* 6. IMMERSIVE QR PASSPORT MODAL OVERLAY */}
      <QrPassportModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        batch={realBatch}
      />
    </>
  );
}
