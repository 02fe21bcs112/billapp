import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bill } from '../types';
import { getBillHistory, deleteBill, exportBillsToJSON } from '../utils/storage';
import { formatCurrency, convertCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';

interface BillHistoryProps {
  onLoadBill: (bill: Bill) => void;
  onClose: () => void;
}

const BillHistory: React.FC<BillHistoryProps> = ({ onLoadBill, onClose }) => {
  const { colors } = useTheme();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const billHistory = await getBillHistory();
      setBills(billHistory);
    } catch (error) {
      Alert.alert('Error', 'Failed to load bill history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBill(billId);
              setBills(prev => prev.filter(b => b.id !== billId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete bill');
            }
          },
        },
      ]
    );
  };

  const handleExportBills = async () => {
    try {
      const jsonData = await exportBillsToJSON();
      await Share.share({
        message: jsonData,
        title: 'Bill History Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export bills');
    }
  };

  const filteredAndSortedBills = bills
    .filter(bill => 
      bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.people.some(person => person.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'amount':
          const totalA = a.items.reduce((sum, item) => 
            sum + convertCurrency(item.price, item.currency, a.baseCurrency), 0);
          const totalB = b.items.reduce((sum, item) => 
            sum + convertCurrency(item.price, item.currency, b.baseCurrency), 0);
          return totalB - totalA;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const calculateBillTotal = (bill: Bill) => {
    const itemsTotal = bill.items.reduce((sum, item) => 
      sum + convertCurrency(item.price, item.currency, bill.baseCurrency), 0);
    const tax = convertCurrency(bill.tax || 0, bill.taxCurrency || bill.baseCurrency, bill.baseCurrency);
    const tip = convertCurrency(bill.tip || 0, bill.tipCurrency || bill.baseCurrency, bill.baseCurrency);
    return itemsTotal + tax + tip;
  };

  const renderBillItem = ({ item }: { item: Bill }) => {
    const total = calculateBillTotal(item);
    const date = new Date(item.createdAt).toLocaleDateString();
    
    return (
      <View style={[styles.billItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.billContent}
          onPress={() => {
            onLoadBill(item);
            onClose();
          }}
        >
          <View style={styles.billInfo}>
            <Text style={[styles.billName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.billDate, { color: colors.textSecondary }]}>{date}</Text>
            <Text style={[styles.billPeople, { color: colors.textSecondary }]}>
              {item.people.length} people • {item.items.length} items
            </Text>
          </View>
          <View style={styles.billAmount}>
            <Text style={[styles.billTotal, { color: colors.primary }]}>
              {formatCurrency(total, item.baseCurrency)}
            </Text>
            <Text style={[styles.billCurrency, { color: colors.textSecondary }]}>
              {item.baseCurrency}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteBill(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Bill History</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: colors.primary }]}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search bills..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.sortContainer}>
        {['date', 'amount', 'name'].map((sort) => (
          <TouchableOpacity
            key={sort}
            style={[
              styles.sortButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              sortBy === sort && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSortBy(sort as typeof sortBy)}
          >
            <Text
              style={[
                styles.sortButtonText,
                { color: colors.textSecondary },
                sortBy === sort && { color: colors.surface, fontWeight: '600' },
              ]}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={[styles.exportButton, { backgroundColor: colors.primary }]} 
          onPress={handleExportBills}
        >
          <Ionicons name="download-outline" size={16} color={colors.surface} />
          <Text style={[styles.exportButtonText, { color: colors.surface }]}>Export</Text>
        </TouchableOpacity>
      </View>

      {filteredAndSortedBills.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No bills found</Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            {bills.length === 0 
              ? "You haven't created any bills yet"
              : "No bills match your search criteria"
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedBills}
          renderItem={renderBillItem}
          keyExtractor={(item) => item.id}
          style={styles.billsList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 17,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 14,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  exportButtonText: {
    fontWeight: '600',
    marginLeft: 6,
  },
  billsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  billContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  billDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  billPeople: {
    fontSize: 12,
  },
  billAmount: {
    alignItems: 'flex-end',
  },
  billTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  billCurrency: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default BillHistory;
