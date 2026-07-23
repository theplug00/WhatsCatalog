// /src/lib/paymentTypes.js
export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: '💵',
    description: 'Pay when you receive your order',
    enabled: true,
  },
  MOMO: {
    id: 'momo',
    name: 'Mobile Money',
    icon: '📱',
    description: 'Pay via MTN, Vodafone, or AirtelTigo',
    enabled: true,
  },
  BANK_TRANSFER: {
    id: 'bank',
    name: 'Bank Transfer',
    icon: '🏦',
    description: 'Direct bank transfer',
    enabled: false,
  },
};

export const MOMO_NETWORKS = [
  { id: 'mtn', name: 'MTN Mobile Money', code: '024', enabled: true },
  { id: 'vodafone', name: 'Vodafone Cash', code: '020', enabled: true },
  { id: 'airteltigo', name: 'AirtelTigo Money', code: '027', enabled: true },
];

export const getPaymentMethod = (id) => {
  return Object.values(PAYMENT_METHODS).find(m => m.id === id) || PAYMENT_METHODS.CASH_ON_DELIVERY;
};

export const getMomoNetwork = (id) => {
  return MOMO_NETWORKS.find(n => n.id === id);
};

export const detectMomoNetwork = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/[^0-9]/g, '');
  const prefixes = {
    '024': 'mtn',
    '025': 'mtn',
    '055': 'mtn',
    '027': 'airteltigo',
    '026': 'airteltigo',
    '028': 'airteltigo',
    '020': 'vodafone',
    '050': 'vodafone',
  };
  
  for (const [prefix, network] of Object.entries(prefixes)) {
    if (cleaned.startsWith(prefix)) {
      return network;
    }
  }
  return null;
};