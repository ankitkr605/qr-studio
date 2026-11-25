import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';

export default function EditQrModal({ qr, open, onClose, onSave }) {
  const [name, setName] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (qr) {
      setName(qr.name || '');
      setDestinationUrl(qr.destinationUrl || '');
      setIsActive(Boolean(qr.isActive));
      setExpiresAt(qr.expiresAt ? new Date(qr.expiresAt).toISOString().slice(0, 16) : '');
      setError('');
    }
  }, [qr]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('QR name is required.');
      return;
    }
    if (!destinationUrl.trim()) {
      setError('Destination URL or payload is required.');
      return;
    }

    setSaving(true);
    try {
      await onSave(qr.id, {
        name: name.trim(),
        destinationUrl: destinationUrl.trim(),
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update QR code.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Dynamic QR Code"
      subtitle="Update the destination URL, status, or expiration without changing the printed QR image."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            QR Name
          </label>
          <input
            type="text"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Destination URL / Content
          </label>
          <input
            type="text"
            className="input-field"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-slate-400">
            Short link <span className="font-mono">/r/{qr?.codeId}</span> stays identical.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Expiration Date (Optional)
          </label>
          <input
            type="datetime-local"
            className="input-field"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
          <div>
            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Active Status
            </span>
            <span className="text-xs text-slate-500">
              Pause to temporarily disable redirects without deleting.
            </span>
          </div>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
