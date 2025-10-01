import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part, Type } from "@google/genai";
import { Message, Sender, UserPreferences, AIResponse, AppView, Project, ProjectFile, Request, RequestPriority, Story } from '../types';

// API key management: env wins, then localStorage fallback; do not crash when missing.
let ai: GoogleGenAI | null = null;
const getEnvKey = (): string | undefined => {
  try { return ((import.meta as any).env?.VITE_API_KEY as string | undefined)?.trim() || undefined; } catch { return undefined; }
};
const getStoredKey = (): string | undefined => {
  try { const v = localStorage.getItem('ai.apiKey'); return v && v.trim() ? v.trim() : undefined; } catch { return undefined; }
};
const getApiKey = (): string | undefined => getEnvKey() || getStoredKey();
const initAI = () => {
  const key = getApiKey();
  if (key) {
    ai = new GoogleGenAI({ apiKey: key });
  } else {
    ai = null;
    console.warn('Gemini API key is not set. Add it in Settings or set VITE_API_KEY to enable AI features.');
  }
};
initAI();

export const isAIAvailable = (): boolean => !!ai;

export const setApiKey = (key: string | null) => {
  try {
    if (key && key.trim()) localStorage.setItem('ai.apiKey', key.trim());
    else localStorage.removeItem('ai.apiKey');
  } catch {}
  initAI();
};
// NOTE: We use text-only interactions. Do not attach images or other binary parts.
const model = "gemini-2.5-flash";

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const getPersonalityPrompt = (personality: UserPreferences['personality']): string => {
  switch (personality) {
    case 'direct': return "You are a direct, to-the-point assistant.";
    case 'concise': return "You are a concise assistant. Keep your answers brief and clear.";
    case 'encouraging': return "You are an encouraging and supportive assistant. Use positive language.";
    case 'gen_z': return "You are a Gen Z assistant. Use modern slang and emojis where appropriate, but keep it professional enough for work. tbh, you're like, the best assistant ever. ✨";
    case 'conservative': return "You are a formal and traditional assistant. Use professional language.";
    case 'smart':
    default: return "You are a smart, knowledgeable, and helpful assistant named Taskly. You are an expert in productivity and project management.";
  }
};

const getContextualPrompt = (view: AppView): string => {
    switch (view) {
        case 'lists': return "The user is on the Tasks page. Your primary goal is to help them manage their tasks. You can create new tasks, or add items to existing multi-item lists.";
        case 'habits': return "The user is on the Habits page. Your primary goal is to help them create and track habits.";
        default: return "The user is in a general context. Be a helpful assistant for productivity and project management.";
    }
}

const actionPrompt = `
You have special capabilities to help the user. When you recognize an intent to perform an action, you MUST format your response with a special action tag.
The action tag is ALWAYS at the end of your response, on a new line. Be precise. A 'note' is for capturing information, a 'task' or 'list' is for actionable to-do items, and a 'habit' is for recurring routines.

Available Actions:

1. Create a single task:
[ACTION:CREATE_TASK]{"text": "Task description", "dueDate": "YYYY-MM-DD"}
- Use this when the user wants to create a single to-do item.
- dueDate is optional.

2. Create a daily habit:
[ACTION:CREATE_HABIT]{"text": "Habit description"}
- Use this when the user wants to start tracking a new daily habit.

3. Add items to a multi-item list or create a new list:
[ACTION:ADD_ITEMS_TO_LIST]{"listName": "Name of the list", "items": ["item 1", "item 2"]}
- Use this when a user wants to create a new list with items, or add one or more items to a specific list.
- Example: "Create a shopping list with bread and milk" or "add eggs to my shopping list".
- If the list doesn't exist, it will be created.
- IMPORTANT: If the user asks to create a list with MORE THAN 5 items, do NOT use this action. Instead, use SUGGEST_TASKS.

4. Suggest tasks for the user to approve:
[ACTION:SUGGEST_TASKS]{"listName": "Name of the List", "items": [{"text": "Task 1", "dueDate": "YYYY-MM-DD"}, {"text": "Task 2"}]}
- Use this when brainstorming, creating a plan, or when the user asks for a list with more than 5 items.
- This allows the user to confirm before a large list is created. Instead of creating tasks directly, suggest them so the user can approve them.

5. Mark an item as complete:
[ACTION:COMPLETE_ITEM]{"itemName": "Name of the item to complete", "itemType": "task" | "habit"}
- Use this when the user says they have completed, finished, or are done with a specific task or habit.
- Example: "I am done with 'Call the bank'" should trigger with itemName: "Call the bank".
- For itemType, infer if it's a 'task' or 'habit'. If it's ambiguous, 'task' is a safe default.

6. Create a note:
[ACTION:CREATE_NOTE]{"noteTitle": "Title for the note", "noteContent": "Optional initial content."}
- Use this when the user wants to write down information, ideas, or meeting minutes. This is for non-actionable text content.

7. Create an event:
[ACTION:CREATE_EVENT]{"title": "Event title", "description": "Optional description", "startDate": "YYYY-MM-DD", "startTime": "HH:MM", "endDate": "YYYY-MM-DD", "endTime": "HH:MM", "isAllDay": false}
- Use this when a user wants to schedule an appointment or event.
- startTime, endDate, endTime are optional.

Example:
User: "I need to plan a birthday party. Can you help?"
Model: "Of course! Here are a few things to get you started.
[ACTION:SUGGEST_TASKS]{"listName": "Birthday Party Plan", "items": [{"text": "Send out invitations"}, {"text": "Order a cake"}, {"text": "Buy decorations"}]}"

Respond with ONLY ONE action tag per response. Your friendly text response should come first, followed by the action tag on a new line.
`;

export const parseAIResponse = async (
  history: Message[],
  newMessage: string,
  currentView: AppView,
  preferences: UserPreferences,
  project?: Project,
  filesForContext?: ProjectFile[],
  projectSnapshot?: string
): Promise<AIResponse> => {
  if (!ai) initAI();
  let promptText = newMessage;
  const parts: Part[] = [];

  // System instruction construction
  let systemInstruction = getPersonalityPrompt(preferences.personality);
  systemInstruction += `\n${getContextualPrompt(currentView)}`;
  if (preferences.nickname) systemInstruction += ` The user's name is ${preferences.nickname}.`;
  if (preferences.occupation) systemInstruction += ` They work as a ${preferences.occupation}.`;
  if (preferences.personalNotes) systemInstruction += ` Here are some personal notes about the user: ${preferences.personalNotes}.`;
  if (project) {
      systemInstruction += `\n\n--- PROJECT CONTEXT: ${project.name} ---\n`;
      systemInstruction += `Description: ${project.description}\n`;
      if (project.instructions) systemInstruction += `AI INSTRUCTIONS FOR THIS PROJECT: ${project.instructions}\n`;
      systemInstruction += `--- END PROJECT CONTEXT ---`;
  }
  if (projectSnapshot) {
    systemInstruction += `\n\n--- PROJECT SNAPSHOT ---\n${projectSnapshot}\n--- END PROJECT SNAPSHOT ---`;
  }
  systemInstruction += actionPrompt;

  // Process files for context (text-only). Image inputs are intentionally ignored.
  if (filesForContext && filesForContext.length > 0) {
    for (const file of filesForContext) {
      if (file.mimeType === 'text/plain' || file.mimeType === 'text/markdown') {
        try {
          const textContent = atob(file.data);
          promptText += `\n\n--- FILE CONTENT (${file.name}) ---\n${textContent}\n--- END FILE CONTENT ---`;
        } catch (e) {
          console.error(`Failed to decode base64 for file ${file.name}:`, e);
        }
      }
    }
  }
  parts.push({ text: promptText });

  const contents = history
    .map((msg): { role: string; parts: Part[] } => ({
      role: msg.sender === Sender.User ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }))
    .concat([{ role: 'user', parts }]);
  
  if (!ai) {
    return { text: "AI is not configured. Please add your API key in the app settings or environment (VITE_API_KEY).", action: undefined };
  }
  const result = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
          temperature: 0.7,
          topK: 64,
          topP: 0.95,
          systemInstruction,
       },
  });

  let text = result.text;
  const actionRegex = /\[ACTION:(\w+)\](.*)/s;
  const match = text.match(actionRegex);

  let action: AIResponse['action'] | undefined;

  if (match) {
    text = text.replace(actionRegex, '').trim(); // Clean the action from the text
    const actionType = match[1] as any;
    try {
      const payload = JSON.parse(match[2]);
      if (actionType === 'SUGGEST_TASKS' && Array.isArray(payload)) {
          // It's the old array format, wrap it for compatibility
          action = { type: actionType, payload: { items: payload } };
      } else {
          action = { type: actionType, payload };
      }
    } catch (error) {
      console.error("Failed to parse AI action payload:", match[2], error);
    }
  }

  return { text, action };
};

export const generateTitleForChat = async (firstMessage: string): Promise<string> => {
    const prompt = `Return ONLY a concise chat title for this first message, max 5 words, no punctuation, no quotes, no emojis, no bullets. Message: "${firstMessage}"`;
  if (!ai) initAI();
  if (!ai) {
    // Fallback to a simple heuristic title
    const trimmed = firstMessage.replace(/\s+/g, ' ').trim();
    const simple = (trimmed.length > 32 ? trimmed.slice(0, 32) : trimmed) || 'New Chat';
    // Use first 5 words heuristic
    const words = simple.split(' ').filter(Boolean).slice(0, 5).join(' ');
    return words || 'New Chat';
  }
  const result = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    let title = result.text.replace(/["'•\-–—\n]/g, ' ').replace(/\s+/g, ' ').trim();
    // Keep at most 5 words and 36 chars
    const words = title.split(' ').filter(Boolean).slice(0, 5).join(' ');
    title = words.slice(0, 36).trim();
    if (!title) title = 'New Chat';
    return title;
};

export const generateTasksFromNote = async (
  noteTitle: string,
  noteContent: string
): Promise<{ listName: string, tasks: { text: string, dueDate?: string }[] }> => {
  if (!ai) initAI();

  const plainTextContent = new DOMParser().parseFromString(noteContent, 'text/html').body.textContent || '';

  const prompt = `
    Analyze the following note to generate a task list.
    Note Title: "${noteTitle}"
    Note Content:
    ---
    ${plainTextContent}
    ---
    Based on the note, please suggest a concise name for a new task list and break down the content into individual, actionable tasks.
    For each task, identify if there is a specific due date mentioned (like "by Friday", "on Tuesday", "tomorrow", or a specific date) and format it as YYYY-MM-DD.
    Today's date is ${new Date().toISOString().split('T')[0]}.
    Provide the response in the requested JSON format.
  `;

  if (!ai) {
    throw new Error('AI not configured');
  }
  const result = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          listName: {
            type: Type.STRING,
            description: "A concise name for the task list, based on the note's title or content."
          },
          tasks: {
            type: Type.ARRAY,
            description: "A list of actionable tasks extracted from the note.",
            items: {
              type: Type.OBJECT,
              properties: {
                text: {
                  type: Type.STRING,
                  description: "The description of a single task."
                },
                dueDate: {
                  type: Type.STRING,
                  description: "The due date for the task in YYYY-MM-DD format, if mentioned. Otherwise, this can be omitted."
                }
              },
              required: ["text"]
            }
          }
        },
        required: ["listName", "tasks"]
      }
    }
  });

  try {
    const jsonText = result.text.trim();
    const parsed = JSON.parse(jsonText);
    if (parsed && typeof parsed.listName === 'string' && Array.isArray(parsed.tasks)) {
        return parsed;
    }
    console.error("AI response for task generation did not match expected schema:", parsed);
    throw new Error("AI response was not valid JSON or did not match schema.");
  } catch (e) {
    console.error("Failed to parse JSON response from AI for task generation:", e);
    throw new Error("AI response was not valid JSON.");
  }
};

// Parse a free-form prompt into a structured Request draft
export const parseRequestFromPrompt = async (prompt: string): Promise<Partial<Request>> => {
  if (!ai) initAI();

  // Fallback when AI isn't configured: seed minimal draft
  if (!ai) {
    const today = new Date().toISOString().split('T')[0];
    return {
      problem: prompt,
      outcome: '',
      valueProposition: '',
      affectedUsers: '',
      priority: 'medium',
      details: '',
      requestedExpertise: [],
      // Lightweight natural language date normalization in fallback
      desiredStartDate: inferDateFromText(prompt) || undefined,
      desiredEndDate: undefined,
    } as Partial<Request>;
  }

  const sys = `Extract a product request from the user's one-message prompt.
Return ONLY JSON that matches the given schema. Do not include commentary.
Infer fields conservatively. Do not invent facts not implied by the text.
If a field is unknown, omit it. Prefer concise phrasing for text fields.
Infer priority (low/medium/high/critical) when urgency or impact is clear; otherwise leave it out.`;

  const today = new Date().toISOString().split('T')[0];

  const result = await ai.models.generateContent({
    model,
    contents: [
      { role: 'user', parts: [{ text: sys }] },
      { role: 'user', parts: [{ text: `Today is ${today}. Parse this prompt:\n---\n${prompt}\n---` }] },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          product: { type: Type.STRING },
          requester: { type: Type.STRING },
          problem: { type: Type.STRING },
          outcome: { type: Type.STRING },
          valueProposition: { type: Type.STRING },
          affectedUsers: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['low','medium','high','critical'] },
          requestedExpertise: { type: Type.ARRAY, items: { type: Type.STRING } },
          desiredStartDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
          desiredEndDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
          details: { type: Type.STRING },
        },
      },
    },
  });

  try {
    const text = (result.text || '').trim();
    const obj = JSON.parse(text);
    const out: Partial<Request> = {};
    const copyIf = (k: keyof Request) => { if (obj[k] && typeof obj[k] === 'string') (out as any)[k] = obj[k]; };
    copyIf('product');
    copyIf('requester');
    copyIf('problem');
    copyIf('outcome');
    copyIf('valueProposition');
    copyIf('affectedUsers');
    copyIf('details');
    if (obj.priority && ['low','medium','high','critical'].includes(obj.priority)) out.priority = obj.priority as RequestPriority;
    if (Array.isArray(obj.requestedExpertise)) out.requestedExpertise = (obj.requestedExpertise as string[]).filter(x => typeof x === 'string');
    if (typeof obj.desiredStartDate === 'string') out.desiredStartDate = normalizeToISO(obj.desiredStartDate) || obj.desiredStartDate;
    if (typeof obj.desiredEndDate === 'string') out.desiredEndDate = normalizeToISO(obj.desiredEndDate) || obj.desiredEndDate;
    return out;
  } catch (e) {
    console.error('Failed to parse AI request draft JSON', e);
    return {
      problem: prompt,
      priority: 'medium',
    } as Partial<Request>;
  }
};

// --- Small helpers for natural language date parsing ---
const normalizeToISO = (text: string): string | null => inferDateFromText(text);

function inferDateFromText(text: string): string | null {
  const t = text.toLowerCase();
  const now = new Date();
  const todayISO = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
  // tomorrow
  if (/(tomorrow|tmrw|tomm?)/.test(t)) {
    const d = new Date(now); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  // today
  if (/(today|by end of day|eod)/.test(t)) {
    return todayISO;
  }
  // Next weekday, e.g., by Friday / on Friday / Friday
  const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  for (let i = 0; i < 7; i++) {
    const name = weekdays[i];
    const regex = new RegExp(`\\b(${name}|${name.slice(0,3)})\\b`);
    if (regex.test(t)) {
      const diff = (i - now.getDay() + 7) % 7 || 7; // if same day mentioned, pick next week
      const d = new Date(now); d.setDate(d.getDate() + diff);
      return d.toISOString().split('T')[0];
    }
  }
  // Explicit dates like 2025-10-02
  const ymd = t.match(/(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (ymd) {
    const y = Number(ymd[1]), m = Number(ymd[2]) - 1, d = Number(ymd[3]);
    const dt = new Date(y, m, d);
    if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
  }
  return null;
}

// Suggest Request intake improvements: normalize text and infer priority.
export const generateRequestAssist = async (
  draft: Partial<Request>
): Promise<Partial<Request>> => {
  if (!ai) initAI();
  if (!ai) {
    throw new Error('AI not configured');
  }

  const prompt = `You are helping triage a product support/request intake.
Given a partially filled request, return improved fields:
- Rewrite problem, outcome, valueProposition, affectedUsers for clarity and concision (keep factual content, avoid exaggeration).
- Infer an appropriate priority: low, medium, high, or critical based on urgency, customer impact, and business risk.
- Do not invent new facts. If a field is missing, leave it out.
Return ONLY JSON as specified.`;

  const payload = {
    product: draft.product || '',
    problem: draft.problem || '',
    outcome: draft.outcome || '',
    valueProposition: draft.valueProposition || '',
    affectedUsers: draft.affectedUsers || '',
    requester: draft.requester || '',
    details: draft.details || '',
  };

  const result = await ai.models.generateContent({
    model,
    contents: [
      { role: 'user', parts: [{ text: prompt }] },
      { role: 'user', parts: [{ text: JSON.stringify(payload) }] },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problem: { type: Type.STRING },
          outcome: { type: Type.STRING },
          valueProposition: { type: Type.STRING },
          affectedUsers: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['low','medium','high','critical'] },
        },
      },
    },
  });

  try {
    const text = (result.text || '').trim();
    const obj = JSON.parse(text);
    const out: Partial<Request> = {};
    if (obj.problem && typeof obj.problem === 'string') out.problem = obj.problem;
    if (obj.outcome && typeof obj.outcome === 'string') out.outcome = obj.outcome;
    if (obj.valueProposition && typeof obj.valueProposition === 'string') out.valueProposition = obj.valueProposition;
    if (obj.affectedUsers && typeof obj.affectedUsers === 'string') out.affectedUsers = obj.affectedUsers;
    if (obj.priority && ['low','medium','high','critical'].includes(obj.priority)) out.priority = obj.priority as RequestPriority;
    return out;
  } catch (e) {
    console.error('Failed to parse AI request assist JSON', e);
    throw new Error('AI response was not valid JSON.');
  }
};

// Generate one or more stories from a Request
export const generateStoriesFromRequest = async (
  req: Request
): Promise<Array<Pick<Story, 'title' | 'description' | 'projectId' | 'categoryId'>>> => {
  if (!ai) initAI();
  if (!ai) throw new Error('AI not configured');

  const prompt = `You are a product/story writing assistant. Convert the following product request into 1-4 concise user stories.
Return JSON: [{"title":"...","description":"..."}]. Keep titles short and descriptions clear and testable. If helpful, include bullet acceptance hints within description.

REQUEST:
Product: ${req.product}
Requester: ${req.requester}
Problem: ${req.problem}
Outcome: ${req.outcome}
Value: ${req.valueProposition}
Users: ${req.affectedUsers}
Priority: ${req.priority}
Expertise: ${(req.requestedExpertise || []).join(', ')}`;

  const result = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json'
    },
  });

  try {
    const text = (result.text || '[]').trim();
    const arr = JSON.parse(text);
    if (Array.isArray(arr)) {
      return arr
        .filter((s: any) => s && typeof s.title === 'string')
        .map((s: any) => ({ title: s.title, description: typeof s.description === 'string' ? s.description : '' })) as any;
    }
    return [];
  } catch (e) {
    console.error('Failed to parse AI stories JSON', e);
    return [];
  }
};