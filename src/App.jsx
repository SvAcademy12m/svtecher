import React, { lazy, Suspense } from 'react';
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
                {/* Everything wrapped in AppLayout for Progressive Web App unification */}
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
                  
                  {/* Auth */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<RegisterPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Role redirect */}
                  <Route path="/redirect" element={<RoleRedirect />} />
                  <Route path="/dashboard" element={<RoleRedirect />} />

                  {/* Protected dashboards */}
                  <Route
                    path="/dashboard/admin"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
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