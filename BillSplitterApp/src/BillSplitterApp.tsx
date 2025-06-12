import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bill, Person, Item } from './types';
import { generateId, getRandomColor } from './utils/calculations';
import PeopleManager from './components/PeopleManager';
import ItemsManager from './components/ItemsManager';
import BillSummary from './components/BillSummary';

const BillSplitterApp: React.FC = () => {
  const [currentBill, setCurrentBill] = useState<Bill>({
    id: generateId(),
    name: 'New Bill',
    baseCurrency: 'USD',
    people: [],
    items: [],
    tax: 0,
    taxCurrency: 'USD',
    tip: 0,
    tipCurrency: 'USD',
    createdAt: new Date(),
  });

  const [activeTab, setActiveTab] = useState<'people' | 'items' | 'summary'>('people');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const addPerson = (name: string) => {
    const newPerson: Person = {
      id: generateId(),
      name,
      color: getRandomColor(),
    };
    
    setCurrentBill(prev => ({
      ...prev,
      people: [...prev.people, newPerson],
    }));
  };

  const removePerson = (personId: string) => {
    Alert.alert(
      'Remove Person',
      'Are you sure you want to remove this person? They will be removed from all items.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setCurrentBill(prev => ({
              ...prev,
              people: prev.people.filter(p => p.id !== personId),
              items: prev.items.map(item => ({
                ...item,
                assignedTo: item.assignedTo.filter(id => id !== personId),
                customSplits: item.customSplits ? 
                  Object.fromEntries(
                    Object.entries(item.customSplits).filter(([id]) => id !== personId)
                  ) : undefined,
              })),
            }));
          },
        },
      ]
    );
  };

  const addItem = (item: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...item,
      id: generateId(),
    };
    
    setCurrentBill(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateItem = (itemId: string, updates: Partial<Item>) => {
    setCurrentBill(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
  };

  const removeItem = (itemId: string) => {
    setCurrentBill(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  const updateBillDetails = (updates: Partial<Pick<Bill, 'tax' | 'tip' | 'name' | 'baseCurrency' | 'taxCurrency' | 'tipCurrency'>>) => {
    setCurrentBill(prev => ({ ...prev, ...updates }));
  };

  const resetBill = () => {
    Alert.alert(
      'Reset Bill',
      'Are you sure you want to start a new bill? All current data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setCurrentBill({
              id: generateId(),
              name: 'New Bill',
              baseCurrency: 'USD',
              people: [],
              items: [],
              tax: 0,
              taxCurrency: 'USD',
              tip: 0,
              tipCurrency: 'USD',
              createdAt: new Date(),
            });
            setActiveTab('people');
          },
        },
      ]
    );
  };

  const renderTabButton = (tab: typeof activeTab, icon: keyof typeof Ionicons.glyphMap, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon}
        size={24}
        color={activeTab === tab ? '#007AFF' : '#8E8E93'}
      />
      <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'people':
        return (
          <PeopleManager
            people={currentBill.people}
            onAddPerson={addPerson}
            onRemovePerson={removePerson}
          />
        );
      case 'items':
        return (
          <ItemsManager
            items={currentBill.items}
            people={currentBill.people}
            bill={currentBill}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        );
      case 'summary':
        return (
          <BillSummary
            bill={currentBill}
            onUpdateBillDetails={updateBillDetails}
            onReset={resetBill}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Bill Splitter</Text>
        <TouchableOpacity onPress={resetBill} style={styles.resetButton}>
          <Ionicons name="refresh-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('people', 'people-outline', 'People')}
        {renderTabButton('items', 'receipt-outline', 'Items')}
        {renderTabButton('summary', 'calculator-outline', 'Summary')}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  resetButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});

export default BillSplitterApp;
