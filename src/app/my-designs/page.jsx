import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import SavedDesigns from '@/app/customer-dashboard/components/SavedDesigns';

// Force dynamic rendering — page is always user-specific
export const dynamic = 'force-dynamic';

export default async function MyDesigns() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name')
    .eq('id', user.id)
    .single();

  const userName = profile?.first_name || user.email?.split('@')?.[0] || 'Customer';

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
