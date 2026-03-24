'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  // 'waiting' | 'ready' | 'success' | 'invalid'
  const [stage, setStage] = useState('waiting');
  const [invalidReason, setInvalidReason] = useState('');
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Check for error params that Supabase sends when the link is invalid/expired.
    // These can appear in both the query string AND the hash fragment.
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const errorCode = searchParams.get('error_code') || hashParams.get('error_code');

    if (errorCode) {
      const description = searchParams.get('error_description') || hashParams.get('error_description') || '';
      if (errorCode === 'otp_expired') {
        setInvalidReason(
          'This reset link has expired. Note: some email clients (e.g. Gmail) automatically scan links in emails, which can consume the one-time token before you click it. Please request a new link.'
        );
      } else {
        setInvalidReason(description.replace(/\+/g, ' ') || 'This reset link is invalid or has already been used.');
      }
      setStage('invalid');
      return;
    }

    // Code flow: verifyOtp already created a recovery session on the previous page.
    // Just confirm the session exists then go straight to ready.
    if (searchParams.get('flow') === 'code') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setStage('ready');
        } else {
          setInvalidReason('Your session has expired. Please start the reset process again.');
          setStage('invalid');
        }
      });
      return;
    }

    // Link flow: Supabase reads the access_token from the URL hash and fires PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStage('ready');
      }
    });

    // If no token arrives within 5 seconds, treat the link as invalid/expired.
    const timeout = setTimeout(() => {
      setStage((current) => current === 'waiting' ? 'invalid' : current);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirm) {
      newErrors.confirm = 'Please confirm your password';
    } else if (formData.password !== formData.confirm) {
      newErrors.confirm = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await updatePassword(formData.password);
    setIsLoading(false);

    if (error) {
      setErrors({ submit: error.message || 'Failed to update password. Please try again.' });
    } else {
      setStage('success');
      setTimeout(() => {
        router.push('/login?message=Password+updated+successfully.+You+can+now+sign+in.');
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-elevated p-8 lg:p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7L10 3L17 7V15L10 19L3 15V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11L14 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground">VirtualFurnish</h1>
              <p className="font-body text-sm text-muted-foreground">by Brosas Furniture Store</p>
            </div>
          </div>

          {/* Waiting for token */}
          {stage === 'waiting' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="font-body text-sm text-muted-foreground">Verifying your reset link...</p>
            </div>
          )}

          {/* Invalid / expired link */}
          {stage === 'invalid' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="ExclamationTriangleIcon" size={32} variant="solid" className="text-error" />
              </div>
              <h2 className="font-heading font-semibold text-xl text-foreground">Link Expired or Invalid</h2>
              <p className="font-body text-sm text-muted-foreground">
                {invalidReason || 'This password reset link has expired or is invalid. Please request a new one.'}
              </p>
              <Link
                href="/forgot-password"
                className="mt-2 inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-primary text-primary-foreground font-body font-semibold text-sm transition-fast hover:bg-primary/90"
              >
                <Icon name="ArrowPathIcon" size={18} variant="outline" />
                Request New Link
              </Link>
            </div>
          )}

          {/* Reset form */}
          {stage === 'ready' && (
            <>
              <div className="mb-8">
                <h2 className="font-heading font-semibold text-xl text-foreground mb-2">
                  Set New Password
                </h2>
                <p className="font-body text-sm text-muted-foreground">
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="LockClosedIcon" size={20} variant="outline" className="text-muted-foreground" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`
                        w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-fast
                        font-body text-sm bg-surface
                        ${errors.password
                          ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                          : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }
                      `}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <Icon
                        name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'}
                        size={20}
                        variant="outline"
                        className="text-muted-foreground hover:text-foreground transition-fast"
                      />
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-foreground mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="LockClosedIcon" size={20} variant="outline" className="text-muted-foreground" />
                    </div>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      id="confirm"
                      name="confirm"
                      value={formData.confirm}
                      onChange={handleChange}
                      className={`
                        w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-fast
                        font-body text-sm bg-surface
                        ${errors.confirm
                          ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                          : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }
                      `}
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <Icon
                        name={showConfirm ? 'EyeSlashIcon' : 'EyeIcon'}
                        size={20}
                        variant="outline"
                        className="text-muted-foreground hover:text-foreground transition-fast"
                      />
                    </button>
                  </div>
                  {errors.confirm && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                      {errors.confirm}
                    </p>
                  )}
                </div>

                {errors.submit && (
                  <div className="p-4 rounded-lg bg-error/10 border border-error">
                    <p className="text-sm text-error flex items-center gap-2">
                      <Icon name="ExclamationTriangleIcon" size={20} variant="solid" />
                      {errors.submit}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-body font-semibold text-sm transition-fast hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Icon name="CheckIcon" size={20} variant="outline" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Success */}
          {stage === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="CheckBadgeIcon" size={32} variant="solid" className="text-success" />
              </div>
              <h2 className="font-heading font-semibold text-xl text-foreground">Password Updated!</h2>
              <p className="font-body text-sm text-muted-foreground">
                Your password has been changed successfully. Redirecting you to sign in...
              </p>
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="font-body text-sm text-muted-foreground">
            © {new Date().getFullYear()} Brosas Furniture Store. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
