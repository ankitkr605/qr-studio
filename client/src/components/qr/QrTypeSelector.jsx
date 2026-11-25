import {
  Globe,
  FileText,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  Contact,
  MapPin,
  IndianRupee,
  Share2,
  FileDown,
  Calendar,
} from 'lucide-react';
import { QR_TYPES } from '../../utils/qrContentBuilder';

const ICONS = {
  url: Globe,
  text: FileText,
  wifi: Wifi,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  whatsapp: MessageCircle,
  vcard: Contact,
  location: MapPin,
  upi: IndianRupee,
  social: Share2,
  pdf: FileDown,
  event: Calendar,
};

export default function QrTypeSelector({ activeType, onSelect, compact = false }) {
  return (
    <div
      className={`grid gap-2 ${
        compact ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      }`}
    >
      {QR_TYPES.map((item) => {
        const Icon = ICONS[item.id] || Globe;
        const selected = activeType === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
              selected
                ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-300'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/80'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                selected
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold">{item.label}</span>
              {!compact && (
                <span className="block truncate text-[11px] text-slate-400 dark:text-slate-500">
                  {item.shortDesc}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
