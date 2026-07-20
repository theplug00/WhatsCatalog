import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import VendorLogin from '@/pages/VendorLogin';
import VendorRegister from '@/pages/VendorRegister';
import VendorLanding from '@/pages/VendorLanding';
import VendorAdmin from '@/pages/VendorAdmin';
import VendorOrders from '@/pages/VendorOrders';
import StorePage from '@/pages/StorePage';
import VendorSubscription from '@/pages/VendorSubscription';
import SuperAdminLayout from '@/components/superadmin/SuperAdminLayout';
import SuperAdminDashboard from '@/pages/superadmin/SuperAdminDashboard';
import SuperAdminVendors from '@/pages/superadmin/SuperAdminVendors';
import SuperAdminOrders from '@/pages/superadmin/SuperAdminOrders';
import SuperAdminCustomers from '@/pages/superadmin/SuperAdminCustomers';
import SuperAdminSubscriptions from '@/pages/superadmin/SuperAdminSubscriptions';
import SuperAdminLogin from '@/pages/superadmin/SuperAdminLogin';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import SuperAdminAnalytics from '@/pages/superadmin/SuperAdminAnalytics';
import SuperAdminNotifications from '@/pages/superadmin/SuperAdminNotifications';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/vendor" element={<VendorLanding />} />
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/vendor/register" element={<VendorRegister />} />
      <Route path="/store/:slug" element={<StorePage />} />
      
      {/* ✅ Super Admin Login - Public */}
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      
      {/* ✅ Super Admin routes - Protected */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/super-admin/login" replace />} />}>
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="vendors" element={<SuperAdminVendors />} />
          <Route path="orders" element={<SuperAdminOrders />} />
          <Route path="customers" element={<SuperAdminCustomers />} />
          <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
          <Route path="analytics" element={<SuperAdminAnalytics />} />
          <Route path="notifications" element={<SuperAdminNotifications />} />
        </Route>
      </Route>
      
      {/* ✅ Vendor routes - Protected */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/vendor/login" replace />} />}>
        <Route path="/vendor/admin" element={<VendorAdmin />} />
        <Route path="/vendor/admin/orders" element={<VendorOrders />} />
        <Route path="/vendor/admin/subscription" element={<VendorSubscription />} />
      </Route>
      
      {/* 404 page */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;