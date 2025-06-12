import { Bill, Person } from '../types';
import { convertCurrency } from './currency';

export interface SpendingAnalytics {
  totalSpent: number;
  averageBillAmount: number;
  mostExpensiveBill: Bill | null;
  cheapestBill: Bill | null;
  billCount: number;
  averageItemsPerBill: number;
  averagePeoplePerBill: number;
  currencyDistribution: { [currency: string]: number };
  monthlySpending: { [month: string]: number };
  categorySpending: { [category: string]: number };
  frequentItems: { name: string; count: number; totalSpent: number }[];
  spendingTrends: { date: string; amount: number }[];
}

export interface PersonAnalytics {
  person: Person;
  totalSpent: number;
  billCount: number;
  averagePerBill: number;
  mostExpensiveBill: number;
  cheapestBill: number;
  favoriteItems: string[];
}

export const calculateSpendingAnalytics = (bills: Bill[], baseCurrency: string = 'USD'): SpendingAnalytics => {
  if (bills.length === 0) {
    return {
      totalSpent: 0,
      averageBillAmount: 0,
      mostExpensiveBill: null,
      cheapestBill: null,
      billCount: 0,
      averageItemsPerBill: 0,
      averagePeoplePerBill: 0,
      currencyDistribution: {},
      monthlySpending: {},
      categorySpending: {},
      frequentItems: [],
      spendingTrends: [],
    };
  }

  let totalSpent = 0;
  let totalItems = 0;
  let totalPeople = 0;
  const currencyDistribution: { [currency: string]: number } = {};
  const monthlySpending: { [month: string]: number } = {};
  const itemFrequency: { [name: string]: { count: number; totalSpent: number } } = {};
  const spendingTrends: { date: string; amount: number }[] = [];

  let mostExpensiveBill: Bill | null = null;
  let cheapestBill: Bill | null = null;
  let maxAmount = 0;
  let minAmount = Infinity;

  bills.forEach(bill => {
    // Calculate total bill amount in base currency
    const billTotal = bill.items.reduce((sum, item) => {
      return sum + convertCurrency(item.price, item.currency, baseCurrency);
    }, 0) + 
    convertCurrency(bill.tax || 0, bill.taxCurrency || baseCurrency, baseCurrency) +
    convertCurrency(bill.tip || 0, bill.tipCurrency || baseCurrency, baseCurrency);

    totalSpent += billTotal;
    totalItems += bill.items.length;
    totalPeople += bill.people.length;

    // Track most/least expensive bills
    if (billTotal > maxAmount) {
      maxAmount = billTotal;
      mostExpensiveBill = bill;
    }
    if (billTotal < minAmount) {
      minAmount = billTotal;
      cheapestBill = bill;
    }

    // Currency distribution
    bill.items.forEach(item => {
      currencyDistribution[item.currency] = (currencyDistribution[item.currency] || 0) + 1;
    });

    // Monthly spending
    const monthKey = bill.createdAt.toISOString().slice(0, 7); // YYYY-MM
    monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + billTotal;

    // Item frequency
    bill.items.forEach(item => {
      const itemName = item.name.toLowerCase();
      if (!itemFrequency[itemName]) {
        itemFrequency[itemName] = { count: 0, totalSpent: 0 };
      }
      itemFrequency[itemName].count++;
      itemFrequency[itemName].totalSpent += convertCurrency(item.price, item.currency, baseCurrency);
    });

    // Spending trends
    spendingTrends.push({
      date: bill.createdAt.toISOString().slice(0, 10), // YYYY-MM-DD
      amount: billTotal
    });
  });

  // Sort frequent items
  const frequentItems = Object.entries(itemFrequency)
    .map(([name, data]) => ({ name, count: data.count, totalSpent: data.totalSpent }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Sort spending trends by date
  spendingTrends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    totalSpent,
    averageBillAmount: totalSpent / bills.length,
    mostExpensiveBill,
    cheapestBill,
    billCount: bills.length,
    averageItemsPerBill: totalItems / bills.length,
    averagePeoplePerBill: totalPeople / bills.length,
    currencyDistribution,
    monthlySpending,
    categorySpending: {}, // We'll implement category detection later
    frequentItems,
    spendingTrends,
  };
};

export const calculatePersonAnalytics = (bills: Bill[], personId: string, baseCurrency: string = 'USD'): PersonAnalytics | null => {
  const personBills = bills.filter(bill => bill.people.some(p => p.id === personId));
  if (personBills.length === 0) return null;

  const person = personBills[0].people.find(p => p.id === personId);
  if (!person) return null;

  let totalSpent = 0;
  let maxBill = 0;
  let minBill = Infinity;
  const itemFrequency: { [name: string]: number } = {};

  personBills.forEach(bill => {
    let personAmount = 0;
    
    bill.items.forEach(item => {
      if (item.assignedTo.includes(personId)) {
        const itemAmount = item.splitType === 'equal' 
          ? item.price / item.assignedTo.length
          : item.customSplits?.[personId] || 0;
        
        personAmount += convertCurrency(itemAmount, item.currency, baseCurrency);
        itemFrequency[item.name.toLowerCase()] = (itemFrequency[item.name.toLowerCase()] || 0) + 1;
      }
    });

    // Add proportional tax and tip
    const billSubtotal = bill.items.reduce((sum, item) => 
      sum + convertCurrency(item.price, item.currency, baseCurrency), 0);
    
    if (billSubtotal > 0) {
      const personProportion = personAmount / billSubtotal;
      const convertedTax = convertCurrency(bill.tax || 0, bill.taxCurrency || baseCurrency, baseCurrency);
      const convertedTip = convertCurrency(bill.tip || 0, bill.tipCurrency || baseCurrency, baseCurrency);
      personAmount += (convertedTax + convertedTip) * personProportion;
    }

    totalSpent += personAmount;
    maxBill = Math.max(maxBill, personAmount);
    minBill = Math.min(minBill, personAmount);
  });

  const favoriteItems = Object.entries(itemFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name]) => name);

  return {
    person,
    totalSpent,
    billCount: personBills.length,
    averagePerBill: totalSpent / personBills.length,
    mostExpensiveBill: maxBill,
    cheapestBill: minBill === Infinity ? 0 : minBill,
    favoriteItems,
  };
};

export const detectItemCategories = (itemName: string): string => {
  const name = itemName.toLowerCase();
  
  // Food categories
  if (name.includes('pizza') || name.includes('burger') || name.includes('sandwich') || 
      name.includes('salad') || name.includes('pasta') || name.includes('rice') ||
      name.includes('chicken') || name.includes('beef') || name.includes('fish')) {
    return 'Food';
  }
  
  // Drinks
  if (name.includes('coffee') || name.includes('tea') || name.includes('beer') || 
      name.includes('wine') || name.includes('cocktail') || name.includes('soda') ||
      name.includes('juice') || name.includes('water')) {
    return 'Beverages';
  }
  
  // Transportation
  if (name.includes('taxi') || name.includes('uber') || name.includes('lyft') || 
      name.includes('bus') || name.includes('train') || name.includes('gas') ||
      name.includes('parking') || name.includes('toll')) {
    return 'Transportation';
  }
  
  // Entertainment
  if (name.includes('movie') || name.includes('concert') || name.includes('game') || 
      name.includes('show') || name.includes('ticket') || name.includes('entertainment')) {
    return 'Entertainment';
  }
  
  // Shopping
  if (name.includes('tip') || name.includes('service') || name.includes('fee')) {
    return 'Service';
  }
  
  return 'Other';
};
