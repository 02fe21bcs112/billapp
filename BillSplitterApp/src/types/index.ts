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
  createdAt: Date;
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
