'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword, verifyResetCode } = useAuth();

  // 'email' | 'code' | 'invalid-email'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSubmitError, setEmailSubmitError] = useState('');

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const codeInputRef = useRef(null);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Step 1: send the OTP email
  const handleSendCode = async (e) => {
    e.preventDefault();
    setEmailSubmitError('');

    if (!email) { setEmailError('Email is required'); return; }
    if (!validateEmail(email)) { setEmailError('Please enter a valid email address'); return; }

    setEmailLoading(true);
    const { error } = await resetPassword(email);
    setEmailLoading(false);

    if (error) {
      setEmailSubmitError(error.message || 'Failed to send code. Please try again.');
    } else {
      setStep('code');
      // Focus the code input after render
      setTimeout(() => codeInputRef.current?.focus(), 100);
    }
  };

  // Step 2: verify the code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setCodeError('');

    const trimmed = code.trim();
    if (!trimmed) { setCodeError('Please enter the code from your email'); return; }
    if (!/^\d{6}$/.test(trimmed)) { setCodeError('The code should be a 6-digit number'); return; }

    setCodeLoading(true);
    const { error } = await verifyResetCode(email, trimmed);
    setCodeLoading(false);

    if (error) {
      if (error.message?.toLowerCase().includes('expired') || error.message?.toLowerCase().includes('invalid')) {
        setCodeError('This code is invalid or has expired. Please request a new one.');
      } else {
        setCodeError(error.message || 'Incorrect code. Please try again.');
      }
    } else {
      // verifyOtp establishes a recovery session — pass flow=code so reset-password
      // knows to check the existing session instead of waiting for PASSWORD_RECOVERY event
      router.push('/reset-password?flow=code');
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

          {/* ── Step 1: email ── */}
          {step === 'email' && (
            <>
              <div className="mb-8">
                <h2 className="font-heading font-semibold text-xl text-foreground mb-2">Forgot Password?</h2>
                <p className="font-body text-sm text-muted-foreground">
                  Enter your account email and we&apos;ll send you a 6-digit verification code.
                </p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="EnvelopeIcon" size={20} variant="outline" className="text-muted-foreground" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      className={`
                        w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-fast
                        font-body text-sm bg-surface
                        ${emailError
                          ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                          : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }
                      `}
                      placeholder="Enter your email"
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                      {emailError}
                    </p>
                  )}
                </div>

                {emailSubmitError && (
                  <div className="p-4 rounded-lg bg-error/10 border border-error">
                    <p className="text-sm text-error flex items-center gap-2">
                      <Icon name="ExclamationTriangleIcon" size={20} variant="solid" />
                      {emailSubmitError}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-body font-semibold text-sm transition-fast hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {emailLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Icon name="PaperAirplaneIcon" size={20} variant="outline" />
                      Send Verification Code
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-fast">
                  <Icon name="ArrowLeftIcon" size={16} variant="outline" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}

          {/* ── Step 2: code ── */}
          {step === 'code' && (
            <>
              <div className="mb-8">
                <h2 className="font-heading font-semibold text-xl text-foreground mb-2">Enter Verification Code</h2>
                <p className="font-body text-sm text-muted-foreground">
                  We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
                  Enter it below to continue.
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-foreground mb-2">
                    Verification Code
                  </label>
                  <input
                    ref={codeInputRef}
                    type="text"
                    id="code"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                    className={`
                      w-full py-4 px-4 rounded-lg border-2 transition-fast text-center
                      font-heading font-bold text-3xl tracking-[0.5em] bg-surface
                      ${codeError
                        ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                        : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }
                    `}
                    placeholder="——————"
                  />
                  {codeError && (
                    <p className="mt-2 text-sm text-error flex items-center gap-1">
                      <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                      {codeError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={codeLoading || code.length !== 6}
                  className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-body font-semibold text-sm transition-fast hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {codeLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Icon name="ShieldCheckIcon" size={20} variant="outline" />
                      Verify Code
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-3 text-sm font-body text-muted-foreground">
                <p>
                  Didn&apos;t receive a code?{' '}
                  <button
                    onClick={() => { setStep('email'); setCode(''); setCodeError(''); }}
                    className="text-primary hover:text-primary/80 transition-fast underline"
                  >
                    Try a different email
                  </button>
                  {' '}or{' '}
                  <button
                    onClick={async () => {
                      setCode(''); setCodeError('');
                      const { error } = await resetPassword(email);
                      if (error) setCodeError('Failed to resend code. Please try again.');
                    }}
                    className="text-primary hover:text-primary/80 transition-fast underline"
                  >
                    resend code
                  </button>
                </p>
                <p className="text-xs text-center text-muted-foreground/70">
                  Check your spam folder if you don&apos;t see it in your inbox.
                </p>
              </div>
            </>
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

