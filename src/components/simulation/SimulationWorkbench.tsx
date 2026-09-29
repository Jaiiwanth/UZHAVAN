'use client';

import React from 'react';
import { DispatchChannel, Language } from '@/types';
import { SensitivitySliders } from './SensitivitySliders';
import { Icon } from '@/components/ui/Icon';
import { useLanguage } from '@/hooks/useLanguage';

export interface SimulationWorkbenchProps {
  readonly transportCost: number;
  readonly wastagePercent: number;
  readonly batchQuantityKg?: number;
  readonly holdingHours?: number;
  readonly selectedChannel?: DispatchChannel;
  readonly netOutcome: number;
  readonly netDifference: number;
  readonly isSurplus: boolean;
  readonly onTransportChange: (val: number) => void;
  readonly onWastageChange: (val: number) => void;
  readonly onQuantityChange?: (val: number) => void;
  readonly onHoldingChange?: (val: number) => void;
  readonly onChannelSelect?: (channel: DispatchChannel) => void;
  readonly onResetDefaults?: () => void;
  readonly language?: Language;
}

export const SimulationWorkbench: React.FC<SimulationWorkbenchProps> = ({
  transportCost,
  wastagePercent,
  batchQuantityKg = 800,
  holdingHours = 0,
  selectedChannel = 'fpo',
  netOutcome,
  netDifference,
  isSurplus,
  onTransportChange,
  onWastageChange,
  onQuantityChange = () => {},
  onHoldingChange = () => {},
  onChannelSelect = () => {},
  onResetDefaults,
  language: propLanguage,
}) => {
  const { lang, t } = useLanguage();
  const activeLanguage = propLanguage || lang;
  const isTa = activeLanguage === 'ta';

  return (
    <section
      className="bg-white rounded-3xl border border-slate-100 shadow-soft-card p-6 md:p-8 overflow-hidden"
      id="compare-simulate"
    >
      {/* Workbench Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-amber-100/90 text-amber-950 font-bold text-xs rounded-full uppercase tracking-wider">
              {t.simulation.badge}
            </span>
            <span className="text-xs font-semibold text-slate-400">• {t.simulation.scenarioModeling}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            {t.simulation.title}
          </h2>
        </div>
        <div className="text-xs bg-slate-100/80 px-4 py-2 rounded-full text-slate-600 self-start md:self-auto flex items-center gap-2 border border-slate-200/50 shrink-0">
          <Icon name="tune" size={15} className="text-emerald-600" />
          <span>
            {t.simulation.simulatingBatch}:{' '}
            <strong className="text-slate-900 font-bold">{batchQuantityKg} {t.common.kg} {isTa ? 'லாட்' : 'Lot'}</strong>
          </span>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="mt-6 overflow-x-auto max-w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="p-3.5 font-bold rounded-l-xl">{t.simulation.evalFactor}</th>
              <th className={`p-3.5 font-bold border-l border-r border-slate-200/60 transition-colors ${
                selectedChannel === 'trader' ? 'bg-amber-50/80 text-slate-950 font-bold' : 'text-slate-700 bg-slate-100/50'
              }`}>
                {t.simulation.pathTrader}
              </th>
              <th className={`p-3.5 font-bold transition-colors ${
                selectedChannel === 'fpo' ? 'bg-amber-50/80 text-slate-950 font-bold' : 'text-emerald-700'
              }`}>
                {t.simulation.pathFpo}
              </th>
              <th className={`p-3.5 font-bold rounded-r-xl transition-colors ${
                selectedChannel === 'rythu' ? 'bg-amber-50/80 text-slate-950 font-bold' : 'text-slate-500'
              }`}>
                {t.simulation.pathRythu}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
            {/* Row 1: Gross Realization */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="p-3.5 font-semibold text-slate-900 flex items-center gap-2">
                <Icon name="payments" size={16} className="text-slate-400" />
                <span>{t.simulation.rows.grossOffer}</span>
              </td>
              <td className="p-3.5 font-mono font-bold text-slate-900 bg-slate-50/30 border-l border-r border-slate-100">
                ₹18.20 / {t.common.kg}
              </td>
              <td className="p-3.5 font-mono font-bold text-emerald-700">
                ₹20.10 / {t.common.kg}
              </td>
              <td className="p-3.5 font-mono font-bold text-slate-900">
                ₹22.50 / {t.common.kg}
              </td>
            </tr>

            {/* Row 2: Transport Logistics Cost */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="p-3.5 font-semibold text-slate-900 flex items-center gap-2">
                <Icon name="local_shipping" size={16} className="text-slate-400" />
                <span>{t.simulation.rows.transportCost}</span>
              </td>
              <td className="p-3.5 font-mono text-slate-800 bg-slate-50/30 border-l border-r border-slate-100">
                ₹1.20 / {t.common.kg} <span className="text-slate-400 text-xs block">({t.simulation.subtexts.pickupIncluded})</span>
              </td>
              <td className="p-3.5 font-mono text-slate-800">
                <span id="fpoTransportCostDisplay" className="font-bold text-emerald-700">
                  ₹{transportCost.toFixed(2)}
                </span>{' '}
                / {t.common.kg} <span className="text-slate-400 text-xs block">({t.simulation.subtexts.farmerHauls})</span>
              </td>
              <td className="p-3.5 font-mono text-slate-800">
                ₹4.10 / {t.common.kg} <span className="text-slate-400 text-xs block">({t.simulation.subtexts.autoRental})</span>
              </td>
            </tr>

            {/* Row 3: Expected Transit Wastage */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="p-3.5 font-semibold text-slate-900 flex items-center gap-2">
                <Icon name="delete_sweep" size={16} className="text-slate-400" />
                <span>{t.simulation.rows.transitWastage}</span>
              </td>
              <td className="p-3.5 font-mono text-slate-800 bg-slate-50/30 border-l border-r border-slate-100">
                3.0% ({t.simulation.subtexts.traderAbsorbs})
              </td>
              <td className="p-3.5 font-mono text-slate-800">
                <span id="fpoWastageDisplay" className="font-bold text-emerald-700">
                  {wastagePercent.toFixed(1)}%
                </span>{' '}
                ({t.simulation.subtexts.gradedCrates})
              </td>
              <td className="p-3.5 font-mono text-slate-800">
                5.5% ({t.simulation.subtexts.exposedCrates})
              </td>
            </tr>

            {/* Row 4: Settlement / Payment Cycle */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="p-3.5 font-semibold text-slate-900 flex items-center gap-2">
                <Icon name="schedule" size={16} className="text-slate-400" />
                <span>{t.simulation.rows.paymentCycle}</span>
              </td>
              <td className="p-3.5 font-medium text-emerald-700 bg-slate-50/30 border-l border-r border-slate-100">
                2 Days ({t.simulation.subtexts.instantCash})
              </td>
              <td className="p-3.5 font-medium text-slate-800">
                7 Days ({t.simulation.subtexts.bankNeft})
              </td>
              <td className="p-3.5 font-medium text-emerald-700">
                Immediate ({t.simulation.subtexts.endOfDayCash})
              </td>
            </tr>

            {/* Row 5: Minimum Quantity Lot */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="p-3.5 font-semibold text-slate-900 flex items-center gap-2">
                <Icon name="scale" size={16} className="text-slate-400" />
                <span>{t.simulation.rows.minLot}</span>
              </td>
              <td className="p-3.5 font-medium text-slate-800 bg-slate-50/30 border-l border-r border-slate-100">
                {batchQuantityKg} {t.common.kg} ({t.simulation.subtexts.fullLot})
              </td>
              <td className="p-3.5 font-medium text-amber-700">
                1,000 {t.common.kg} min ({t.simulation.subtexts.requiresPool})
              </td>
              <td className="p-3.5 font-medium text-slate-500">
                {t.simulation.subtexts.maxCapacity}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sliders & Calculated Outcome */}
      <SensitivitySliders
        transportCost={transportCost}
        wastagePercent={wastagePercent}
        batchQuantityKg={batchQuantityKg}
        holdingHours={holdingHours}
        selectedChannel={selectedChannel}
        netOutcome={netOutcome}
        netDifference={netDifference}
        isSurplus={isSurplus}
        onTransportChange={onTransportChange}
        onWastageChange={onWastageChange}
        onQuantityChange={onQuantityChange}
        onHoldingChange={onHoldingChange}
        onChannelSelect={onChannelSelect}
        onResetDefaults={onResetDefaults}
        language={activeLanguage}
      />
    </section>
  );
};

export default SimulationWorkbench;
