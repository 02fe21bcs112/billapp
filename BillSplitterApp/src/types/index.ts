export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to USD
}

export interface Person {
  id: string;
  name: string;
  color: string;
  preferredCurrency?: string; // Currency code
}

export interface Item {
  id: string;
  name: string;
  price: number;
  currency: string; // Currency code
  assignedTo: string[]; // Array of person IDs
  splitType: 'equal' | 'custom';
  customSplits?: { [personId: string]: number }; // Custom amounts for each person
  category?: string; // Auto-detected or manual category
  barcode?: string; // Barcode data if scanned
}

export interface Bill {
  id: string;
  name: string;
  baseCurrency: string; // Main currency for the bill
  people: Person[];
  items: Item[];
  tax?: number;
  taxCurrency?: string;
  tip?: number;
  tipCurrency?: string;
  receiptImage?: string; // URI to receipt photo
  location?: string; // Restaurant/store name
  notes?: string; // Additional notes
  tags?: string[]; // Custom tags for categorization
  createdAt: Date;
  updatedAt?: Date;
}

export interface PersonSummary {
  personId: string;
  name: string;
  totalAmount: number;
  items: {
    itemName: string;
    amount: number;
    currency?: string;
    convertedAmount?: number;
  }[];
}

export interface BillTemplate {
  id: string;
  name: string;
  description?: string;
  people: Person[];
  items: Omit<Item, 'id' | 'assignedTo' | 'customSplits'>[];
  defaultLocation?: string;
  tags?: string[];
  createdAt: Date;
  usageCount: number;
}

export interface NotificationSettings {
  enablePushNotifications: boolean;
  billReminders: boolean;
  splitUpdates: boolean;
  paymentReminders: boolean;
}
