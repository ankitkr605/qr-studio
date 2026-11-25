import { Link } from 'react-router-dom';
import { QrCode, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <QrCode className="h-4 w-4" />
              </span>
              <span className="text-slate-900 dark:text-white">QR Studio</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Smart static & dynamic QR code infrastructure with real-time, privacy-first scan analytics.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <Link to="/about" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
              About
            </Link>
            <Link to="/contact" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
              Contact
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
              Terms of Service
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-200/80 pt-6 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-500">
          © {new Date().getFullYear()} QR Studio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
