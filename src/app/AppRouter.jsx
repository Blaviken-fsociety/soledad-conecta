import { BrowserRouter, Routes, Route } from 'react-router';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { BusinessDetailPageReal } from './pages/BusinessDetailPageReal';
import { LoginPage } from './pages/LoginPage';
import { ContactPage } from './pages/ContactPage';
import { EntrepreneurDashboard } from './pages/EntrepreneurDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import ScrollToTop from './components/ScrollToTop';

function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<EntrepreneurDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/marketplace" element={<Layout><MarketplacePage /></Layout>} />
        <Route path="/negocio/:id" element={<Layout><BusinessDetailPageReal /></Layout>} />
        <Route path="/contacto" element={<Layout><ContactPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
