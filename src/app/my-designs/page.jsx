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
          .select('full_name')
          .eq('user_id', user.id)
          .single();

        if (data?.full_name) {
          const firstName = data.full_name.split(' ')[0];
          setUserName(firstName);
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
