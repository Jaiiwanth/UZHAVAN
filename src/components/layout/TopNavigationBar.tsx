'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Language } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/contexts/AuthContext';

export interface TopNavigationBarProps {
  readonly currentLanguage?: Language;
  readonly onLanguageChange?: (lang: Language) => void;
  readonly onOpenQrModal: () => void;
  readonly activeSection?: string;
}

export const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  currentLanguage: propLanguage,
  onLanguageChange: propOnLanguageChange,
  onOpenQrModal,
  activeSection = 'cropchain-lens',
}) => {
  const { lang, t, setLang } = useLanguage();
  const currentLanguage = propLanguage || lang;
  const onLanguageChange = propOnLanguageChange || setLang;

  const { user, logout } = useAuth();
  const [userNav, setUserNav] = useState<string | null>(null);
  const activeNav = userNav ?? activeSection;

  const navItems = [
    { id: 'crop-passport', label: t.nav.passport, href: '#crop-passport' },
    { id: 'cropchain-lens', label: t.nav.lens, href: '#cropchain-lens' },
    { id: 'value-journey', label: t.nav.journey, href: '#value-journey' },
    { id: 'compare-simulate', label: t.nav.simulate, href: '#compare-simulate' },
    { id: 'farmer-context', label: t.nav.context, href: '#farmer-context' },
    { id: 'you-decide', label: t.nav.decide, href: '#you-decide' },
    { id: 'outcome-memory', label: t.nav.outcome, href: '#outcome-memory' },
  ];

  const handleNavClick = (id: string, href: string) => {
    setUserNav(id);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayName = user?.fullName || user?.email?.split('@')[0] || (currentLanguage === 'ta' ? 'விவசாயி' : 'Farmer');
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 sticky top-0 z-40">
      <header className="bg-white/95 backdrop-blur-md rounded-full px-4 sm:px-6 py-2 border border-slate-200 shadow-soft-card flex items-center justify-between gap-3">
        {/* Brand & Logo Badge */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2.5 group cursor-pointer"
            title={t.nav.dashboard}
          >
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
              <Icon name="energy_savings_leaf" className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                UZHAVAR<span className="font-normal text-slate-500 ml-1">OS</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider hidden sm:inline-block">
                PRO
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop / Large Screen Pill Navigation */}
        <nav className="hidden xl:flex items-center space-x-1 text-sm font-medium overflow-x-auto min-w-0">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 mr-1 shrink-0"
          >
            <Icon name="dashboard" className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.nav.dashboard}</span>
          </Link>

          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id, item.href);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>}
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Pill Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Quick link to Dashboard on tablet/mobile */}
          <Link
            href="/dashboard"
            className="xl:hidden px-2.5 py-1 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
            title={t.nav.dashboard}
          >
            <Icon name="dashboard" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.nav.dashboard}</span>
          </Link>

          {/* Language Switcher Pill */}
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                currentLanguage === 'en'
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('ta')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                currentLanguage === 'ta'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* QR Passport CTA */}
          <button
            type="button"
            onClick={onOpenQrModal}
            className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="qr_code_2" className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{t.nav.qrSuite}</span>
          </button>

          {/* User Profile Avatar / Logout */}
          <div className="flex items-center space-x-1.5 pl-1">
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs hover:ring-2 hover:ring-amber-500 transition-all"
              title={`${displayName} • ${t.nav.dashboard}`}
            >
              {initial}
            </Link>
            {user && (
              <button
                type="button"
                onClick={() => logout()}
                className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title={t.nav.logout}
                aria-label="Logout"
              >
                <Icon name="logout" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default TopNavigationBar;
