import { supabase } from '@/lib/supabase';

export const supportService = {
  /**
   * Customer: fetch the full message thread for the current user.
   * Returns messages sorted oldest-first.
   */
  async getMyMessages() {
    const { data, error } = await supabase
      .from('support_messages')
      .select('id, user_id, sender_id, sender_role, message, is_read_by_customer, is_read_by_admin, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Customer: send a new message to support.
   * userId must be supplied by the caller (available from server session).
   */
  async sendMessage(message, userId) {
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        user_id: userId,
        sender_id: userId,
        sender_role: 'customer',
        message: message.trim(),
        is_read_by_customer: true,
        is_read_by_admin: false,
      })
      .select('id, user_id, sender_id, sender_role, message, is_read_by_customer, is_read_by_admin, created_at')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Customer: count of unread messages from admin.
   * Used for the header badge.
   */
  async getUnreadCount() {
    const { count, error } = await supabase
      .from('support_messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_role', 'admin')
      .eq('is_read_by_customer', false);

    if (error) return 0;
    return count ?? 0;
  },

  /**
   * Customer: mark all admin messages in this thread as read.
   * Call when the /support page is opened.
   */
  async markAdminMessagesAsRead() {
    const { error } = await supabase
      .from('support_messages')
      .update({ is_read_by_customer: true })
      .eq('sender_role', 'admin')
      .eq('is_read_by_customer', false);

    return !error;
  },
};
