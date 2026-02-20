'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminProtection({ children }) {
  const router = useRouter();
  const { user, userRole, loading, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !loading && (!user || userRole !== 'admin')) {
      router.push('/login');
    }
  }, [isHydrated, loading, user, userRole, router]);

  // Only show the spinner before the very first auth check completes.
  // Token refreshes on tab focus must NOT unmount the admin content.
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

  if (!user || userRole !== 'admin') {
    return null;
  }

  return children;
}
