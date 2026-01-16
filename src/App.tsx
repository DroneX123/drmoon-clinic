import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import BookingPage from './pages/BookingPage';
import OffersPage from './pages/OffersPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './components/admin/AdminLayout';
import AdminClientsPage from './pages/admin/AdminClientsPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import PageTransition from './components/PageTransition';
import { SpeedInsights } from "@vercel/speed-insights/react"

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/booking" element={<PageTransition><BookingPage /></PageTransition>} />
          <Route path="/offers" element={<PageTransition><OffersPage /></PageTransition>} />

          <Route path="/admin" element={<AdminLoginPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            <Route path="/admin/clients" element={<AdminClientsPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <SpeedInsights />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

export default App;
