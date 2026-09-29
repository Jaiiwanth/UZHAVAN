'use client';

import { useState, useMemo, useCallback } from 'react';

export type DispatchChannel = 'trader' | 'fpo' | 'rythu';

export interface ChannelCalculation {
  readonly grossRate: number;
  readonly transportCost: number;
  readonly effectiveWastagePercent: number;
  readonly saleableWeightKg: number;
  readonly grossRevenue: number;
  readonly freightExpense: number;
  readonly netRealization: number;
  readonly netDiffVsBaseline: number;
  readonly settlementDays: string;
}

export interface SimulationState {
  readonly transportCost: number;
  readonly wastagePercent: number;
  readonly batchQuantityKg: number;
  readonly holdingHours: number;
  readonly selectedChannel: DispatchChannel;
  readonly fpoCalculation: ChannelCalculation;
  readonly traderCalculation: ChannelCalculation;
  readonly rythuCalculation: ChannelCalculation;
  readonly activeCalculation: ChannelCalculation;
  readonly netOutcome: number;
  readonly netDifference: number;
  readonly isSurplus: boolean;
  readonly setTransportCost: (cost: number) => void;
  readonly setWastagePercent: (wastage: number) => void;
  readonly setBatchQuantityKg: (qty: number) => void;
  readonly setHoldingHours: (hours: number) => void;
  readonly setSelectedChannel: (channel: DispatchChannel) => void;
  readonly resetDefaults: () => void;
}

const DEFAULT_TRANSPORT = 2.40;
const DEFAULT_WASTAGE = 2.0;
const DEFAULT_QTY = 800;
const DEFAULT_HOLDING = 0;

export function useSimulation(): SimulationState {
  const [transportCost, setTransportCost] = useState<number>(DEFAULT_TRANSPORT);
  const [wastagePercent, setWastagePercent] = useState<number>(DEFAULT_WASTAGE);
  const [batchQuantityKg, setBatchQuantityKg] = useState<number>(DEFAULT_QTY);
  const [holdingHours, setHoldingHours] = useState<number>(DEFAULT_HOLDING);
  const [selectedChannel, setSelectedChannel] = useState<DispatchChannel>('fpo');

  // Compute metrics for all 3 channels
  const calculations = useMemo(() => {
    // Moisture evaporation shrinkage over holding hours: ~0.02% per hour
    const holdingShrinkage = holdingHours * 0.02;

    // 1. Trader Baseline (Local Trader)
    const traderWastage = 3.0 + holdingShrinkage;
    const traderWeight = batchQuantityKg * (1 - traderWastage / 100);
    const traderGross = traderWeight * 18.20;
    const traderFreight = batchQuantityKg * 1.20;
    const traderNet = Math.round(traderGross - traderFreight);

    const baselineNet = traderNet;

    // 2. Alternative 1 (Salem FPO Direct)
    const fpoWastage = wastagePercent + holdingShrinkage;
    const fpoWeight = batchQuantityKg * (1 - fpoWastage / 100);
    const fpoGross = fpoWeight * 20.10;
    const fpoFreight = batchQuantityKg * transportCost;
    const fpoNet = Math.round(fpoGross - fpoFreight);
    const fpoDiff = fpoNet - baselineNet;

    // 3. Alternative 2 (District Rythu Bazaar)
    const rythuWastage = 5.5 + holdingShrinkage * 1.5;
    const rythuWeight = Math.min(batchQuantityKg, 300) * (1 - rythuWastage / 100);
    const rythuGross = rythuWeight * 22.50;
    const rythuFreight = Math.min(batchQuantityKg, 300) * 4.10;
    const rythuNet = Math.round(rythuGross - rythuFreight);
    const rythuDiff = rythuNet - Math.round(Math.min(batchQuantityKg, 300) * (1 - 0.03) * 18.20 - Math.min(batchQuantityKg, 300) * 1.20);

    const traderCalc: ChannelCalculation = {
      grossRate: 18.20,
      transportCost: 1.20,
      effectiveWastagePercent: traderWastage,
      saleableWeightKg: Math.round(traderWeight),
      grossRevenue: Math.round(traderGross),
      freightExpense: Math.round(traderFreight),
      netRealization: traderNet,
      netDiffVsBaseline: 0,
      settlementDays: '2 Days (Instant Spot Cash)',
    };

    const fpoCalc: ChannelCalculation = {
      grossRate: 20.10,
      transportCost: transportCost,
      effectiveWastagePercent: fpoWastage,
      saleableWeightKg: Math.round(fpoWeight),
      grossRevenue: Math.round(fpoGross),
      freightExpense: Math.round(fpoFreight),
      netRealization: fpoNet,
      netDiffVsBaseline: fpoDiff,
      settlementDays: '7 Days (Direct Bank NEFT)',
    };

    const rythuCalc: ChannelCalculation = {
      grossRate: 22.50,
      transportCost: 4.10,
      effectiveWastagePercent: rythuWastage,
      saleableWeightKg: Math.round(rythuWeight),
      grossRevenue: Math.round(rythuGross),
      freightExpense: Math.round(rythuFreight),
      netRealization: rythuNet,
      netDiffVsBaseline: rythuDiff,
      settlementDays: 'Immediate (End-of-day Cash)',
    };

    const activeCalc =
      selectedChannel === 'trader' ? traderCalc : selectedChannel === 'rythu' ? rythuCalc : fpoCalc;

    return {
      traderCalculation: traderCalc,
      fpoCalculation: fpoCalc,
      rythuCalculation: rythuCalc,
      activeCalculation: activeCalc,
      netOutcome: fpoNet,
      netDifference: fpoDiff,
      isSurplus: fpoDiff >= 0,
    };
  }, [transportCost, wastagePercent, batchQuantityKg, holdingHours, selectedChannel]);

  const resetDefaults = useCallback(() => {
    setTransportCost(DEFAULT_TRANSPORT);
    setWastagePercent(DEFAULT_WASTAGE);
    setBatchQuantityKg(DEFAULT_QTY);
    setHoldingHours(DEFAULT_HOLDING);
    setSelectedChannel('fpo');
  }, []);

  return {
    transportCost,
    wastagePercent,
    batchQuantityKg,
    holdingHours,
    selectedChannel,
    ...calculations,
    setTransportCost,
    setWastagePercent,
    setBatchQuantityKg,
    setHoldingHours,
    setSelectedChannel,
    resetDefaults,
  };
}
