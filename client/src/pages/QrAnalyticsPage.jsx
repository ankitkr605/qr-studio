import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import { analyticsApi, REDIRECT_BASE_URL } from '../services/api';
import { useToast } from '../components/ui/Toast';

export default function QrAnalyticsPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    analyticsApi
      .byQrId(id, days)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) showToast(err.message || 'Failed to load QR analytics', 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, days, showToast]);

  const qr = data?.qrCode;

  return (
    <DashboardLayout
      title={qr ? `Analytics: ${qr.name}` : 'QR Code Analytics'}
      subtitle={qr ? `Redirecting /r/${qr.codeId} → ${qr.destinationUrl}` : 'Detailed scan breakdown'}
      actions={
        <div className="flex items-center gap-2">
          <select
            className="input-field w-auto py-2 text-xs font-semibold"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Link to="/dashboard" className="btn-secondary py-2 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        </div>
      }
    >
      {loading ? (
        <div className="card p-12 text-center text-sm text-slate-400">Loading QR analytics...</div>
      ) : !qr ? (
        <div className="card p-12 text-center text-sm text-slate-500">QR code not found.</div>
      ) : (
        <div className="space-y-6">
          {/* QR Summary Banner */}
          <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold uppercase text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  {qr.qrType}
                </span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {REDIRECT_BASE_URL}/r/{qr.codeId}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Destination: <span className="font-medium text-slate-900 dark:text-white">{qr.destinationUrl}</span>
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-semibold uppercase text-slate-400">Total Scans</p>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{qr.scanCount}</p>
              </div>
              <a
                href={`${REDIRECT_BASE_URL}/r/${qr.codeId}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary py-2 text-xs"
              >
                Test Link <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <AnalyticsCharts data={data} />

          {/* Recent Scans Table */}
          <div className="card overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Scan Log</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Privacy-safe telemetry only — no IP addresses or personal identifiers are stored.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Device</th>
                    <th className="px-6 py-3">Browser</th>
                    <th className="px-6 py-3">OS</th>
                    <th className="px-6 py-3">Country / Region</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {data.recentScans?.length ? (
                    data.recentScans.map((scan) => (
                      <tr key={scan.id}>
                        <td className="px-6 py-3 font-mono text-slate-700 dark:text-slate-300">
                          {new Date(scan.scannedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-3">{scan.deviceCategory}</td>
                        <td className="px-6 py-3">{scan.browserCategory}</td>
                        <td className="px-6 py-3">{scan.osCategory}</td>
                        <td className="px-6 py-3">{scan.country}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        No scans recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
