import React, { useState, useEffect } from 'react';
import { PulseWidgetConfig, PulseWidgetType, UserPreferences, WeatherData, StockData, CryptoData, EmailData, CalendarEventData, ExchangeData, TrendingData } from '../types';
import * as pulseService from '../services/pulseService';
import {
    AddCircleIcon, SettingsIcon, WbSunnyIcon, CloudIcon, GrainIcon, ThunderstormIcon,
    TrendingUpIcon, CurrencyBitcoinIcon, MailIcon, EventUpcomingIcon, CurrencyExchangeIcon, WhatshotIcon
} from './icons';

type IndividualWidgetProps = {
    config: PulseWidgetConfig;
};

const LoadingSpinner: React.FC = () => (
    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
);

const WeatherWidget: React.FC<{ data: WeatherData }> = ({ data }) => {
    const WeatherIcon = () => {
        switch (data.condition) {
            case 'sunny': return <WbSunnyIcon className="text-yellow-400" />;
            case 'cloudy': return <CloudIcon className="text-gray-400" />;
            case 'rainy': return <GrainIcon className="text-blue-400" />;
            case 'stormy': return <ThunderstormIcon className="text-purple-400" />;
            default: return null;
        }
    };
    return (
        <>
            <WeatherIcon />
            <span className="font-semibold">{data.temperature}°C</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs truncate">{data.city}</span>
        </>
    );
};

const StockWidget: React.FC<{ data: StockData }> = ({ data }) => (
    <>
        <TrendingUpIcon className={data.change >= 0 ? 'text-green-500' : 'text-red-500'} />
        <span className="font-semibold">{data.ticker}</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">${data.price.toFixed(2)}</span>
    </>
);

const CryptoWidget: React.FC<{ data: CryptoData }> = ({ data }) => (
    <>
        <CurrencyBitcoinIcon className={data.changePercent >= 0 ? 'text-green-500' : 'text-red-500'} />
        <span className="font-semibold">{data.symbol}</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">${data.price.toLocaleString()}</span>
    </>
);

const EmailWidget: React.FC<{ data: EmailData }> = ({ data }) => (
    <>
        <MailIcon className="text-blue-500" />
        <span className="font-semibold">{data.unreadCount}</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">Unread</span>
    </>
);

const CalendarWidget: React.FC<{ data: CalendarEventData }> = ({ data }) => (
    <>
        <EventUpcomingIcon className="text-purple-500" />
        <span className="font-semibold truncate flex-1">{data.title}</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">{data.startTime}</span>
    </>
);

const ExchangeWidget: React.FC<{ data: ExchangeData }> = ({ data }) => (
    <>
        <CurrencyExchangeIcon className="text-green-500" />
        <span className="font-semibold">{data.from}/{data.to}</span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">{data.rate.toFixed(4)}</span>
    </>
);

const TrendingWidget: React.FC<{ data: TrendingData }> = ({ data }) => (
    <>
        <WhatshotIcon className="text-orange-500" />
        <span className="font-semibold truncate">{data.topic}</span>
    </>
);


const IndividualWidget: React.FC<IndividualWidgetProps> = ({ config }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!loading) setLoading(true);
            setError(false);
            try {
                let result;
                switch (config.type) {
                    case 'weather': result = await pulseService.getWeatherData(config.meta?.city || ''); break;
                    case 'stock': result = await pulseService.getStockData(config.meta?.ticker || ''); break;
                    case 'crypto': result = await pulseService.getCryptoData(config.meta?.symbol || ''); break;
                    case 'email': result = await pulseService.getEmailData(); break;
                    case 'calendar': result = await pulseService.getCalendarEventData(); break;
                    case 'exchange': result = await pulseService.getExchangeData(config.meta?.from || '', config.meta?.to || ''); break;
                    case 'trending': result = await pulseService.getTrendingData(); break;
                    default: throw new Error('Unknown widget type');
                }
                setData(result);
            } catch (e) {
                console.error(`Failed to fetch data for ${config.type} widget:`, e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60 * 1000); // Refresh every minute

        return () => clearInterval(interval);
    }, [config]);

    const renderContent = () => {
        if (loading) return <LoadingSpinner />;
        if (error || !data) return <span className="text-red-500 text-xs">Error</span>;

        switch (config.type) {
            case 'weather': return <WeatherWidget data={data} />;
            case 'stock': return <StockWidget data={data} />;
            case 'crypto': return <CryptoWidget data={data} />;
            case 'email': return <EmailWidget data={data} />;
            case 'calendar': return <CalendarWidget data={data} />;
            case 'exchange': return <ExchangeWidget data={data} />;
            case 'trending': return <TrendingWidget data={data} />;
            default: return null;
        }
    };

    return (
        <div className="bg-gray-200/80 dark:bg-gray-700/50 p-2 rounded-lg flex items-center gap-2 text-sm min-w-[120px] max-w-[180px]">
            {renderContent()}
        </div>
    );
};


interface PulseWidgetProps {
    widgets: PulseWidgetConfig[];
    onConfigure: () => void;
}

const PulseWidget: React.FC<PulseWidgetProps> = ({ widgets, onConfigure }) => {
    if (!widgets || widgets.length === 0) {
        return (
            <button onClick={onConfigure} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full transition-colors bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                <AddCircleIcon />
                <span>Widget</span>
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {widgets.map(widget => <IndividualWidget key={widget.id} config={widget} />)}
            <button onClick={onConfigure} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Configure Pulse Widgets">
                <SettingsIcon />
            </button>
        </div>
    );
};

export default PulseWidget;