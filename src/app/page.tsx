'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Icon } from '@/components/ui/Icon';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const isTa = lang === 'ta';

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="bg-white/95 backdrop-blur-md rounded-full px-5 py-3 border border-slate-200/80 shadow-soft-card flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold tracking-tighter shadow-sm">
              <Icon name="energy_savings_leaf" className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                UZHAVAR<span className="font-normal text-slate-500 ml-1">OS</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-950 uppercase tracking-wider hidden sm:inline-block">
                Production
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 text-xs font-bold text-slate-600 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('ta')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'ta' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Auth CTA */}
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs flex items-center gap-1.5"
              >
                <Icon name="dashboard" className="w-3.5 h-3.5" />
                <span>{isTa ? 'டாஷ்போர்டு' : 'My Dashboard'}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs flex items-center gap-1.5"
              >
                <Icon name="login" className="w-3.5 h-3.5" />
                <span>{isTa ? 'உள்நுழைக / பதிவு செய்க' : 'Sign In / Register'}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center space-y-8 flex-grow flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-950 text-xs font-bold mx-auto shadow-xs">
          <Icon name="verified_user" className="w-4 h-4 text-emerald-600" />
          <span>{isTa ? 'தமிழ்நாடு வேளாண் வம்சாவளி நெறிமுறை (TNOALP-2026)' : 'Tamil Nadu Open Agronomic Lineage Protocol (TNOALP-2026)'}</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            {isTa ? (
              <>
                விளைபொருட்களுக்கான <br />
                <span className="text-emerald-700">நம்பகமான டிஜிட்டல் பாஸ்போர்ட்</span>
              </>
            ) : (
              <>
                Decentralized Provenance <br />
                <span className="text-emerald-700">& Value Lineage for Farmers</span>
              </>
            )}
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
            {isTa
              ? 'பண்ணை வாசல் முதல் நுகர்வோர் தட்டு வரை ஒவ்வொரு ரூபாயின் பயணத்தையும், பயிரின் உண்மையான தரத்தையும் சான்றளித்து விவசாயிக்கு முழு பொருளாதார வெளிப்படைத்தன்மையை வழங்குகிறது.'
              : 'Verifiable post-harvest provenance, transparent value distribution across supply chain intermediaries, and autonomous non-coercive market decision intelligence.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Icon name="assignment" className="w-4 h-4 text-amber-300" />
            <span>{isTa ? 'பயிர் தொகுதியை உருவாக்கத் தொடங்குங்கள்' : 'Get Started — Create Crop Batch'}</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-slate-800 font-bold text-sm hover:bg-slate-100 border border-slate-200 transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Icon name="dashboard" className="w-4 h-4" />
            <span>{isTa ? 'விவசாயி டாஷ்போர்டு' : 'Farmer Dashboard'}</span>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-left">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Icon name="assignment" className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {isTa ? 'பயிர் பாஸ்போர்ட்' : 'Crop Passport'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isTa
                ? 'அறுவடை நிலை, தரம் மற்றும் பாதுகாக்கப்பட்ட டிஜிட்டல் முத்திரை.'
                : 'Cryptographically sealed lot identity, quality metrics, and origin verification.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Icon name="hub" className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {isTa ? 'விலைச் சங்கிலி பார்வை' : 'CropChain Lens'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isTa
                ? 'பண்ணை முதல் சந்தை வரை விலை அதிகரிப்பின் ஊடாடும் பார்வை.'
                : 'Audited price spread across farmgate, aggregator, wholesaler, and retail shelf.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Icon name="tune" className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {isTa ? 'உருவகப்படுத்துதல்' : 'Value Journey'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isTa
                ? 'போக்குவரத்து மற்றும் சேதாரம் சார்ந்து மாற்று வழிகளை ஒப்பிடுக.'
                : 'Interactive financial sensitivity analysis with explicit non-coercive trade-offs.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Icon name="verified_user" className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {isTa ? 'சுயாதீன முடிவு' : 'You Decide'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isTa
                ? 'விவசாயியின் அனுபவ அறிவுக்கும் முடிவுகளுக்கும் முதன்மையான மரியாதை.'
                : 'Zero automated lock-in. Farmer field knowledge and human ground truth prevail.'}
            </p>
          </div>
        </div>
      </main>

      {/* Ethos Strip & Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <strong className="text-slate-900 font-extrabold">{t.appName}</strong>
          <span>•</span>
          <span className="italic">{t.ethos}</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            APMC Verified Node: Active
          </span>
          <span>•</span>
          <span className="font-semibold text-slate-600">Zero Lock-In Guarantee</span>
        </div>
      </footer>
    </div>
  );
}
