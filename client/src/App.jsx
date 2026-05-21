import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import Login          from './pages/Login';
import Signup         from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Dashboard      from './pages/Dashboard';
import Projects       from './pages/Projects';
import ProjectDetail  from './pages/ProjectDetail';
import Tasks          from './pages/Tasks';
import TaskDetail     from './pages/TaskDetail';
import Profile        from './pages/Profile';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={<PublicRoute><Login /></PublicRoute>} 
      />
      <Route 
        path="/signup" 
        element={<PublicRoute><Signup /></PublicRoute>} 
      />
      <Route 
        path="/forgot-password" 
        element={<PublicRoute><ForgotPassword /></PublicRoute>} 
      />
      <Route 
        path="/reset-password/:token" 
        element={<ResetPassword />} 
      />

      {/* Protected App Routes */}
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
