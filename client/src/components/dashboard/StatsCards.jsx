import { QrCode, ScanLine, Activity, TrendingUp } from 'lucide-react';

export default function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Total QR Codes',
      value: stats?.totalQrCodes ?? 0,
      icon: QrCode,
      color: 'text-brand-600 bg-brand-50 dark:bg-brand-500/15 dark:text-brand-400',
    },
    {
      label: 'Total Scans',
      value: stats?.totalScans ?? 0,
      icon: ScanLine,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400',
    },
    {
      label: 'Active QR Codes',
      value: stats?.activeQrCodes ?? 0,
      icon: Activity,
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/15 dark:text-violet-400',
    },
    {
      label: 'Avg. Scans / QR',
      value:
        stats?.totalQrCodes > 0
          ? (stats.totalScans / stats.totalQrCodes).toFixed(1)
          : '0.0',
      icon: TrendingUp,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
