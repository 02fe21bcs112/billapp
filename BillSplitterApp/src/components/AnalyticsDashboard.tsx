import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bill } from '../types';
import { getBillHistory } from '../utils/storage';
import { calculateSpendingAnalytics, SpendingAnalytics } from '../utils/analytics';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';

interface AnalyticsDashboardProps {
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose }) => {
  const { colors } = useTheme();
  const [analytics, setAnalytics] = useState<SpendingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30d' | '90d' | '1y'>('all');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      let bills = await getBillHistory();
      
      // Filter by selected period
      const now = new Date();
      if (selectedPeriod !== 'all') {
        const daysBack = selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365;
        const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        bills = bills.filter(bill => new Date(bill.createdAt) > cutoffDate);
      }

      const analyticsData = calculateSpendingAnalytics(bills, 'USD');
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (title: string, value: string, icon: string, color: string) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  const renderFrequentItems = () => {
    if (!analytics?.frequentItems.length) return null;
    
    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Most Frequent Items</Text>
        {analytics.frequentItems.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.frequentItem}>
            <View style={styles.frequentItemInfo}>
              <Text style={[styles.frequentItemName, { color: colors.text }]}>
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </Text>
              <Text style={[styles.frequentItemCount, { color: colors.textSecondary }]}>
                {item.count} times
              </Text>
            </View>
            <Text style={[styles.frequentItemAmount, { color: colors.primary }]}>
              {formatCurrency(item.totalSpent, 'USD')}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderMonthlySpending = () => {
    if (!analytics?.monthlySpending) return null;
    
    const months = Object.entries(analytics.monthlySpending)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6);
    
    if (months.length === 0) return null;
    
    const maxAmount = Math.max(...months.map(([, amount]) => amount));
    
    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Spending</Text>
        {months.map(([month, amount]) => {
          const percentage = (amount / maxAmount) * 100;
          const date = new Date(month + '-01');
          const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          
          return (
            <View key={month} style={styles.monthlyItem}>
              <View style={styles.monthlyInfo}>
                <Text style={[styles.monthlyName, { color: colors.text }]}>{monthName}</Text>
                <Text style={[styles.monthlyAmount, { color: colors.primary }]}>
                  {formatCurrency(amount, 'USD')}
                </Text>
              </View>
              <View style={[styles.monthlyBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.monthlyProgress, 
                    { width: `${percentage}%`, backgroundColor: colors.primary }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    closeText: {
      fontSize: 17,
      color: colors.primary,
    },
    periodSelector: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    periodButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    periodButtonTextActive: {
      color: colors.surface,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20,
    },
    statCard: {
      width: (Dimensions.get('window').width - 60) / 2,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      margin: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    statContent: {
      flex: 1,
    },
    statTitle: {
      fontSize: 12,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    section: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    frequentItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '50',
    },
    frequentItemInfo: {
      flex: 1,
    },
    frequentItemName: {
      fontSize: 14,
      fontWeight: '500',
    },
    frequentItemCount: {
      fontSize: 12,
      marginTop: 2,
    },
    frequentItemAmount: {
      fontSize: 14,
      fontWeight: '600',
    },
    monthlyItem: {
      marginBottom: 12,
    },
    monthlyInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    monthlyName: {
      fontSize: 14,
      fontWeight: '500',
    },
    monthlyAmount: {
      fontSize: 14,
      fontWeight: '600',
    },
    monthlyBar: {
      height: 6,
      borderRadius: 3,
    },
    monthlyProgress: {
      height: '100%',
      borderRadius: 3,
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
      color: colors.textSecondary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Loading analytics...</Text>
      </View>
    );
  }

  if (!analytics || analytics.billCount === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>No data to analyze</Text>
          <Text style={styles.emptyStateSubtext}>
            Create some bills to see your spending analytics
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        {[
          { key: 'all', label: 'All Time' },
          { key: '30d', label: '30 Days' },
          { key: '90d', label: '90 Days' },
          { key: '1y', label: '1 Year' },
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.key as typeof selectedPeriod)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {renderStatCard(
            'Total Spent',
            formatCurrency(analytics.totalSpent, 'USD'),
            'wallet-outline',
            colors.primary
          )}
          {renderStatCard(
            'Bills Created',
            analytics.billCount.toString(),
            'receipt-outline',
            colors.success
          )}
          {renderStatCard(
            'Avg per Bill',
            formatCurrency(analytics.averageBillAmount, 'USD'),
            'calculator-outline',
            colors.warning
          )}
          {renderStatCard(
            'Avg People',
            Math.round(analytics.averagePeoplePerBill).toString(),
            'people-outline',
            colors.error
          )}
        </View>

        {renderFrequentItems()}
        {renderMonthlySpending()}
      </ScrollView>
    </View>
  );
};

export default AnalyticsDashboard;
