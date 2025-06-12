import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bill } from '../types';

const BILLS_STORAGE_KEY = 'bills_history';
const TEMPLATES_STORAGE_KEY = 'bill_templates';

export interface BillTemplate {
  id: string;
  name: string;
  description: string;
  items: Array<{
    name: string;
    price: number;
    currency: string;
  }>;
  defaultPeople: string[];
  createdAt: Date;
}

export const saveBill = async (bill: Bill): Promise<void> => {
  try {
    const existingBills = await getBillHistory();
    const updatedBills = [bill, ...existingBills.filter(b => b.id !== bill.id)];
    
    // Keep only the last 100 bills
    const billsToSave = updatedBills.slice(0, 100);
    
    await AsyncStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(billsToSave));
  } catch (error) {
    console.error('Error saving bill:', error);
    throw error;
  }
};

export const getBillHistory = async (): Promise<Bill[]> => {
  try {
    const billsJson = await AsyncStorage.getItem(BILLS_STORAGE_KEY);
    if (!billsJson) return [];
    
    const bills = JSON.parse(billsJson);
    return bills.map((bill: any) => ({
      ...bill,
      createdAt: new Date(bill.createdAt),
    }));
  } catch (error) {
    console.error('Error loading bill history:', error);
    return [];
  }
};

export const deleteBill = async (billId: string): Promise<void> => {
  try {
    const bills = await getBillHistory();
    const updatedBills = bills.filter(bill => bill.id !== billId);
    await AsyncStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(updatedBills));
  } catch (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
};

export const saveTemplate = async (template: BillTemplate): Promise<void> => {
  try {
    const existingTemplates = await getTemplates();
    const updatedTemplates = [template, ...existingTemplates.filter(t => t.id !== template.id)];
    await AsyncStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedTemplates));
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
};

export const getTemplates = async (): Promise<BillTemplate[]> => {
  try {
    const templatesJson = await AsyncStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!templatesJson) return [];
    
    const templates = JSON.parse(templatesJson);
    return templates.map((template: any) => ({
      ...template,
      createdAt: new Date(template.createdAt),
    }));
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
};

export const deleteTemplate = async (templateId: string): Promise<void> => {
  try {
    const templates = await getTemplates();
    const updatedTemplates = templates.filter(template => template.id !== templateId);
    await AsyncStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedTemplates));
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

export const exportBillsToJSON = async (): Promise<string> => {
  try {
    const bills = await getBillHistory();
    return JSON.stringify(bills, null, 2);
  } catch (error) {
    console.error('Error exporting bills:', error);
    throw error;
  }
};

export const importBillsFromJSON = async (jsonData: string): Promise<void> => {
  try {
    const importedBills = JSON.parse(jsonData);
    const existingBills = await getBillHistory();
    
    // Merge bills, avoiding duplicates
    const allBills = [...importedBills, ...existingBills];
    const uniqueBills = allBills.filter((bill, index, self) => 
      index === self.findIndex(b => b.id === bill.id)
    );
    
    await AsyncStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(uniqueBills));
  } catch (error) {
    console.error('Error importing bills:', error);
    throw error;
  }
};
