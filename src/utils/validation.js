/**
 * Validates an email address format.
 *
 * @param {string} email
 * @returns {{ valid: boolean, message: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required.' };
  }

  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return {
      valid: false,
      message: 'Please enter a valid email address.',
    };
  }

  return { valid: true, message: '' };
}

/**
 * Validates a password for email+password authentication.
 * Rules:
 *   - At least 6 characters (Supabase default minimum)
 *
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }

  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters.' };
  }

  return { valid: true, message: '' };
}

/**
 * Checks that the confirm-password field matches the original password.
 * Call this only on the sign-up form, not on login.
 *
 * @param {string} password
 * @param {string} confirm
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePasswordMatch(password, confirm) {
  if (!confirm) {
    return { valid: false, message: 'Please confirm your password.' };
  }
  if (password !== confirm) {
    return { valid: false, message: 'Passwords do not match.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validates a non-empty display name.
 *
 * @param {string} name
 * @returns {{ valid: boolean, message: string }}
 */
export function validateName(name) {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters.' };
  }
  return { valid: true, message: '' };
}

// =====================================================
// DEPRECATED - These are no longer used (phone auth removed)
// Kept for backwards compatibility but will be removed
// =====================================================

/**
 * @deprecated Phone authentication has been replaced with email authentication
 */
export function validatePhone(phone) {
  console.warn('validatePhone is deprecated - use validateEmail instead');
  return { valid: false, message: 'Phone authentication is no longer supported. Please use email.' };
}

/**
 * @deprecated OTP is no longer used (phone auth removed)
 */
export function validateOtp(token) {
  console.warn('validateOtp is deprecated - OTP authentication is no longer used');
  return { valid: false, message: 'OTP authentication is no longer supported.' };
}
