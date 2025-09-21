import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import { useState } from 'react';

const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = null }) => {
  const { user, loading, isAuthenticated, hasRole, hasAnyRole, login } = useAuth();
  const [loginProcessing, setLoginProcessing] = useState(false);

  // Handle login success without page reload
  const handleLoginSuccess = (user, token) => {
    console.log('Login successful - navigating to protected content');
    // No reload needed - the auth context will update automatically
    setLoginProcessing(false);
  };

  // Show loading spinner while checking authentication
  if (loading || loginProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated()) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500">Required role: <span className="font-medium">{requiredRole}</span></p>
          <p className="text-sm text-gray-500">Your role: <span className="font-medium">{user?.role}</span></p>
        </div>
      </div>
    );
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500">Required roles: <span className="font-medium">{requiredRoles.join(', ')}</span></p>
          <p className="text-sm text-gray-500">Your role: <span className="font-medium">{user?.role}</span></p>
        </div>
      </div>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;