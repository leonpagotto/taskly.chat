import React, { useRef, useEffect, useState } from 'react';
import { Conversation, Message, Sender, Project, UserCategory } from '../types';
import { Icon, ChevronLeftIcon, ChatBubbleIcon, AddIcon, CheckIcon, CloseIcon, CreateNewFolderIcon } from './icons';
import ProjectLinkModal from './ProjectLinkModal';


interface ChatViewProps {
  conversation: Conversation;
  project?: Project;
  projects: Project[];
  userCategories: UserCategory[];
  isLoading: boolean;
  onBack: () => void;
  onMove: (projectId?: string) => void;
  onApproveTask: (conversationId: string, messageId: string, taskText: string, dueDate?: string) => void;
  onApproveAllTasks: (conversationId: string, messageId: string) => void;
  isPanel?: boolean;
}

const ChatMessage: React.FC<{ 
  message: Message,
  conversationId: string;
  onApproveTask: (conversationId: string, messageId: string, taskText: string, dueDate?: string) => void;
  onApproveAllTasks: (conversationId: string, messageId: string) => void;
}> = ({ message, conversationId, onApproveTask, onApproveAllTasks }) => {
  const isUser = message.sender === Sender.User;
  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-600)] to-purple-600 flex-shrink-0"></div>
      )}
      <div 
        className={`rounded-xl max-w-lg ${isUser ? 'bg-[var(--color-primary-600)] text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}
      >
        <div 
          className="px-4 py-3"
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {message.text}
        </div>
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="border-t border-gray-300/30 dark:border-gray-600/50 mt-2 p-3 space-y-2">
            {message.suggestionListName ? (
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{message.suggestionListName}</h4>
                <button
                  onClick={() => onApproveAllTasks(conversationId, message.id)}
                  disabled={message.suggestions.every(s => s.isApproved)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors disabled:cursor-not-allowed bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900 disabled:bg-green-100 disabled:dark:bg-green-900/50 disabled:text-green-700 disabled:dark:text-green-400"
                >
                  <CheckIcon className="text-base"/>
                  {message.suggestions.every(s => s.isApproved) ? 'Added' : 'Add All to List'}
                </button>
              </div>
            ) : (
               <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Suggested Tasks:</h4>
            )}
            
            {message.suggestions.map((task, index) => (
              <div key={index} className="bg-gray-100/50 dark:bg-gray-800/60 p-2.5 rounded-lg flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{task.text}</p>
                  {task.dueDate && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Due: {task.dueDate}</p>}
                </div>
                <button
                  onClick={() => onApproveTask(conversationId, message.id, task.text, task.dueDate)}
                  disabled={task.isApproved}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors disabled:cursor-not-allowed
                    ${task.isApproved 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' 
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900'}`
                  }
                >
                  {task.isApproved ? <CheckIcon className="text-base"/> : <AddIcon className="text-base"/>}
                  {task.isApproved ? 'Added' : 'Add Task'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatView: React.FC<ChatViewProps> = (props) => {
    const { conversation, project, projects, userCategories, isLoading, onBack, onMove, onApproveTask, onApproveAllTasks, isPanel = false } = props;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation?.messages, isLoading]);

  const title = conversation?.name || "AI Assistant";
  const projectName = project?.name;

    const category = project?.categoryId ? userCategories.find(c => c.id === project.categoryId) : undefined;
    const projectColor = project?.color || category?.color;
    const projectIcon = project?.icon || category?.icon || 'folder';

    // Resolve a friendly nickname for the greeting
    const getNickname = (): string => {
      try {
        const raw = window.localStorage.getItem('preferences') || window.localStorage.getItem('user.preferences');
        if (raw) {
          const obj = JSON.parse(raw);
          return obj?.nickname || obj?.name || 'there';
        }
      } catch {}
      return 'there';
    };

    const nickname = getNickname();

    const quickPrompt = (text: string, send = false) => {
      try {
        window.dispatchEvent(new CustomEvent('taskly.quickPrompt', { detail: { text, send } }));
      } catch {}
    };

    return (
    <>
        <ProjectLinkModal
            title="Add Chat to Project"
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            projects={projects}
            userCategories={userCategories}
            currentProjectId={conversation.projectId}
            onLink={(projectId) => onMove(projectId)}
            itemType="Chat"
        />
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 flex-shrink-0 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isPanel ? (
                      <button onClick={onBack} className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                      </button>
                    ) : (
                      <button onClick={onBack} className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white md:hidden">
                        <ChevronLeftIcon className="w-6 h-6" />
                      </button>
                    )}
                    {projectName ? 
                        <Icon name={projectIcon} className="text-xl text-gray-500 dark:text-gray-400" style={{color: projectColor}} /> 
                        : <ChatBubbleIcon className="text-xl text-gray-500 dark:text-gray-400" />
                    }
          <div className="truncate flex-1">
            <span className="truncate font-semibold text-xl">{title}</span>
          </div>
                </div>
        <div className="flex-shrink-0">
          {project ? (
            <button onClick={() => setIsProjectModalOpen(true)} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full transition-colors bg-gray-200/80 dark:bg-gray-700/50 hover:bg-gray-300/80 dark:hover:bg-gray-700">
              <Icon name={projectIcon} className="text-base" style={{ color: projectColor }} />
              <span className="truncate max-w-[36ch]">{projectName}</span>
            </button>
          ) : (
            <button onClick={() => setIsProjectModalOpen(true)} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors bg-gray-200/80 dark:bg-gray-700/50 hover:bg-gray-300/80 dark:hover:bg-gray-700">
              <CreateNewFolderIcon className="text-base" />
              <span>Add to a project</span>
            </button>
          )}
        </div>
            </header>
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6">
          <div className="mx-auto w-full max-w-[52rem] py-4 sm:py-6">
                {conversation.messages.length === 0 && !isLoading ? (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <div className="mx-auto max-w-2xl pt-16 sm:pt-20 pb-6">
                          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                            {`How can I help you, ${nickname}?`}
                          </h1>
                          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
                            <button onClick={() => quickPrompt('Create a task to …')} className="px-3 sm:px-4 py-1.5 rounded-full text-sm bg-white/5 dark:bg-white/5 hover:bg-white/10 text-white/90 border border-white/10">
                              ✨ Create
                            </button>
                            <button onClick={() => quickPrompt('Explore my projects and suggest priorities')} className="px-3 sm:px-4 py-1.5 rounded-full text-sm bg-white/5 dark:bg-white/5 hover:bg-white/10 text-white/90 border border-white/10">
                              📂 Explore
                            </button>
                            <button onClick={() => quickPrompt('Generate code for …')} className="px-3 sm:px-4 py-1.5 rounded-full text-sm bg-white/5 dark:bg-white/5 hover:bg-white/10 text-white/90 border border-white/10">
                              💻 Code
                            </button>
                            <button onClick={() => quickPrompt('Teach me about …')} className="px-3 sm:px-4 py-1.5 rounded-full text-sm bg-white/5 dark:bg-white/5 hover:bg-white/10 text-white/90 border border-white/10">
                              📚 Learn
                            </button>
                          </div>
                          <div className="mx-auto max-w-xl text-left text-gray-700 dark:text-gray-300/80">
                            <button onClick={() => quickPrompt('Plan my day with 3 top tasks and quick wins', true)} className="w-full text-left py-3 border-b border-white/10 hover:text-white/90">
                              How should I plan my day?
                            </button>
                            <button onClick={() => quickPrompt('Add “Buy milk” to my Groceries list', true)} className="w-full text-left py-3 border-b border-white/10 hover:text-white/90">
                              Add “Buy milk” to Groceries
                            </button>
                            <button onClick={() => quickPrompt('Create a weekly habit for reading 30 minutes', true)} className="w-full text-left py-3 border-b border-white/10 hover:text-white/90">
                              Create a reading habit
                            </button>
                            <button onClick={() => quickPrompt('Summarize the status of Project Alpha and next steps', true)} className="w-full text-left py-3 hover:text-white/90">
                              Summarize Project Alpha
                            </button>
                          </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        {conversation.messages.map(msg => (
                            <ChatMessage key={msg.id} message={msg} conversationId={conversation.id} onApproveTask={onApproveTask} onApproveAllTasks={onApproveAllTasks} />
                        ))}
                        {isLoading && (
                           <div className="flex items-start gap-3 my-4 justify-start">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-600)] to-purple-600 flex-shrink-0"></div>
                              <div className="px-4 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                                </div>
                              </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
          </div>
        </div>
            </main>
        </div>
    </>
    );
};

export default ChatView;
