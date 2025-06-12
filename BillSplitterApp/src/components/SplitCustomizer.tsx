import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Person, Item, Currency } from '../types';
import { formatCurrency } from '../utils/currency';

interface SplitCustomizerProps {
  visible: boolean;
  onClose: () => void;
  item: Item;
  people: Person[];
  onSplitUpdated: (itemId: string, customSplit: { [personId: string]: number }) => void;
}

const SplitCustomizer: React.FC<SplitCustomizerProps> = ({
  visible,
  onClose,
  item,
  people,
  onSplitUpdated,
}) => {
  const { colors } = useTheme();
  const [splitMode, setSplitMode] = useState<'equal' | 'percentage' | 'amount'>('equal');
  const [percentages, setPercentages] = useState<{ [personId: string]: string }>({});
  const [amounts, setAmounts] = useState<{ [personId: string]: string }>({});

  const assignedPeople = people.filter(person => 
    item.assignedTo.includes(person.id)
  );

  useEffect(() => {
    if (visible) {
      // Initialize with equal splits
      const equalPercentage = assignedPeople.length > 0 ? 
        (100 / assignedPeople.length).toFixed(1) : '0';
      const equalAmount = assignedPeople.length > 0 ? 
        (item.price / assignedPeople.length).toFixed(2) : '0';

      const initialPercentages: { [personId: string]: string } = {};
      const initialAmounts: { [personId: string]: string } = {};

      assignedPeople.forEach(person => {
        initialPercentages[person.id] = equalPercentage;
        initialAmounts[person.id] = equalAmount;
      });

      setPercentages(initialPercentages);
      setAmounts(initialAmounts);
    }
  }, [visible, item, assignedPeople]);

  const getTotalPercentage = (): number => {
    return Object.values(percentages).reduce((sum, value) => {
      return sum + (parseFloat(value) || 0);
    }, 0);
  };

  const getTotalAmount = (): number => {
    return Object.values(amounts).reduce((sum, value) => {
      return sum + (parseFloat(value) || 0);
    }, 0);
  };

  const updatePercentage = (personId: string, value: string) => {
    setPercentages(prev => ({
      ...prev,
      [personId]: value,
    }));
  };

  const updateAmount = (personId: string, value: string) => {
    setAmounts(prev => ({
      ...prev,
      [personId]: value,
    }));
  };

  const handleEqualSplit = () => {
    setSplitMode('equal');
    const equalPercentage = assignedPeople.length > 0 ? 
      (100 / assignedPeople.length).toFixed(1) : '0';
    
    const newPercentages: { [personId: string]: string } = {};
    assignedPeople.forEach(person => {
      newPercentages[person.id] = equalPercentage;
    });
    setPercentages(newPercentages);
  };

  const handleApplySplit = () => {
    let customSplit: { [personId: string]: number } = {};

    if (splitMode === 'equal') {
      // Equal split - each person pays the same amount
      const equalAmount = item.price / assignedPeople.length;
      assignedPeople.forEach(person => {
        customSplit[person.id] = equalAmount;
      });
    } else if (splitMode === 'percentage') {
      const totalPercentage = getTotalPercentage();
      if (Math.abs(totalPercentage - 100) > 0.01) {
        Alert.alert('Invalid Split', `Percentages must add up to 100%. Current total: ${totalPercentage.toFixed(1)}%`);
        return;
      }
      
      assignedPeople.forEach(person => {
        const percentage = parseFloat(percentages[person.id]) || 0;
        customSplit[person.id] = (item.price * percentage) / 100;
      });
    } else if (splitMode === 'amount') {
      const totalAmount = getTotalAmount();
      if (Math.abs(totalAmount - item.price) > 0.01) {
        Alert.alert(
          'Invalid Split', 
          `Amounts must add up to ${formatCurrency(item.price, item.currency)}. Current total: ${formatCurrency(totalAmount, item.currency)}`
        );
        return;
      }
      
      assignedPeople.forEach(person => {
        customSplit[person.id] = parseFloat(amounts[person.id]) || 0;
      });
    }

    onSplitUpdated(item.id, customSplit);
    onClose();
  };

  const renderSplitModeSelector = () => (
    <View style={styles.modeSelector}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          { backgroundColor: colors.border },
          splitMode === 'equal' && { backgroundColor: colors.primary }
        ]}
        onPress={handleEqualSplit}
      >
        <Text style={[
          styles.modeButtonText,
          { color: colors.text },
          splitMode === 'equal' && { color: 'white' }
        ]}>
          Equal
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.modeButton,
          { backgroundColor: colors.border },
          splitMode === 'percentage' && { backgroundColor: colors.primary }
        ]}
        onPress={() => setSplitMode('percentage')}
      >
        <Text style={[
          styles.modeButtonText,
          { color: colors.text },
          splitMode === 'percentage' && { color: 'white' }
        ]}>
          Percentage
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.modeButton,
          { backgroundColor: colors.border },
          splitMode === 'amount' && { backgroundColor: colors.primary }
        ]}
        onPress={() => setSplitMode('amount')}
      >
        <Text style={[
          styles.modeButtonText,
          { color: colors.text },
          splitMode === 'amount' && { color: 'white' }
        ]}>
          Amount
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPersonSplit = (person: Person) => {
    if (splitMode === 'equal') {
      const equalAmount = item.price / assignedPeople.length;
      return (
        <View key={person.id} style={[styles.personRow, { borderBottomColor: colors.border }]}>
          <View style={styles.personInfo}>
            <View style={[styles.personColor, { backgroundColor: person.color }]} />
            <Text style={[styles.personName, { color: colors.text }]}>
              {person.name}
            </Text>
          </View>
          <Text style={[styles.splitValue, { color: colors.text }]}>
            {formatCurrency(equalAmount, item.currency)}
          </Text>
        </View>
      );
    }

    if (splitMode === 'percentage') {
      return (
        <View key={person.id} style={[styles.personRow, { borderBottomColor: colors.border }]}>
          <View style={styles.personInfo}>
            <View style={[styles.personColor, { backgroundColor: person.color }]} />
            <Text style={[styles.personName, { color: colors.text }]}>
              {person.name}
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              value={percentages[person.id]}
              onChangeText={(value) => updatePercentage(person.id, value)}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <Text style={[styles.inputSuffix, { color: colors.text }]}>%</Text>
          </View>
        </View>
      );
    }

    if (splitMode === 'amount') {
      return (
        <View key={person.id} style={[styles.personRow, { borderBottomColor: colors.border }]}>
          <View style={styles.personInfo}>
            <View style={[styles.personColor, { backgroundColor: person.color }]} />
            <Text style={[styles.personName, { color: colors.text }]}>
              {person.name}
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputPrefix, { color: colors.text }]}>
              {item.currency}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              value={amounts[person.id]}
              onChangeText={(value) => updateAmount(person.id, value)}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>
      );
    }

    return null;
  };

  const renderSummary = () => {
    if (splitMode === 'percentage') {
      const totalPercentage = getTotalPercentage();
      const isValid = Math.abs(totalPercentage - 100) < 0.01;
      
      return (
        <View style={[styles.summary, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            Total: {totalPercentage.toFixed(1)}% / 100%
          </Text>
          {!isValid && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Percentages must equal 100%
            </Text>
          )}
        </View>
      );
    }

    if (splitMode === 'amount') {
      const totalAmount = getTotalAmount();
      const isValid = Math.abs(totalAmount - item.price) < 0.01;
      
      return (
        <View style={[styles.summary, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            Total: {formatCurrency(totalAmount, item.currency)} / {formatCurrency(item.price, item.currency)}
          </Text>
          {!isValid && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Amounts must equal item price
            </Text>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Custom Split</Text>
          <TouchableOpacity onPress={handleApplySplit}>
            <Text style={[styles.applyButton, { color: colors.primary }]}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={[styles.itemInfo, { backgroundColor: colors.surface }]}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
              {formatCurrency(item.price, item.currency)}
            </Text>
          </View>

          {renderSplitModeSelector()}

          <View style={[styles.peopleContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Split Between ({assignedPeople.length} people)
            </Text>
            {assignedPeople.map(renderPersonSplit)}
          </View>

          {renderSummary()}
        </ScrollView>
      </View>
    </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  applyButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  itemInfo: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  peopleContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 15,
    paddingBottom: 10,
  },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  personName: {
    fontSize: 16,
    fontWeight: '500',
  },
  splitValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    minWidth: 80,
    textAlign: 'center',
  },
  inputPrefix: {
    fontSize: 16,
    marginRight: 5,
  },
  inputSuffix: {
    fontSize: 16,
    marginLeft: 5,
  },
  summary: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default SplitCustomizer;
