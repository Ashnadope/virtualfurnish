import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import AdminSupportInteractive from './components/AdminSupportInteractive';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Support Inbox - VirtualFurnish Admin',
  description: 'Manage customer support conversations.',
};

export default async function AdminSupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') redirect('/customer-dashboard');

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="admin" />
      <Header />
      <main className="pt-16">
        <div className="p-6">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          <Suspense fallback={null}>
            <AdminSupportInteractive adminId={user.id} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
