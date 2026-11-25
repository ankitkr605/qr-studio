import { SOCIAL_PLATFORMS } from '../../utils/qrContentBuilder';

function Field({ label, error, required, children, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

export default function QrDynamicForms({ type, values = {}, errors = {}, onChange }) {
  const update = (field, value) => onChange({ ...values, [field]: value });

  switch (type) {
    case 'url':
      return (
        <div className="space-y-4">
          <Field label="Website URL" required error={errors.url} hint="Include https:// or enter a domain name.">
            <input
              type="url"
              className="input-field"
              placeholder="https://yourcompany.com/launch"
              value={values.url || ''}
              onChange={(e) => update('url', e.target.value)}
            />
          </Field>
        </div>
      );

    case 'text':
      return (
        <Field label="Plain Text Message" required error={errors.text} hint={`${(values.text || '').length}/2000 characters`}>
          <textarea
            rows={4}
            className="input-field"
            placeholder="Enter text, coupon code, instructions, or notes..."
            value={values.text || ''}
            onChange={(e) => update('text', e.target.value)}
          />
        </Field>
      );

    case 'wifi':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Network Name (SSID)" required error={errors.ssid}>
            <input
              type="text"
              className="input-field"
              placeholder="Office_Guest_5G"
              value={values.ssid || ''}
              onChange={(e) => update('ssid', e.target.value)}
            />
          </Field>
          <Field label="Encryption Type">
            <select
              className="input-field"
              value={values.encryption || 'WPA'}
              onChange={(e) => update('encryption', e.target.value)}
            >
              <option value="WPA">WPA / WPA2 / WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None (Open Network)</option>
            </select>
          </Field>
          {values.encryption !== 'nopass' && (
            <Field label="Wi-Fi Password" required error={errors.password}>
              <input
                type="text"
                className="input-field"
                placeholder="Enter Wi-Fi password"
                value={values.password || ''}
                onChange={(e) => update('password', e.target.value)}
              />
            </Field>
          )}
          <div className="flex items-center pt-5">
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={Boolean(values.hidden)}
                onChange={(e) => update('hidden', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Hidden SSID network
            </label>
          </div>
        </div>
      );

    case 'email':
      return (
        <div className="space-y-4">
          <Field label="Recipient Email" required error={errors.to}>
            <input
              type="email"
              className="input-field"
              placeholder="support@company.com"
              value={values.to || ''}
              onChange={(e) => update('to', e.target.value)}
            />
          </Field>
          <Field label="Email Subject">
            <input
              type="text"
              className="input-field"
              placeholder="Product Inquiry"
              value={values.subject || ''}
              onChange={(e) => update('subject', e.target.value)}
            />
          </Field>
          <Field label="Email Body">
            <textarea
              rows={3}
              className="input-field"
              placeholder="Hello team, I would like to learn more about..."
              value={values.body || ''}
              onChange={(e) => update('body', e.target.value)}
            />
          </Field>
        </div>
      );

    case 'phone':
      return (
        <Field label="Phone Number" required error={errors.number} hint="Include country code, e.g. +1 415 555 0199">
          <input
            type="tel"
            className="input-field"
            placeholder="+1 415 555 0199"
            value={values.number || ''}
            onChange={(e) => update('number', e.target.value)}
          />
        </Field>
      );

    case 'sms':
      return (
        <div className="space-y-4">
          <Field label="Phone Number" required error={errors.number}>
            <input
              type="tel"
              className="input-field"
              placeholder="+1 415 555 0199"
              value={values.number || ''}
              onChange={(e) => update('number', e.target.value)}
            />
          </Field>
          <Field label="Pre-filled SMS Message">
            <textarea
              rows={3}
              className="input-field"
              placeholder="Hi! Please send me the promo details."
              value={values.message || ''}
              onChange={(e) => update('message', e.target.value)}
            />
          </Field>
        </div>
      );

    case 'whatsapp':
      return (
        <div className="space-y-4">
          <Field
            label="WhatsApp Phone Number"
            required
            error={errors.number}
            hint="Include country code without spaces or dashes (e.g. +919876543210)."
          >
            <input
              type="tel"
              className="input-field"
              placeholder="+14155550199"
              value={values.number || ''}
              onChange={(e) => update('number', e.target.value)}
            />
          </Field>
          <Field label="Starter Message">
            <textarea
              rows={3}
              className="input-field"
              placeholder="Hello! I scanned your QR code."
              value={values.message || ''}
              onChange={(e) => update('message', e.target.value)}
            />
          </Field>
        </div>
      );

    case 'vcard':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name" required error={errors.firstName}>
            <input
              type="text"
              className="input-field"
              placeholder="Alex"
              value={values.firstName || ''}
              onChange={(e) => update('firstName', e.target.value)}
            />
          </Field>
          <Field label="Last Name">
            <input
              type="text"
              className="input-field"
              placeholder="Morgan"
              value={values.lastName || ''}
              onChange={(e) => update('lastName', e.target.value)}
            />
          </Field>
          <Field label="Organization">
            <input
              type="text"
              className="input-field"
              placeholder="QR Studio Inc."
              value={values.organization || ''}
              onChange={(e) => update('organization', e.target.value)}
            />
          </Field>
          <Field label="Job Title">
            <input
              type="text"
              className="input-field"
              placeholder="Product Lead"
              value={values.title || ''}
              onChange={(e) => update('title', e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              className="input-field"
              placeholder="+1 415 555 0140"
              value={values.phone || ''}
              onChange={(e) => update('phone', e.target.value)}
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <input
              type="email"
              className="input-field"
              placeholder="alex@qrstudio.app"
              value={values.email || ''}
              onChange={(e) => update('email', e.target.value)}
            />
          </Field>
          <Field label="Website" error={errors.website}>
            <input
              type="url"
              className="input-field"
              placeholder="https://qrstudio.app"
              value={values.website || ''}
              onChange={(e) => update('website', e.target.value)}
            />
          </Field>
          <Field label="Address">
            <input
              type="text"
              className="input-field"
              placeholder="548 Market St, San Francisco, CA"
              value={values.address || ''}
              onChange={(e) => update('address', e.target.value)}
            />
          </Field>
        </div>
      );

    case 'location':
      return (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update('mode', 'coords')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                (values.mode || 'coords') === 'coords'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              GPS Coordinates
            </button>
            <button
              type="button"
              onClick={() => update('mode', 'search')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                values.mode === 'search'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Place / Address
            </button>
          </div>
          {(values.mode || 'coords') === 'coords' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Latitude" required error={errors.latitude}>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  placeholder="37.7749"
                  value={values.latitude || ''}
                  onChange={(e) => update('latitude', e.target.value)}
                />
              </Field>
              <Field label="Longitude" required error={errors.longitude}>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  placeholder="-122.4194"
                  value={values.longitude || ''}
                  onChange={(e) => update('longitude', e.target.value)}
                />
              </Field>
            </div>
          ) : (
            <Field label="Address or Place Name" required error={errors.query}>
              <input
                type="text"
                className="input-field"
                placeholder="Golden Gate Bridge, San Francisco"
                value={values.query || ''}
                onChange={(e) => update('query', e.target.value)}
              />
            </Field>
          )}
        </div>
      );

    case 'upi':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="UPI ID (VPA)" required error={errors.vpa}>
            <input
              type="text"
              className="input-field"
              placeholder="merchant@okicici"
              value={values.vpa || ''}
              onChange={(e) => update('vpa', e.target.value)}
            />
          </Field>
          <Field label="Payee Name" required error={errors.name}>
            <input
              type="text"
              className="input-field"
              placeholder="QR Studio Store"
              value={values.name || ''}
              onChange={(e) => update('name', e.target.value)}
            />
          </Field>
          <Field label="Amount (INR - Optional)" error={errors.amount}>
            <input
              type="number"
              step="0.01"
              min="1"
              className="input-field"
              placeholder="499.00"
              value={values.amount || ''}
              onChange={(e) => update('amount', e.target.value)}
            />
          </Field>
          <Field label="Transaction Note">
            <input
              type="text"
              className="input-field"
              placeholder="Invoice #1042"
              value={values.note || ''}
              onChange={(e) => update('note', e.target.value)}
            />
          </Field>
        </div>
      );

    case 'social':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Social Platform">
            <select
              className="input-field"
              value={values.platform || 'instagram'}
              onChange={(e) => update('platform', e.target.value)}
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          {(values.platform || 'instagram') === 'custom' ? (
            <Field label="Profile URL" required error={errors.customUrl}>
              <input
                type="url"
                className="input-field"
                placeholder="https://threads.net/@username"
                value={values.customUrl || ''}
                onChange={(e) => update('customUrl', e.target.value)}
              />
            </Field>
          ) : (
            <Field label="Username / Handle" required error={errors.handle}>
              <input
                type="text"
                className="input-field"
                placeholder="qrstudio"
                value={values.handle || ''}
                onChange={(e) => update('handle', e.target.value)}
              />
            </Field>
          )}
        </div>
      );

    case 'pdf':
      return (
        <div className="space-y-4">
          <Field label="PDF or Document URL" required error={errors.url} hint="Link to a hosted PDF, menu, brochure, or Google Doc.">
            <input
              type="url"
              className="input-field"
              placeholder="https://example.com/menu-2026.pdf"
              value={values.url || ''}
              onChange={(e) => update('url', e.target.value)}
            />
          </Field>
          <Field label="Document Label (Optional)">
            <input
              type="text"
              className="input-field"
              placeholder="Summer Tasting Menu PDF"
              value={values.documentTitle || ''}
              onChange={(e) => update('documentTitle', e.target.value)}
            />
          </Field>
        </div>
      );

    case 'event':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Event Title" required error={errors.title}>
              <input
                type="text"
                className="input-field"
                placeholder="QR Studio Product Summit 2026"
                value={values.title || ''}
                onChange={(e) => update('title', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Start Date & Time" required error={errors.startDate}>
            <input
              type="datetime-local"
              className="input-field"
              value={values.startDate || ''}
              onChange={(e) => update('startDate', e.target.value)}
            />
          </Field>
          <Field label="End Date & Time" error={errors.endDate}>
            <input
              type="datetime-local"
              className="input-field"
              value={values.endDate || ''}
              onChange={(e) => update('endDate', e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Location / Meeting Link">
              <input
                type="text"
                className="input-field"
                placeholder="Moscone Center, San Francisco"
                value={values.location || ''}
                onChange={(e) => update('location', e.target.value)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                rows={2}
                className="input-field"
                placeholder="Keynote sessions, live demos, and networking."
                value={values.description || ''}
                onChange={(e) => update('description', e.target.value)}
              />
            </Field>
          </div>
        </div>
      );

    default:
      return null;
  }
}
