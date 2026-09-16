import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Rate relative to USD (1 USD = rate units)
  flag: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0, flag: '🇺🇸', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92, flag: '🇪🇺', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79, flag: '🇬🇧', locale: 'en-GB' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.50, flag: '🇮🇳', locale: 'en-IN' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 155.00, flag: '🇯🇵', locale: 'ja-JP' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36, flag: '🇨🇦', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rate: 1.52, flag: '🇦🇺', locale: 'en-AU' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.35, flag: '🇸🇬', locale: 'en-SG' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rate: 3.67, flag: '🇦🇪', locale: 'ar-AE' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.90, flag: '🇨🇭', locale: 'de-CH' },
  CNY: { code: 'CNY', symbol: 'CN¥', name: 'Chinese Yuan', rate: 7.23, flag: '🇨🇳', locale: 'zh-CN' },
};

const STORAGE_KEY = '@celarox_currency_preference';

/**
 * Automatically determine the appropriate currency based on client timezone and locale.
 */
export function detectRegionCurrency(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const languages = typeof navigator !== 'undefined' && navigator.languages ? navigator.languages : [];
    const primaryLang = (typeof navigator !== 'undefined' && navigator.language) || '';

    // Check timezone patterns first
    if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('India')) {
      return 'INR';
    }
    if (timeZone.includes('London') || timeZone.includes('Belfast') || timeZone.includes('Edinburgh')) {
      return 'GBP';
    }
    if (timeZone.includes('Tokyo') || timeZone.includes('Japan')) {
      return 'JPY';
    }
    if (timeZone.includes('Toronto') || timeZone.includes('Vancouver') || timeZone.includes('Montreal') || timeZone.includes('Edmonton') || timeZone.includes('Winnipeg')) {
      return 'CAD';
    }
    if (timeZone.includes('Sydney') || timeZone.includes('Melbourne') || timeZone.includes('Brisbane') || timeZone.includes('Perth') || timeZone.includes('Adelaide') || timeZone.includes('Australia')) {
      return 'AUD';
    }
    if (timeZone.includes('Singapore')) {
      return 'SGD';
    }
    if (timeZone.includes('Dubai') || timeZone.includes('Abu_Dhabi') || timeZone.includes('UAE')) {
      return 'AED';
    }
    if (timeZone.includes('Zurich') || timeZone.includes('Geneva')) {
      return 'CHF';
    }
    if (timeZone.includes('Shanghai') || timeZone.includes('Chongqing') || timeZone.includes('Urumqi')) {
      return 'CNY';
    }
    if (
      timeZone.includes('Paris') ||
      timeZone.includes('Berlin') ||
      timeZone.includes('Rome') ||
      timeZone.includes('Madrid') ||
      timeZone.includes('Amsterdam') ||
      timeZone.includes('Brussels') ||
      timeZone.includes('Vienna') ||
      timeZone.includes('Dublin') ||
      timeZone.includes('Lisbon') ||
      timeZone.includes('Helsinki') ||
      timeZone.includes('Athens')
    ) {
      return 'EUR';
    }

    // Check language codes
    const allLangs = [primaryLang, ...languages].join(',').toLowerCase();
    if (allLangs.includes('-in') || allLangs.includes('hi')) return 'INR';
    if (allLangs.includes('-gb')) return 'GBP';
    if (allLangs.includes('ja')) return 'JPY';
    if (allLangs.includes('-ca')) return 'CAD';
    if (allLangs.includes('-au')) return 'AUD';
    if (allLangs.includes('-sg')) return 'SGD';
    if (allLangs.includes('-ae')) return 'AED';
    if (allLangs.includes('zh')) return 'CNY';
    if (allLangs.includes('de') || allLangs.includes('fr') || allLangs.includes('es') || allLangs.includes('it') || allLangs.includes('nl')) {
      return 'EUR';
    }

    return 'USD';
  } catch {
    return 'USD';
  }
}

export interface CurrencyContextType {
  currentCurrency: CurrencyInfo;
  currencyCode: string;
  isAutoMode: boolean;
  detectedCurrencyCode: string;
  setCurrency: (code: string) => Promise<void>;
  setAutoMode: (enabled: boolean) => Promise<void>;
  formatAmount: (
    amount: number | string,
    options?: {
      compact?: boolean;
      hideSymbol?: boolean;
      fromCurrency?: string;
      showDecimals?: boolean;
      decimals?: number;
    }
  ) => string;
  convertAmount: (amount: number | string, fromCurrency?: string, toCurrency?: string) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currentCurrency: SUPPORTED_CURRENCIES.USD,
  currencyCode: 'USD',
  isAutoMode: true,
  detectedCurrencyCode: 'USD',
  setCurrency: async () => {},
  setAutoMode: async () => {},
  formatAmount: (amt) => `$${amt}`,
  convertAmount: (amt) => Number(amt) || 0,
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [detectedCurrencyCode, setDetectedCurrencyCode] = useState<string>('USD');
  const [currencyCode, setCurrencyCodeState] = useState<string>('USD');
  const [isAutoMode, setIsAutoModeState] = useState<boolean>(true);

  // Initialize and load saved currency preference
  useEffect(() => {
    const initCurrency = async () => {
      const detected = detectRegionCurrency();
      setDetectedCurrencyCode(detected);

      try {
        const savedPref = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedPref) {
          const parsed = JSON.parse(savedPref);
          if (parsed.isAutoMode === false && parsed.currencyCode && SUPPORTED_CURRENCIES[parsed.currencyCode]) {
            setIsAutoModeState(false);
            setCurrencyCodeState(parsed.currencyCode);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not read saved currency preferences:', err);
      }

      // Default: auto mode with detected regional currency
      setIsAutoModeState(true);
      setCurrencyCodeState(detected);
    };

    initCurrency();
  }, []);

  const setCurrency = async (code: string) => {
    if (!SUPPORTED_CURRENCIES[code]) return;
    setCurrencyCodeState(code);
    setIsAutoModeState(false);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isAutoMode: false, currencyCode: code })
      );
    } catch (err) {
      console.warn('Failed to save manual currency:', err);
    }
  };

  const setAutoMode = async (enabled: boolean) => {
    setIsAutoModeState(enabled);
    const targetCode = enabled ? detectedCurrencyCode : currencyCode;
    setCurrencyCodeState(targetCode);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isAutoMode: enabled, currencyCode: targetCode })
      );
    } catch (err) {
      console.warn('Failed to save auto currency mode:', err);
    }
  };

  const currentCurrency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;

  /**
   * Convert amount from base or source currency to target currency
   */
  const convertAmount = (
    amount: number | string,
    fromCurrency: string = 'USD',
    toCurrency: string = currencyCode
  ): number => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount || 0;
    if (fromCurrency === toCurrency) return numericAmount;

    const fromInfo = SUPPORTED_CURRENCIES[fromCurrency] || SUPPORTED_CURRENCIES.USD;
    const toInfo = SUPPORTED_CURRENCIES[toCurrency] || SUPPORTED_CURRENCIES.USD;

    // Convert from source currency to USD base, then to target currency
    const amountInUSD = numericAmount / fromInfo.rate;
    return amountInUSD * toInfo.rate;
  };

  /**
   * Format a numerical amount into an Apple-grade formatted currency string.
   */
  const formatAmount = (
    amount: number | string,
    options?: {
      compact?: boolean;
      hideSymbol?: boolean;
      fromCurrency?: string;
      showDecimals?: boolean;
      decimals?: number;
    }
  ): string => {
    const fromCurr = options?.fromCurrency || 'USD';
    const converted = convertAmount(amount, fromCurr, currencyCode);
    const symbol = options?.hideSymbol ? '' : currentCurrency.symbol;

    if (options?.compact) {
      if (Math.abs(converted) >= 1_000_000_000) {
        return `${symbol}${(converted / 1_000_000_000).toFixed(1)}B`;
      }
      if (Math.abs(converted) >= 1_000_000) {
        return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
      }
      if (Math.abs(converted) >= 1_000) {
        return `${symbol}${(converted / 1_000).toFixed(1)}k`;
      }
      return `${symbol}${converted.toFixed(0)}`;
    }

    const hasDecimals = options?.showDecimals !== undefined
      ? (options.showDecimals ? 2 : 0)
      : (options?.decimals !== undefined ? options.decimals : (currentCurrency.code === 'JPY' ? 0 : 2));

    // Standard high-precision formatting
    const formattedNum = new Intl.NumberFormat(currentCurrency.locale, {
      minimumFractionDigits: hasDecimals,
      maximumFractionDigits: hasDecimals,
    }).format(converted);

    if (currentCurrency.code === 'AED' || currentCurrency.code === 'CHF') {
      return `${symbol} ${formattedNum}`;
    }
    return `${symbol}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        currencyCode,
        isAutoMode,
        detectedCurrencyCode,
        setCurrency,
        setAutoMode,
        formatAmount,
        convertAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
