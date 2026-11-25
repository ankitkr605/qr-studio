import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import LandingPage from './pages/LandingPage';
import GeneratorPage from './pages/GeneratorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsOverviewPage from './pages/AnalyticsOverviewPage';
import QrAnalyticsPage from './pages/QrAnalyticsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import { ContactPage, PricingPage, StaticDocumentPage } from './pages/InfoPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-slate-950">
        Loading QR Studio...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/generator" element={<GeneratorPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsOverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/qr/:id"
                element={
                  <ProtectedRoute>
                    <QrAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <ProtectedRoute>
                    <ProfileSettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/about"
                element={
                  <StaticDocumentPage
                    title="About QR Studio"
                    sections={[
                      {
                        heading: 'Our Mission',
                        body: 'QR Studio empowers teams, creators, and businesses to generate reliable, customizable static and dynamic QR codes without bloated software or invasive tracking.',
                      },
                      {
                        heading: 'Built for Reliability',
                        body: 'Every dynamic redirect is backed by PostgreSQL, strict URL validation against open-redirect abuse, and real-time scannability contrast checks.',
                      },
                    ]}
                  />
                }
              />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/privacy"
                element={
                  <StaticDocumentPage
                    title="Privacy Policy"
                    updated="November 2026"
                    sections={[
                      {
                        heading: 'Privacy-First Scan Analytics',
                        body: 'QR Studio records only aggregated, non-identifying scan metadata: timestamp, device category, browser family, OS family, and approximate region. We never store visitor IP addresses or third-party tracking cookies.',
                      },
                      {
                        heading: 'Account Data',
                        body: 'User passwords are encrypted with bcrypt. You can update or delete your QR codes and scan history at any time from your dashboard.',
                      },
                    ]}
                  />
                }
              />
              <Route
                path="/terms"
                element={
                  <StaticDocumentPage
                    title="Terms of Service"
                    updated="November 2026"
                    sections={[
                      {
                        heading: 'Acceptable Use',
                        body: 'You may not use QR Studio dynamic redirects to distribute malware, phishing pages, or deceptive links. Links violating safety policies may be deactivated.',
                      },
                      {
                        heading: 'Availability',
                        body: 'Static QR codes encode data directly and never depend on QR Studio servers. Dynamic QR codes remain active as long as they are enabled and not past their configured expiration date.',
                      },
                    ]}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
