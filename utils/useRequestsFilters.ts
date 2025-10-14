import { useEffect, useState } from 'react';
import { RequestPriority, RequestStatus } from '../types';

export type RequestsSort = 'updated' | 'created' | 'priority' | 'name';

type PersistedFilters = {
  status: RequestStatus | 'all';
  priority: RequestPriority | 'all';
  expertise: string; // 'all' or specific tag
  projectId: string; // 'all' or specific project id
  sortBy: RequestsSort;
};

const STORAGE_KEY = 'requests.filters.v1';

const defaultState: PersistedFilters = {
  status: 'all',
  priority: 'all',
  expertise: 'all',
  projectId: 'all',
  sortBy: 'updated',
};

const load = (): PersistedFilters => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<PersistedFilters>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
};

const save = (state: PersistedFilters) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
};

export const useRequestsFilters = () => {
  const initial = load();
  const [status, setStatus] = useState<PersistedFilters['status']>(initial.status);
  const [priority, setPriority] = useState<PersistedFilters['priority']>(initial.priority);
  const [expertise, setExpertise] = useState<PersistedFilters['expertise']>(initial.expertise);
  const [projectId, setProjectId] = useState<PersistedFilters['projectId']>(initial.projectId);
  const [sortBy, setSortBy] = useState<PersistedFilters['sortBy']>(initial.sortBy);

  // Persist whenever any filter changes
  useEffect(() => {
    save({ status, priority, expertise, projectId, sortBy });
  }, [status, priority, expertise, projectId, sortBy]);

  return {
    status, setStatus,
    priority, setPriority,
    expertise, setExpertise,
    projectId, setProjectId,
    sortBy, setSortBy,
  } as const;
};
