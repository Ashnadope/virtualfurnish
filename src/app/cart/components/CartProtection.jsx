'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CartProtection({ children }) {
  const router = useRouter();
  const { user, loading, isHydrated } = useAuth();

  useEffect(() => {
    // Only redirect after auth has fully initialized
    if (isHydrated && !loading && !user) {
      router.push('/login');
    }
  }, [isHydrated, loading, user, router]);

  // Only show the full-page loading screen before the very first auth check.
  // After hydration, token refreshes must NOT unmount the cart — doing so
  // causes the cart to get stuck in an infinite loading state on tab focus.
  if (!isHydrated && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
