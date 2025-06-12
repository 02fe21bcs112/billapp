import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Person, Item, Bill } from '../types';
import { formatCurrency } from '../utils/currency';
import CurrencySelector from './CurrencySelector';

interface ItemsManagerProps {
  items: Item[];
  people: Person[];
  bill: Bill;
  onAddItem: (item: Omit<Item, 'id'>) => void;
  onUpdateItem: (itemId: string, updates: Partial<Item>) => void;
  onRemoveItem: (itemId: string) => void;
}

const ItemsManager: React.FC<ItemsManagerProps> = ({
  items,
  people,
  bill,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}) => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCurrency, setNewItemCurrency] = useState(bill.baseCurrency);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  const handleAddItem = () => {
    const trimmedName = newItemName.trim();
    const price = parseFloat(newItemPrice);

    if (!trimmedName) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (selectedPeople.length === 0) {
      Alert.alert('Error', 'Please select at least one person');
      return;
    }

    onAddItem({
      name: trimmedName,
      price,
      currency: newItemCurrency,
      assignedTo: selectedPeople,
      splitType: 'equal',
    });

    // Reset form
    setNewItemName('');
    setNewItemPrice('');
    setNewItemCurrency(bill.baseCurrency);
    setSelectedPeople([]);
    setIsAddingItem(false);
  };

  const togglePersonSelection = (personId: string) => {
    setSelectedPeople(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const renderItemCard = ({ item }: { item: Item }) => {
    const assignedPeople = people.filter(person => item.assignedTo.includes(person.id));
    
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.price, item.currency)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onRemoveItem(item.id)}
            style={styles.removeButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.assignedPeople}>
          <Text style={styles.assignedLabel}>Split between:</Text>
          <View style={styles.peopleChips}>
            {assignedPeople.map(person => (
              <View key={person.id} style={styles.personChip}>
                <View style={[styles.chipColorIndicator, { backgroundColor: person.color }]} />
                <Text style={styles.chipText}>{person.name}</Text>
                <Text style={styles.chipAmount}>
                  {formatCurrency(item.price / item.assignedTo.length, item.currency)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (people.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyStateText}>Add people first</Text>
          <Text style={styles.emptyStateSubtext}>
            You need to add people before you can add items
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Items & Expenses</Text>
        <TouchableOpacity
          onPress={() => setIsAddingItem(true)}
          style={styles.addItemButton}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addItemButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderItemCard}
          keyExtractor={(item) => item.id}
          style={styles.itemsList}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyStateText}>No items added yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add items to start splitting expenses
          </Text>
        </View>
      )}

      <Modal
        visible={isAddingItem}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsAddingItem(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity
              onPress={handleAddItem}
              style={styles.modalSaveButton}
              disabled={!newItemName.trim() || !newItemPrice.trim() || selectedPeople.length === 0}
            >
              <Text style={[
                styles.modalSaveText,
                (!newItemName.trim() || !newItemPrice.trim() || selectedPeople.length === 0) && styles.modalSaveTextDisabled
              ]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter item name"
                value={newItemName}
                onChangeText={setNewItemName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price</Text>
              <View style={styles.priceContainer}>
                <TextInput
                  style={[styles.textInput, styles.priceInput]}
                  placeholder="0.00"
                  value={newItemPrice}
                  onChangeText={setNewItemPrice}
                  keyboardType="decimal-pad"
                />
                <CurrencySelector
                  selectedCurrency={newItemCurrency}
                  onCurrencySelect={setNewItemCurrency}
                  style={styles.currencySelector}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Split Between {selectedPeople.length > 0 && `(${selectedPeople.length} selected)`}
              </Text>
              <View style={styles.peopleSelector}>
                {people.map(person => (
                  <TouchableOpacity
                    key={person.id}
                    onPress={() => togglePersonSelection(person.id)}
                    style={[
                      styles.personSelector,
                      selectedPeople.includes(person.id) && styles.personSelectorSelected
                    ]}
                  >
                    <View style={[styles.selectorColorIndicator, { backgroundColor: person.color }]} />
                    <Text style={[
                      styles.personSelectorText,
                      selectedPeople.includes(person.id) && styles.personSelectorTextSelected
                    ]}>
                      {person.name}
                    </Text>
                    {selectedPeople.includes(person.id) && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addItemButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  itemsList: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  removeButton: {
    padding: 8,
  },
  assignedPeople: {
    marginTop: 8,
  },
  assignedLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  peopleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    color: '#000000',
    marginRight: 8,
  },
  chipAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 17,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalSaveButton: {
    padding: 4,
  },
  modalSaveText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalSaveTextDisabled: {
    color: '#C7C7CC',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  peopleSelector: {
    gap: 8,
  },
  personSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  personSelectorSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  selectorColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  personSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  personSelectorTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 2,
  },
  currencySelector: {
    flex: 1,
    marginBottom: 0,
  },
});

export default ItemsManager;
