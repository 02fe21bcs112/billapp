import { Bill, Person, Item, PersonSummary } from '../types';
import { convertCurrency, formatCurrency } from './currency';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A24', '#0C2461', '#8395A7', '#222F3E'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const calculatePersonTotal = (
  person: Person, 
  items: Item[], 
  baseCurrency: string,
  tax: number = 0, 
  taxCurrency: string = baseCurrency,
  tip: number = 0, 
  tipCurrency: string = baseCurrency
): number => {
  let total = 0;
  
  items.forEach(item => {
    if (item.assignedTo.includes(person.id)) {
      let itemAmount = 0;
      if (item.splitType === 'equal') {
        itemAmount = item.price / item.assignedTo.length;
      } else if (item.splitType === 'custom' && item.customSplits) {
        itemAmount = item.customSplits[person.id] || 0;
      }
      
      // Convert item amount to base currency
      const convertedAmount = convertCurrency(itemAmount, item.currency, baseCurrency);
      total += convertedAmount;
    }
  });

  // Calculate subtotal in base currency
  const subtotal = items.reduce((sum, item) => {
    const convertedPrice = convertCurrency(item.price, item.currency, baseCurrency);
    return sum + convertedPrice;
  }, 0);

  // Add proportional tax and tip (converted to base currency)
  if (subtotal > 0) {
    const personProportion = total / subtotal;
    const convertedTax = convertCurrency(tax, taxCurrency, baseCurrency);
    const convertedTip = convertCurrency(tip, tipCurrency, baseCurrency);
    total += (convertedTax + convertedTip) * personProportion;
  }

  return Math.round(total * 100) / 100;
};

export const calculateBillSummary = (bill: Bill): PersonSummary[] => {
  return bill.people.map(person => {
    const personItems: { itemName: string; amount: number; currency: string; convertedAmount: number }[] = [];
    let totalAmount = 0;

    bill.items.forEach(item => {
      if (item.assignedTo.includes(person.id)) {
        let itemAmount = 0;
        if (item.splitType === 'equal') {
          itemAmount = item.price / item.assignedTo.length;
        } else if (item.splitType === 'custom' && item.customSplits) {
          itemAmount = item.customSplits[person.id] || 0;
        }
        
        if (itemAmount > 0) {
          const convertedAmount = convertCurrency(itemAmount, item.currency, bill.baseCurrency);
          personItems.push({
            itemName: item.name,
            amount: Math.round(itemAmount * 100) / 100,
            currency: item.currency,
            convertedAmount: Math.round(convertedAmount * 100) / 100
          });
          totalAmount += convertedAmount;
        }
      }
    });

    // Add proportional tax and tip
    const subtotal = bill.items.reduce((sum, item) => {
      const convertedPrice = convertCurrency(item.price, item.currency, bill.baseCurrency);
      return sum + convertedPrice;
    }, 0);
    
    if (subtotal > 0) {
      const personProportion = totalAmount / subtotal;
      const convertedTax = convertCurrency(bill.tax || 0, bill.taxCurrency || bill.baseCurrency, bill.baseCurrency);
      const convertedTip = convertCurrency(bill.tip || 0, bill.tipCurrency || bill.baseCurrency, bill.baseCurrency);
      totalAmount += (convertedTax + convertedTip) * personProportion;
    }

    return {
      personId: person.id,
      name: person.name,
      totalAmount: Math.round(totalAmount * 100) / 100,
      items: personItems
    };
  });
};
