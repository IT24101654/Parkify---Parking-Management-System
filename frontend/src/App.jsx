import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

import DriverDashboard from './pages/driver/DriverDashboard';
import CreateBooking from './pages/driver/CreateBooking';
import CheckoutPayment from './pages/driver/CheckoutPayment';
import TransactionHistory from './pages/driver/TransactionHistory';

import OwnerDashboard from './pages/owner/OwnerDashboard';
import PayoutTracker from './pages/owner/PayoutTracker';

import AdminDashboard from './pages/admin/AdminDashboard';
import RefundManagement from './pages/admin/RefundManagement';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="main-content">Loading session...</div>;
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />; // Redirect to home if role mismatch
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* DRIVER ROUTES */}
            <Route path="/driver/dashboard" element={
              <ProtectedRoute allowedRole="DRIVER">
                <DriverDashboard />
              </ProtectedRoute>
            } />
            <Route path="/driver/book" element={
              <ProtectedRoute allowedRole="DRIVER">
                <CreateBooking />
              </ProtectedRoute>
            } />
            <Route path="/driver/checkout/:bookingId" element={
              <ProtectedRoute allowedRole="DRIVER">
                <CheckoutPayment />
              </ProtectedRoute>
            } />
            <Route path="/driver/transactions" element={
              <ProtectedRoute allowedRole="DRIVER">
                <TransactionHistory /> {/* Placeholder for the component we will build */}
              </ProtectedRoute>
            } />

            {/* OWNER ROUTES */}
            <Route path="/owner/dashboard" element={
              <ProtectedRoute allowedRole="OWNER">
                <OwnerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/owner/payouts" element={
              <ProtectedRoute allowedRole="OWNER">
                <PayoutTracker /> {/* Placeholder for the component we will build */}
              </ProtectedRoute>
            } />

            {/* ADMIN ROUTES */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard /> {/* Placeholder */}
              </ProtectedRoute>
            } />
            <Route path="/admin/refunds" element={
              <ProtectedRoute allowedRole="ADMIN">
                <RefundManagement /> {/* Placeholder */}
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
