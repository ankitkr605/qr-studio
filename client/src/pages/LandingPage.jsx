import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Layers,
  Palette,
  RefreshCw,
  BarChart3,
  Download,
  FolderKanban,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { renderQrToCanvas } from '../utils/qrRenderer';

const FEATURES = [
  {
    icon: Layers,
    title: 'Multiple QR Types',
    description:
      'Generate QR codes for URLs, Wi-Fi, vCards, UPI payments, WhatsApp, SMS, events, Google Maps, PDFs, and more.',
  },
  {
    icon: Palette,
    title: 'Custom QR Designs',
    description:
      'Tailor foreground/background colors, dot shapes, corner finder styles, margins, titles, and center brand logos.',
  },
  {
    icon: RefreshCw,
    title: 'Dynamic QR Codes',
    description:
      'Update destination links anytime without reprinting. Toggle activation status or schedule expiration dates.',
  },
  {
    icon: BarChart3,
    title: 'Scan Analytics',
    description:
      'Track total scans, timestamps, device categories, browsers, operating systems, and regions with visual charts.',
  },
  {
    icon: Download,
    title: 'High-Quality Downloads',
    description:
      'Export crisp raster PNG, scalable vector SVG, and print-ready PDF files in one click with live contrast checks.',
  },
  {
    icon: FolderKanban,
    title: 'Easy QR Management',
    description:
      'Organize, search, filter, sort, and manage all your dynamic QR campaigns from a unified SaaS dashboard.',
  },
];

const STEPS = [
  { step: '01', title: 'Select your QR type.', desc: 'Choose from 13 specialized static or dynamic QR formats.' },
  { step: '02', title: 'Enter your information.', desc: 'Fill in validated fields with instant live payload encoding.' },
  { step: '03', title: 'Customize your QR code.', desc: 'Pick colors, dot patterns, corner styles, and upload your logo.' },
  { step: '04', title: 'Download or save it.', desc: 'Export as PNG, SVG, or PDF — or save as a trackable dynamic QR.' },
];

export default function LandingPage() {
  const [heroUrl, setHeroUrl] = useState('https://qrstudio.app');
  const [heroColor, setHeroColor] = useState('#4f46e5');
  const [heroDotStyle, setHeroDotStyle] = useState('rounded');
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    if (!previewCanvasRef.current) return;
    renderQrToCanvas(previewCanvasRef.current, heroUrl.trim() || 'https://qrstudio.app', {
      fgColor: heroColor,
      bgColor: '#ffffff',
      size: 220,
      ecc: 'M',
      margin: 2,
      dotStyle: heroDotStyle,
      cornerStyle: 'rounded',
      title: 'QR Studio Preview',
    });
  }, [heroUrl, heroColor, heroDotStyle]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(79,70,229,0.12),_transparent_55%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5" />
              Static & Dynamic QR Platform
            </span>

            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Create Smart QR Codes in Seconds
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Generate, customize, and manage QR codes for your business, website, payments, and everyday needs.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/generator" className="btn-primary px-6 py-3.5 text-base shadow-glow">
                Generate QR Code
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="btn-secondary px-6 py-3.5 text-base">
                Explore Features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free static QR codes without login
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Editable dynamic redirects
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> PNG, SVG & PDF export
              </span>
            </div>
          </div>

          {/* Interactive Hero QR Preview */}
          <div className="lg:col-span-5">
            <div className="card relative mx-auto max-w-md border-slate-200/90 p-6 shadow-xl dark:border-slate-800">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Interactive Preview
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  Live Render
                </span>
              </div>

              <div className="flex justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <canvas ref={previewCanvasRef} className="rounded-xl shadow-sm" />
              </div>

              <div className="mt-4 space-y-3">
                <input
                  type="url"
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  placeholder="Enter a URL to preview..."
                  className="input-field text-xs"
                  aria-label="Preview URL"
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {['#4f46e5', '#0f172a', '#059669', '#dc2626'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setHeroColor(color)}
                        className={`h-7 w-7 rounded-lg border-2 transition ${
                          heroColor === color ? 'scale-110 border-slate-900 dark:border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-1">
                    {['square', 'rounded', 'dots'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setHeroDotStyle(style)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize ${
                          heroDotStyle === style
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Everything You Need for Modern QR Workflows
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Built for marketers, restaurants, developers, and businesses that need reliable, customizable QR infrastructure.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="card group p-6 transition-all hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/15 dark:text-brand-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-slate-200/80 bg-white py-20 dark:border-slate-800/80 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Launch a custom static or dynamic QR code in four effortless steps.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <div key={item.step} className="card relative p-6">
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                  STEP {item.step}
                </span>
                <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Ready to Create Your First Smart QR Code?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-brand-100 sm:text-base">
            Start generating static QR codes for free right now, or create an account for dynamic links and analytics.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/generator"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-sm transition hover:bg-brand-50"
            >
              Open QR Generator
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
