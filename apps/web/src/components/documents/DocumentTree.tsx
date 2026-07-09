import type { DocumentTreeNode, EventDocument } from '@edit-os/core';
import { FileText, Folder } from 'lucide-react';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { cn } from '@/lib/utils';

interface DocumentTreeProps {
  nodes: readonly DocumentTreeNode[];
  depth?: number;
}

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  }
  if (bytes >= 1_000) {
    return `${Math.round(bytes / 1_000)} KB`;
  }
  return `${bytes} B`;
}

function DocumentRow({ document }: { document: EventDocument }): React.JSX.Element {
  return (
    <div className="grid grid-cols-[16px_1fr_auto_auto] items-center gap-3 py-3 pl-6">
      <FileText className="h-3.5 w-3.5 text-neutral-400" />
      <div>
        <p className="text-[13px] text-neutral-900 dark:text-neutral-100">{document.name}</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
          v{document.version} · {document.visibility}
        </p>
      </div>
      <span className="font-mono text-[10px] text-neutral-400">{formatSize(document.sizeBytes)}</span>
      <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
        {document.tags.slice(0, 2).join(' · ') || '—'}
      </span>
    </div>
  );
}

function TreeNode({ node, depth = 0 }: { node: DocumentTreeNode; depth?: number }): React.JSX.Element {
  return (
    <div className={cn(depth > 0 && 'border-l border-neutral-200 pl-4 dark:border-neutral-800')}>
      <div className="flex items-center gap-2 border-b border-neutral-200 py-3 dark:border-neutral-800">
        <Folder className="h-3.5 w-3.5 text-neutral-500" />
        <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{node.folder.name}</p>
        <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">{node.folder.slug}</span>
      </div>

      {node.documents.map((document) => (
        <DocumentRow key={document.id as string} document={document} />
      ))}

      {node.children.map((child) => (
        <TreeNode key={child.folder.id as string} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function DocumentTree({ nodes, depth = 0 }: DocumentTreeProps): React.JSX.Element {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <SectionLabel>Event vault</SectionLabel>
        <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
          {nodes.length} root folders
        </span>
      </div>

      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {nodes.map((node) => (
          <TreeNode key={node.folder.id as string} node={node} depth={depth} />
        ))}
      </div>
    </div>
  );
}
