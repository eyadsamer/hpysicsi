/**
 * Maps raw Supabase / network error messages to user-friendly strings.
 *
 * @param {Error|object|string} error  - Error thrown by a Supabase call
 * @returns {string}                   - Human-readable message
 */
export function parseAuthError(error) {
  if (!error) return 'An unexpected error occurred.';

  const msg =
    typeof error === 'string'
      ? error
      : error?.message || error?.error_description || JSON.stringify(error);

  const lower = msg.toLowerCase();

  // ── OTP / phone confirmation errors ───────────────────────────────
  if (
    lower.includes('invalid otp') ||
    lower.includes('token has expired') ||
    lower.includes('otp expired')
  ) {
    return 'The code is invalid or has expired. Please try again.';
  }

  // ── Password-specific errors ──────────────────────────────────────
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Incorrect phone number or password.';
  }
  if (lower.includes('password') && lower.includes('short')) {
    return 'Password is too short. Use at least 8 characters.';
  }
  if (lower.includes('weak password') || lower.includes('password should be')) {
    return 'Password is too weak. Use at least 8 characters with letters and numbers.';
  }

  // ── Registration errors ───────────────────────────────────────────
  if (lower.includes('already registered') || lower.includes('user already exists')) {
    return 'This phone number is already registered. Use the Log-in tab.';
  }

  // ── Phone confirmation errors ─────────────────────────────────────
  if (lower.includes('phone not confirmed') || lower.includes('email not confirmed')) {
    return 'Your phone number is not confirmed yet. Please complete sign-up first.';
  }

  // ── Rate limiting ─────────────────────────────────────────────────
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many requests. Please wait a minute and try again.';
  }

  // ── Network errors ────────────────────────────────────────────────
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Check your connection and try again.';
  }

  // ── Phone format errors ───────────────────────────────────────────
  if (lower.includes('phone') && lower.includes('invalid')) {
    return 'Invalid phone number format. Use E.164 format, e.g. +201234567890';
  }

  // ── Not found ─────────────────────────────────────────────────────
  if (lower.includes('not found') || lower.includes('no rows')) {
    return 'Account not found. Please sign up first.';
  }

  // Fallback: return the raw message (still better than a stack trace)
  return msg;
}
