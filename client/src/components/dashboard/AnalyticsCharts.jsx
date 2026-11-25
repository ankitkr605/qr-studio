import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CHART_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

function EmptyChart({ message }) {
  return (
    <div className="flex h-60 items-center justify-center text-sm text-slate-400">
      {message || 'No scan data recorded for this period yet.'}
    </div>
  );
}

export default function AnalyticsCharts({ data }) {
  const timeline = data?.scansOverTime || [];
  const devices = data?.byDevice || [];
  const browsers = data?.byBrowser || [];
  const operatingSystems = data?.byOs || [];
  const countries = data?.byCountry || [];

  return (
    <div className="space-y-6">
      {/* Scans Over Time */}
      <div className="card p-6">
        <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">Scans Over Time</h3>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Daily scan activity across your dynamic QR links</p>
        {timeline.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(148,163,184,0.25)',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Scans"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#scanGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Breakdown Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Devices */}
        <div className="card p-6">
          <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">Device Categories</h3>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Mobile, tablet, and desktop share</p>
          {devices.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="grid items-center gap-4 sm:grid-cols-2">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={devices}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {devices.map((entry, idx) => (
                        <Cell key={entry.label} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5">
                {devices.map((item, idx) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                      />
                      {item.label}
                    </span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Browsers */}
        <div className="card p-6">
          <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">Browsers</h3>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Top scanner & client browsers</p>
          {browsers.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={browsers} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Scans" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Operating Systems */}
        <div className="card p-6">
          <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">Operating Systems</h3>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">iOS, Android, Windows, macOS, Linux</p>
          {operatingSystems.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operatingSystems} layout="vertical" margin={{ top: 8, right: 16, left: 12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis dataKey="label" type="category" width={72} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Scans" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Countries / Regions */}
        <div className="card p-6">
          <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">Approximate Country / Region</h3>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Privacy-preserving region signals (no IPs stored)</p>
          {countries.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-3">
              {countries.map((c) => {
                const max = countries[0]?.count || 1;
                const pct = Math.round((c.count / max) * 100);
                return (
                  <div key={c.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{c.label}</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{c.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
