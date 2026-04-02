'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

async function fetchMessages() {
  const res = await fetch('/api/support/messages');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return `Yesterday ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SupportChat({ userId, initialMessages = [], initialOrderRef = '' }) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState('');
  const [orderRef, setOrderRef] = useState(initialOrderRef);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const sendingRef = useRef(false); // hard lock against double-fire

  // Auto-focus textarea when arriving from an order card
  useEffect(() => {
    if (initialOrderRef) textareaRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for new messages every 8 seconds while the chat is open
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(async () => {
      try {
        const data = await fetchMessages();
        setMessages(data);
      } catch { /* silent */ }
    }, 8_000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sendingRef.current) return;

    // Store order reference as a separate field (not prepended to message text)
    const fullMessage = trimmed;
    const attachedOrderRef = orderRef || null;

    sendingRef.current = true;
    setSending(true);
    setError(null);

    const optimistic = {
      id: `opt-${Date.now()}`,
      sender_role: 'customer',
      message: fullMessage,
      order_number: attachedOrderRef,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setText('');
    const savedRef = orderRef;
    setOrderRef(''); // clear chip once sent

    try {
      const res = await fetch('/api/support/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: fullMessage, order_number: attachedOrderRef }),
      });
      if (!res.ok) {
        const { error: errMsg } = await res.json().catch(() => ({}));
        throw new Error(errMsg ?? `HTTP ${res.status}`);
      }
      const saved = await res.json();
      setMessages(prev => prev.map(m => m.id === optimistic.id ? saved : m));
    } catch (err) {
      console.error('SupportChat send error:', err);
      setError(`Failed to send: ${err?.message ?? 'Unknown error'}`);
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setText(trimmed);
      setOrderRef(savedRef); // restore chip on failure
    } finally {
      sendingRef.current = false;
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col bg-surface border border-border rounded-xl overflow-hidden shadow-sm" style={{ height: 'calc(100vh - 11rem)' }}>
      {/* Thread header */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Icon name="ChatBubbleLeftRightIcon" size={18} className="text-white" />
        </div>
        <div>
          <p className="font-heading font-semibold text-foreground text-sm">Support Team</p>
          <p className="text-xs text-muted-foreground">We typically reply within a few hours</p>
        </div>
        <button
          onClick={async () => {
            try {
              const data = await fetchMessages();
              setMessages(data);
            } catch { /* silent */ }
          }}
          className="ml-auto p-1.5 rounded-md hover:bg-muted transition-fast text-muted-foreground hover:text-foreground"
          aria-label="Refresh messages"
        >
          <Icon name="ArrowPathIcon" size={15} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-muted/20">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Icon name="ExclamationCircleIcon" size={36} className="text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center">
              <Icon name="ChatBubbleLeftEllipsisIcon" size={28} className="text-muted-foreground" />
            </div>
            <p className="font-heading font-medium text-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Have a question about an order or product? Send us a message below.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCustomer = msg.sender_role === 'customer';
            return (
              <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                {!isCustomer && (
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <Icon name="UserIcon" size={13} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[72%]`}>
                  {!isCustomer && (
                    <p className="text-xs text-muted-foreground mb-1 ml-1">Support Team</p>
                  )}
                  {msg.order_number && (
                    <div className={`mb-1 ${isCustomer ? 'text-right' : 'text-left ml-1'}`}>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        <Icon name="ShoppingBagIcon" size={11} />
                        Order #{msg.order_number}
                      </span>
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isCustomer
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-surface border border-border text-foreground rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.message}
                  </div>
                  {!isCustomer && msg.order_id && msg.order_number && (
                    <div className="mt-2 ml-1">
                      <Link
                        href={`/order-history?orderId=${encodeURIComponent(msg.order_id)}&order=${encodeURIComponent(msg.order_number)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Icon name="ArrowTopRightOnSquareIcon" size={12} />
                        Open order to cancel
                      </Link>
                    </div>
                  )}
                  <p className={`text-[11px] text-muted-foreground mt-1 ${isCustomer ? 'text-right' : 'text-left ml-1'}`}>
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
      {error && messages.length > 0 && (
        <div className="px-6 py-2 bg-red-50 border-t border-red-200 flex-shrink-0">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-border bg-surface flex-shrink-0">
        {/* Order reference chip — shown when arriving from an order card */}
        {orderRef && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs font-medium text-primary">
              <Icon name="TagIcon" size={11} />
              Order #{orderRef}
              <button
                type="button"
                onClick={() => setOrderRef('')}
                className="ml-0.5 hover:opacity-60 transition-opacity"
                aria-label="Remove order reference"
              >
                <Icon name="XMarkIcon" size={11} />
              </button>
            </span>
          </div>
        )}
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors max-h-32 overflow-y-auto"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Send message"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon name="PaperAirplaneIcon" size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
