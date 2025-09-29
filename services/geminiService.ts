import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part, Type } from "@google/genai";
import { Message, Sender, UserPreferences, AIResponse, AppView, Project, ProjectFile } from '../types';

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
  filesForContext?: ProjectFile[]
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
    const prompt = `Generate a very short, concise title (4-5 words max) for a chat that starts with this message: "${firstMessage}"`;
  if (!ai) initAI();
  if (!ai) {
    // Fallback to a simple heuristic title
    const trimmed = firstMessage.replace(/\s+/g, ' ').trim();
    return (trimmed.length > 24 ? trimmed.slice(0, 24) + '…' : trimmed) || 'New Chat';
  }
  const result = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    return result.text.replace(/["']/g, "").trim() || "New Chat";
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