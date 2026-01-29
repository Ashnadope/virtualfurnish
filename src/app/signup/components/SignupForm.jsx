'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function SignupForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const supabase = createClient();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!formData?.firstName) {
        newErrors.firstName = 'First name is required';
    }

    if (!formData?.lastName) {
        newErrors.lastName = 'Last name is required';
    }

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

    if (!formData?.confirmPassword) {
        newErrors.confirmPassword = 'Password confirmation is required';
    } else if (formData?.password !== formData?.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    const { data, error } = await signUp(formData.email, formData.password, { 
        first_name: formData.firstName, 
        last_name: formData.lastName,
        email: formData.email
    });

    if (error) {
        setErrors({ submit: error.message });
        setIsLoading(false);
        return;
    }

    // Create user profile in user_profiles table
    if (data?.user?.id) {
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: data.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'customer',
            total_orders: 0,
            total_spent: 0,
            loyalty_points: 0
          }]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          setErrors({ submit: 'Account created but profile setup failed. Please contact support.' });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error('Profile insert error:', err);
        setErrors({ submit: 'Account created but profile setup failed. Please contact support.' });
        setIsLoading(false);
        return;
      }
    }

    // Success - redirect to login
    router.push('/login?message=Signup successful! Please log in.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                First Name
                </label>
                <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData?.firstName}
                onChange={handleChange}
                className={`
                    w-full px-4 py-3 rounded-lg border-2 transition-fast
                    font-body text-sm bg-surface
                    ${errors?.firstName
                        ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' :'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }
                `}
                placeholder="Enter your first name"
                />
                {errors?.firstName && (
                <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                    {errors?.firstName}
                </p>
                )}
            </div>
            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                Last Name
                </label>
                <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData?.lastName}
                onChange={handleChange}
                className={`
                    w-full px-4 py-3 rounded-lg border-2 transition-fast
                    font-body text-sm bg-surface
                    ${errors?.lastName
                        ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' :'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }
                `}
                placeholder="Enter your last name"
                />
                {errors?.lastName && (
                <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                    {errors?.lastName}
                </p>
                )}
            </div>
        </div>
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
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="LockClosedIcon" size={20} variant="outline" className="text-muted-foreground" />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData?.confirmPassword}
            onChange={handleChange}
            className={`
              w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-fast
              font-body text-sm bg-surface
              ${errors?.confirmPassword
                ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' :'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
              }
            `}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <Icon
              name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'}
              size={20}
              variant="outline"
              className="text-muted-foreground hover:text-foreground transition-fast"
            />
          </button>
        </div>
        {errors?.confirmPassword && (
          <p className="mt-1 text-sm text-error flex items-center gap-1">
            <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
            {errors?.confirmPassword}
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
            Creating Account...
          </>
        ) : (
          <>
            <Icon name="UserPlusIcon" size={20} variant="outline" />
            Create Account
          </>
        )}
      </button>
    </form>
  );
}