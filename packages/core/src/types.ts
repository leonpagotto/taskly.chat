export interface Task {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  createdAt: string;
  updatedAt: string;
  sourceMessageId?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryEntry {
  id: string;
  type: 'preference' | 'fact' | 'pattern';
  content: string;
  relevance: number; // 0-1
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageMetadata {
  tasks?: TaskDraft[];
  projectId?: string;
  memoryRefs?: string[]; // MemoryEntry ids
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: ChatMessageMetadata;
}

export interface TaskDraft {
  title: string;
  description?: string;
  confidence: number; // 0-1
}

// Intent & Entity Parsing (DEV-002)
export type UserIntent = 'create_task' | 'create_reminder' | 'capture_idea' | 'unknown';

export interface ParsedEntitiesBase {
  description?: string;
}

export interface TaskEntities extends ParsedEntitiesBase {
  due_date?: string; // ISO
  priority?: 'low' | 'normal' | 'high';
}

export interface ReminderEntities extends ParsedEntitiesBase {
  reminder_time?: string; // ISO
  recurrence?: string; // raw expression
}

export interface IdeaEntities extends ParsedEntitiesBase {
  topic?: string;
}

export type ParsedEntities = TaskEntities | ReminderEntities | IdeaEntities | ParsedEntitiesBase;

export interface ParseResult<E = ParsedEntities> {
  intent: UserIntent;
  entities: E;
  confidence: number; // 0-1
  missing: string[]; // required fields missing
  raw: {
    text: string;
    notes?: string[];
  };
}

export interface GlobalInstructionsLayer {
  id: 'global';
  content: string;
}

export interface ProjectInstructionsLayer {
  id: `project:${string}`;
  projectId: string;
  content: string;
}

export interface EphemeralContextLayer {
  id: `context:${string}`;
  expiresAt?: string;
  content: string;
}

export type InstructionLayer = GlobalInstructionsLayer | ProjectInstructionsLayer | EphemeralContextLayer;

export interface MergedInstructions {
  systemPrompt: string;
  layers: InstructionLayer[];
}
