'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return `Yesterday ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function AdminSupportInteractive({ adminId }) {
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(
    () => searchParams?.get('user') || null
  );
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    setThreadsLoading(true);
    try {
      const res = await fetch('/api/support/admin/threads');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setThreads(json.threads ?? []);
    } catch (err) {
      setError('Could not load support threads.');
    } finally {
      setThreadsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedUserId) return;
    fetchMessages(selectedUserId);
    markThreadAsRead(selectedUserId);
  }, [selectedUserId]);

  const fetchMessages = async (userId) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/support/admin/messages?userId=${userId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMessages(json.messages ?? []);
    } catch {
      setError('Could not load messages.');
    } finally {
      setMessagesLoading(false);
    }
  };

  const markThreadAsRead = async (userId) => {
    try {
      await fetch('/api/support/admin/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setThreads(prev => prev.map(t => t.userId === userId ? { ...t, unreadCount: 0 } : t));
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectThread = (userId) => {
    setSelectedUserId(userId);
    setReply('');
    setError(null);
  };

  const handleSendReply = async () => {
    const trimmed = reply.trim();
    if (!trimmed || sending || !selectedUserId) return;

    setSending(true);
    setError(null);

    const optimistic = {
      id: `opt-${Date.now()}`,
      sender_role: 'admin',
      message: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setReply('');

    try {
      const res = await fetch('/api/support/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, message: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setMessages(prev => prev.map(m => m.id === optimistic.id ? json.message : m));
      setThreads(prev => prev.map(t =>
        t.userId === selectedUserId
          ? { ...t, lastMessage: trimmed, lastMessageAt: new Date().toISOString(), lastSenderRole: 'admin' }
          : t
      ));
    } catch {
      setError('Failed to send reply.');
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setReply(trimmed);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const selectedThread = threads.find(t => t.userId === selectedUserId);

  return (
    <div
      className="flex bg-surface border border-border rounded-xl overflow-hidden shadow-sm"
      style={{ height: 'calc(100vh - 11rem)' }}
    >
      {/* Thread list */}
      <div className="w-80 flex-shrink-0 border-r border-border flex flex-col">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className="font-heading font-semibold text-foreground text-sm">Customer Threads</h2>
          <button
            onClick={fetchThreads}
            className="p-1.5 rounded-md hover:bg-muted transition-fast text-muted-foreground hover:text-foreground"
            aria-label="Refresh"
          >
            <Icon name="ArrowPathIcon" size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {threadsLoading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading…</span>
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-2">
              <Icon name="ChatBubbleLeftIcon" size={32} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No customer messages yet</p>
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.userId}
                onClick={() => handleSelectThread(thread.userId)}
                className={`w-full text-left px-5 py-4 border-b border-border/50 transition-fast hover:bg-muted/60 ${
                  selectedUserId === thread.userId ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-xs">
                        {(thread.customer?.fullName || thread.customer?.email || '?')[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {thread.customer?.fullName || thread.customer?.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {thread.lastSenderRole === 'admin' ? 'You: ' : ''}{thread.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatTime(thread.lastMessageAt)}
                    </span>
                    {thread.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Conversation panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedUserId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Icon name="ChatBubbleLeftRightIcon" size={30} className="text-muted-foreground/40" />
            </div>
            <p className="font-heading font-medium text-foreground">Select a conversation</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Choose a customer from the list to view their messages and reply.
            </p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-6 py-4 border-b border-border bg-surface flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {(selectedThread?.customer?.fullName || 'C')[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {selectedThread?.customer?.fullName || 'Customer'}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedThread?.customer?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => fetchMessages(selectedUserId)}
                  className="p-1.5 rounded-md hover:bg-muted transition-fast text-muted-foreground"
                  aria-label="Refresh messages"
                >
                  <Icon name="ArrowPathIcon" size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-muted/20">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                  No messages in this thread yet.
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender_role === 'admin';
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      {!isAdmin && (
                        <div className="w-7 h-7 bg-muted-foreground/20 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                          <Icon name="UserIcon" size={13} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="max-w-[70%]">
                        {msg.order_number && (
                          <div className={`mb-1 ${isAdmin ? 'text-right' : 'text-left ml-1'}`}>
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              <Icon name="ShoppingBagIcon" size={11} />
                              Order #{msg.order_number}
                            </span>
                          </div>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                          isAdmin
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-surface border border-border text-foreground rounded-bl-sm shadow-sm'
                        }`}>
                          {msg.message}
                        </div>
                        <p className={`text-[11px] text-muted-foreground mt-1 ${isAdmin ? 'text-right' : 'text-left ml-1'}`}>
                          {formatTime(msg.created_at)}
                          {msg.id?.startsWith('opt-') && <span className="ml-1 opacity-60">· Sending…</span>}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Error banner */}
            {error && (
              <div className="px-6 py-2 bg-red-50 border-t border-red-200 flex-shrink-0">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Reply bar */}
            <div className="px-6 py-4 border-t border-border bg-surface flex-shrink-0">
              <div className="flex items-end gap-3">
                <textarea
                  ref={textareaRef}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a reply… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors max-h-28 overflow-y-auto"
                  style={{ minHeight: '44px' }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!reply.trim() || sending}
                  className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Send reply"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon name="PaperAirplaneIcon" size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
