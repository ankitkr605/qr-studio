import { Upload, Trash2, Palette, Sparkles } from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Obsidian', fg: '#0f172a', bg: '#ffffff' },
  { name: 'Indigo', fg: '#4f46e5', bg: '#ffffff' },
  { name: 'Emerald', fg: '#047857', bg: '#ffffff' },
  { name: 'Crimson', fg: '#be123c', bg: '#ffffff' },
  { name: 'Midnight', fg: '#1e1b4b', bg: '#eef2ff' },
];

const DOT_STYLES = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'dots', label: 'Dots' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'classy', label: 'Fluid' },
];

const CORNER_STYLES = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'extra-rounded', label: 'Circle' },
];

const ECC_LEVELS = [
  { id: 'L', label: 'L (7%)' },
  { id: 'M', label: 'M (15%)' },
  { id: 'Q', label: 'Q (25%)' },
  { id: 'H', label: 'H (30%)' },
];

export default function QrCustomizer({ design, onChange }) {
  const update = (key, val) => onChange({ ...design, [key]: val });

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 2) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        ...design,
        logoDataUrl: String(reader.result || ''),
        ecc: design.ecc === 'L' || design.ecc === 'M' ? 'H' : design.ecc,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Title & Quick Presets */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            QR Code Title (Caption)
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Scan to Visit"
            maxLength={48}
            value={design.title || ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            Color Presets
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                title={preset.name}
                onClick={() => onChange({ ...design, fgColor: preset.fg, bgColor: preset.bg })}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition hover:scale-105 dark:border-slate-700"
                style={{ backgroundColor: preset.bg }}
              >
                <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: preset.fg }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Palette className="h-3.5 w-3.5" /> Foreground Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={design.fgColor}
              onChange={(e) => update('fgColor', e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0.5 dark:border-slate-700"
            />
            <input
              type="text"
              value={design.fgColor}
              onChange={(e) => update('fgColor', e.target.value)}
              className="input-field font-mono uppercase"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={design.bgColor}
              onChange={(e) => update('bgColor', e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0.5 dark:border-slate-700"
            />
            <input
              type="text"
              value={design.bgColor}
              onChange={(e) => update('bgColor', e.target.value)}
              className="input-field font-mono uppercase"
            />
          </div>
        </div>
      </div>

      {/* Dot & Corner Styles */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Dot Style
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
            {DOT_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => update('dotStyle', style.id)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                  design.dotStyle === style.id
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-300'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Corner Finder Style
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {CORNER_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => update('cornerStyle', style.id)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                  design.cornerStyle === style.id
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-300'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Size, Margin, Error Correction */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Preview Size</span>
            <span className="font-mono text-brand-600 dark:text-brand-400">{design.size}px</span>
          </label>
          <input
            type="range"
            min="220"
            max="440"
            step="10"
            value={design.size}
            onChange={(e) => update('size', Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </div>

        <div>
          <label className="mb-1.5 flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Margin (Quiet Zone)</span>
            <span className="font-mono text-brand-600 dark:text-brand-400">{design.margin}</span>
          </label>
          <input
            type="range"
            min="0"
            max="6"
            step="1"
            value={design.margin}
            onChange={(e) => update('margin', Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Error Correction
          </label>
          <select
            className="input-field py-2 text-xs"
            value={design.ecc}
            onChange={(e) => update('ecc', e.target.value)}
          >
            {ECC_LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Logo Upload */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {design.logoDataUrl ? (
              <img
                src={design.logoDataUrl}
                alt="Center logo preview"
                className="h-11 w-11 rounded-lg border border-slate-200 bg-white object-contain p-1 dark:border-slate-700"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-200/70 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                <Upload className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Center Brand Logo</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                PNG, JPG, or SVG (ECC auto-boosts to H for scannability)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="btn-secondary cursor-pointer py-1.5 text-xs">
              <Upload className="h-3.5 w-3.5" />
              {design.logoDataUrl ? 'Change Logo' : 'Upload Logo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            {design.logoDataUrl && (
              <button
                type="button"
                onClick={() => update('logoDataUrl', '')}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
        </div>

        {design.logoDataUrl && (
          <div className="mt-4">
            <label className="mb-1 flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Logo Size</span>
              <span className="font-mono text-brand-600 dark:text-brand-400">{design.logoSizePct}%</span>
            </label>
            <input
              type="range"
              min="12"
              max="30"
              step="1"
              value={design.logoSizePct}
              onChange={(e) => update('logoSizePct', Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        )}
      </div>
    </div>
  );
}
