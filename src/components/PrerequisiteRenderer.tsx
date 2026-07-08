import React from 'react';
import { type PrerequisiteNode } from '../types';

interface PrerequisiteRendererProps {
  node: PrerequisiteNode;
  depth?: number;
}

export const PrerequisiteRenderer: React.FC<PrerequisiteRendererProps> = ({ node, depth = 0 }) => {
  if (typeof node === 'string') {
    return (
      <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded font-semibold whitespace-nowrap">
        {node}
      </span>
    );
  }

  if ('AND' in node) {
    const children = node.AND.map((child, i) => (
      <span key={i} className="inline-flex items-center">
        {i > 0 && <span className="mx-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">AND</span>}
        <PrerequisiteRenderer node={child} depth={depth + 1} />
      </span>
    ));

    return depth > 0 ? (
      <span className="inline-flex items-center bg-slate-900/50 border border-slate-700/50 rounded-lg px-2 py-1 flex-wrap gap-y-1">
        {children}
      </span>
    ) : (
      <span className="inline-flex items-center flex-wrap gap-y-1">{children}</span>
    );
  }

  if ('OR' in node) {
    const children = node.OR.map((child, i) => (
      <span key={i} className="inline-flex items-center">
        {i > 0 && <span className="mx-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">OR</span>}
        <PrerequisiteRenderer node={child} depth={depth + 1} />
      </span>
    ));

    return depth > 0 ? (
      <span className="inline-flex items-center bg-slate-900/50 border border-slate-700/50 rounded-lg px-2 py-1 flex-wrap gap-y-1">
        {children}
      </span>
    ) : (
      <span className="inline-flex items-center flex-wrap gap-y-1">{children}</span>
    );
  }

  return null;
};
