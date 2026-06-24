import type { LayoutNode, LayoutRole } from '../lib/types';

function roleMinHeight(role: LayoutRole): string {
  switch (role) {
    case 'header': return '56px';
    case 'nav': return '44px';
    case 'hero': return '280px';
    case 'section': return '180px';
    case 'footer': return '72px';
    case 'card': return '140px';
    case 'aside': return '180px';
    case 'container': return '48px';
    default: return '48px';
  }
}

function roleLabel(node: LayoutNode): string {
  if (node.role !== 'unknown') return node.role;
  if (node.id) return `#${node.id}`;
  if (node.className) return `.${node.className}`;
  return node.tag;
}

function WireframeNode({ node, isInRow = false }: { node: LayoutNode; isInRow?: boolean }) {
  const { role, bgColor, children, isImage, hasText, widthHint } = node;
  const isRow = children.length > 1 && children.some((c) => c.widthHint < 0.9);
  const label = roleLabel(node);

  const rowStyle = isInRow
    ? { flexGrow: widthHint, flexShrink: 1, minWidth: 0 }
    : { width: '100%' };

  return (
    <div
      style={{
        backgroundColor: bgColor || undefined,
        minHeight: roleMinHeight(role),
        ...rowStyle,
      }}
      className={[
        'relative border border-dashed border-black/10 dark:border-white/10 overflow-hidden',
        !bgColor ? 'bg-gray-100 dark:bg-gray-800' : '',
      ].join(' ')}
      title={`${node.tag}${node.id ? '#' + node.id : ''}${node.className ? '.' + node.className : ''}`}
    >
      {/* Role label */}
      <span className="absolute top-1 left-2 z-10 text-[9px] font-mono uppercase tracking-widest opacity-30 select-none pointer-events-none leading-none">
        {label}
      </span>

      {/* Image placeholder */}
      {isImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="opacity-20"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
      )}

      {/* Text placeholder lines */}
      {!isImage && hasText && children.length === 0 && (
        <div className="pt-6 px-3 space-y-2">
          <div
            className="h-1.5 w-3/4 rounded-full"
            style={{ backgroundColor: bgColor ? 'rgba(0,0,0,0.18)' : undefined }}
          />
          <div
            className={`h-1.5 w-1/2 rounded-full ${!bgColor ? 'bg-black/10 dark:bg-white/10' : ''}`}
            style={{ backgroundColor: bgColor ? 'rgba(0,0,0,0.12)' : undefined }}
          />
        </div>
      )}

      {/* Children */}
      {children.length > 0 && (
        <div className={`flex ${isRow ? 'flex-row' : 'flex-col'} h-full pt-5`}>
          {children.map((child, i) => (
            <WireframeNode key={i} node={child} isInRow={isRow} />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  tree: LayoutNode;
  url: string;
}

export default function WireframeCanvas({ tree, url }: Props) {
  if (tree.children.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-400 text-sm">
        No layout structure detected — the page may use CSS-in-JS or block bots
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Fake browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
        <span className="flex-1 text-center text-[10px] font-mono text-gray-400 truncate">{url}</span>
      </div>

      {/* Wireframe blocks */}
      <div className="flex flex-col">
        {tree.children.map((node, i) => (
          <WireframeNode key={i} node={node} isInRow={false} />
        ))}
      </div>
    </div>
  );
}
