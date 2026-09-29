export type Language = 'en' | 'ta';

export type DispatchChannel = 'trader' | 'fpo' | 'rythu';

// ==========================================
// SUPABASE DATABASE ENTITY TYPES
// ==========================================

export interface Profile {
  id: string;
  full_name: string;
  preferred_language: 'en' | 'ta';
  phone?: string;
  role: 'farmer' | 'trader' | 'fpo_admin' | 'inspector';
  village?: string;
  district?: string;
  created_at: string;
  updated_at: string;
}

export interface CropBatch {
  id: string;
  batch_id: string;
  user_id: string;
  crop_name: string;
  crop_name_tamil?: string;
  variety: string;
  grade: string;
  quantity_kg: number;
  harvest_date: string;
  farm_location: string;
  notes?: string;
  status: 'CREATED' | 'IN_TRANSIT' | 'AGGREGATED' | 'DELIVERED' | 'SETTLED';
  seal_signature: string;
  created_at: string;
  updated_at: string;
}

export interface ChainStage {
  id: string;
  batch_id: string;
  stage_order: number;
  stage_type: 'FARM' | 'AGGREGATION' | 'LOGISTICS' | 'MANDI' | 'RETAIL';
  stage_name: string;
  node_name?: string;
  node_name_tamil?: string;
  actor_name: string;
  location: string;
  quantity_kg?: number;
  price_per_kg?: number;
  recorded_at: string;
  timestamp?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  verified_evidence?: string[];
  estimated_variables?: string[];
  notes?: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  batch_id: string;
  stage_id?: string;
  transaction_type: 'SALE' | 'HAULAGE' | 'STORAGE' | 'CESS' | 'COMMISSION';
  quantity_kg?: number;
  price_per_kg?: number;
  total_amount: number;
  gross_amount?: number;
  net_amount?: number;
  rate_per_kg?: number;
  logistics_cost?: number;
  wastage_percent?: number;
  payment_cycle?: string;
  payment_mode?: string;
  recorded_at: string;
  notes?: string;
  created_at?: string;
}

export interface BatchNote {
  id: string;
  batch_id: string;
  user_id: string;
  note_type: 'field' | 'voice' | 'dispute' | 'general';
  note: string;
  content?: string;
  is_confidential: boolean;
  created_at: string;
}

export interface CreateBatchInput {
  cropName: string;
  cropNameTamil?: string;
  quantityKg: number;
  variety?: string;
  grade?: string;
  harvestDate?: string;
  farmLocation?: string;
  initialNote?: string;
}

// ==========================================
// WORKSTATION & PRESENTATION UI TYPES
// ==========================================

export interface BatchInfo {
  readonly lotId: string;
  readonly crop: string;
  readonly cropTamil?: string;
  readonly variety?: string;
  readonly quantityKg: number;
  readonly grade?: string;
  readonly origin: string;
  readonly harvestTime?: string;
  readonly harvestDate?: string;
  readonly farmGatePrice?: number | null;
  readonly farmgateRate?: number | null;
  readonly retailPrice?: number | null;
  readonly consumerRetailPrice?: number | null;
  readonly spreadPercent?: number | null;
  readonly sealSignature: string;
  readonly qrHash?: string;
  readonly status?: string;
  readonly owner?: string;
  readonly ownerName?: string;
  readonly createdDate?: string;
}

export interface NodeBreakdownItem {
  readonly label: string;
  readonly amount: number;
  readonly note: string;
}

export interface SupplyChainNode {
  readonly id: 'farm' | 'trader' | 'wholesaler' | 'retail';
  readonly stageNumber: number;
  readonly title: string;
  readonly titleTamil: string;
  readonly location: string;
  readonly pricePerKg: number;
  readonly quantitySummary: string;
  readonly icon: string;
  readonly delta: {
    readonly amount: number;
    readonly label: string;
    readonly labelTamil: string;
  } | null;
  readonly auditTxnId: string;
  readonly operatorName: string;
  readonly operatorRole: string;
  readonly isVerified: boolean;
  readonly acquisitionPrice: number;
  readonly transferPrice: number;
  readonly stageDelta: number;
  readonly breakdown: readonly NodeBreakdownItem[];
  readonly explainQuestion: string;
  readonly explainAnswer: string;
}

export interface ValueDistributionStage {
  readonly label: string;
  readonly labelTamil?: string;
  readonly actor: string;
  readonly actorTamil?: string;
  readonly amount: number;
  readonly percentage: number;
  readonly colorBgClass: string;
}

export interface EpistemicAuditSection {
  readonly type: 'documented' | 'modeled' | 'unknown';
  readonly title: string;
  readonly titleTamil?: string;
  readonly icon: string;
  readonly headerClass: string;
  readonly containerClass: string;
  readonly bulletColor: string;
  readonly items: readonly string[];
  readonly itemsTamil?: readonly string[];
}

export interface ComparisonRow {
  readonly factorKey: string;
  readonly factorName: string;
  readonly factorIcon: string;
  readonly currentPath: string;
  readonly currentPathSubtext?: string;
  readonly altFpo: string;
  readonly altFpoSubtext?: string;
  readonly altRythu: string;
  readonly altRythuSubtext?: string;
}

export interface DecisionOption {
  readonly letter: 'A' | 'B';
  readonly title: string;
  readonly titleTamil: string;
  readonly baselineNet: number;
  readonly advantages: readonly string[];
  readonly advantagesTamil?: readonly string[];
  readonly tradeOffs: readonly string[];
  readonly tradeOffsTamil?: readonly string[];
  readonly actionLabel: string;
  readonly actionLabelTamil: string;
  readonly isAccentButton?: boolean;
}

export interface RelationalFactor {
  readonly id: string;
  readonly label: string;
  readonly labelTamil?: string;
  readonly detail: string;
  readonly detailTamil?: string;
  readonly defaultChecked: boolean;
}

// ==========================================
// MEDIA ASSETS (Supabase Storage)
// ==========================================

export type MediaAssetType = 'crop_image' | 'pdf_report' | 'certificate' | 'receipt' | 'other';
export type StorageBucket = 'crop-images' | 'batch-documents';

export interface MediaAsset {
  id: string;
  user_id: string;
  batch_id?: string | null;
  asset_type: MediaAssetType;
  bucket_name: StorageBucket;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  description?: string | null;
  is_public: boolean;
  created_at: string;
  // Derived — not stored in DB, added client-side after getSignedUrl
  signed_url?: string;
}

export interface UploadMediaInput {
  file: File;
  batchId?: string;
  assetType: MediaAssetType;
  description?: string;
}

export interface UploadMediaResult {
  asset: MediaAsset | null;
  signedUrl: string | null;
  error: string | null;
}
