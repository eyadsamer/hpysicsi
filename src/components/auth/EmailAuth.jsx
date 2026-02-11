import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function EmailAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Validate email format
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate password strength
   */
  const isValidPassword = (password) => {
    // Minimum 6 characters (Supabase default)
    return password.length >= 6;
  };

  /**
   * Handle Sign Up
   */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // Handle specific errors
        if (error.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else if (error.message.includes('rate limit')) {
          setError('Too many signup attempts. Please try again later.');
        } else {
          setError(error.message);
        }
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setSuccessMessage('Account created! Please check your email to verify your account.');
      } else {
        // User is automatically signed in (confirmations disabled)
        setSuccessMessage('Account created successfully!');
      }

    } catch (err) {
      setError('Signup failed. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Sign In
   */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else {
          setError(error.message);
        }
        return;
      }

      // Success - user is now authenticated
      setSuccessMessage('Signed in successfully!');

    } catch (err) {
      setError('Sign in failed. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle between Sign Up and Sign In
   */
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-dark rounded-lg">
      <h2 className="font-payback text-h2 text-header mb-6">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>

      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4">
          <p className="font-inter text-body-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-success/10 border border-success text-success px-4 py-3 rounded mb-4">
          <p className="font-inter text-body-sm">{successMessage}</p>
        </div>
      )}

      <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
        {/* Email Input */}
        <div className="mb-4">
          <label className="font-inter text-body-sm text-body block mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-background border border-gray-medium rounded-lg font-inter text-body text-body focus:outline-none focus:border-primary"
            disabled={loading}
            autoComplete="email"
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="font-inter text-body-sm text-body block mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-background border border-gray-medium rounded-lg font-inter text-body text-body focus:outline-none focus:border-primary"
            disabled={loading}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
          {isSignUp && (
            <p className="font-inter text-body-sm text-gray-400 mt-2">
              Minimum 6 characters
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-primary hover:bg-primary-hover disabled:bg-gray-medium disabled:cursor-not-allowed font-rockwell text-btn text-white py-3 rounded-lg uppercase transition-colors mb-4"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        {/* Toggle Mode */}
        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="font-inter text-body-sm text-primary hover:text-primary-hover"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </form>
    </div>
  );
}
