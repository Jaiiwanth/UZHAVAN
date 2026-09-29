'use client';

import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export interface FooterBarProps {
  readonly appName?: string;
}

export const FooterBar: React.FC<FooterBarProps> = ({ appName }) => {
  const { t } = useLanguage();
  const name = appName || t.appName;

  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 pb-20 md:pb-8">
      <div className="flex items-center space-x-2">
        <strong className="text-slate-900 font-extrabold">{name}</strong>
        <span>•</span>
        <span>{t.footer.protocol}</span>
      </div>
      <div className="flex items-center space-x-3 text-[11px]">
        <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          {t.footer.apmcOnline}
        </span>
        <span>•</span>
        <span className="font-semibold text-slate-600">{t.footer.guarantee}</span>
      </div>
    </footer>
  );
};

export default FooterBar;
