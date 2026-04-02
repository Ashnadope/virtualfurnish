import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Breadcrumb from '@/components/common/Breadcrumb';
import SupportChat from './components/SupportChat';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Support - VirtualFurnish',
  description: 'Contact our support team.',
};

export default async function SupportPage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch messages server-side so SupportChat never needs to do an initial client fetch
  const { data: messages } = await supabase
    .from('support_messages')
    .select('id, user_id, sender_id, sender_role, message, order_id, order_number, is_read_by_customer, is_read_by_admin, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  // Mark admin messages as read while we're here server-side
  await supabase
    .from('support_messages')
    .update({ is_read_by_customer: true })
    .eq('user_id', user.id)
    .eq('sender_role', 'admin')
    .eq('is_read_by_customer', false);

  // Pre-fill text when coming from an order card
  const orderNumber = searchParams?.order;
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole="customer" />
      <Header />
      <main className="pt-16">
        <div className="p-6 max-w-3xl mx-auto">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          <SupportChat userId={user.id} initialMessages={messages ?? []} initialOrderRef={orderNumber ?? ''} />
        </div>
      </main>
    </div>
  );
}
