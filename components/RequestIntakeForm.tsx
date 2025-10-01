import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import { ArrowBackIcon } from './icons';
import { Checklist, Request, RequestPriority, RequestUpdate } from '../types';
import { generateRequestAssist } from '../services/geminiService';
import { ChevronRightIcon, AddIcon } from './icons';
import { relationalDb } from '../services/relationalDatabaseService';

const required = (v?: string | null) => !!v && v.trim().length > 0;

const RequestIntakeForm: React.FC<{
  initial?: Partial<Request>;
  onBack: () => void;
  onSubmit: (req: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSuggest?: (draft: Partial<Request>) => Promise<Partial<Request>>;
  onCreateLinkedTask: (name: string) => void;
  existingChecklists: Checklist[];
}> = ({ initial, onBack, onSubmit, onSuggest, onCreateLinkedTask, existingChecklists }) => {
  const [local, setLocal] = useState<Omit<Request, 'id' | 'createdAt' | 'updatedAt'>>({
    product: initial?.product || '',
    requester: initial?.requester || '',
    problem: initial?.problem || '',
    outcome: initial?.outcome || '',
    valueProposition: initial?.valueProposition || '',
    affectedUsers: initial?.affectedUsers || '',
    priority: initial?.priority || 'medium',
  requestedExpertise: initial?.requestedExpertise || [],
    desiredStartDate: initial?.desiredStartDate || null,
    desiredEndDate: initial?.desiredEndDate || null,
    details: initial?.details || '',
    attachments: initial?.attachments || [],
    status: initial?.status || 'new',
    linkedTaskIds: initial?.linkedTaskIds || [],
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedExistingId, setSelectedExistingId] = useState('');
  const [assistLoading, setAssistLoading] = useState(false);
  const [updates, setUpdates] = useState<RequestUpdate[]>([]);
  const [newRemark, setNewRemark] = useState('');

  // Expertise options grouped by category
  const expertiseGroups: { label: string; options: string[] }[] = [
    { label: 'Research & Insights', options: [
      'User Interviews','Contextual Inquiry / Field Studies','Usability Testing','Diary Studies / Longitudinal Research','Surveys (design & analysis)','Behavioral / Quantitative Analysis','Insights Reporting & Synthesis',
    ]},
    { label: 'Experience & Journey Design', options: [
      'Journey Mapping','Service Blueprinting','Experience Mapping (end-to-end, cross-channel)','Persona & Scenario Development','Storyboarding','Current vs. Future State Mapping',
    ]},
    { label: 'UX & Prototyping', options: [
      'Wireframes & Interaction Design','High-Fidelity UI Design','Responsive / Adaptive Layouts','Prototyping (low-fi to high-fi)','Information Architecture','Navigation Design','Accessibility & Inclusive Design Review',
    ]},
    { label: 'Service Design & Systems Thinking', options: [
      'Ecosystem Mapping','Value Proposition Exploration','Touchpoint Orchestration','Process & Workflow Design','Co-Creation Workshops','Future Visioning & Concept Development',
    ]},
    { label: 'Facilitation & Collaboration', options: [
      'Design Thinking Sprints','Stakeholder Alignment Workshops','Co-Creation with Users','Ideation Sessions','Prioritization & Roadmapping',
    ]},
    { label: 'Content & Communication', options: [
      'Content Strategy','UX Writing & Microcopy','Visual Storytelling','Information Visualization',
    ]},
    { label: 'Strategy & Evaluation', options: [
      'Competitive Analysis & Benchmarking','Concept Validation','KPI Definition & Success Metrics','Experimentation / A/B Testing','Impact Assessment (user & business value)',
    ]},
    { label: 'Design Delivery & Support', options: [
      'Design Specifications for Development','Contribution to Design System / Pattern Library','Accessibility Compliance Checks','QA Support & Design Validation',
    ]},
  ];

  const toggleExpertise = (opt: string) => {
    setLocal(prev => {
      const set = new Set(prev.requestedExpertise || []);
      if (set.has(opt)) set.delete(opt); else set.add(opt);
      return { ...prev, requestedExpertise: Array.from(set) };
    });
  };

  // Validation: For NEW requests, require Product/Feature, Requester, Problem, and at least one requested expertise.
  // When editing an existing request, keep validation permissive to allow partial updates.
  const isEditing = Boolean((initial as any)?.id);
  const hasExpertise = Array.isArray(local.requestedExpertise) && local.requestedExpertise.length > 0;
  const isValid = isEditing
    ? required(local.product) && required(local.requester) && required(local.problem)
    : required(local.product) && required(local.requester) && required(local.problem) && hasExpertise;

  const handle = <K extends keyof typeof local>(k: K, v: (typeof local)[K]) => setLocal(prev => ({ ...prev, [k]: v }));

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(local);
  };

  const handleAssist = async () => {
    setAssistLoading(true);
    try {
      const suggestions = await generateRequestAssist(local as any);
      setLocal(prev => ({ ...prev, ...suggestions }));
    } catch (e) {
      // Best-effort; keep UX quiet
      console.warn('AI assist failed', e);
    } finally {
      setAssistLoading(false);
    }
  };

  // Load request updates when editing an existing request and relational DB is enabled
  useEffect(() => {
    const load = async () => {
      const id = (initial as any)?.id as string | undefined;
      if (!id || !relationalDb.isEnabled()) return;
      try {
        const list = await relationalDb.listRequestUpdates(id);
        setUpdates(list);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [(initial as any)?.id]);

  const addRemark = async () => {
    const id = (initial as any)?.id as string | undefined;
    const text = newRemark.trim();
    if (!id || !text || !relationalDb.isEnabled()) return;
    try {
      const saved = await relationalDb.addRequestUpdate({ requestId: id, author: 'Me', comment: text } as any);
      if (saved) setUpdates(prev => [...prev, saved]);
      setNewRemark('');
    } catch (e) {
      // ignore
    }
  };

  // moved up for validation
  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
  <Header
        title={
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <ArrowBackIcon className="text-base" />
            </button>
            <span className="truncate">{isEditing ? 'Edit Request' : 'New Request'}</span>
          </div>
        }
        onToggleSidebar={() => {}}
        onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))}
      >
        <button onClick={handleAssist} disabled={assistLoading} className="mr-2 px-4 py-2 rounded-[var(--radius-button)] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold disabled:opacity-50">{assistLoading ? 'Thinking…' : 'AI Assist'}</button>
        <button onClick={handleSubmit} disabled={!isValid} className="px-4 py-2 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white text-sm font-semibold disabled:opacity-50">Submit</button>
      </Header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Product / Feature <span className="text-red-500">*</span></label>
              <input value={local.product} onChange={e => handle('product', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="e.g., Billing, Onboarding, Calendar" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Requester Name / Team <span className="text-red-500">*</span></label>
              <input value={local.requester} onChange={e => handle('requester', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="e.g., Jane Doe / CS" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Request / Problem <span className="text-red-500">*</span></label>
              <textarea value={local.problem} onChange={e => handle('problem', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" rows={3} placeholder="What happened? What's the issue?" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Desired Outcome / Goal <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={local.outcome} onChange={e => handle('outcome', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" rows={2} placeholder="What does success look like?" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Value Proposition (Business value) <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={local.valueProposition} onChange={e => handle('valueProposition', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" rows={2} placeholder="Why does this matter?" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Affected Users / Customers <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={local.affectedUsers} onChange={e => handle('affectedUsers', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" rows={2} placeholder="Who is affected? How many?" />
            </div>
          </div>

          {/* Requested Expertise & Approach */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Requested Expertise & Approach {isEditing ? (<span className="text-xs text-gray-500 font-normal">(optional)</span>) : (<span className="text-red-500">*</span>)}
              </label>
              {Boolean(local.requestedExpertise && local.requestedExpertise.length) && (
                <span className="text-xs text-gray-500">{local.requestedExpertise!.length} selected</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {expertiseGroups.map(group => (
                <div key={group.label} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900/40">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">{group.label}</div>
                  <div className="space-y-1">
                    {group.options.map(opt => {
                      const checked = (local.requestedExpertise || []).includes(opt);
                      return (
                        <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                          <input type="checkbox" className="accent-[var(--color-primary-600)]" checked={checked} onChange={() => toggleExpertise(opt)} />
                          <span className="truncate">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500">{isEditing ? 'Tip: Select one or more areas if you know the expertise needed. You can leave this blank.' : 'Please select at least one expertise area for new requests.'}</div>
            {!isEditing && !hasExpertise && (
              <div className="mt-2 text-xs text-red-500">Select at least one area to proceed.</div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Priority</label>
              <div className="relative">
                <select value={local.priority} onChange={e => handle('priority', e.target.value as RequestPriority)} className="w-full appearance-none bg-gray-100 dark:bg-gray-700 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <ChevronRightIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Desired Start</label>
              <input type="date" value={local.desiredStartDate || ''} onChange={e => handle('desiredStartDate', e.target.value || null)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Desired End</label>
              <input type="date" value={local.desiredEndDate || ''} onChange={e => handle('desiredEndDate', e.target.value || null)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Additional Details / Attachments</label>
            <textarea value={local.details || ''} onChange={e => handle('details', e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" rows={4} placeholder="Any additional context (you can paste links to screenshots/docs here)." />
          </div>

          {/* Updates / Remarks timeline (edit mode only) */}
          {Boolean((initial as any)?.id) && relationalDb.isEnabled() && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Updates</h3>
              </div>
              <div className="space-y-2">
                {updates.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">No updates yet.</div>}
                {updates.map(u => (
                  <div key={u.id} className="text-sm flex items-start gap-2">
                    <span className="material-symbols-outlined text-base text-gray-500">schedule</span>
                    <div className="min-w-0">
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{new Date(u.createdAt).toLocaleString()}</div>
                      {u.action && <div className="text-gray-700 dark:text-gray-200">{u.action}</div>}
                      {u.comment && <div className="text-gray-700 dark:text-gray-200">{u.comment}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input value={newRemark} onChange={e => setNewRemark(e.target.value)} placeholder="Add a remark" className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                <button onClick={addRemark} disabled={!newRemark.trim()} className="px-3 py-2 rounded-[var(--radius-button)] bg-gray-200 dark:bg-gray-600 text-sm disabled:opacity-50">Add</button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Linked Action Items</div>
            <div className="space-y-2">
              {(local.linkedTaskIds || []).length === 0 && (<div className="text-sm text-gray-500 dark:text-gray-300">No tasks linked.</div>)}
              {(local.linkedTaskIds || []).map(id => {
                const cl = existingChecklists.find(c => c.id === id);
                if (!cl) return null;
                return (
                  <div key={id} className="flex items-center justify-between gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{cl.name}</div>
                    </div>
                    <button onClick={() => handle('linkedTaskIds', (local.linkedTaskIds || []).filter(x => x !== id))} className="p-2 rounded-full text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30" title="Unlink">Unlink</button>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input value={newTaskName} onChange={e => setNewTaskName(e.target.value)} placeholder="Create and link new task" className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter' && newTaskName.trim()) { onCreateLinkedTask(newTaskName.trim()); setNewTaskName(''); } }} />
              <button disabled={!newTaskName.trim()} onClick={() => { if (newTaskName.trim()) { onCreateLinkedTask(newTaskName.trim()); setNewTaskName(''); } }} className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center disabled:opacity-50" title="Create & Link"><AddIcon className="text-base" /></button>
            </div>
            {existingChecklists.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <select value={selectedExistingId} onChange={(e) => setSelectedExistingId(e.target.value)} className="w-full appearance-none bg-gray-100 dark:bg-gray-700 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none">
                    <option value="">Select an existing task list</option>
                    {existingChecklists.map(cl => (<option key={cl.id} value={cl.id}>{cl.name}</option>))}
                  </select>
                  <ChevronRightIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
                <button onClick={() => { if (selectedExistingId) { handle('linkedTaskIds', Array.from(new Set([...(local.linkedTaskIds || []), selectedExistingId]))); setSelectedExistingId(''); } }} className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center" title="Link"><AddIcon className="text-base" /></button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestIntakeForm;
