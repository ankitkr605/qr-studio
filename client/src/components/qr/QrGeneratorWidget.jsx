import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Zap, Layers, Sliders, CheckCircle2, ArrowRight } from 'lucide-react';
import QrTypeSelector from './QrTypeSelector';
import QrDynamicForms from './QrDynamicForms';
import QrCustomizer from './QrCustomizer';
import QrPreviewCard from './QrPreviewCard';
import { DEFAULT_FORM_DATA, QR_TYPES, buildQrPayload } from '../../utils/qrContentBuilder';
import { DEFAULT_QR_DESIGN } from '../../utils/qrRenderer';
import { useAuth } from '../../context/AuthContext';
import { qrApi, REDIRECT_BASE_URL } from '../../services/api';
import { useToast } from '../ui/Toast';

export default function QrGeneratorWidget({ initialMode = 'static', compact = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [mode, setMode] = useState(initialMode);
  const [activeType, setActiveType] = useState('url');
  const [formsState, setFormsState] = useState(DEFAULT_FORM_DATA);
  const [design, setDesign] = useState(DEFAULT_QR_DESIGN);
  const [activeTab, setActiveTab] = useState('content'); // content | design

  // Dynamic QR metadata
  const [qrName, setQrName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [savingDynamic, setSavingDynamic] = useState(false);
  const [savedQr, setSavedQr] = useState(null);

  const currentValues = formsState[activeType] || {};
  const payload = useMemo(() => buildQrPayload(activeType, currentValues), [activeType, currentValues]);

  const activeTypeMeta = QR_TYPES.find((t) => t.id === activeType);

  const handleFormChange = (nextValues) => {
    setSavedQr(null);
    setFormsState((prev) => ({ ...prev, [activeType]: nextValues }));
  };

  const handleSelectType = (nextType) => {
    setSavedQr(null);
    setActiveType(nextType);
  };

  // When a dynamic QR is saved, preview encodes its actual short redirect URL!
  const previewContent =
    mode === 'dynamic' && savedQr
      ? `${REDIRECT_BASE_URL}/r/${savedQr.codeId}`
      : payload.content;

  const handleSaveDynamic = async () => {
    if (!user) {
      showToast('Please sign in to save and manage dynamic QR codes.', 'info');
      navigate('/login');
      return;
    }

    if (!payload.isValid) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    setSavingDynamic(true);
    try {
      const response = await qrApi.create({
        name: qrName.trim() || `${activeTypeMeta?.label || 'Dynamic'} QR`,
        qrType: activeType,
        destinationUrl: payload.destinationUrl || payload.content,
        content: payload.content,
        isDynamic: true,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        customization: design,
      });

      setSavedQr(response.qrCode);
      showToast('Dynamic QR code created! Ready to download or manage.');
    } catch (err) {
      showToast(err.message || 'Failed to save dynamic QR code', 'error');
    } finally {
      setSavingDynamic(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Left Builder Column */}
      <div className="space-y-6 lg:col-span-7 xl:col-span-8">
        {/* Static vs Dynamic Mode Switcher */}
        {!compact && (
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">QR Code Mode</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Static QR codes work forever offline. Dynamic QR codes support live editing & scan analytics.
                </p>
              </div>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('static');
                    setSavedQr(null);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                    mode === 'static'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-emerald-500" />
                  Static (Free)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('dynamic')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                    mode === 'dynamic'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 text-brand-500" />
                  Dynamic (Tracked)
                </button>
              </div>
            </div>

            {mode === 'dynamic' && !user && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-3 text-xs text-brand-800 dark:border-brand-800/60 dark:bg-brand-950/40 dark:text-brand-200">
                <span className="flex items-center gap-2 font-medium">
                  <Lock className="h-4 w-4 shrink-0" />
                  Sign in to create editable dynamic QR codes with scan analytics. Static QR codes require no login.
                </span>
                <Link to="/login" className="font-bold underline">
                  Sign in →
                </Link>
              </div>
            )}

            {mode === 'dynamic' && user && (
              <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Campaign / QR Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Spring Flyer Campaign"
                    value={qrName}
                    onChange={(e) => setQrName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>
            )}

            {savedQr && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <span className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Dynamic QR saved! Short link: <code className="font-mono">{REDIRECT_BASE_URL}/r/{savedQr.codeId}</code>
                </span>
                <Link to="/dashboard" className="inline-flex items-center gap-1 font-bold underline">
                  Manage in Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* QR Type Grid */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              1. Select QR Type
            </h2>
            <span className="text-xs text-slate-400">13 formats supported</span>
          </div>
          <QrTypeSelector activeType={activeType} onSelect={handleSelectType} compact={compact} />
        </div>

        {/* Content Form & Design Tabs */}
        <div className="card overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`flex-1 px-5 py-3.5 text-sm font-semibold transition ${
                activeTab === 'content'
                  ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              2. Enter {activeTypeMeta?.label} Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('design')}
              className={`inline-flex flex-1 items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold transition ${
                activeTab === 'design'
                  ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="h-4 w-4" />
              3. Customize Design
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {activeTab === 'content' ? (
              <QrDynamicForms
                type={activeType}
                values={currentValues}
                errors={payload.errors}
                onChange={handleFormChange}
              />
            ) : (
              <QrCustomizer design={design} onChange={setDesign} />
            )}
          </div>
        </div>
      </div>

      {/* Right Preview Column */}
      <div className="lg:col-span-5 xl:col-span-4">
        <QrPreviewCard
          encodedContent={previewContent}
          isValid={payload.isValid}
          design={design}
          mode={mode}
          onSaveDynamic={mode === 'dynamic' ? handleSaveDynamic : undefined}
          savingDynamic={savingDynamic}
          savedCodeId={savedQr?.codeId}
        />
      </div>
    </div>
  );
}
