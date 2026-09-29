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
      <header className="bg-white/95 backdrop-blur-md rounded-full px-4 sm:px-6 py-2.5 border border-outline-variant shadow-soft-card flex items-center justify-between">
        {/* Brand & Logo Badge */}
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2.5 group cursor-pointer"
            title={t.nav.dashboard}
          >
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
              <Icon name="energy_savings_leaf" className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-primary">
                UZHAVAR<span className="font-normal text-on-surface-variant ml-1">OS</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant uppercase tracking-wider hidden lg:inline-block">
                v4.2 PRO
              </span>
            </div>
          </Link>
        </div>

        {/* SkyBound Pill Navigation */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 mr-1"
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
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-100/90 text-amber-950 font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>}
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* SkyBound Pill Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-surface-container rounded-full p-0.5 text-[11px] font-bold text-on-surface-variant border border-outline-variant/60">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                currentLanguage === 'en'
                  ? 'bg-white text-primary shadow-xs font-extrabold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('ta')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                currentLanguage === 'ta'
                  ? 'bg-white text-primary shadow-xs font-extrabold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Anomaly Indicator */}
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition shadow-xs cursor-pointer relative"
            title={currentLanguage === 'ta' ? 'தணிக்கை எச்சரிக்கைகள்' : 'Audit verification alerts'}
            onClick={() => {
              const el = document.querySelector('#farmer-context');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Icon name="notifications" className="w-4 h-4 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
          </button>

          {/* SkyBound Black Pill CTA */}
          <button
            type="button"
            onClick={onOpenQrModal}
            className="px-3.5 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="qr_code_2" className="w-4 h-4 text-white" />
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
                className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title={t.nav.logout}
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
