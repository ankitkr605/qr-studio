import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import QrGeneratorWidget from '../components/qr/QrGeneratorWidget';

export default function GeneratorPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'dynamic' ? 'dynamic' : 'static';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            QR Code Studio
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Generate instant static QR codes for free or save editable dynamic QR codes with live scan analytics.
          </p>
        </div>

        <QrGeneratorWidget initialMode={initialMode} />
      </main>
      <Footer />
    </div>
  );
}
