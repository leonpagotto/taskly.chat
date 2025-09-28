import React from 'react';

// A generic Icon component for Material Symbols
export const Icon: React.FC<{ name: string; className?: string; style?: React.CSSProperties; onClick?: React.MouseEventHandler<HTMLSpanElement>; title?: string; }> = ({ name, className, style, onClick, title }) => (
  <span className={`material-symbols-outlined ${className}`} style={style} onClick={onClick} title={title}>{name}</span>
);

export const TodayIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="today" className={className} />;
export const ListAltIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="list_alt_check" className={className} />;
export const AutorenewIcon: React.FC<{ className?: string; style?: React.CSSProperties; title?: string; }> = ({ className, style, title }) => <Icon name="autorenew" className={className} style={style} title={title} />;
export const AddIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="add" className={className} />;
export const FolderIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => <Icon name="folder" className={className} style={style} />;
export const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="chat_bubble" className={className} />;
export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="menu" className={className} />;
export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="close" className={className} />;
export const SendIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="send" className={className} />;
export const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="attachment" className={className} />;
export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="check_circle" className={className} />;
export const RadioButtonUncheckedIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="radio_button_unchecked" className={className} />;
export const MoreVertIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="more_vert" className={className} />;
export const LocalFireDepartmentIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="local_fire_department" className={className} />;
export const MicIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="mic" className={className} />;
export const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="delete" className={className} />;
export const EditIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="edit" className={className} />;
export const WarningIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="warning" className={className} />;
export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="check" className={className} />;
export const PlaylistAddCheckIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="playlist_add_check" className={className} />;
export const PlaylistAddIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="playlist_add" className={className} />;
export const NoteAddIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="note_add" className={className} />;
export const StyleIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="style" className={className} />;
export const ExpandMoreIcon: React.FC<{ className?: string; onClick?: React.MouseEventHandler<HTMLSpanElement> }> = ({ className, onClick }) => <Icon name="expand_more" className={className} onClick={onClick} />;
export const PersonOutlineIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="person_outline" className={className} />;
export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="settings" className={className} />;
export const DescriptionIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="description" className={className} />;
export const CreateNewFolderIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="create_new_folder" className={className} />;
export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="chevron_left" className={className} />;
export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="chevron_right" className={className} />;
export const ContentCopyIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="content_copy" className={className} />;
export const DragIndicatorIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="drag_indicator" className={className} />;
export const FileUploadIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="upload_file" className={className} />;
export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="download" className={className} />;
export const ImageIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="image" className={className} />;
export const PictureAsPdfIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="picture_as_pdf" className={className} />;
export const ArticleIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="article" className={className} />;
export const FolderOpenIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="folder_open" className={className} />;
export const ArrowBackIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="arrow_back" className={className} />;
export const WidthNormalIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="dock_to_right" className={className} />;
export const NewTaskIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="add_task" className={className} />;
export const NewHabitIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="routine" className={className} />;
export const FilePresentIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="file_present" className={className} />;
export const ChatAddOnIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="chat_add_on" className={className} />;
export const TabDuplicateIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="tab_duplicate" className={className} />;
export const AttachFileIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="attach_file" className={className} />;
export const CalendarAddOnIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="calendar_add_on" className={className} />;
export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="search" className={className} />;
export const HelpOutlineIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="help_outline" className={className} />;
export const DragPanIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="drag_pan" className={className} />;
export const SwipeIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="swipe" className={className} />;

export const LeftPanelOpenIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="left_panel_open" className={className} />;
export const LeftPanelCloseIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="left_panel_close" className={className} />;


// Editor Icons
export const FormatBoldIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="format_bold" className={className} />;
export const FormatItalicIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="format_italic" className={className} />;
export const FormatUnderlinedIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="format_underlined" className={className} />;
export const FormatListBulletedIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="format_list_bulleted" className={className} />;
export const FormatListNumberedIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="format_list_numbered" className={className} />;
export const CodeIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="code" className={className} />;
export const FormatQuoteIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="format_quote" className={className} />;
export const TextFieldsIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="text_fields" className={className} />;


// Category Icons
export const WorkIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="work" className={className} />;
export const PersonIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="person" className={className} />;
export const ShoppingCartIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="shopping_cart" className={className} />;
export const FitnessCenterIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="fitness_center" className={className} />;
export const AccountBalanceWalletIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="account_balance_wallet" className={className} />;
export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="home" className={className} />;
export const FlightTakeoffIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="flight_takeoff" className={className} />;
export const SchoolIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="school" className={className} />;
export const GroupsIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="groups" className={className} />;
export const SportsEsportsIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="sports_esports" className={className} />;
export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="lightbulb" className={className} />;
export const EventIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="event" className={className} />;

// UI Icons
export const NotificationsIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="notifications" className={className} />;
export const PaletteIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="palette" className={className} />;
export const CalendarTodayIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="calendar_today" className={className} />;
export const CalendarMonthIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="calendar_month" className={className} />;
export const EventNoteIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="event_note" className={className} />;


// Pulse Widget Icons
export const WbSunnyIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="wb_sunny" className={className} />;
export const CloudIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="cloud" className={className} />;
export const GrainIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="grain" className={className} />;
export const ThunderstormIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="thunderstorm" className={className} />;
export const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="trending_up" className={className} />;
export const CurrencyBitcoinIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="currency_bitcoin" className={className} />;
export const MailIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="mail" className={className} />;
export const EventUpcomingIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="event_upcoming" className={className} />;
export const CurrencyExchangeIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="currency_exchange" className={className} />;
export const WhatshotIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="whatshot" className={className} />;
export const AddCircleIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="add_circle" className={className} />;