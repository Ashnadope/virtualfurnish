'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminProtection({ children }) {
  const router = useRouter();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    // Only check after loading is complete
    if (!loading) {
      if (!user || userRole !== 'admin') {
        router.push('/login');
      }
    }
  }, [loading, user, userRole, router]);

  if (loading) {
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
