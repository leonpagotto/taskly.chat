import { Project, Conversation, Sender, Habit, Checklist, Task, UserCategory, Note, ProjectFile, Event, Story } from '../types';

export type SampleTemplateId = 'general' | 'fitness' | 'student' | 'researcher' | 'coder' | 'retired' | 'combined';

const getISODate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = getISODate();

type SampleBundle = {
  projects: Project[];
  conversations: Conversation[];
  checklists: Checklist[];
  habits: Habit[];
  events: Event[];
  stories: Story[];
  userCategories: UserCategory[];
  notes: Note[];
  projectFiles: ProjectFile[];
};

const makeId = (prefix: string) => `${prefix}-${Math.floor(Date.now() / 1000)}-${Math.floor(Math.random() * 10000)}`;

const common = {
  files: [] as ProjectFile[],
};

const generalProfessional = (): SampleBundle => {
  const catWork: UserCategory = { id: 'cat-work', name: 'Work', icon: 'work', color: '#3B82F6' };
  const catPersonal: UserCategory = { id: 'cat-personal', name: 'Personal', icon: 'person', color: '#EC4899' };
  const catMeetings: UserCategory = { id: 'cat-meetings', name: 'Meetings', icon: 'event', color: '#22C55E' };

  const project: Project = { id: 'proj-general', name: 'Website Launch Plan', description: 'Plan and launch a new website with content, QA, and go-live.', categoryId: catWork.id, instructions: 'Be concise and provide actionable steps.' };

  const checklists: Checklist[] = [
    { id: 'cl-gen-1', name: 'Homepage QA', completionHistory: [], tasks: [
      { id: 't-gen-1', text: 'Check header links', completedAt: null },
      { id: 't-gen-2', text: 'Verify mobile layout', completedAt: null },
      { id: 't-gen-3', text: 'Run Lighthouse audit', completedAt: null },
    ], categoryId: catWork.id, projectId: project.id, priority: 5 },
    { id: 'cl-gen-2', name: 'Grocery list', completionHistory: [], tasks: [
      { id: 't-gen-4', text: 'Milk', completedAt: null },
      { id: 't-gen-5', text: 'Bread', completedAt: null },
    ], categoryId: catPersonal.id, priority: 8 },
    { id: 'cl-gen-3', name: 'Call accountant', completionHistory: [], tasks: [], categoryId: catPersonal.id, priority: 3, dueDate: today },
  ];

  const stories: Story[] = [
    { id: 'st-gen-1', title: 'Launch MVP Story', description: 'Ship core landing page and signup flow.', projectId: project.id, categoryId: catWork.id, status: 'in_progress', acceptanceCriteria: [
      { id: 'ac-gen-1', text: 'Landing page loads under 2s', done: false },
      { id: 'ac-gen-2', text: 'Signup form persists users to storage', done: false },
    ], estimatePoints: 5, linkedTaskIds: ['cl-gen-1'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const habits: Habit[] = [
    { id: 'hab-gen-1', name: 'Read 15 minutes', type: 'daily_check_off', completionHistory: [], categoryId: catPersonal.id, recurrence: { type: 'daily', startDate: today }, priority: 10 },
    { id: 'hab-gen-2', name: 'Standup checklist', type: 'checklist', completionHistory: [], categoryId: catWork.id, tasks: [
      { id: 'ht-gen-1', text: 'Yesterday recap', completedAt: null },
      { id: 'ht-gen-2', text: 'Today plan', completedAt: null },
    ], recurrence: { type: 'weekly', startDate: today, daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }, priority: 6 },
  ];

  const events: Event[] = [
    { id: 'ev-gen-1', title: 'Kickoff Meeting', description: 'Align scope and milestones', startDate: today, startTime: '10:00', endDate: today, endTime: '11:00', isAllDay: false, reminders: ['15m'], categoryId: catMeetings.id, projectId: project.id },
    { id: 'ev-gen-2', title: 'Dentist', startDate: today, startTime: '16:00', endDate: today, endTime: '16:30', isAllDay: false, reminders: ['1h'], categoryId: catPersonal.id },
  ];

  const conversations: Conversation[] = [
    { id: 'convo-gen-1', name: 'Brainstorm slogans', projectId: project.id, messages: [
      { id: 'msg-gen-1', sender: Sender.User, text: 'Brainstorm slogans for Taskly.Chat' },
      { id: 'msg-gen-2', sender: Sender.Model, text: 'Ideas: Where conversations become actions; Plan your day in one place.' },
    ]},
  ];

  const notes: Note[] = [
    { id: 'note-gen-1', name: 'Kickoff agenda', content: '<h1>Kickoff agenda</h1><p>Intro, Scope, Timeline, Next steps</p>', projectId: project.id, lastModified: new Date().toISOString() },
    { id: 'note-gen-2', name: 'Ideas', content: '<h1>Ideas</h1><ul><li>Marketing copy</li><li>Launch checklist</li></ul>', lastModified: new Date().toISOString() },
  ];

  return { 
    projects: [project],
    conversations,
    checklists,
    habits,
    events,
    stories,
    userCategories: [catWork, catPersonal, catMeetings],
    notes,
    projectFiles: common.files,
  };
};

const fitness = (): SampleBundle => {
  const catTrain: UserCategory = { id: 'cat-train', name: 'Training', icon: 'fitness_center', color: '#22C55E' };
  const catNutri: UserCategory = { id: 'cat-nutri', name: 'Nutrition', icon: 'restaurant', color: '#F59E0B' };
  const catHealth: UserCategory = { id: 'cat-health', name: 'Health', icon: 'monitor_heart', color: '#EF4444' };

  const project: Project = { id: 'proj-fitness', name: 'Half-Marathon Plan', description: '12-week training plan with cross-training and nutrition.', categoryId: catTrain.id };

  const checklists: Checklist[] = [
    { id: 'cl-fit-1', name: 'Grocery (meal prep)', completionHistory: [], tasks: [
      { id: 't-fit-1', text: 'Chicken breast', completedAt: null },
      { id: 't-fit-2', text: 'Brown rice', completedAt: null },
      { id: 't-fit-3', text: 'Broccoli', completedAt: null },
    ], categoryId: catNutri.id },
  ];

  const stories: Story[] = [
    { id: 'st-fit-1', title: 'Race Day Ready', description: 'Summarize training and finalize logistics.', projectId: project.id, categoryId: catTrain.id, status: 'backlog', acceptanceCriteria: [
      { id: 'ac-fit-1', text: 'Taper week plan created', done: false },
      { id: 'ac-fit-2', text: 'Race kit checklist complete', done: false },
    ], estimatePoints: 3, linkedTaskIds: ['cl-fit-1'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const habits: Habit[] = [
    { id: 'hab-fit-1', name: 'Run 5km', type: 'daily_check_off', completionHistory: [], categoryId: catTrain.id, projectId: project.id, recurrence: { type: 'interval', startDate: today, interval: 2 }, priority: 5 },
    { id: 'hab-fit-2', name: 'Stretch routine', type: 'checklist', completionHistory: [], categoryId: catHealth.id, tasks: [
      { id: 'ht-fit-1', text: 'Hamstring stretch', completedAt: null },
      { id: 'ht-fit-2', text: 'Hip flexor stretch', completedAt: null },
    ], recurrence: { type: 'daily', startDate: today }, priority: 7 },
  ];

  const events: Event[] = [
    { id: 'ev-fit-1', title: 'Gym Session', startDate: today, startTime: '18:00', endDate: today, endTime: '19:00', isAllDay: false, reminders: ['15m'], categoryId: catTrain.id, projectId: project.id },
  ];

  const conversations: Conversation[] = [
    { id: 'convo-fit-1', name: 'Training tips', projectId: project.id, messages: [
      { id: 'msg-fit-1', sender: Sender.User, text: 'How to avoid injury when increasing mileage?' },
      { id: 'msg-fit-2', sender: Sender.Model, text: 'Increase by 10% per week, include rest days, and strengthen core.' },
    ]},
  ];

  const notes: Note[] = [
    { id: 'note-fit-1', name: 'Nutrition plan', content: '<h1>Nutrition plan</h1><p>High protein, complex carbs, hydration goals.</p>', projectId: project.id, lastModified: new Date().toISOString() },
  ];

  return { projects: [project], conversations, checklists, habits, events, stories, userCategories: [catTrain, catNutri, catHealth], notes, projectFiles: common.files };
};

const student = (): SampleBundle => {
  const catClasses: UserCategory = { id: 'cat-classes', name: 'Classes', icon: 'school', color: '#8B5CF6' };
  const catStudy: UserCategory = { id: 'cat-study', name: 'Study', icon: 'menu_book', color: '#3B82F6' };
  const catExams: UserCategory = { id: 'cat-exams', name: 'Exams', icon: 'quiz', color: '#EF4444' };

  const project: Project = { id: 'proj-student', name: 'CS101 Semester', description: 'Track lectures, assignments, and exams.', categoryId: catClasses.id };

  const checklists: Checklist[] = [
    { id: 'cl-stu-1', name: 'Assignment 1', completionHistory: [], tasks: [
      { id: 't-stu-1', text: 'Read chapter 1', completedAt: null },
      { id: 't-stu-2', text: 'Implement algorithm', completedAt: null },
    ], categoryId: catStudy.id, projectId: project.id, dueDate: today, priority: 4 },
  ];

  const stories: Story[] = [
    { id: 'st-stu-1', title: 'Project 1 Story', description: 'Research and implement algorithm.', projectId: project.id, categoryId: catStudy.id, status: 'in_progress', acceptanceCriteria: [
      { id: 'ac-stu-1', text: 'Prototype implementation', done: false },
      { id: 'ac-stu-2', text: 'Complexity analysis written', done: false },
    ], estimatePoints: 8, linkedTaskIds: ['cl-stu-1'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const habits: Habit[] = [
    { id: 'hab-stu-1', name: 'Study block (1h)', type: 'daily_check_off', completionHistory: [], categoryId: catStudy.id, recurrence: { type: 'daily', startDate: today }, priority: 6 },
  ];

  const events: Event[] = [
    { id: 'ev-stu-1', title: 'Lecture', startDate: today, startTime: '09:00', endDate: today, endTime: '10:30', isAllDay: false, reminders: ['15m'], categoryId: catClasses.id, projectId: project.id },
    { id: 'ev-stu-2', title: 'Exam prep', startDate: today, startTime: '14:00', endDate: today, endTime: '15:00', isAllDay: false, reminders: ['1h'], categoryId: catExams.id },
  ];

  const conversations: Conversation[] = [
    { id: 'convo-stu-1', name: 'Explain Big-O', projectId: project.id, messages: [
      { id: 'msg-stu-1', sender: Sender.User, text: 'Explain Big-O notation simply.' },
      { id: 'msg-stu-2', sender: Sender.Model, text: 'It describes how runtime scales with input size, focusing on the dominant term.' },
    ]},
  ];

  const notes: Note[] = [
    { id: 'note-stu-1', name: 'Lecture 1 notes', content: '<h1>Lecture 1</h1><p>Intro to algorithms...</p>', projectId: project.id, lastModified: new Date().toISOString() },
  ];

  return { projects: [project], conversations, checklists, habits, events, stories, userCategories: [catClasses, catStudy, catExams], notes, projectFiles: common.files };
};

const researcher = (): SampleBundle => {
  const catResearch: UserCategory = { id: 'cat-research', name: 'Research', icon: 'science', color: '#06B6D4' };
  const catWriting: UserCategory = { id: 'cat-writing', name: 'Writing', icon: 'draw', color: '#F59E0B' };
  const catLab: UserCategory = { id: 'cat-lab', name: 'Lab', icon: 'biotech', color: '#10B981' };

  const project: Project = { id: 'proj-research', name: 'Manuscript Draft', description: 'From experiments to submission.', categoryId: catWriting.id };

  const checklists: Checklist[] = [
    { id: 'cl-res-1', name: 'Revise introduction', completionHistory: [], tasks: [
      { id: 't-res-1', text: 'Add background refs', completedAt: null },
      { id: 't-res-2', text: 'Clarify hypothesis', completedAt: null },
    ], categoryId: catWriting.id, projectId: project.id, priority: 5 },
  ];

  const stories: Story[] = [
    { id: 'st-res-1', title: 'Rewrite Methods Section', description: 'Clarify experimental setup.', projectId: project.id, categoryId: catWriting.id, status: 'review', acceptanceCriteria: [
      { id: 'ac-res-1', text: 'Reviewer feedback addressed', done: false },
    ], estimatePoints: 2, linkedTaskIds: ['cl-res-1'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const habits: Habit[] = [
    { id: 'hab-res-1', name: 'Daily reading (30m)', type: 'daily_check_off', completionHistory: [], categoryId: catResearch.id, recurrence: { type: 'daily', startDate: today }, priority: 7 },
  ];

  const events: Event[] = [
    { id: 'ev-res-1', title: 'Lab meeting', startDate: today, startTime: '11:00', endDate: today, endTime: '12:00', isAllDay: false, reminders: ['15m'], categoryId: catLab.id },
  ];

  const conversations: Conversation[] = [
    { id: 'convo-res-1', name: 'Abstract wording', projectId: project.id, messages: [
      { id: 'msg-res-1', sender: Sender.User, text: 'Help refine the abstract tone.' },
      { id: 'msg-res-2', sender: Sender.Model, text: 'Focus on problem, method, result, and significance concisely.' },
    ]},
  ];

  const notes: Note[] = [
    { id: 'note-res-1', name: 'Experiment log', content: '<h1>Experiment log</h1><p>Day 1: setup ...</p>', projectId: project.id, lastModified: new Date().toISOString() },
  ];

  return { projects: [project], conversations, checklists, habits, events, stories, userCategories: [catResearch, catWriting, catLab], notes, projectFiles: common.files };
};

const coder = (): SampleBundle => {
  const catCode: UserCategory = { id: 'cat-code', name: 'Code', icon: 'code', color: '#6366F1' };
  const catDevOps: UserCategory = { id: 'cat-devops', name: 'DevOps', icon: 'terminal', color: '#22C55E' };
  const catLearn: UserCategory = { id: 'cat-learn', name: 'Learning', icon: 'school', color: '#F97316' };

  const project: Project = { id: 'proj-coder', name: 'Taskly Clone', description: 'Build a productivity app prototype.', categoryId: catCode.id };

  const checklists: Checklist[] = [
    { id: 'cl-cod-1', name: 'MVP backlog', completionHistory: [], tasks: [
      { id: 't-cod-1', text: 'Auth flow', completedAt: null },
      { id: 't-cod-2', text: 'Task list UI', completedAt: null },
      { id: 't-cod-3', text: 'Local storage sync', completedAt: today },
    ], categoryId: catCode.id, projectId: project.id, priority: 4 },
    { id: 'cl-cod-2', name: 'Provision CI', completionHistory: [], tasks: [], categoryId: catDevOps.id, priority: 6 },
  ];

  const stories: Story[] = [
    { id: 'st-cod-1', title: 'MVP Kanban', description: 'Implement Stories board.', projectId: project.id, categoryId: catCode.id, status: 'in_progress', acceptanceCriteria: [
      { id: 'ac-cod-1', text: 'List and Board views in sync', done: false },
    ], estimatePoints: 5, linkedTaskIds: ['cl-cod-1'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const habits: Habit[] = [
    { id: 'hab-cod-1', name: 'Leetcode 1/day', type: 'daily_check_off', completionHistory: [], categoryId: catLearn.id, recurrence: { type: 'daily', startDate: today }, priority: 8 },
  ];

  const events: Event[] = [
    { id: 'ev-cod-1', title: 'Pair programming', startDate: today, startTime: '13:00', endDate: today, endTime: '14:00', isAllDay: false, reminders: ['15m'], categoryId: catCode.id, projectId: project.id },
  ];

  const conversations: Conversation[] = [
    { id: 'convo-cod-1', name: 'Component design', projectId: project.id, messages: [
      { id: 'msg-cod-1', sender: Sender.User, text: 'How to structure components for reusability?' },
      { id: 'msg-cod-2', sender: Sender.Model, text: 'Favor composition, extract hooks, and keep props minimal.' },
    ]},
  ];

  const notes: Note[] = [
    { id: 'note-cod-1', name: 'Architecture', content: '<h1>Architecture</h1><p>State lifted to App, views are dumb.</p>', projectId: project.id, lastModified: new Date().toISOString() },
  ];

  return { projects: [project], conversations, checklists, habits, events, stories, userCategories: [catCode, catDevOps, catLearn], notes, projectFiles: common.files };
};

const retired = (): SampleBundle => {
  const catHealth: UserCategory = { id: 'cat-ret-health', name: 'Health', icon: 'monitor_heart', color: '#10B981' };
  const catHobby: UserCategory = { id: 'cat-ret-hobby', name: 'Hobbies', icon: 'palette', color: '#F59E0B' };
  const catFamily: UserCategory = { id: 'cat-ret-family', name: 'Family', icon: 'family_restroom', color: '#8B5CF6' };

  const project: Project = { id: 'proj-retired', name: 'Garden Renovation', description: 'Refresh the backyard garden with new plants and layout.', categoryId: catHobby.id };

  const checklists: Checklist[] = [
    { id: 'cl-ret-1', name: 'Plant shopping', completionHistory: [], tasks: [
      { id: 't-ret-1', text: 'Lavender', completedAt: null },
      { id: 't-ret-2', text: 'Tomato seedlings', completedAt: null },
    ], categoryId: catHobby.id, projectId: project.id },
    { id: 'cl-ret-2', name: 'Call grandchildren', completionHistory: [], tasks: [], categoryId: catFamily.id, priority: 2, dueDate: today },
  ];

  const stories: Story[] = [
    { id: 'st-ret-1', title: 'Garden Paths Story', description: 'Plan and build stone paths.', projectId: project.id, categoryId: catHobby.id, status: 'backlog', acceptanceCriteria: [
      { id: 'ac-ret-1', text: 'Path layout sketched', done: false },
    ], estimatePoints: 1, linkedTaskIds: ['cl-ret-1'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const habits: Habit[] = [
    { id: 'hab-ret-1', name: 'Morning walk', type: 'daily_check_off', completionHistory: [], categoryId: catHealth.id, recurrence: { type: 'daily', startDate: today }, priority: 5 },
  ];

  const events: Event[] = [
    { id: 'ev-ret-1', title: 'Family dinner', startDate: today, startTime: '19:00', endDate: today, endTime: '21:00', isAllDay: false, reminders: ['1h'], categoryId: catFamily.id },
  ];

  const conversations: Conversation[] = [
    { id: 'convo-ret-1', name: 'Hobby ideas', messages: [
      { id: 'msg-ret-1', sender: Sender.User, text: 'Fun hobbies to try this month?' },
      { id: 'msg-ret-2', sender: Sender.Model, text: 'Bird watching, watercolor painting, or local community gardening.' },
    ]},
  ];

  const notes: Note[] = [
    { id: 'note-ret-1', name: 'Garden layout', content: '<h1>Garden layout</h1><p>Raised beds near the fence, herb corner by the patio.</p>', projectId: project.id, lastModified: new Date().toISOString() },
  ];

  return { projects: [project], conversations, checklists, habits, events, stories, userCategories: [catHealth, catHobby, catFamily], notes, projectFiles: common.files };
};

export const getSampleData = (templateId: SampleTemplateId): SampleBundle => {
  switch (templateId) {
    case 'general':
      return generalProfessional();
    case 'fitness':
      return fitness();
    case 'student':
      return student();
    case 'researcher':
      return researcher();
    case 'coder':
      return coder();
    case 'retired':
      return retired();
    case 'combined': {
      const bundles = [generalProfessional(), fitness(), student(), researcher(), coder(), retired()];
      const merged: SampleBundle = {
        projects: [], conversations: [], checklists: [], habits: [], events: [], stories: [], userCategories: [], notes: [], projectFiles: []
      };
      for (const b of bundles) {
        merged.projects.push(...b.projects);
        merged.conversations.push(...b.conversations);
        merged.checklists.push(...b.checklists);
        merged.habits.push(...b.habits);
        merged.events.push(...b.events);
  merged.stories.push(...(b as any).stories || []);
        merged.userCategories.push(...b.userCategories);
        merged.notes.push(...b.notes);
        merged.projectFiles.push(...b.projectFiles);
      }
      return merged;
    }
  }
};

export const getCombinedSampleData = (): SampleBundle => getSampleData('combined');
