'use client';

import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import SavedDesigns from '@/app/customer-dashboard/components/SavedDesigns';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MyDesigns() {
  const { user } = useAuth();
  const [userName, setUserName] = useState('Customer');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('user_profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();

        if (data?.first_name) {
          setUserName(data.first_name);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="customer" />
      <Header userRole="customer" userName={userName} />
      <main className="pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          
          <SavedDesigns showAll={true} />
        </div>
      </main>
    </div>
  );
}
