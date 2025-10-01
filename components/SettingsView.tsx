import React, { useState, useEffect } from 'react';
import { setApiKey as setGeminiApiKey } from '../services/geminiService';
import { UserPreferences, AIPersonality, AppTheme, AppColorTheme, AppLanguage, UserCategory, PulseWidgetConfig, PulseWidgetType, AppSize } from '../types';
import { SettingsIcon, WarningIcon, CheckCircleIcon, CloseIcon, DeleteIcon, EditIcon, LeftPanelOpenIcon } from './icons';
import CategoriesView from './CategoriesView';
import Header from './Header';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdate: (newPreferences: UserPreferences) => void;
  onReset: () => void;
  onToggleSidebar: () => void;
  t: (key: string) => string;
  // Category Management Props
  categories: UserCategory[];
  onNewCategory: () => void;
  onEditCategory: (category: UserCategory) => void;
  targetTab?: string;
    // Auth (Supabase) controls
    authEmail?: string | null;
    onSignIn?: () => void;
    onSignOut?: () => void;
    supabaseEnabled?: boolean;
}

const personalityOptions: { value: AIPersonality; label: string; description: string }[] = [
  { value: 'smart', label: 'Smart', description: 'Knowledgeable and helpful.' },
  { value: 'direct', label: 'Direct', description: 'Straight to the point.' },
  { value: 'concise', label: 'Concise', description: 'Brief and clear.' },
  { value: 'encouraging', label: 'Encouraging', description: 'Positive and supportive.' },
  { value: 'gen_z', label: 'Generation Z', description: 'Uses modern slang and emojis.' },
  { value: 'conservative', label: 'Conservative', description: 'Formal and traditional.' },
];

const colorThemeOptions: { value: AppColorTheme; hex: string }[] = [
    { value: 'blue', hex: '#3B82F6' },
    { value: 'purple', hex: '#8B5CF6' },
    { value: 'green', hex: '#22C55E' },
    { value: 'orange', hex: '#F97316' },
];

const languageOptions: { value: AppLanguage; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'nl', label: 'Dutch' },
    { value: 'auto', label: 'Auto-Detect' },
];

type SettingsTab = 'profile' | 'ai' | 'appearance' | 'categories' | 'pulse';

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-900/50 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>
        <div className="space-y-4">{children}</div>
    </div>
);

const FormRow: React.FC<{ label: string; htmlFor: string; children: React.ReactNode; description?: string }> = ({ label, htmlFor, children, description }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="mt-1">{children}</div>
        {description && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)] border border-transparent focus:border-[var(--color-primary-600)]" />
);
const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)] border border-transparent focus:border-[var(--color-primary-600)]" />
);
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)] border border-transparent focus:border-[var(--color-primary-600)]" />
);

const ToggleSwitch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string; }> = ({ label, checked, onChange, description }) => (
    <div>
        <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary-600)]"></div>
            </label>
        </div>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
    </div>
);

const PulseConfigModal: React.FC<{
    widget: PulseWidgetConfig | null;
    onClose: () => void;
    onSave: (widget: PulseWidgetConfig) => void;
    t: (key: string) => string;
}> = ({ widget, onClose, onSave, t }) => {
    const [config, setConfig] = useState<PulseWidgetConfig>(widget || { id: `pulse-${Date.now()}`, type: 'weather', meta: {} });
    const isNew = !widget;

    const widgetTypes: { value: PulseWidgetType; label: string; needsMeta: boolean }[] = [
        { value: 'weather', label: t('pulse_weather'), needsMeta: true },
        { value: 'stock', label: t('pulse_stock'), needsMeta: true },
        { value: 'crypto', label: t('pulse_crypto'), needsMeta: true },
        { value: 'email', label: t('pulse_email'), needsMeta: false },
        { value: 'calendar', label: t('pulse_calendar'), needsMeta: false },
        { value: 'exchange', label: t('pulse_exchange'), needsMeta: true },
        { value: 'trending', label: t('pulse_trending'), needsMeta: false },
    ];

    const handleTypeChange = (type: PulseWidgetType) => {
        setConfig({ ...config, type, meta: {} }); // Reset meta on type change
    };

    const handleMetaChange = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, meta: { ...prev.meta, [key]: value } }));
    };

    const renderMetaFields = () => {
        switch (config.type) {
            case 'weather': return <TextInput placeholder={t('pulse_config_city')} value={config.meta?.city || ''} onChange={e => handleMetaChange('city', e.target.value)} />;
            case 'stock': return <TextInput placeholder={t('pulse_config_ticker')} value={config.meta?.ticker || ''} onChange={e => handleMetaChange('ticker', e.target.value)} />;
            case 'crypto': return <TextInput placeholder={t('pulse_config_symbol')} value={config.meta?.symbol || ''} onChange={e => handleMetaChange('symbol', e.target.value)} />;
            case 'exchange': return (
                <div className="flex gap-2">
                    <TextInput placeholder={t('pulse_config_from')} value={config.meta?.from || ''} onChange={e => handleMetaChange('from', e.target.value)} />
                    <TextInput placeholder={t('pulse_config_to')} value={config.meta?.to || ''} onChange={e => handleMetaChange('to', e.target.value)} />
                </div>
            );
            default: return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-900/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
                 <header className="p-4 flex items-center justify-between border-b border-gray-700">
                    <h2 className="text-lg font-semibold">{t('pulse_configure_widget')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </header>
                <main className="p-6 space-y-4">
                    <FormRow label={t('pulse_select_type')} htmlFor="pulse-type">
                        <Select id="pulse-type" value={config.type} onChange={e => handleTypeChange(e.target.value as PulseWidgetType)}>
                            {widgetTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Select>
                    </FormRow>
                    {renderMetaFields()}
                </main>
                 <footer className="p-4">
                    <button onClick={() => onSave(config)} className="w-full px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all">
                        {isNew ? 'Add Widget' : 'Save Changes'}
                    </button>
                </footer>
            </div>
        </div>
    );
};


const SettingsView: React.FC<SettingsViewProps> = (props) => {
    const { preferences, onUpdate, onReset, onToggleSidebar, t, categories, onNewCategory, onEditCategory, targetTab, authEmail, onSignIn, onSignOut, supabaseEnabled } = props;
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [localPrefs, setLocalPrefs] = useState(preferences);
    const [showSaved, setShowSaved] = useState(false);
    const [pulseModalConfig, setPulseModalConfig] = useState<PulseWidgetConfig | null>(null);
    const [isPulseModalNew, setIsPulseModalNew] = useState(false);
    const API_MISSING = !(import.meta as any).env?.VITE_API_KEY;
    const existingLocalApiKey = (() => { try { return localStorage.getItem('ai.apiKey') || ''; } catch { return ''; } })();
    const [apiKeyInput, setApiKeyInput] = useState<string>(existingLocalApiKey);
    const [apiStatus, setApiStatus] = useState<'unset' | 'saved'>(() => (existingLocalApiKey ? 'saved' : 'unset'));
    const [hideAIBanner, setHideAIBanner] = useState<boolean>(() => {
        try { return localStorage.getItem('settings.hideAIBanner') === 'true'; } catch { return false; }
    });
    const [showUpgrade, setShowUpgrade] = useState(false);
    const dismissBanner = () => {
        setHideAIBanner(true);
        try { localStorage.setItem('settings.hideAIBanner', 'true'); } catch {}
    };


    useEffect(() => {
        setLocalPrefs(preferences);
    }, [preferences]);
    
    useEffect(() => {
        if(targetTab) {
            setActiveTab(targetTab as SettingsTab);
        }
    }, [targetTab]);

    const handleUpdateLocal = (update: Partial<UserPreferences>) => {
      setLocalPrefs(prev => ({...prev, ...update}));
    }

    const handleSave = () => {
      onUpdate(localPrefs);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2500);
    };

    const handleDiscard = () => {
      setLocalPrefs(preferences);
    };
    
    const isDirty = JSON.stringify(localPrefs) !== JSON.stringify(preferences);

    const tabs = [
        { id: 'profile', label: t('settings_user_profile') },
        { id: 'ai', label: t('settings_ai_memory') },
        { id: 'appearance', label: t('settings_appearance') },
        { id: 'categories', label: t('categories') },
        { id: 'pulse', label: t('settings_pulse') },
    ];
    
    const sizeOptions: { value: AppSize, label: string }[] = [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
    ];

    const handleSavePulseWidget = (widget: PulseWidgetConfig) => {
        const widgets = [...localPrefs.pulseWidgets];
        if (isPulseModalNew) {
            widgets.push(widget);
        } else {
            const index = widgets.findIndex(w => w.id === widget.id);
            if (index > -1) widgets[index] = widget;
        }
        handleUpdateLocal({ pulseWidgets: widgets });
        setPulseModalConfig(null);
        setIsPulseModalNew(false);
        // Provide feedback
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2500);
    };
    
    const handleRemovePulseWidget = (id: string) => {
        const widgets = localPrefs.pulseWidgets.filter(w => w.id !== id);
        handleUpdateLocal({ pulseWidgets: widgets });
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <SettingsCard title={t('settings_user_profile')}>
                            <FormRow label={t('settings_nickname')} htmlFor="nickname">
                                <TextInput id="nickname" type="text" value={localPrefs.nickname} onChange={e => handleUpdateLocal({ nickname: e.target.value })} placeholder="e.g., Alex"/>
                            </FormRow>
                            <FormRow label={t('settings_occupation')} htmlFor="occupation">
                                <TextInput id="occupation" type="text" value={localPrefs.occupation} onChange={e => handleUpdateLocal({ occupation: e.target.value })} placeholder="e.g., Software Engineer"/>
                            </FormRow>
                            <FormRow label={t('settings_personal_notes')} htmlFor="personal-notes" description={t('settings_personal_notes_desc')}>
                                <TextArea id="personal-notes" value={localPrefs.personalNotes} onChange={e => handleUpdateLocal({ personalNotes: e.target.value })} rows={3} placeholder="e.g., I prefer concise answers and I work in the tech industry."/>
                            </FormRow>
                             <FormRow label={t('settings_language')} htmlFor="language">
                                <Select id="language" value={localPrefs.language} onChange={e => handleUpdateLocal({ language: e.target.value as AppLanguage })}>
                                    {languageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </Select>
                            </FormRow>
                        </SettingsCard>

                                                <SettingsCard title="Account">
                                                        {supabaseEnabled ? (
                                                            <div className="mb-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                                                                {authEmail ? (
                                                                    <div className="flex items-center justify-between">
                                                                        <div>
                                                                            <div className="text-sm text-gray-400">Signed in</div>
                                                                            <div className="font-semibold">{authEmail}</div>
                                                                        </div>
                                                                        <button onClick={() => onSignOut?.()} className="px-4 py-2 rounded-[var(--radius-button)] bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold text-sm">Sign out</button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="text-sm text-gray-400">Sync your data across devices</div>
                                                                        <button onClick={() => onSignIn?.()} className="px-4 py-2 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white text-sm font-semibold hover:shadow">Sign in</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="mb-4 text-sm text-amber-500">Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env to enable cloud sync.</div>
                                                        )}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setShowUpgrade(true)}
                                    className="px-4 py-2 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white text-sm font-semibold hover:shadow"
                                >
                                    Upgrade (mock)
                                </button>
                                <button
                                    onClick={() => {
                                        try {
                                            // Clear mock auth and preferences for logout
                                            localStorage.removeItem('auth.token');
                                            localStorage.removeItem('auth.user');
                                            localStorage.setItem('onboarding.seen', 'true');
                                        } catch {}
                                        location.reload();
                                    }}
                                    className="px-4 py-2 rounded-[var(--radius-button)] bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold text-sm"
                                >
                                    Log out
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Upgrade is a demo flow for now; payments are not yet wired.</p>
                        </SettingsCard>
                    </div>
                );
            case 'ai':
                return (
                    <div className="space-y-6">
                        <SettingsCard title="Chatbot Personality & Behavior">
                            <FormRow label={t('settings_personality')} htmlFor="personality">
                                <Select id="personality" value={localPrefs.personality} onChange={e => handleUpdateLocal({ personality: e.target.value as AIPersonality })}>
                                    {personalityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </Select>
                            </FormRow>
                            <FormRow label="AI project context verbosity" htmlFor="ai-verbosity" description="Control how much project data is summarized and sent to the AI. Concise is faster and lighter; Detailed includes more lists, notes, stories, and events.">
                                <Select
                                  id="ai-verbosity"
                                  value={localPrefs.aiSnapshotVerbosity || 'concise'}
                                  onChange={e => handleUpdateLocal({ aiSnapshotVerbosity: (e.target.value as 'concise' | 'detailed') })}
                                >
                                  <option value="concise">Concise (recommended)</option>
                                  <option value="detailed">Detailed</option>
                                </Select>
                            </FormRow>
                        </SettingsCard>
                        <SettingsCard title="Gemini API">
                            <p className="text-sm text-gray-400 -mt-1">Add your Gemini API key to enable AI chat and smart features. The key is stored locally on this device.</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="password"
                                    value={apiKeyInput}
                                    onChange={e => setApiKeyInput(e.target.value)}
                                    placeholder="Paste your Gemini API key"
                                    className="flex-1 bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]"
                                />
                                <button
                                    onClick={() => {
                                        setGeminiApiKey(apiKeyInput || null);
                                        setApiStatus(apiKeyInput ? 'saved' : 'unset');
                                        setShowSaved(true);
                                        setTimeout(() => setShowSaved(false), 2000);
                                    }}
                                    className="px-3 py-2 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white text-sm font-semibold hover:shadow"
                                >
                                    {apiKeyInput ? 'Save' : 'Clear'}
                                </button>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                Status: {apiStatus === 'saved' ? <span className="text-green-400">Configured</span> : <span className="text-amber-400">Not set</span>}
                            </div>
                        </SettingsCard>
                        <SettingsCard title={t('settings_ai_memory')}>
                            <ToggleSwitch label={t('settings_use_memory')} checked={localPrefs.useMemory} onChange={useMemory => handleUpdateLocal({ useMemory })} description={t('settings_use_memory_desc')} />
                            <ToggleSwitch label={t('settings_use_history')} checked={localPrefs.useHistory} onChange={useHistory => handleUpdateLocal({ useHistory })} description={t('settings_use_history_desc')} />
                        </SettingsCard>
                         <SettingsCard title="Advanced Settings">
                            <ToggleSwitch label={t('settings_allow_web_search')} checked={localPrefs.allowWebSearch} onChange={allowWebSearch => handleUpdateLocal({ allowWebSearch })} description={t('settings_allow_web_search_desc')} />
                        </SettingsCard>
                    </div>
                );
            case 'appearance':
                return (
                    <SettingsCard title={t('settings_appearance')}>
                        <ToggleSwitch label={t('settings_dark_mode')} checked={localPrefs.theme === 'dark'} onChange={checked => handleUpdateLocal({ theme: checked ? 'dark' : 'light' })} />
                        <FormRow label={t('settings_color_theme')} htmlFor="color-theme">
                            <div className="flex items-center gap-4">
                                {colorThemeOptions.map(opt => (
                                <button key={opt.value} onClick={() => handleUpdateLocal({ colorTheme: opt.value })} style={{backgroundColor: opt.hex}} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${localPrefs.colorTheme === opt.value ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 ring-white' : ''}`}></button>
                                ))}
                            </div>
                        </FormRow>
                            <FormRow label="Element Size" htmlFor="element-size">
                            <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                                {sizeOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleUpdateLocal({ size: opt.value })}
                                        className={`flex-1 px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                                            localPrefs.size === opt.value
                                            ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow'
                                            : 'text-gray-500 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </FormRow>
                    </SettingsCard>
                );
            case 'categories':
                return (
                    <SettingsCard title={t('categories')}>
                        <CategoriesView
                            categories={categories}
                            onNewCategory={onNewCategory}
                            onEditCategory={onEditCategory}
                            t={t}
                        />
                    </SettingsCard>
                );
            case 'pulse':
                const widgetTypes: { value: PulseWidgetType; label: string }[] = [
                    { value: 'weather', label: t('pulse_weather')},
                    { value: 'stock', label: t('pulse_stock')},
                    { value: 'crypto', label: t('pulse_crypto')},
                    { value: 'email', label: t('pulse_email')},
                    { value: 'calendar', label: t('pulse_calendar')},
                    { value: 'exchange', label: t('pulse_exchange')},
                    { value: 'trending', label: t('pulse_trending')},
                ];
                return (
                    <SettingsCard title={t('settings_pulse')}>
                        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">{t('settings_pulse_desc')}</p>
                        <div className="space-y-3">
                            {localPrefs.pulseWidgets.map(widget => {
                                const typeInfo = widgetTypes.find(t => t.value === widget.type);
                                return (
                                    <div key={widget.id} className="bg-gray-200 dark:bg-gray-800/50 p-3 rounded-lg flex items-center justify-between">
                                        <div className="font-semibold">{typeInfo?.label || 'Widget'}</div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => { setIsPulseModalNew(false); setPulseModalConfig(widget); }} className="p-1.5 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full"><EditIcon /></button>
                                            <button onClick={() => handleRemovePulseWidget(widget.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-full"><DeleteIcon /></button>
                                        </div>
                                    </div>
                                );
                            })}
                            {localPrefs.pulseWidgets.length < 3 && (
                                <button onClick={() => { setIsPulseModalNew(true); setPulseModalConfig(null); }} className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800/50 hover:border-solid">
                                    {t('pulse_add_widget')}
                                </button>
                            )}
                        </div>
                    </SettingsCard>
                );
            default: return null;
        }
    }

    return (
    <>
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
            <Header title={t('settings_title')} onToggleSidebar={onToggleSidebar} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))} />
                        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 text-gray-800 dark:text-white">
                                {API_MISSING && !hideAIBanner && (
                                    <div className="max-w-4xl mx-auto mb-4">
                                        <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
                                            <div className="w-8 h-8 rounded-full bg-amber-200/70 dark:bg-amber-800/60 flex items-center justify-center flex-shrink-0">
                                                <WarningIcon className="text-base" />
                                            </div>
                                            <div className="flex-1 text-sm">
                                                <div className="font-semibold mb-0.5">Connect AI to enable chat and smart features</div>
                                                <p className="opacity-90">Add your Gemini API key to use AI. Set the environment variable VITE_API_KEY and reload the app.</p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <code className="px-2 py-1 rounded bg-amber-100/70 dark:bg-amber-800/40">VITE_API_KEY=your-key</code>
                                                    <a className="underline opacity-90 hover:opacity-100" href="https://ai.google.dev/" target="_blank" rel="noreferrer">Get an API key</a>
                                                </div>
                                            </div>
                                            <button onClick={dismissBanner} className="w-8 h-8 rounded-full hover:bg-amber-200/60 dark:hover:bg-amber-800/40 flex items-center justify-center text-amber-800 dark:text-amber-200"><CloseIcon /></button>
                                        </div>
                                    </div>
                                )}
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <div className="bg-gray-200 dark:bg-gray-900/50 p-1 rounded-full flex flex-nowrap justify-start items-center gap-1 overflow-x-auto scrollbar-hide">
                            {tabs.map(tab => (
                                <button 
                                    key={tab.id} 
                                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                                    className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-800/50'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {renderContent()}

                    {isDirty && (
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4">
                            {showSaved && 
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm animate-fade-in-down">
                                <CheckCircleIcon />
                                <span>{t('settings_changes_saved')}</span>
                              </div>
                            }
                            <button onClick={handleDiscard} className="px-4 py-2 rounded-[var(--radius-button)] bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold transition-colors text-sm">
                                {t('settings_discard_changes')}
                            </button>
                            <button onClick={handleSave} className="px-6 py-2 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white font-semibold hover:shadow-lg transition-all text-sm">
                                {t('settings_save_changes')}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
        {(pulseModalConfig || isPulseModalNew) && (
            <PulseConfigModal 
                widget={pulseModalConfig}
                onClose={() => { setPulseModalConfig(null); setIsPulseModalNew(false); }}
                onSave={handleSavePulseWidget}
                t={t}
            />
        )}
                {showUpgrade && (
                        <div className="fixed inset-0 bg-gray-900/80 z-[70] flex items-center justify-center p-4" onClick={() => setShowUpgrade(false)}>
                            <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                                <header className="p-4 flex items-center justify-between border-b border-gray-700">
                                    <h2 className="text-lg font-semibold">Upgrade to Taskly Premium</h2>
                                    <button onClick={() => setShowUpgrade(false)} className="w-9 h-9 rounded-[var(--radius-button)] hover:bg-gray-700 flex items-center justify-center"><CloseIcon /></button>
                                </header>
                                <main className="p-6 space-y-4 text-sm text-gray-300">
                                    <p>Unlock advanced AI features, unlimited usage, and priority support.</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Unlimited tasks, habits, projects</li>
                                        <li>Smart AI: natural language task creation and summaries</li>
                                        <li>Calendar sync and automations (coming soon)</li>
                                    </ul>
                                </main>
                                <footer className="p-4 border-t border-gray-700 flex items-center justify-end gap-2">
                                    <button onClick={() => setShowUpgrade(false)} className="px-4 py-2 rounded-[var(--radius-button)] bg-gray-700 hover:bg-gray-600 text-sm font-semibold">Not now</button>
                                    <button onClick={() => setShowUpgrade(false)} className="px-4 py-2 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white text-sm font-semibold">Choose plan</button>
                                </footer>
                            </div>
                        </div>
                )}
    </>
    );
};

export default SettingsView;