
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DealerRoute from './components/DealerRoute';

import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import History from './pages/History';
import Upcoming from './pages/Upcoming';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AddVehicle from './pages/AddVehicle';
import EditVehicle from './pages/EditVehicle';
import AddService from './pages/AddService';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';

import DealerDashboard from './pages/dealer/DealerDashboard';
import DealerVehicles from './pages/dealer/DealerVehicles';
import DealerCustomers from './pages/dealer/DealerCustomers';
import DealerLookup from './pages/dealer/DealerLookup';
import DealerLogService from './pages/dealer/DealerLogService';
import DealerHistory from './pages/dealer/DealerHistory';
import DealerSettings from './pages/dealer/DealerSettings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected User Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
          <Route path="/vehicles/new" element={<ProtectedRoute><AddVehicle /></ProtectedRoute>} />
          <Route path="/vehicles/:id/edit" element={<ProtectedRoute><EditVehicle /></ProtectedRoute>} />
          <Route path="/services/new" element={<ProtectedRoute><AddService /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/upcoming" element={<ProtectedRoute><Upcoming /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

          {/* Dealer Routes */}
          <Route path="/dealer" element={<DealerRoute><DealerDashboard /></DealerRoute>} />
          <Route path="/dealer/vehicles" element={<DealerRoute><DealerVehicles /></DealerRoute>} />
          <Route path="/dealer/customers" element={<DealerRoute><DealerCustomers /></DealerRoute>} />
          <Route path="/dealer/lookup" element={<DealerRoute><DealerLookup /></DealerRoute>} />
          <Route path="/dealer/log-service" element={<DealerRoute><DealerLogService /></DealerRoute>} />
          <Route path="/dealer/history" element={<DealerRoute><DealerHistory /></DealerRoute>} />
          <Route path="/dealer/settings" element={<DealerRoute><DealerSettings /></DealerRoute>} />

          {/* Catch all redirect - Ideally this should redirect based on role but Navigate to '/' will hit ProtectedRoute which handles unauth */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
