import type { Message, MessageThread } from '@edit-os/core';
import { Loader2, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchMessageThreads, fetchThreadMessages, sendMessage } from '@/lib/api';
import { getAvatarGradient, getInitials } from '@/lib/avatar';
import { cn } from '@/lib/utils';

const DEMO_EVENT_ID = 'event-1';

export function MessagesPage(): React.JSX.Element {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadThreads = useCallback(async (): Promise<void> => {
    const data = await fetchMessageThreads(DEMO_EVENT_ID);
    setThreads(data);
    if (!activeThreadId && data[0]) {
      setActiveThreadId(data[0].id);
    }
  }, [activeThreadId]);

  const loadMessages = useCallback(async (threadId: string): Promise<void> => {
    const data = await fetchThreadMessages(DEMO_EVENT_ID, threadId);
    setMessages(data);
  }, []);

  useEffect(() => {
    void loadThreads().finally(() => setIsLoading(false));
  }, [loadThreads]);

  useEffect(() => {
    if (activeThreadId) {
      void loadMessages(activeThreadId);
    }
  }, [activeThreadId, loadMessages]);

  async function handleSend(submitEvent: React.FormEvent): Promise<void> {
    submitEvent.preventDefault();
    if (!activeThreadId || !draft.trim()) {
      return;
    }

    setIsSending(true);
    try {
      const message = await sendMessage(DEMO_EVENT_ID, activeThreadId, draft.trim());
      setMessages((current) => [...current, message]);
      setDraft('');
      await loadThreads();
    } finally {
      setIsSending(false);
    }
  }

  const activeThread = threads.find((thread) => thread.id === activeThreadId);

  return (
    <div className="flex min-h-screen bg-[#F4F4F5] dark:bg-neutral-950">
      <aside className="w-[320px] border-r border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-950">
        <div className="border-b border-neutral-200/70 px-5 py-6 dark:border-neutral-800/70">
          <h1 className="text-[20px] font-semibold text-neutral-950 dark:text-neutral-50">Messages</h1>
          <p className="mt-1 text-[12px] text-neutral-500">Vendor & team coordination</p>
        </div>
        <div className="p-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveThreadId(thread.id)}
                className={cn(
                  'mb-2 w-full rounded-2xl px-4 py-3 text-left transition-colors',
                  activeThreadId === thread.id
                    ? 'bg-neutral-100 dark:bg-neutral-900'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50',
                )}
              >
                <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{thread.title}</p>
                <p className="mt-1 line-clamp-1 text-[12px] text-neutral-500">{thread.lastMessage}</p>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex min-h-screen flex-1 flex-col bg-white dark:bg-neutral-950">
        {activeThread ? (
          <>
            <header className="border-b border-neutral-200/70 px-8 py-5 dark:border-neutral-800/70">
              <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">{activeThread.title}</p>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-8 py-6">
              {messages.map((message) => (
                <div
                  key={message.id as string}
                  className={cn('flex', message.senderId === 'user-1' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-3xl px-4 py-3 text-[13px]',
                      message.isSystem
                        ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
                        : message.senderId === 'user-1'
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                          : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100',
                    )}
                  >
                    {!message.isSystem && message.senderId !== 'user-1' ? (
                      <p className="mb-1 text-[11px] font-medium opacity-70">{message.senderName}</p>
                    ) : null}
                    {message.body}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => void handleSend(e)} className="border-t border-neutral-200/70 px-8 py-5 dark:border-neutral-800/70">
              <div className="flex items-center gap-3 rounded-full border border-neutral-200/70 bg-neutral-50 px-4 py-2 dark:border-neutral-800/70 dark:bg-neutral-900/40">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message"
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
                <Button type="submit" size="sm" disabled={isSending} className="rounded-full shadow-none">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-neutral-500">Select a conversation</div>
        )}
      </section>
    </div>
  );
}
