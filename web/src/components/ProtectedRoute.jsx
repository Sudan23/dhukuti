import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * ProtectedRoute component to guard routes that require authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
