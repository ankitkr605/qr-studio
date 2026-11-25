import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink, BarChart2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsCards from '../components/dashboard/StatsCards';
import QrTable from '../components/dashboard/QrTable';
import EditQrModal from '../components/dashboard/EditQrModal';
import Modal from '../components/ui/Modal';
import { qrApi, REDIRECT_BASE_URL } from '../services/api';
import { useToast } from '../components/ui/Toast';

export default function DashboardPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState({ totalQrCodes: 0, totalScans: 0, activeQrCodes: 0 });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    qrType: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [editingQr, setEditingQr] = useState(null);
  const [deletingQr, setDeletingQr] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQrCodes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await qrApi.list({
        page,
        limit: 8,
        ...filters,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setStats(data.stats || { totalQrCodes: 0, totalScans: 0, activeQrCodes: 0 });
      if (data.recent) {
        setRecentItems(data.recent);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load QR codes', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filters, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQrCodes();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchQrCodes]);

  const handleFilterChange = (nextFilters) => {
    setPage(1);
    setFilters(nextFilters);
  };

  const handleEditSave = async (id, payload) => {
    await qrApi.update(id, payload);
    showToast('Dynamic QR code updated!');
    fetchQrCodes();
  };

  const handleConfirmDelete = async () => {
    if (!deletingQr) return;
    setDeleting(true);
    try {
      await qrApi.remove(deletingQr.id);
      showToast('QR code deleted.');
      setDeletingQr(null);
      fetchQrCodes();
    } catch (err) {
      showToast(err.message || 'Failed to delete QR code', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Manage your dynamic QR codes, destinations, and real-time scan activity"
      actions={
        <Link to="/generator?mode=dynamic" className="btn-primary py-2 text-xs sm:text-sm">
          <Plus className="h-4 w-4" />
          New QR Code
        </Link>
      }
    >
      <div className="space-y-6">
        <StatsCards stats={stats} />

        {/* Recent QR Codes */}
        {recentItems.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent QR Codes
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentItems.slice(0, 3).map((qr) => (
                <div key={qr.id} className="card flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{qr.name}</p>
                    <p className="truncate font-mono text-xs text-brand-600 dark:text-brand-400">
                      {REDIRECT_BASE_URL}/r/{qr.codeId}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {qr.scanCount} scans · {qr.qrType.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      to={`/dashboard/qr/${qr.id}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                      title="Analytics"
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Link>
                    <a
                      href={`${REDIRECT_BASE_URL}/r/${qr.codeId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                      title="Test Redirect"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Management Table */}
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            All Dynamic QR Codes
          </h2>
          <QrTable
            items={items}
            total={total}
            page={page}
            totalPages={totalPages}
            filters={filters}
            onFilterChange={handleFilterChange}
            onPageChange={setPage}
            onEdit={(qr) => setEditingQr(qr)}
            onDelete={(qr) => setDeletingQr(qr)}
            loading={loading}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <EditQrModal
        qr={editingQr}
        open={Boolean(editingQr)}
        onClose={() => setEditingQr(null)}
        onSave={handleEditSave}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deletingQr)}
        onClose={() => setDeletingQr(null)}
        title="Delete QR Code?"
        subtitle="This action permanently deletes the dynamic QR code and all associated scan analytics."
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete <strong>{deletingQr?.name}</strong> (
          <span className="font-mono">/r/{deletingQr?.codeId}</span>)? Printed QR codes using this link will stop redirecting.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setDeletingQr(null)} className="btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleConfirmDelete}
            className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
