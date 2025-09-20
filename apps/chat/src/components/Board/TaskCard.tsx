import React from 'react';

interface Props { id: string; status: string; story: string; dirty?: boolean }

export function TaskCard({ id, status, story, dirty }: Props) {
  const border = dirty ? 'border-amber-500' : 'border-gray-300';
  const ring = dirty ? 'ring-1 ring-amber-400' : '';
  return (
    <div className={`rounded border ${border} ${ring} bg-white px-2 py-1 text-sm shadow-sm hover:shadow transition-colors`} role="group" aria-label={`Task ${id} in status ${status}`}>      
      <div className="flex items-center justify-between">
        <div className="font-medium">{id}</div>
        {dirty && <span className="ml-2 rounded bg-amber-500/10 px-1 text-[10px] font-semibold text-amber-600">moved</span>}
      </div>
      <div className="text-xs text-gray-500 truncate">{story}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">{status}</div>
    </div>
  );
}
