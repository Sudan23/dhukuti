// Member status constants
export const MEMBER_STATUS = {
    ACTIVE: 'active',
    PENDING: 'pending',
};

// Member role constants
export const MEMBER_ROLE = {
    ADMIN: 'admin',
    MEMBER: 'member',
};

// API error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Your session has expired. Please login again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
    CONTRIBUTION_RECORDED: 'Contribution recorded successfully!',
    MEMBER_APPROVED: 'Member approved successfully!',
    AMOUNT_APPROVED: 'Amount change approved!',
    CIRCLE_CREATED: 'Circle created successfully!',
    MEMBER_INVITED: 'Member invited successfully!',
};
