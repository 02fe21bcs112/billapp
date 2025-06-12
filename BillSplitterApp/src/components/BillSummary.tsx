import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bill } from '../types';
import { calculateBillSummary } from '../utils/calculations';
import { formatCurrency, convertCurrency, getExchangeRateText } from '../utils/currency';
import CurrencySelector from './CurrencySelector';

interface BillSummaryProps {
  bill: Bill;
  onUpdateBillDetails: (updates: Partial<Pick<Bill, 'tax' | 'tip' | 'name' | 'baseCurrency' | 'taxCurrency' | 'tipCurrency'>>) => void;
  onReset: () => void;
}

const BillSummary: React.FC<BillSummaryProps> = ({
  bill,
  onUpdateBillDetails,
  onReset,
}) => {
  const [taxInput, setTaxInput] = useState(bill.tax?.toString() || '0');
  const [tipInput, setTipInput] = useState(bill.tip?.toString() || '0');

  const summary = calculateBillSummary(bill);
  const subtotal = bill.items.reduce((sum, item) => {
    return sum + convertCurrency(item.price, item.currency, bill.baseCurrency);
  }, 0);
  const tax = parseFloat(taxInput) || 0;
  const tip = parseFloat(tipInput) || 0;
  const convertedTax = convertCurrency(tax, bill.taxCurrency || bill.baseCurrency, bill.baseCurrency);
  const convertedTip = convertCurrency(tip, bill.tipCurrency || bill.baseCurrency, bill.baseCurrency);
  const total = subtotal + convertedTax + convertedTip;

  const handleTaxChange = (value: string) => {
    setTaxInput(value);
    const taxAmount = parseFloat(value) || 0;
    onUpdateBillDetails({ tax: taxAmount });
  };

  const handleTipChange = (value: string) => {
    setTipInput(value);
    const tipAmount = parseFloat(value) || 0;
    onUpdateBillDetails({ tip: tipAmount });
  };

  const handleTaxCurrencyChange = (currency: string) => {
    onUpdateBillDetails({ taxCurrency: currency });
  };

  const handleTipCurrencyChange = (currency: string) => {
    onUpdateBillDetails({ tipCurrency: currency });
  };

  const handleBaseCurrencyChange = (currency: string) => {
    onUpdateBillDetails({ baseCurrency: currency });
  };

  const generateShareText = () => {
    let shareText = `📊 Bill Split Summary\n\n`;
    shareText += `💰 Total Bill: ${formatCurrency(total, bill.baseCurrency)}\n`;
    shareText += `📋 Subtotal: ${formatCurrency(subtotal, bill.baseCurrency)}\n`;
    if (tax > 0) shareText += `🏷️ Tax: ${formatCurrency(tax, bill.taxCurrency || bill.baseCurrency)}\n`;
    if (tip > 0) shareText += `💡 Tip: ${formatCurrency(tip, bill.tipCurrency || bill.baseCurrency)}\n`;
    shareText += `\n👥 Individual Amounts:\n`;
    
    summary.forEach(person => {
      shareText += `• ${person.name}: ${formatCurrency(person.totalAmount, bill.baseCurrency)}\n`;
    });

    shareText += `\n📱 Split with Bill Splitter App`;
    return shareText;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: generateShareText(),
        title: 'Bill Split Summary',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderPersonSummary = ({ item }: { item: typeof summary[0] }) => {
    const person = bill.people.find(p => p.id === item.personId);
    
    return (
      <View style={styles.personSummaryCard}>
        <View style={styles.personHeader}>
          <View style={styles.personInfo}>
            <View style={[styles.colorIndicator, { backgroundColor: person?.color || '#C7C7CC' }]} />
            <Text style={styles.personName}>{item.name}</Text>
          </View>
          <Text style={styles.personTotal}>{formatCurrency(item.totalAmount, bill.baseCurrency)}</Text>
        </View>
        
        {item.items.length > 0 && (
          <View style={styles.itemsBreakdown}>
            <Text style={styles.breakdownTitle}>Items:</Text>
            {item.items.map((itemDetail, index) => (
              <View key={index} style={styles.itemDetail}>
                <Text style={styles.itemDetailName}>{itemDetail.itemName}</Text>
                <View style={styles.itemAmountContainer}>
                  {itemDetail.currency && itemDetail.currency !== bill.baseCurrency && (
                    <Text style={styles.itemDetailOriginal}>
                      {formatCurrency(itemDetail.amount, itemDetail.currency)}
                    </Text>
                  )}
                  <Text style={styles.itemDetailAmount}>
                    {formatCurrency(itemDetail.convertedAmount || itemDetail.amount, bill.baseCurrency)}
                  </Text>
                </View>
              </View>
            ))}
            
            {(convertedTax > 0 || convertedTip > 0) && (
              <View style={styles.additionalCharges}>
                {convertedTax > 0 && (
                  <View style={styles.itemDetail}>
                    <Text style={styles.itemDetailName}>Tax (proportional)</Text>
                    <Text style={styles.itemDetailAmount}>
                      {formatCurrency((item.totalAmount - item.items.reduce((sum, i) => sum + (i.convertedAmount || i.amount), 0)) * (convertedTax / (convertedTax + convertedTip)), bill.baseCurrency)}
                    </Text>
                  </View>
                )}
                {convertedTip > 0 && (
                  <View style={styles.itemDetail}>
                    <Text style={styles.itemDetailName}>Tip (proportional)</Text>
                    <Text style={styles.itemDetailAmount}>
                      {formatCurrency((item.totalAmount - item.items.reduce((sum, i) => sum + (i.convertedAmount || i.amount), 0)) * (convertedTip / (convertedTax + convertedTip)), bill.baseCurrency)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (bill.people.length === 0 || bill.items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="calculator-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyStateText}>Nothing to calculate yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add people and items to see the bill summary
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Bill Summary</Text>
      
      <CurrencySelector
        selectedCurrency={bill.baseCurrency}
        onCurrencySelect={handleBaseCurrencyChange}
        label="Base Currency"
        style={styles.baseCurrencySelector}
      />
      
      <View style={styles.billTotals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalAmount}>{formatCurrency(subtotal, bill.baseCurrency)}</Text>
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Tax</Text>
          <View style={styles.inputWithCurrency}>
            <TextInput
              style={styles.amountInput}
              value={taxInput}
              onChangeText={handleTaxChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            <CurrencySelector
              selectedCurrency={bill.taxCurrency || bill.baseCurrency}
              onCurrencySelect={handleTaxCurrencyChange}
              style={styles.smallCurrencySelector}
            />
          </View>
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Tip</Text>
          <View style={styles.inputWithCurrency}>
            <TextInput
              style={styles.amountInput}
              value={tipInput}
              onChangeText={handleTipChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            <CurrencySelector
              selectedCurrency={bill.tipCurrency || bill.baseCurrency}
              onCurrencySelect={handleTipCurrencyChange}
              style={styles.smallCurrencySelector}
            />
          </View>
        </View>
        
        <View style={styles.separator} />
        
        <View style={styles.totalRow}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalAmount}>{formatCurrency(total, bill.baseCurrency)}</Text>
        </View>
      </View>

      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Individual Amounts</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color="#007AFF" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={summary}
        renderItem={renderPersonSummary}
        keyExtractor={(item) => item.personId}
        style={styles.summaryList}
        scrollEnabled={false}
      />

      <TouchableOpacity onPress={onReset} style={styles.resetButton}>
        <Ionicons name="refresh-outline" size={20} color="#FF3B30" />
        <Text style={styles.resetButtonText}>Start New Bill</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  billTotals: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#000000',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000000',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'right',
    minWidth: 80,
    backgroundColor: '#F8F8F8',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  grandTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  shareButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  summaryList: {
    marginBottom: 20,
  },
  personSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  personTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  itemsBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  itemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemDetailName: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  itemDetailAmount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  additionalCharges: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    marginTop: 20,
  },
  resetButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
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
  baseCurrencySelector: {
    marginBottom: 20,
  },
  inputWithCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallCurrencySelector: {
    marginBottom: 0,
    minWidth: 100,
  },
  itemAmountContainer: {
    alignItems: 'flex-end',
  },
  itemDetailOriginal: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});

export default BillSummary;
