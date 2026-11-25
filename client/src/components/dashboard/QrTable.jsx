import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Edit3,
  Trash2,
  Download,
  BarChart2,
  ExternalLink,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { QR_TYPES } from '../../utils/qrContentBuilder';
import { REDIRECT_BASE_URL } from '../../services/api';
import { downloadQrPng, downloadQrSvg, downloadQrPdf } from '../../utils/qrRenderer';
import { useToast } from '../ui/Toast';

export default function QrTable({
  items = [],
  total = 0,
  page = 1,
  totalPages = 1,
  filters,
  onFilterChange,
  onPageChange,
  onEdit,
  onDelete,
  loading = false,
}) {
  const { showToast } = useToast();
  const [downloadMenuId, setDownloadMenuId] = useState(null);

  const handleCopyShortUrl = async (codeId) => {
    const url = `${REDIRECT_BASE_URL}/r/${codeId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Dynamic QR redirect URL copied');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleDownload = async (qr, format) => {
    setDownloadMenuId(null);
    const qrPayload = qr.isDynamic ? `${REDIRECT_BASE_URL}/r/${qr.codeId}` : qr.destinationUrl;
    const design = qr.customization || {};
    const filename = qr.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || qr.codeId;

    try {
      if (format === 'png') await downloadQrPng(qrPayload, design, filename);
      if (format === 'svg') downloadQrSvg(qrPayload, design, filename);
      if (format === 'pdf') await downloadQrPdf(qrPayload, design, filename);
      showToast(`Exported ${qr.name} as ${format.toUpperCase()}`);
    } catch {
      showToast('Download failed', 'error');
    }
  };

  const toggleSort = (field) => {
    const nextOrder = filters.sortBy === field && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    onFilterChange({ ...filters, sortBy: field, sortOrder: nextOrder });
  };

  const isExpired = (qr) => qr.expiresAt && new Date(qr.expiresAt) < new Date();

  return (
    <div className="card overflow-hidden">
      {/* Toolbar: Search, Filter, Sort */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input-field pl-9"
            placeholder="Search by name, URL, or ID..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input-field w-auto py-2 text-xs"
            value={filters.qrType}
            onChange={(e) => onFilterChange({ ...filters, qrType: e.target.value })}
          >
            <option value="">All QR Types</option>
            {QR_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            className="input-field w-auto py-2 text-xs"
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3.5">
                <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-white">
                  Name <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Destination</th>
              <th className="px-4 py-3.5">
                <button type="button" onClick={() => toggleSort('scanCount')} className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-white">
                  Scans <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">
                <button type="button" onClick={() => toggleSort('createdAt')} className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-white">
                  Created <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                  Loading QR codes...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                  No QR codes match your filters. Create your first dynamic QR code to start tracking scans!
                </td>
              </tr>
            ) : (
              items.map((qr) => {
                const expired = isExpired(qr);
                return (
                  <tr key={qr.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{qr.name}</div>
                      <button
                        type="button"
                        onClick={() => handleCopyShortUrl(qr.codeId)}
                        className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-brand-600 hover:underline dark:text-brand-400"
                        title="Copy short redirect URL"
                      >
                        /r/{qr.codeId} <Copy className="h-3 w-3" />
                      </button>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {qr.qrType}
                      </span>
                    </td>

                    <td className="max-w-[220px] px-4 py-3.5">
                      <div className="flex items-center gap-1.5 truncate text-xs text-slate-600 dark:text-slate-300">
                        <span className="truncate">{qr.destinationUrl}</span>
                        {/^https?:\/\//i.test(qr.destinationUrl) && (
                          <a
                            href={qr.destinationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 text-slate-400 hover:text-brand-600"
                            title="Open destination"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {qr.scanCount ?? 0}
                    </td>

                    <td className="px-4 py-3.5">
                      {expired ? (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                          Expired
                        </span>
                      ) : qr.isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Paused
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(qr.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="relative inline-flex items-center justify-end gap-1">
                        <Link
                          to={`/dashboard/qr/${qr.id}`}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-400"
                          title="View Analytics"
                        >
                          <BarChart2 className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onEdit(qr)}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                          title="Edit Destination & Status"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setDownloadMenuId(downloadMenuId === qr.id ? null : qr.id)}
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="Download QR"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {downloadMenuId === qr.id && (
                            <div className="absolute right-0 z-20 mt-1 w-28 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                              {['png', 'svg', 'pdf'].map((fmt) => (
                                <button
                                  key={fmt}
                                  type="button"
                                  onClick={() => handleDownload(qr, fmt)}
                                  className="block w-full px-3 py-1.5 text-left text-xs font-medium uppercase text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                                >
                                  {fmt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onDelete(qr)}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                          title="Delete QR"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>
          Showing page <strong>{page}</strong> of <strong>{Math.max(1, totalPages)}</strong> ({total} total)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="btn-secondary px-2.5 py-1.5 text-xs"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="btn-secondary px-2.5 py-1.5 text-xs"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
