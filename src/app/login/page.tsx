'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Icon } from '@/components/ui/Icon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user, loading: authLoading, login, signup } = useAuth();
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTa = lang === 'ta';

  // Redirect to dashboard if session already active
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(
            isTa
              ? 'உள்நுழைவு தோல்வியடைந்தது. உங்கள் நற்சான்றிதழ்களை சரிபார்க்கவும்.'
              : res.error || 'Login failed. Please check your credentials.'
          );
        }
      } else {
        const res = await signup(email, password, fullName);
        if (!res.success) {
          setErrorMessage(
            isTa
              ? 'பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.'
              : res.error || 'Registration failed. Please try again.'
          );
        }
      }
    } catch (err: unknown) {
      setErrorMessage(
        isTa
          ? 'எதிர்பாராத பிழை ஏற்பட்டது.'
          : err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden" style={{background: "linear-gradient(135deg, #0a0e1a 0%, #0f1923 40%, #0d1f17 70%, #0a1a0d 100%)"}}>
      {/* Decorative background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div style={{position:'absolute',top:'-15%',left:'-10%',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)'}} />
        <div style={{position:'absolute',bottom:'-20%',right:'-10%',width:'600px',height:'600px',borderRadius:'50%',background:'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)'}} />
        <div style={{position:'absolute',top:'40%',right:'15%',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)'}} />
      </div>
      {/* Top Floating Pill Brand & Language Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-3">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-lg">
            U
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-base">
            UZHAVAR <span className="text-emerald-400">OS</span>
          </span>
        </Link>

        {/* Bilingual Selector */}
        <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-xs">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang('ta')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              lang === 'ta'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            தமிழ்
          </button>
        </div>
      </header>

      {/* Main Login / Register Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/90 text-amber-950 font-bold text-xs rounded-full uppercase tracking-wider">
              <Icon name="sprout" size={14} className="text-amber-700" />
              {isTa ? 'விவசாயி போர்டல்' : 'Farmer Workstation Auth'}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-3">
              {mode === 'signin'
                ? isTa
                  ? 'பணித்தள உள்நுழைவு'
                  : 'Welcome to UZHAVAR OS'
                : isTa
                ? 'புதிய கணக்கு தொடங்கவும்'
                : 'Create Producer Account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isTa
                ? 'நேரடி பயிர் பாஸ்போர்ட் மற்றும் மதிப்பு தொடர் கண்காணிப்பு'
                : 'Cryptographic CropChain provenance & verified ledger records'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/50 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {isTa ? 'உள்நுழைக' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {isTa ? 'பதிவு செய்க' : 'Create Account'}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2">
              <Icon name="warning" size={16} className="text-red-600 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {isTa ? 'முழு பெயர்' : 'Full Name'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isTa ? 'எ.கா. விவசாயி பெயர்' : 'e.g. Producer Name'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                  <Icon name="user" size={16} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                {isTa ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="producer@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                {isTa ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {isTa ? 'குறைந்தபட்சம் 6 எழுத்துக்கள்' : 'Minimum 6 characters'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              <Icon name="lock" size={16} />
              <span>
                {isSubmitting
                  ? isTa
                    ? 'சரிபார்க்கிறது...'
                    : 'Authenticating...'
                  : mode === 'signin'
                  ? isTa
                    ? 'பணித்தளத்தில் நுழைக'
                    : 'Sign In to Dashboard'
                  : isTa
                  ? 'கணக்கை உருவாக்கு'
                  : 'Register Account'}
              </span>
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-white/30 py-3">
        {isTa
          ? 'UZHAVAR OS • தமிழ்நாடு வேளாண் வம்சாவளி நெறிமுறை (TNOALP-2026) • உழவர் பூட்டுதல் அற்றது'
          : 'UZHAVAR OS • Tamil Nadu Open Agronomic Lineage Protocol (TNOALP-2026) • Zero Lock-In'}
      </footer>
    </div>
  );
}
