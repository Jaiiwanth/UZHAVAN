'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useLanguage } from '@/hooks/useLanguage';

export interface MobileBottomNavProps {
  readonly onOpenQrModal: () => void;
  readonly activeTabId?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenQrModal,
  activeTabId = 'cropchain-lens',
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>(activeTabId);

  const handleNavClick = (id: string, href: string) => {
    setActiveTab(id);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex md:hidden justify-around items-center px-4 py-2 pb-safe bg-white/95 backdrop-blur-md shadow-lg border-t border-slate-200">
      {/* Passport */}
      <a
        className={`flex flex-col items-center justify-center text-[10px] py-1 transition-colors cursor-pointer ${
          activeTab === 'crop-passport' ? 'text-slate-900 font-bold' : 'text-slate-500'
        }`}
        href="#crop-passport"
        onClick={(e) => {
          e.preventDefault();
          handleNavClick('crop-passport', '#crop-passport');
        }}
      >
        <Icon name="assignment" className="w-5 h-5" />
        <span className="mt-0.5">{t.mobile.passport}</span>
      </a>

      {/* Lens (Active default) */}
      <a
        className={`flex flex-col items-center justify-center text-[10px] py-1 transition-colors cursor-pointer ${
          activeTab === 'cropchain-lens' ? 'text-slate-900 font-bold' : 'text-slate-500'
        }`}
        href="#cropchain-lens"
        onClick={(e) => {
          e.preventDefault();
          handleNavClick('cropchain-lens', '#cropchain-lens');
        }}
      >
        <Icon name="hub" className="w-5 h-5" />
        <span className="mt-0.5">{t.mobile.lens}</span>
      </a>

      {/* Simulate */}
      <a
        className={`flex flex-col items-center justify-center text-[10px] py-1 transition-colors cursor-pointer ${
          activeTab === 'compare-simulate' ? 'text-slate-900 font-bold' : 'text-slate-500'
        }`}
        href="#compare-simulate"
        onClick={(e) => {
          e.preventDefault();
          handleNavClick('compare-simulate', '#compare-simulate');
        }}
      >
        <Icon name="tune" className="w-5 h-5" />
        <span className="mt-0.5">{t.mobile.simulate}</span>
      </a>

      {/* Decide */}
      <a
        className={`flex flex-col items-center justify-center text-[10px] py-1 transition-colors cursor-pointer ${
          activeTab === 'you-decide' ? 'text-slate-900 font-bold' : 'text-slate-500'
        }`}
        href="#you-decide"
        onClick={(e) => {
          e.preventDefault();
          handleNavClick('you-decide', '#you-decide');
        }}
      >
        <Icon name="verified_user" className="w-5 h-5" />
        <span className="mt-0.5">{t.mobile.decide}</span>
      </a>

      {/* QR Trigger */}
      <button
        type="button"
        className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 text-[10px] py-1 cursor-pointer transition-colors"
        onClick={onOpenQrModal}
      >
        <Icon name="qr_code_scanner" className="w-5 h-5" />
        <span className="mt-0.5 font-medium">{t.mobile.qr}</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
