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
import { useTheme } from './contexts/ThemeContext';
import PeopleManager from './components/PeopleManager';
import ItemsManager from './components/ItemsManager';
import BillSummary from './components/BillSummary';
import BillHistory from './components/BillHistory';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ReceiptCamera from './components/ReceiptCameraSimulated';
// import SplitCustomizer from './components/SplitCustomizer';
import VoiceInput from './components/VoiceInputSimulated';
import BarcodeScanner from './components/BarcodeScannerSimulated';

const BillSplitterApp: React.FC = () => {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
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

  const [activeTab, setActiveTab] = useState<'people' | 'items' | 'summary' | 'history' | 'analytics'>('people');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  // Modal states
  const [showReceiptCamera, setShowReceiptCamera] = useState(false);
  const [showSplitCustomizer, setSplitCustomizer] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [voiceInputMode, setVoiceInputMode] = useState<'item' | 'person'>('item');
  const [selectedItemForSplit, setSelectedItemForSplit] = useState<Item | null>(null);

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

  // New feature handlers
  const handleReceiptCaptured = (imageUri: string) => {
    setCurrentBill(prev => ({
      ...prev,
      receiptImage: imageUri,
    }));
    Alert.alert('Receipt Captured', 'Receipt photo has been attached to this bill.');
  };

  const handleCustomSplit = (itemId: string, customSplit: { [personId: string]: number }) => {
    setCurrentBill(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, splitType: 'custom', customSplits: customSplit }
          : item
      ),
    }));
  };

  const handleVoiceInput = (text: string) => {
    if (voiceInputMode === 'person') {
      addPerson(text);
    } else {
      // Parse item from voice input (e.g., "Pizza slice eight fifty")
      const match = text.match(/(.+?)(?:\s+(?:[$]?(\d+(?:\.\d{2})?)))?$/i);
      if (match) {
        const name = match[1].trim();
        const price = match[2] ? parseFloat(match[2]) : 0;
        addItem({
          name,
          price,
          currency: currentBill.baseCurrency,
          assignedTo: [],
          splitType: 'equal',
        });
      }
    }
  };

  const handleProductScanned = (productData: { name: string; price?: number }) => {
    addItem({
      name: productData.name,
      price: productData.price || 0,
      currency: currentBill.baseCurrency,
      assignedTo: [],
      splitType: 'equal',
      barcode: 'scanned',
    });
  };

  const showCustomSplitForItem = (item: Item) => {
    if (item.assignedTo.length === 0) {
      Alert.alert('No People Assigned', 'Please assign people to this item before customizing the split.');
      return;
    }
    setSelectedItemForSplit(item);
    setSplitCustomizer(true);
  };

  const renderTabButton = (tab: typeof activeTab, icon: keyof typeof Ionicons.glyphMap, label: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { borderBottomColor: colors.primary },
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={activeTab === tab ? colors.primary : colors.textSecondary}
      />
      <Text style={[
        styles.tabLabel,
        { color: colors.textSecondary },
        activeTab === tab && { color: colors.primary, fontWeight: '600' }
      ]}>
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
            onVoiceInput={() => {
              setVoiceInputMode('person');
              setShowVoiceInput(true);
            }}
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
            onCustomSplit={showCustomSplitForItem}
            onVoiceInput={() => {
              setVoiceInputMode('item');
              setShowVoiceInput(true);
            }}
            onBarcodeScanner={() => setShowBarcodeScanner(true)}
          />
        );
      case 'summary':
        return (
          <BillSummary
            bill={currentBill}
            onUpdateBillDetails={updateBillDetails}
            onReset={resetBill}
            onCaptureReceipt={() => setShowReceiptCamera(true)}
          />
        );
      case 'history':
        return (
          <BillHistory 
            onLoadBill={(bill) => {
              setCurrentBill(bill);
              setActiveTab('summary');
            }}
            onClose={() => setActiveTab('people')}
          />
        );
      case 'analytics':
        return (
          <AnalyticsDashboard 
            onClose={() => setActiveTab('people')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
        translucent={false}
      />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Bill Splitter</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleDarkMode} style={styles.themeButton}>
            <Ionicons 
              name={isDarkMode ? "sunny-outline" : "moon-outline"} 
              size={22} 
              color={colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={resetBill} style={styles.resetButton}>
            <Ionicons name="refresh-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {renderTabButton('people', 'people-outline', 'People')}
        {renderTabButton('items', 'receipt-outline', 'Items')}
        {renderTabButton('summary', 'calculator-outline', 'Summary')}
        {renderTabButton('history', 'time-outline', 'History')}
        {renderTabButton('analytics', 'bar-chart-outline', 'Analytics')}
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      {/* Modals */}
      <ReceiptCamera
        visible={showReceiptCamera}
        onClose={() => setShowReceiptCamera(false)}
        onReceiptCaptured={handleReceiptCaptured}
      />

      {/* Temporarily disabled SplitCustomizer */}
      {/* {selectedItemForSplit && (
        <SplitCustomizer
          visible={showSplitCustomizer}
          onClose={() => {
            setSplitCustomizer(false);
            setSelectedItemForSplit(null);
          }}
          item={selectedItemForSplit}
          people={currentBill.people}
          onSplitUpdated={handleCustomSplit}
        />
      )} */}

      <VoiceInput
        visible={showVoiceInput}
        onClose={() => setShowVoiceInput(false)}
        onTextRecognized={handleVoiceInput}
        mode={voiceInputMode}
      />

      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onProductScanned={handleProductScanned}
      />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeButton: {
    padding: 8,
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
