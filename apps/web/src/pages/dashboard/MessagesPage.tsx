import type { Message, MessageThread } from '@edit-os/core';
import { Loader2, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchMessageThreads, fetchThreadMessages, sendMessage } from '@/lib/api';
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

  useEffect(() => {
    void loadThreads().finally(() => setIsLoading(false));
  }, [loadThreads]);

  useEffect(() => {
    if (activeThreadId) {
      void fetchThreadMessages(DEMO_EVENT_ID, activeThreadId).then(setMessages);
    }
  }, [activeThreadId]);

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
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] dark:bg-neutral-950">
      <PageHeader
        eyebrow="Coordination"
        title="Messages"
        description="Vendor and team communication"
      />

      <div className="flex flex-1 border-t border-neutral-200 dark:border-neutral-800">
        <aside className="w-[280px] border-r border-neutral-200 dark:border-neutral-800">
          <div className="px-5 py-4">
            <SectionLabel>Threads</SectionLabel>
          </div>
          <div>
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
                    'w-full border-b border-neutral-200 px-5 py-4 text-left dark:border-neutral-800',
                    activeThreadId === thread.id
                      ? 'bg-neutral-100 dark:bg-neutral-900'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/40',
                  )}
                >
                  <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{thread.title}</p>
                  <p className="mt-1 line-clamp-1 text-[12px] text-neutral-500">{thread.lastMessage}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex flex-1 flex-col">
          {activeThread ? (
            <>
              <div className="border-b border-neutral-200 px-8 py-4 dark:border-neutral-800">
                <p className="text-[13px] font-medium">{activeThread.title}</p>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-8 py-6">
                {messages.map((message) => (
                  <div
                    key={message.id as string}
                    className={cn('flex', message.senderId === 'user-1' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] border px-4 py-3 text-[13px]',
                        message.isSystem
                          ? 'border-neutral-400 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300'
                          : message.senderId === 'user-1'
                            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                            : 'border-neutral-200 bg-white text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100',
                      )}
                    >
                      {!message.isSystem && message.senderId !== 'user-1' ? (
                        <p className="mb-1 text-[10px] uppercase tracking-[0.1em] opacity-60">{message.senderName}</p>
                      ) : null}
                      {message.body}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => void handleSend(e)} className="border-t border-neutral-200 px-8 py-4 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={isSending}>
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-neutral-500">Select a thread</div>
          )}
        </section>
      </div>
    </div>
  );
}
