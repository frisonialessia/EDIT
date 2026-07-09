import type { DocumentTreeNode } from '@edit-os/core';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DocumentTree } from '@/components/documents/DocumentTree';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetchDocumentTree } from '@/lib/api';

const DEMO_EVENT_ID = 'event-1';

export function DocumentsPage(): React.JSX.Element {
  const [tree, setTree] = useState<DocumentTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTree = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      setTree(await fetchDocumentTree(DEMO_EVENT_ID));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] dark:bg-neutral-950">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-neutral-950">
      <PageHeader
        eyebrow="Como Villa Gala · Secure vault"
        title="Documents"
        description="Per-event hierarchy · ACL by visibility · Plan B auto-archive on approval"
      />

      <main className="px-10 py-12">
        <DocumentTree nodes={tree} />
      </main>
    </div>
  );
}
