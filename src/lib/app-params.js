// src/lib/app-params.js
// Updated for Supabase - no longer uses Base44

const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
  if (isNode) {
    return defaultValue;
  }
  const storageKey = `whatscatalog_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  
  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  
  if (searchParam) {
    storage.setItem(storageKey, searchParam);
    return searchParam;
  }
  
  if (defaultValue) {
    storage.setItem(storageKey, defaultValue);
    return defaultValue;
  }
  
  const storedValue = storage.getItem(storageKey);
  if (storedValue) {
    return storedValue;
  }
  
  return null;
};

export const appParams = {
  // Supabase configuration
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // App configuration
  appName: 'WhatsCatalog',
  appUrl: typeof window !== 'undefined' ? window.location.origin : '',
  
  // Feature flags
  enableWhatsApp: true,
  enablePayments: false, // Set to true when payment integration is ready
  
  // Support
  supportWhatsApp: '233555140982',
  supportEmail: 'hello@whatscatalog.com',
  
  // Default vendor plan
  defaultPlan: 'free',
  
  // Legacy support (for backward compatibility)
  get appId() {
    return 'whatscatalog';
  },
  get token() {
    return null; // No token needed for Supabase
  },
  get functionsVersion() {
    return 'v1';
  },
  get appBaseUrl() {
    return typeof window !== 'undefined' ? window.location.origin : '';
  },
};