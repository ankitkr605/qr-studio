import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Send } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useToast } from '../components/ui/Toast';

export function PricingPage() {
  const tiers = [
    {
      name: 'Static Free',
      price: '$0',
      period: 'forever',
      desc: 'Instant static QR generation with no account required.',
      features: [
        'All 13 QR code types',
        'Custom colors, dot & corner styles',
        'Center logo & title caption',
        'PNG, SVG & PDF downloads',
      ],
      cta: 'Start Generating',
      to: '/generator',
      highlight: false,
    },
    {
      name: 'Dynamic Pro',
      price: '$0',
      period: 'included free',
      desc: 'Full dynamic QR code management and privacy-first analytics.',
      features: [
        'Unlimited dynamic /r/:codeId redirects',
        'Edit destination URL anytime',
        'Pause, activate & set expiration dates',
        'Recharts device, OS, browser & region analytics',
      ],
      cta: 'Create Free Account',
      to: '/register',
      highlight: true,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Generate static QR codes anonymously or sign up free to unlock dynamic redirects and scan analytics.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`card flex flex-col justify-between p-8 ${
                tier.highlight ? 'border-brand-500 ring-2 ring-brand-500/20' : ''
              }`}
            >
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{tier.name}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{tier.desc}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-extrabold text-slate-900 dark:text-white">
                    {tier.price}
                  </span>
                  <span className="text-sm text-slate-500">{tier.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to={tier.to} className={`mt-8 w-full justify-center ${tier.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function StaticDocumentPage({ title, updated, sections }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <div className="card p-8 sm:p-10">
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {updated && <p className="mt-2 text-xs text-slate-400">Last updated: {updated}</p>}
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {sections.map((s) => (
              <section key={s.heading}>
                <h2 className="mb-2 text-base font-bold text-slate-900 dark:text-white">{s.heading}</h2>
                <p>{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function ContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Message received! Our team will respond shortly.');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
        <div className="card p-8">
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Contact QR Studio</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Questions about dynamic QR deployments, enterprise limits, or custom integrations? Send us a note.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              Thank you, <strong>{name}</strong>. We have logged your inquiry for <strong>{email}</strong> and will reply soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold">Your Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">Message</label>
                <textarea
                  rows={4}
                  required
                  className="input-field"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary">
                <Send className="h-4 w-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
