'use client';

import React from 'react';
import {
  Sprout,
  Store,
  Warehouse,
  ShoppingBag,
  Truck,
  Coins,
  Sliders,
  Clock,
  Scale,
  Trash2,
  Milestone,
  Thermometer,
  Mic,
  Save,
  Lock,
  CheckCircle2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  QrCode,
  History,
  Compass,
  BadgeCheck,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Info,
  AlertTriangle,
  Phone,
  PackageCheck,
  Radio,
  ChevronsUpDown,
  ChevronsDownUp,
  Download,
  Smartphone,
  Camera,
  LogOut,
  User,
  Plus,
  ExternalLink,
  GitBranch,
  FileText,
  RotateCcw,
  Tag,
  Calendar,
  MapPin,
  Sparkles,
  Layers,
  Leaf,
} from 'lucide-react';

export type IconName =
  | 'energy_saving_leaf'
  | 'eco'
  | 'sprout'
  | 'storefront'
  | 'warehouse'
  | 'shipping_basket'
  | 'shopping_basket'
  | 'local_shipping'
  | 'payments'
  | 'tune'
  | 'schedule'
  | 'scale'
  | 'delete_sweep'
  | 'route'
  | 'thermostat'
  | 'mic'
  | 'save'
  | 'lock'
  | 'check_circle'
  | 'check_circle_outline'
  | 'check'
  | 'close'
  | 'expand_more'
  | 'expand_less'
  | 'qr_code_scanner'
  | 'qr_code_2'
  | 'qr_code'
  | 'history'
  | 'explore'
  | 'verified'
  | 'verified_user'
  | 'arrow_forward'
  | 'help_outline'
  | 'info'
  | 'warning'
  | 'call'
  | 'inventory_2'
  | 'sensors'
  | 'unfold_more'
  | 'unfold_less'
  | 'download'
  | 'smartphone'
  | 'photo_camera'
  | 'logout'
  | 'user'
  | 'plus'
  | 'add'
  | 'external_link'
  | 'hub'
  | 'assignment'
  | 'restart_alt'
  | 'edit_note'
  | 'cloud_done'
  | 'calendar'
  | 'map_pin'
  | 'tag'
  | 'balance'
  | string;

export interface IconProps {
  readonly name: IconName;
  readonly className?: string;
  readonly size?: number;
  readonly style?: React.CSSProperties;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>> = {
  energy_saving_leaf: Leaf,
  eco: Sprout,
  sprout: Sprout,
  storefront: Store,
  warehouse: Warehouse,
  shipping_basket: ShoppingBag,
  shopping_basket: ShoppingBag,
  local_shipping: Truck,
  payments: Coins,
  tune: Sliders,
  schedule: Clock,
  scale: Scale,
  delete_sweep: Trash2,
  route: Milestone,
  thermostat: Thermometer,
  mic: Mic,
  save: Save,
  lock: Lock,
  check_circle: CheckCircle2,
  check_circle_outline: CheckCircle2,
  check: Check,
  close: X,
  expand_more: ChevronDown,
  expand_less: ChevronUp,
  qr_code_scanner: QrCode,
  qr_code_2: QrCode,
  qr_code: QrCode,
  history: History,
  explore: Compass,
  verified: BadgeCheck,
  verified_user: ShieldCheck,
  arrow_forward: ArrowRight,
  help_outline: HelpCircle,
  info: Info,
  warning: AlertTriangle,
  call: Phone,
  inventory_2: PackageCheck,
  sensors: Radio,
  unfold_more: ChevronsUpDown,
  unfold_less: ChevronsDownUp,
  download: Download,
  smartphone: Smartphone,
  photo_camera: Camera,
  logout: LogOut,
  user: User,
  plus: Plus,
  add: Plus,
  external_link: ExternalLink,
  hub: GitBranch,
  assignment: FileText,
  restart_alt: RotateCcw,
  edit_note: FileText,
  cloud_done: CheckCircle2,
  calendar: Calendar,
  map_pin: MapPin,
  tag: Tag,
  balance: Scale,
  sparkles: Sparkles,
  layers: Layers,
};

export const Icon: React.FC<IconProps> = ({ name, className = '', size = 18, style }) => {
  const normalizedKey = name.toLowerCase().trim();
  const IconComponent = ICON_MAP[normalizedKey];

  if (IconComponent) {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`} style={style}>
        <IconComponent size={size} />
      </span>
    );
  }

  // Graceful fallback: render clean SVG circle rather than leaking raw identifier string
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`} style={style}>
      <Info size={size} />
    </span>
  );
};

export default Icon;
