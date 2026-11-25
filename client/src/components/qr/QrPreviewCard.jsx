import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Copy, Check, ShieldCheck, AlertTriangle, Sparkles, Save } from 'lucide-react';
import {
  renderQrToCanvas,
  downloadQrPng,
  downloadQrSvg,
  downloadQrPdf,
} from '../../utils/qrRenderer';
import { checkQrScannability } from '../../utils/validators';
import { useToast } from '../ui/Toast';

export default function QrPreviewCard({
  encodedContent,
  isValid,
  design,
  mode = 'static',
  onSaveDynamic,
  savingDynamic = false,
  savedCodeId = null,
}) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const scannability = useMemo(
    () =>
      checkQrScannability({
        fgColor: design.fgColor,
        bgColor: design.bgColor,
        hasLogo: Boolean(design.logoDataUrl),
        logoSizePct: design.logoSizePct,
        ecc: design.ecc,
      }),
    [design]
  );

  const renderValue = isValid && encodedContent ? encodedContent : 'https://qrstudio.app';

  useEffect(() => {
    if (!canvasRef.current) return;
    renderQrToCanvas(canvasRef.current, renderValue, design);
  }, [renderValue, design]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(renderValue);
      setCopied(true);
      showToast('Encoded QR content copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Unable to copy to clipboard', 'error');
    }
  };

  const baseName = (design.title || 'qr-studio-code')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'qr-studio-code';

  const handleDownload = async (format) => {
    if (!isValid) {
      showToast('Please fix validation errors before downloading.', 'error');
      return;
    }
    try {
      if (format === 'png') await downloadQrPng(renderValue, design, baseName);
      if (format === 'svg') downloadQrSvg(renderValue, design, baseName);
      if (format === 'pdf') await downloadQrPdf(renderValue, design, baseName);
      showToast(`Downloaded QR code as ${format.toUpperCase()}`);
    } catch {
      showToast(`Failed to export ${format.toUpperCase()}`, 'error');
    }
  };

  return (
    <div className="card sticky top-24 flex flex-col items-center p-6">
      <div className="mb-4 flex w-full items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          {mode === 'dynamic' ? 'Dynamic Preview' : 'Live Static Preview'}
        </span>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            scannability.isHealthy
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
          }`}
        >
          {scannability.isHealthy ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5" /> Scannable ({scannability.contrast}:1)
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5" /> Low Contrast
            </>
          )}
        </span>
      </div>

      {/* Canvas Container */}
      <div className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
        <canvas
          ref={canvasRef}
          className={`max-w-full rounded-xl shadow-sm transition-opacity ${
            isValid ? 'opacity-100' : 'opacity-45'
          }`}
          style={{ height: 'auto' }}
        />
        {!isValid && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <span className="rounded-xl bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-md dark:bg-slate-900/95 dark:text-slate-200">
              Complete the required fields to preview your QR code
            </span>
          </div>
        )}
      </div>

      {/* Scannability Warnings */}
      {scannability.warnings.length > 0 && (
        <div className="mt-3 w-full rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          {scannability.warnings.map((w, i) => (
            <p key={i}>• {w}</p>
          ))}
        </div>
      )}

      {/* Encoded Payload Box */}
      <div className="mt-4 w-full">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60">
          <span className="truncate font-mono text-xs text-slate-600 dark:text-slate-300">
            {renderValue}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Save Dynamic QR Action */}
      {mode === 'dynamic' && onSaveDynamic && (
        <button
          type="button"
          disabled={!isValid || savingDynamic}
          onClick={onSaveDynamic}
          className="btn-primary mt-4 w-full py-3"
        >
          <Save className="h-4 w-4" />
          {savingDynamic ? 'Creating Dynamic QR...' : savedCodeId ? 'Dynamic QR Saved!' : 'Save & Activate Dynamic QR'}
        </button>
      )}

      {/* Export Buttons */}
      <div className="mt-4 grid w-full grid-cols-3 gap-2">
        <button
          type="button"
          disabled={!isValid}
          onClick={() => handleDownload('png')}
          className="btn-secondary px-3 py-2.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          PNG
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={() => handleDownload('svg')}
          className="btn-secondary px-3 py-2.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          SVG
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={() => handleDownload('pdf')}
          className="btn-secondary px-3 py-2.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          PDF
        </button>
      </div>
    </div>
  );
}
