import React, { createContext, useContext, useState, useCallback } from 'react';

const ETB_RATE = 130; // 1 USD = ~130 ETB (adjustable)

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('svtech_currency') || 'ETB');

  const toggleCurrency = useCallback(() => {
    const next = currency === 'ETB' ? 'USD' : 'ETB';
    setCurrency(next);
    localStorage.setItem('svtech_currency', next);
  }, [currency]);

  /** Format a price. Stored prices are assumed to be in ETB. */
  const formatPrice = useCallback((amountETB) => {
    const num = Number(amountETB) || 0;
    if (currency === 'USD') {
      const usd = (num / ETB_RATE).toFixed(2);
      return `$${Number(usd).toLocaleString()}`;
    }
    return `${num.toLocaleString()} ETB`;
  }, [currency]);

  /** Show both prices */
  const formatDualPrice = useCallback((amountETB) => {
    const num = Number(amountETB) || 0;
    const usd = (num / ETB_RATE).toFixed(2);
    return { etb: `${num.toLocaleString()} ETB`, usd: `$${Number(usd).toLocaleString()}` };
  }, []);

  /** Convert ETB to current currency value */
  const convertFromETB = useCallback((amountETB) => {
    const num = Number(amountETB) || 0;
    return currency === 'USD' ? +(num / ETB_RATE).toFixed(2) : num;
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: (c) => { setCurrency(c); localStorage.setItem('svtech_currency', c); }, toggleCurrency, formatPrice, formatDualPrice, convertFromETB, ETB_RATE }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
