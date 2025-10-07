import React from 'react';

const Icon: React.FC<{ name: string; className?: string; style?: React.CSSProperties }> = ({ name, className, style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

export const CATEGORY_ICONS = [
  // Original icons
  'work', 'person', 'shopping_cart', 'fitness_center', 'account_balance_wallet', 'home',
  'flight_takeoff', 'school', 'groups', 'sports_esports', 'lightbulb', 'event', 'list_alt',
  'autorenew', 'style', 'cake', 'celebration', 'music_note', 'movie', 'construction',
  'cloud', 'palette', 'rocket_launch', 'favorite',
  // New work & professional icons
  'business_center', 'badge', 'handshake', 'workspace_premium', 'corporate_fare', 'analytics',
  // New technology icons
  'code', 'computer', 'developer_mode', 'terminal', 'memory', 'smartphone',
  // New media & creative icons
  'photo_camera', 'videocam', 'brush', 'design_services',
  // New study & learning icons
  'menu_book', 'psychology', 'science', 'history_edu'
];
export const COLORS = [
  // Original colors
  '#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E', '#14B8A6',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B',
  // New color variations
  '#DC2626', '#EA580C', '#CA8A04', '#65A30D', '#16A34A', '#0D9488',
  '#0891B2', '#2563EB', '#4F46E5', '#7C3AED', '#DB2777', '#475569', '#F59E0B'
];

interface IconColorPickerProps {
    selectedIcon: string;
    selectedColor: string;
    onIconSelect: (icon: string) => void;
    onColorSelect: (color: string) => void;
}

const IconColorPicker: React.FC<IconColorPickerProps> = ({ selectedIcon, selectedColor, onIconSelect, onColorSelect }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${selectedColor}30` }}>
                    <Icon name={selectedIcon} style={{ color: selectedColor }} className="text-5xl" />
                </div>
                <div className="flex-1">
                    <div>
                        <h3 className="font-semibold text-gray-300 mb-2">Color</h3>
                        <div className="flex flex-wrap items-center gap-3 bg-gray-700/50 p-3 rounded-lg">
                            {COLORS.map(c => (
                                <button key={c} type="button" onClick={() => onColorSelect(c)} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${selectedColor === c ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}></button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
             <div>
                <h3 className="font-semibold text-gray-300 mb-2">Icon</h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-gray-700/50 rounded-lg max-h-48 overflow-y-auto">
                    {CATEGORY_ICONS.map(iconName => (
                        <button key={iconName} type="button" onClick={() => onIconSelect(iconName)} className={`p-2 rounded-lg flex justify-center items-center transition-colors ${selectedIcon === iconName ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            <Icon name={iconName} style={{ color: selectedColor }} className="text-3xl" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IconColorPicker;
