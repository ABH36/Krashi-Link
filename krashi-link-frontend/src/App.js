import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LocaleProvider } from './context/LocaleContext';
import Navbar from './components/common/Navbar';
import LoadingSpinner from './components/common/Loader';
import InstallPWA from './components/common/InstallPWA'; // IMPORT ADDED
import UpdateToast from './components/common/UpdateToast'; // IMPORT ADDED
import * as serviceWorkerRegistration from './serviceWorkerRegistration';


// ... (Baki saare Lazy Imports same rahenge - Login, Dashboard etc.) ...
const AdminBroadcast = React.lazy(() => import('./pages/Admin/Broadcast'));
const AdminActivityLogs = React.lazy(() => import('./pages/Admin/ActivityLogs'));
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const FarmerDashboard = React.lazy(() => import('./pages/Farmer/Dashboard'));
const OwnerDashboard = React.lazy(() => import('./pages/Owner/Dashboard'));
const AdminDashboard = React.lazy(() => import('./pages/Admin/Dashboard'));
const FarmerMachines = React.lazy(() => import('./pages/Farmer/Machines'));
const OwnerMyMachines = React.lazy(() => import('./pages/Owner/MyMachines'));
const FarmerBookings = React.lazy(() => import('./pages/Farmer/Bookings'));
const OwnerRequests = React.lazy(() => import('./pages/Owner/Requests'));
const AdminVerification = React.lazy(() => import('./pages/Admin/Verification'));
const AdminAnalytics = React.lazy(() => import('./pages/Admin/Analytics'));
const AdminPayouts = React.lazy(() => import('./pages/Admin/Payouts'));
const AdminDisputes = React.lazy(() => import('./pages/Admin/Disputes'));
const Booking = React.lazy(() => import('./pages/Farmer/Booking'));
const FarmerBookingDetails = React.lazy(() => import('./pages/Farmer/FarmerBookingDetails'));
const PaymentPage = React.lazy(() => import('./pages/Payment/PaymentPage'));
const PaymentSuccess = React.lazy(() => import('./pages/Payment/PaymentSuccess'));
const PaymentFailed = React.lazy(() => import('./pages/Payment/PaymentFailed'));
const PaymentHistory = React.lazy(() => import('./pages/Payment/PaymentHistory'));
const ReviewForm = React.lazy(() => import('./pages/Review/ReviewForm'));
const MyReviews = React.lazy(() => import('./pages/Review/MyReviews'));
const MachineReviews = React.lazy(() => import('./pages/Review/MachineReviews'));

// ... (ErrorBoundary, ProtectedRoute, RoleRedirect components same rahenge) ...
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 text-center"><h1>Something went wrong.</h1><button onClick={() => window.location.reload()} className="btn-primary mt-4">Reload</button></div>;
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
  if (user.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);

  // Setup Service Worker Updates
  useEffect(() => {
    serviceWorkerRegistration.register({
      onUpdate: (registration) => {
        setWaitingWorker(registration.waiting);
        setShowUpdate(true);
      },
      onSuccess: () => {
        console.log('PWA: Content is cached for offline use.');
      }
    });
  }, []);

  const updateServiceWorker = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
    window.location.reload();
  };

  return (
    <ErrorBoundary>
      <LocaleProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                
                {/* PWA Components Added Here */}
                <InstallPWA />
                {showUpdate && (
                  <UpdateToast 
                    onRefresh={updateServiceWorker} 
                    onClose={() => setShowUpdate(false)} 
                  />
                )}

                <main className="container mx-auto px-4 py-6 flex-grow">
                  <React.Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* ... All your existing routes ... */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      <Route path="/farmer/*" element={
                        <ProtectedRoute allowedRoles={['farmer']}>
                          <Routes>
                            <Route path="dashboard" element={<FarmerDashboard />} />
                            <Route path="machines" element={<FarmerMachines />} />
                            <Route path="book-machine/:machineId" element={<Booking />} />
                            <Route path="bookings" element={<FarmerBookings />} />
                            <Route path="bookings/:id" element={<FarmerBookingDetails />} />
                            <Route path="payment/:bookingId" element={<PaymentPage />} />
                            <Route path="payment-history" element={<PaymentHistory />} />
                            <Route path="review/:bookingId" element={<ReviewForm />} />
                            <Route path="my-reviews" element={<MyReviews />} />
                            <Route path="machine/:machineId/reviews" element={<MachineReviews />} />
                          </Routes>
                        </ProtectedRoute>
                      } />

                      <Route path="/owner/*" element={
                        <ProtectedRoute allowedRoles={['owner']}>
                          <Routes>
                            <Route path="dashboard" element={<OwnerDashboard />} />
                            <Route path="my-machines" element={<OwnerMyMachines />} />
                            <Route path="requests" element={<OwnerRequests />} />
                            <Route path="booking/:id" element={<FarmerBookingDetails />} />
                            <Route path="reviews" element={<MyReviews />} />
                            <Route path="machine/:machineId/reviews" element={<MachineReviews />} />
                          </Routes>
                        </ProtectedRoute>
                      } />

                      <Route path="/admin/*" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <Routes>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="verification" element={<AdminVerification />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                            <Route path="payouts" element={<AdminPayouts />} />
                            <Route path="disputes" element={<AdminDisputes />} />
                            <Route path="logs" element={<AdminActivityLogs />} />
                            <Route path="broadcast" element={<AdminBroadcast />} />
                          </Routes>
                        </ProtectedRoute>
                      } />

                      <Route path="/payment-success" element={<PaymentSuccess />} />
                      <Route path="/payment-failed" element={<PaymentFailed />} />
                      <Route path="/" element={<RoleRedirect />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </React.Suspense>
                </main>
              </div>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}

export default App;