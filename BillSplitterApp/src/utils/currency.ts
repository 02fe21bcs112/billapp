import { Currency } from '../types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.85 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.73 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 110.0 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.25 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.35 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.92 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 6.45 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 74.5 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', rate: 1180.0 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.35 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', rate: 7.8 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rate: 8.5 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rate: 8.7 },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', rate: 20.0 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 5.2 },
];

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return SUPPORTED_CURRENCIES.find(currency => currency.code === code);
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const fromRate = getCurrencyByCode(fromCurrency)?.rate || 1;
  const toRate = getCurrencyByCode(toCurrency)?.rate || 1;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  const convertedAmount = usdAmount * toRate;
  
  return Math.round(convertedAmount * 100) / 100;
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount.toFixed(2)}`;
  
  // For Japanese Yen and Korean Won, don't show decimal places
  const decimals = ['JPY', 'KRW'].includes(currencyCode) ? 0 : 2;
  
  return `${currency.symbol}${amount.toFixed(decimals)}`;
};

export const getExchangeRateText = (fromCurrency: string, toCurrency: string): string => {
  if (fromCurrency === toCurrency) return '';
  
  const fromCur = getCurrencyByCode(fromCurrency);
  const toCur = getCurrencyByCode(toCurrency);
  
  if (!fromCur || !toCur) return '';
  
  const rate = convertCurrency(1, fromCurrency, toCurrency);
  return `1 ${fromCur.symbol} = ${formatCurrency(rate, toCurrency)}`;
};

// Mock function to simulate real-time exchange rates
// In a real app, you'd fetch from an API like exchangerate-api.io
export const updateExchangeRates = async (): Promise<void> => {
  // This would fetch real exchange rates in a production app
  console.log('Exchange rates updated (mock)');
};
