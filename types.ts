// All type definitions for the application

export enum Sender {
  User = 'user',
  Model = 'model',
}

export type FeedbackType = 'bug' | 'feature' | 'general';

export type FeedbackMetadata = {
  submittedAt: string;
  appVersion?: string;
  locale?: string;
  timezone?: string;
  userAgent?: string;
  platform?: string;
  appView?: AppView | null;
};

export type FeedbackSubmission = {
  email?: string;
  type: FeedbackType;
  message: string;
  metadata?: FeedbackMetadata;
};

export type Task = {
  id: string;
  text: string;
  completedAt: string | null; // YYYY-MM-DD or null
};

export type RecurrenceRule = {
  type: 'daily' | 'weekly' | 'interval';
  startDate: string; // YYYY-MM-DD
  daysOfWeek?: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[];
  interval?: number; // for 'interval' type
};

export type Reminder = {
  remindAt: string; // ISO string
};

export type Message = {
  id: string;
  sender: Sender;
  text: string;
  suggestions?: {
    text: string;
    dueDate?: string;
    isApproved: boolean;
  }[];
  suggestionListName?: string;
};

export type Conversation = {
  id: string;
  name: string;
  projectId?: string;
  messages: Message[];
};

export type Checklist = {
  id: string;
  name:string;
  tasks: Task[];
  completionHistory: string[]; // Array of YYYY-MM-DD dates
  categoryId?: string;
  projectId?: string;
  dueDate?: string | null; // YYYY-MM-DD
  dueTime?: string | null; // HH:MM
  recurrence?: RecurrenceRule;
  reminder?: Reminder;
  priority?: number;
  sourceNoteId?: string;
  generatedChecklistId?: string;
};

export type Habit = {
  id: string;
  name: string;
  type: 'daily_check_off' | 'checklist';
  completionHistory: string[]; // Array of YYYY-MM-DD dates
  categoryId?: string;
  projectId?: string;
  tasks?: Task[];
  recurrence: RecurrenceRule;
  reminder?: Reminder;
  priority?: number;
};

export type UserCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

// --- Skills Management ---
export type Skill = {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
};

export type SkillCategory = {
  id: string;
  name: string;
  skills: Skill[];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  categoryId?: string;
  instructions?: string;
  icon?: string;
  color?: string;
  members?: ProjectMember[];
  invites?: ProjectInvite[];
};

export type ProjectRole = 'admin' | 'collaborator';

export type ProjectAccessStatus = 'accepted' | 'pending' | 'revoked';

export type ProjectMember = {
  id: string; // user id or email hash when user account not yet created
  email?: string;
  name?: string;
  role: ProjectRole;
  status: ProjectAccessStatus;
  invitedAt: string;
  acceptedAt?: string;
  invitedBy?: string;
};

export type ProjectInviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export type ProjectInvite = {
  id: string;
  projectId: string;
  email: string;
  role: ProjectRole;
  invitedBy: string;
  status: ProjectInviteStatus;
  token: string;
  createdAt: string;
  respondedAt?: string;
  message?: string;
};

export type Note = {
    id: string;
    name: string;
    content: string;
    projectId?: string;
    categoryId?: string;
    lastModified: string; // ISO string
    fileIds?: string[];
    generatedChecklistId?: string;
};

export type ProjectFile = {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    data: string; // base64 encoded
    projectId: string;
};

export type ReminderSetting = '5m' | '15m' | '1h' | '1d' | 'start';

export type Event = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  attendees?: string[]; // names or emails
  startDate: string; // YYYY-MM-DD
  startTime: string | null; // HH:MM
  endDate: string | null; // YYYY-MM-DD
  endTime: string | null; // HH:MM
  isAllDay: boolean;
  reminders: ReminderSetting[];
  categoryId?: string;
  projectId?: string;
  // External calendar integration
  externalSource?: 'microsoft' | 'google'; // Which external calendar this event is synced from
  externalId?: string; // Original event ID from external calendar
  isReadOnly?: boolean; // Whether this event can be edited in the app
};

export type AIResponse = {
  text: string;
  action?: {
    type: 'CREATE_TASK' | 'CREATE_HABIT' | 'ADD_ITEMS_TO_LIST' | 'SUGGEST_TASKS' | 'COMPLETE_ITEM' | 'CREATE_NOTE' | 'CREATE_EVENT' | 'CREATE_REQUEST' | 'CREATE_STORY' | 'LINK_OBJECTS';
    payload: any;
  };
};

// --- Stories ---
export type StoryStatus = 'backlog' | 'in_progress' | 'review' | 'done';

export type AcceptanceCriterion = {
  id: string;
  text: string;
  done: boolean;
};

export type Story = {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  categoryId?: string;
  status: StoryStatus;
  acceptanceCriteria: AcceptanceCriterion[];
  estimatePoints?: number; // story points
  estimateTime?: string; // optional time estimate (e.g., "3h", "1d")
  linkedTaskIds: string[]; // Checklist IDs linked to this story
  skillIds?: string[]; // Skills tagged to this story
  // Assignee/Requester fields (free-form name and/or user id)
  assigneeUserId?: string;
  assigneeName?: string;
  requesterUserId?: string;
  requesterName?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type AppView = 'dashboard' | 'lists' | 'habits' | 'settings' | 'notes' | 'files' | 'projects' | 'calendar' | 'stories' | 'storyEditor' | 'requests' | 'requestIntake' | 'categories';

// --- Requests Intake ---
export type RequestPriority = 'low' | 'medium' | 'high' | 'critical';
// Expanded RequestStatus to support triage workflow; legacy values remain mapped in UI
export type RequestStatus =
  | 'new'            // legacy "Open"
  | 'triage'         // legacy "In Review"
  | 'in_progress'    // In Progress
  | 'blocked'        // On Hold
  | 'done'           // legacy "Closed"
  | 'cancelled'      // Closed
  | 'open'
  | 'in_review'
  | 'closed';
export type RequestAttachment = { name: string; url: string; type?: string; size?: number };
export type Request = {
  id: string;
  product: string; // Product/Feature involved
  requester: string; // Requester Name/Team
  problem: string; // Request/Problem description
  outcome: string; // Desired Outcome/Goal
  valueProposition: string; // Business value
  affectedUsers: string; // Affected Users/Customers
  priority: RequestPriority;
  // New: Requested Expertise & Approach (optional multi-select)
  requestedExpertise?: string[];
  desiredStartDate?: string | null; // YYYY-MM-DD
  desiredEndDate?: string | null;   // YYYY-MM-DD
  details?: string; // Additional details
  attachments?: RequestAttachment[];
  status: RequestStatus;
  linkedTaskIds: string[]; // Checklist IDs created/linked for this request
  skillIds?: string[]; // Skills tagged to this request
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

// Activity log entries for requests (remarks, actions, status changes)
export type RequestUpdate = {
  id: string;
  requestId: string;
  author: string; // free text for now (name or email)
  comment?: string; // remark text
  action?: string; // structured action, e.g., "Status changed from Open -> In Review"
  createdAt: string; // ISO
};

// --- User Preferences ---
export type AIPersonality = 'smart' | 'direct' | 'concise' | 'encouraging' | 'gen_z' | 'conservative';
export type AppTheme = 'light' | 'dark';
export type AppColorTheme = 'blue' | 'purple' | 'green' | 'orange';
export type AppLanguage = 'en' | 'pt' | 'nl' | 'auto';
export type AppSize = 'sm' | 'md' | 'lg';

export type BottomNavItemKey =
  | 'dashboard'
  | 'lists'
  | 'habits'
  | 'notes'
  | 'requests'
  | 'calendar'
  | 'stories'
  | 'files'
  | 'projects'
  | 'categories';

// --- Pulse Widget Types ---
export type PulseWidgetType = 'weather' | 'stock' | 'crypto' | 'email' | 'calendar' | 'exchange' | 'trending';

export type PulseWidgetConfig = {
    id: string;
    type: PulseWidgetType;
    meta: {
        city?: string;
        ticker?: string;
        symbol?: string;
        from?: string;
        to?: string;
    };
};

export type UserPreferences = {
  personality: AIPersonality;
  nickname: string;
  occupation: string;
  personalNotes: string;
  useMemory: boolean;
  useHistory: boolean;
  allowWebSearch: boolean;
  theme: AppTheme;
  colorTheme: AppColorTheme;
  language: AppLanguage;
  size: AppSize;
  pulseWidgets: PulseWidgetConfig[];
  // Controls how much project context is sent to the AI
  aiSnapshotVerbosity?: 'concise' | 'detailed';
  // Onboarding & profile
  onboardingCompleted?: boolean;
  avatarUrl?: string;
  contactEmail?: string;
  defaultView?: AppView;
  bottomNavItems: BottomNavItemKey[];
};


// --- Pulse Data Types ---
export type WeatherData = {
    city: string;
    temperature: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
};

export type StockData = {
    ticker: string;
    price: number;
    change: number;
};

export type CryptoData = {
    symbol: string;
    price: number;
    changePercent: number;
};

export type EmailData = {
    unreadCount: number;
};

export type CalendarEventData = {
    title: string;
    startTime: string;
};

export type ExchangeData = {
    from: string;
    to: string;
    rate: number;
};

export type TrendingData = {
    topic: string;
};

// Search Result Type
export type SearchableItem = 
    | (Checklist & { itemType: 'task' })
    | (Habit & { itemType: 'habit' })
    | (Note & { itemType: 'note' })
    | (Project & { itemType: 'project' })
    | (ProjectFile & { itemType: 'file' })
    | (Event & { itemType: 'event' });