/**
 * Get the current authenticated user from localStorage
 * @returns {Object} User object or empty object if not found/invalid
 */
export function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : {};
    } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        return {};
    }
}

/**
 * Get the authentication token from localStorage
 * @returns {string|null} JWT token or null
 */
export function getToken() {
    return localStorage.getItem('token');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token and user data
 */
export function isAuthenticated() {
    const token = getToken();
    const user = getCurrentUser();
    return !!(token && user.id);
}

/**
 * Clear authentication data from localStorage
 */
export function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

/**
 * Set authentication data in localStorage
 * @param {string} token - JWT token
 * @param {Object} user - User object
 */
export function setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}
