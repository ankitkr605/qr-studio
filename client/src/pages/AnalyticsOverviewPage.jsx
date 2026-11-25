import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsCards from '../components/dashboard/StatsCards';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import { analyticsApi } from '../services/api';
import { useToast } from '../components/ui/Toast';

export default function AnalyticsOverviewPage() {
  const { showToast } = useToast();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    analyticsApi
      .overview(days)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) showToast(err.message || 'Failed to load analytics', 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [days, showToast]);

  return (
    <DashboardLayout
      title="Overall Scan Analytics"
      subtitle="Aggregated, privacy-first performance metrics across all your dynamic QR codes"
      actions={
        <select
          className="input-field w-auto py-2 text-xs font-semibold"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      }
    >
      {loading ? (
        <div className="card p-12 text-center text-sm text-slate-400">Loading analytics...</div>
      ) : (
        <div className="space-y-6">
          <StatsCards stats={data?.summary} />
          <AnalyticsCharts data={data} />

          {/* Top Performing QRs */}
          {data?.topQrCodes?.length > 0 && (
            <div className="card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <BarChart3 className="h-4 w-4 text-brand-600" />
                Top Performing QR Codes
              </h3>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.topQrCodes.map((qr) => (
                  <div key={qr.id} className="flex items-center justify-between py-3 text-sm">
                    <div className="min-w-0">
                      <Link
                        to={`/dashboard/qr/${qr.id}`}
                        className="font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                      >
                        {qr.name}
                      </Link>
                      <p className="truncate font-mono text-xs text-slate-400">/r/{qr.codeId}</p>
                    </div>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {qr.scanCount} scans
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
