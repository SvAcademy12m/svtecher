import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ROLES } from './core/utils/constants';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRedirect from './routes/RoleRedirect';
import Spinner from './components/ui/Spinner';
import ScrollToTop from './components/utils/ScrollToTop';
import { AnimatePresence, motion } from 'framer-motion';

// Lazy load pages
const HomePage = lazy(() => import('./pages/home/HomePage'));
const CoursesPage = lazy(() => import('./pages/courses/CoursesPage'));
const JobsPage = lazy(() => import('./pages/jobs/JobsPage'));
const BlogPage = lazy(() => import('./pages/blog/BlogPage'));
const PostPage = lazy(() => import('./pages/blog/PostPage'));
const ServicesPage = lazy(() => import('./pages/services/ServicesPage'));
const AboutPage = lazy(() => import('./pages/about/AboutPage'));
const ContactPage = lazy(() => import('./pages/contact/ContactPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

// Lazy load dashboards
const AdminDashboard = lazy(() => import('./dashboard/admin/AdminDashboard'));
const StudentDashboard = lazy(() => import('./dashboard/student/StudentDashboard'));
const JobFinderDashboard = lazy(() => import('./dashboard/jobFinder/JobFinderDashboard'));
const TrainerDashboard = lazy(() => import('./dashboard/trainer/TrainerDashboard'));
const CustomerDashboard = lazy(() => import('./dashboard/customer/CustomerDashboard'));
const SupportDashboard = lazy(() => import('./dashboard/support/SupportDashboard'));
const EmployerDashboard = lazy(() => import('./dashboard/employer/EmployerDashboard'));
const SellerDashboard = lazy(() => import('./dashboard/seller/SellerDashboard'));

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LanguageProvider>
        <CurrencyProvider>
          <ThemeProvider>
            <AuthProvider>
              <Suspense fallback={<Spinner fullScreen />}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:id" element={<PostPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile/:uid" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<RegisterPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    <Route path="/redirect" element={<RoleRedirect />} />
                    <Route path="/dashboard" element={<RoleRedirect />} />

                    <Route
                      path="/dashboard/admin"
                      element={
                        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/student"
                      element={
                        <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                          <StudentDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/jobs"
                      element={
                        <ProtectedRoute allowedRoles={[ROLES.JOB_FINDER]}>
                          <JobFinderDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/trainer"
                      element={
                        <ProtectedRoute allowedRoles={[ROLES.TRAINER]}>
                          <TrainerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/customer"
                      element={
                        <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                          <CustomerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/support"
                      element={
                        <ProtectedRoute allowedRoles={[ROLES.SUPPORT]}>
                          <SupportDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/employer"
                      element={
                        <ProtectedRoute allowedRoles={[ROLES.EMPLOYER]}>
                          <EmployerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/seller"
                      element={
                        <ProtectedRoute allowedRoles={[ROLES.SELLER]}>
                          <SellerDashboard />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Routes>
              </Suspense>

              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                toastClassName="!rounded-xl !shadow-xl !text-sm !font-medium"
              />
            </AuthProvider>
          </ThemeProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
