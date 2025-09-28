import { PulseWidgetConfig, WeatherData, StockData, CryptoData, EmailData, CalendarEventData, ExchangeData, TrendingData } from '../types';

const getRandom = (min: number, max: number, decimals: number = 2) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

const pause = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getWeatherData = async (city: string): Promise<WeatherData> => {
  await pause(getRandom(200, 800));
  const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'stormy'];
  return {
    city: city || 'San Francisco',
    temperature: getRandom(10, 25, 0),
    condition: conditions[Math.floor(Math.random() * conditions.length)],
  };
};

export const getStockData = async (ticker: string): Promise<StockData> => {
  await pause(getRandom(200, 800));
  return {
    ticker: ticker || 'GOOGL',
    price: getRandom(150, 180),
    change: getRandom(-5, 5),
  };
};

export const getCryptoData = async (symbol: string): Promise<CryptoData> => {
  await pause(getRandom(200, 800));
  return {
    symbol: symbol || 'BTC',
    price: getRandom(60000, 70000, 0),
    changePercent: getRandom(-10, 10),
  };
};

export const getEmailData = async (): Promise<EmailData> => {
  await pause(getRandom(200, 800));
  return {
    unreadCount: Math.floor(getRandom(0, 15, 0)),
  };
};

export const getCalendarEventData = async (): Promise<CalendarEventData> => {
  await pause(getRandom(200, 800));
  const events = [
    { title: 'Team Sync', startTime: '11:00 AM' },
    { title: 'Project Stand-up', startTime: '09:30 AM' },
    { title: 'Design Review', startTime: '02:00 PM' },
  ];
  return events[Math.floor(Math.random() * events.length)];
};

export const getExchangeData = async (from: string, to: string): Promise<ExchangeData> => {
  await pause(getRandom(200, 800));
  return {
    from: from || 'USD',
    to: to || 'EUR',
    rate: getRandom(0.85, 0.95, 4),
  };
};

export const getTrendingData = async (): Promise<TrendingData> => {
  await pause(getRandom(200, 800));
  const topics = ['AI Development', 'Frontend Frameworks', 'Global Economy', 'Tech Innovations'];
  return {
    topic: topics[Math.floor(Math.random() * topics.length)],
  };
};