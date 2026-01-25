'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const router = useRouter();
  const { signIn, user, userRole, loading, signOut } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If user is already logged in, redirect them
  useEffect(() => {
    if (!loading && user) {
      // User is logged in, redirect to dashboard
      if (userRole === 'admin') {
        router?.push('/admin-dashboard');
      } else {
        router?.push('/customer-dashboard');
      }
    }
  }, [user, userRole, loading, router]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      setErrors({
        submit: error.message || 'Invalid email or password'
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            name="email"
            value={formData?.email}
            onChange={handleChange}
            className={`
              w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-fast
              font-body text-sm bg-surface
              ${errors?.email
                ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' :'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
              }
            `}
            placeholder="Enter your email"
          />
        </div>
        {errors?.email && (
          <p className="mt-1 text-sm text-error flex items-center gap-1">
            <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
            {errors?.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="LockClosedIcon" size={20} variant="outline" className="text-muted-foreground" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData?.password}
            onChange={handleChange}
            className={`
              w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-fast
              font-body text-sm bg-surface
              ${errors?.password
                ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' :'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
              }
            `}
            placeholder="Enter your password"
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
        {errors?.password && (
          <p className="mt-1 text-sm text-error flex items-center gap-1">
            <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
            {errors?.password}
          </p>
        )}
      </div>
      {errors?.submit && (
        <div className="p-4 rounded-lg bg-error/10 border border-error">
          <p className="text-sm text-error flex items-center gap-2">
            <Icon name="ExclamationTriangleIcon" size={20} variant="solid" />
            {errors?.submit}
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
            Signing In...
          </>
        ) : (
          <>
            <Icon name="ArrowRightOnRectangleIcon" size={20} variant="outline" />
            Sign In
          </>
        )}
      </button>
    </form>
  );
}