-- Support messaging system: one global thread per customer <-> admin
-- Each row is a single message. user_id is always the CUSTOMER's UID (identifies the thread).

CREATE TABLE IF NOT EXISTS public.support_messages (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL REFERENCES auth.users(id),
  sender_role     TEXT        NOT NULL CHECK (sender_role IN ('customer', 'admin')),
  message         TEXT        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  is_read_by_customer  BOOLEAN DEFAULT FALSE NOT NULL,
  is_read_by_admin     BOOLEAN DEFAULT FALSE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_support_messages_user_id    ON public.support_messages(user_id);
CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at DESC);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Customers: read their own thread
CREATE POLICY "support_customer_select"
  ON public.support_messages FOR SELECT
  USING (user_id = auth.uid());

-- Customers: insert a message in their own thread
CREATE POLICY "support_customer_insert"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    user_id      = auth.uid() AND
    sender_id    = auth.uid() AND
    sender_role  = 'customer'
  );

-- Customers: mark admin messages as read (update is_read_by_customer only)
CREATE POLICY "support_customer_update_read"
  ON public.support_messages FOR UPDATE
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins: full access (read all threads, insert replies, mark read)
CREATE POLICY "support_admin_select"
  ON public.support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "support_admin_insert"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    sender_role = 'admin' AND
    sender_id   = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "support_admin_update"
  ON public.support_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


