import React from 'react';
import { TaskCard } from './TaskCard';

export function Column({ title, tasks }: { title: string; tasks: { id: string; status: string; story: string }[] }) {
  return (
    <div className="flex min-w-64 flex-col gap-2 rounded-lg bg-gray-50 p-3 border border-gray-200">
      <h2 className="text-sm font-semibold mb-1">{title}</h2>
      <div className="flex flex-col gap-2">
        {tasks.map(t=> <TaskCard key={t.id} id={t.id} status={t.status} story={t.story} />)}
      </div>
    </div>
  );
}
