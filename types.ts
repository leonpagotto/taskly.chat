// All type definitions for the application

export enum Sender {
  User = 'user',
  Model = 'model',
}

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

export type Project = {
  id: string;
  name: string;
  description: string;
  categoryId?: string;
  instructions?: string;
  icon?: string;
  color?: string;
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
};

export type AIResponse = {
  text: string;
  action?: {
    type: 'CREATE_TASK' | 'CREATE_HABIT' | 'ADD_ITEMS_TO_LIST' | 'SUGGEST_TASKS' | 'COMPLETE_ITEM' | 'CREATE_NOTE' | 'CREATE_EVENT';
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
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type AppView = 'dashboard' | 'lists' | 'habits' | 'settings' | 'notes' | 'files' | 'projects' | 'calendar' | 'stories' | 'storyEditor';

// --- User Preferences ---
export type AIPersonality = 'smart' | 'direct' | 'concise' | 'encouraging' | 'gen_z' | 'conservative';
export type AppTheme = 'light' | 'dark';
export type AppColorTheme = 'blue' | 'purple' | 'green' | 'orange';
export type AppLanguage = 'en' | 'pt' | 'nl' | 'auto';
export type AppSize = 'sm' | 'md' | 'lg';

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