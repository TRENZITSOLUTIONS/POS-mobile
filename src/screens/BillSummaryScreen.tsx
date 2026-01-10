import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import SalesIcon from '../assets/icons/Sales.svg';
import TotalBillsIcon from '../assets/icons/TotalBills.svg';
import AvgIcon from '../assets/icons/AvgIcon.svg';
import TotalItemsIcon from '../assets/icons/TotalItems.svg';
import { RootStackParamList } from '../types/business.types';
import { getBills, getItems, getCategories } from '../services/storage';

type BillSummaryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BillSummary'>;
  route: RouteProp<RootStackParamList, 'BillSummary'>;
};

interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface SummaryData {
  totalSales: number;
  totalBills: number;
  avgBillValue: number;
  totalItems: number;
  categories: CategoryBreakdown[];
  peakHour: string;
  gstCollected: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

const BillSummaryScreen: React.FC<BillSummaryScreenProps> = ({ navigation, route }) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadSummaryData();
  }, []);

  useEffect(() => {
    if (!isLoading && summaryData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, summaryData]);

  const loadSummaryData = async () => {
    try {
      const { dateRange, customDays } = route.params || {};
      
      // Calculate date range
      const range = calculateDateRange(dateRange, customDays);
      
      // Load bills from database
      const allBills = await getBills();
      
      // Filter bills by date range
      const filteredBills = allBills.filter(bill => {
        const billDate = new Date(bill.created_at);
        return billDate >= range.start && billDate <= range.end;
      });

      // Load items and categories for breakdown
      const allItems = await getItems();
      const allCategories = await getCategories();

      // Calculate summary
      const summary = calculateSummary(filteredBills, allItems, allCategories, range);
      
      setSummaryData(summary);
    } catch (error) {
      console.error('Failed to load summary data:', error);
      // Set empty data to avoid infinite loading
      setSummaryData({
        totalSales: 0,
        totalBills: 0,
        avgBillValue: 0,
        totalItems: 0,
        categories: [],
        peakHour: 'N/A',
        gstCollected: 0,
        dateRange: {
          start: new Date(),
          end: new Date(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDateRange = (dateRange: string | undefined, customDays: string | undefined) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (dateRange) {
      case 'today':
        // Already set to today
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        break;
      case 'last7days':
        start.setDate(start.getDate() - 7);
        break;
      case 'custom':
        if (customDays) {
          const days = parseInt(customDays, 10);
          start.setDate(start.getDate() - days);
        }
        break;
      default:
        // Today by default
        break;
    }

    return { start, end };
  };

  const calculateSummary = (
    bills: any[],
    items: any[],
    categories: any[],
    range: { start: Date; end: Date }
  ): SummaryData => {
    // Total sales
    const totalSales = bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
    
    // Total bills
    const totalBills = bills.length;
    
    // Average bill value
    const avgBillValue = totalBills > 0 ? totalSales / totalBills : 0;
    
    // Total items (sum of quantities from all bills)
    let totalItemsCount = 0;
    const categoryTotals: { [key: string]: number } = {};
    const hourCounts: { [key: number]: number } = {};

    bills.forEach(bill => {
      try {
        const billItems = JSON.parse(bill.items || '[]');
        
        billItems.forEach((item: any) => {
          totalItemsCount += item.quantity || 0;
          
          // Track category totals
          const itemData = items.find(i => i.id === item.id);
          if (itemData && itemData.category_ids && itemData.category_ids.length > 0) {
            const categoryId = itemData.category_ids[0];
            const category = categories.find(c => c.id === categoryId);
            if (category) {
              const categoryName = category.name;
              const itemTotal = (item.price || 0) * (item.quantity || 0);
              categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + itemTotal;
            }
          }
        });

        // Track hourly activity for peak hour
        const billTime = new Date(bill.created_at);
        const hour = billTime.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      } catch (error) {
        console.error('Error parsing bill items:', error);
      }
    });

    // Calculate category breakdown
    const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalSales > 0 ? Math.round((amount / totalSales) * 100) : 0,
        color: '#C62828',
      }))
      .sort((a, b) => b.amount - a.amount);

    // Find peak hour
    let peakHour = 'N/A';
    if (Object.keys(hourCounts).length > 0) {
      const peakHourNumber = parseInt(
        Object.entries(hourCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0],
        10
      );
      const startHour = peakHourNumber === 0 ? 12 : peakHourNumber > 12 ? peakHourNumber - 12 : peakHourNumber;
      const endHour = (peakHourNumber + 1) % 24;
      const endHourFormatted = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
      const startPeriod = peakHourNumber < 12 ? 'AM' : 'PM';
      const endPeriod = (peakHourNumber + 1) < 12 ? 'AM' : 'PM';
      peakHour = `${startHour}:00 ${startPeriod} - ${endHourFormatted}:00 ${endPeriod}`;
    }

    // Calculate GST (assuming 18% included in total)
    const gstCollected = totalSales * 0.18 / 1.18; // Reverse calculate GST from inclusive price

    return {
      totalSales,
      totalBills,
      avgBillValue,
      totalItems: totalItemsCount,
      categories: categoryBreakdown,
      peakHour,
      gstCollected,
      dateRange: range,
    };
  };

  const handleSavePDF = () => {
    // TODO: Generate PDF with summary data
    navigation.navigate('SaveSuccess');
  };

  const getDateRangeText = () => {
    const { dateRange, customDays } = route.params || {};
    
    if (dateRange === 'custom' && customDays) {
      return `Last ${customDays} Days`;
    }
    
    switch (dateRange) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'last7days':
        return 'Last 7 Days';
      default:
        return 'Today';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getPaymentMethodSummary = () => {
    // This could be enhanced to parse payment methods from bills
    return 'Multiple Methods';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={styles.loadingText}>Generating summary...</Text>
      </View>
    );
  }

  if (!summaryData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Failed to load summary data</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadSummaryData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>Bill Summary</Text>
          <Text style={styles.subtitle}>Summary report ready</Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Date Banner */}
        <View style={styles.dateBanner}>
          <Text style={styles.bannerLabel}>Summary for</Text>
          <Text style={styles.bannerDate}>{getDateRangeText()}</Text>
          <Text style={styles.bannerSubtext}>
            {summaryData.dateRange.start.toDateString() === summaryData.dateRange.end.toDateString()
              ? formatDate(summaryData.dateRange.start)
              : `${formatDate(summaryData.dateRange.start)} - ${formatDate(summaryData.dateRange.end)}`}
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#E8F5E9' }]}>
              <SalesIcon width={24} height={24} />
            </View>
            <Text style={styles.metricLabel}>Total Sales</Text>
            <Text style={styles.metricValue}>₹{summaryData.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#FEF2F2' }]}>
              <TotalBillsIcon width={24} height={24} />
            </View>
            <Text style={styles.metricLabel}>Total Bills</Text>
            <Text style={styles.metricValue}>{summaryData.totalBills}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#E3F2FD' }]}>
              <AvgIcon width={24} height={24} />
            </View>
            <Text style={styles.metricLabel}>Avg. Bill Value</Text>
            <Text style={styles.metricValue}>₹{summaryData.avgBillValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#FFF8E1' }]}>
              <TotalItemsIcon width={24} height={24} />
            </View>
            <Text style={styles.metricLabel}>Total Items</Text>
            <Text style={styles.metricValue}>{summaryData.totalItems}</Text>
          </View>
        </View>

        {/* Category Breakdown */}
        {summaryData.categories.length > 0 ? (
          <View style={styles.categoryCard}>
            <Text style={styles.cardTitle}>Category Breakdown</Text>
            
            <View style={styles.categoriesList}>
              {summaryData.categories.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <View style={styles.categoryAmountRow}>
                      <Text style={styles.categoryAmount}>₹{category.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                      <Text style={styles.categoryPercentage}>({category.percentage}%)</Text>
                    </View>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${category.percentage}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.categoryCard}>
            <Text style={styles.cardTitle}>Category Breakdown</Text>
            <Text style={styles.emptyText}>No category data available</Text>
          </View>
        )}

        {/* Additional Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Additional Details</Text>
          
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Peak Hour:</Text>
              <Text style={styles.detailValue}>{summaryData.peakHour}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method:</Text>
              <Text style={styles.detailValue}>{getPaymentMethodSummary()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>GST Collected:</Text>
              <Text style={styles.detailValue}>₹{summaryData.gstCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Report Generated:</Text>
              <Text style={styles.detailValue}>{getCurrentTime()}</Text>
            </View>
          </View>
        </View>

        {/* Show info if no bills */}
        {summaryData.totalBills === 0 && (
          <View style={styles.demoNotice}>
            <Text style={styles.demoNoticeText}>
              No bills found for the selected date range
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePDF}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>Save as PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#C62828',
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 0,
    paddingTop: 70,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.6,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    lineHeight: 21,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  dateBanner: {
    backgroundColor: '#C62828',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  bannerLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    letterSpacing: -0.31,
  },
  bannerDate: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.26,
    lineHeight: 33,
  },
  bannerSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    letterSpacing: -0.31,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.44,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 21,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.44,
    marginBottom: 16,
  },
  categoriesList: {
    gap: 16,
  },
  categoryItem: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    color: '#666666',
    letterSpacing: -0.15,
  },
  categoryAmountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryAmount: {
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.31,
  },
  categoryPercentage: {
    fontSize: 14,
    color: '#999999',
    letterSpacing: -0.15,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F2F2F2',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C62828',
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 21,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    letterSpacing: -0.15,
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    letterSpacing: -0.15,
  },
  demoNotice: {
    backgroundColor: '#FEF2F2',
    borderWidth: 0.6,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 12,
  },
  demoNoticeText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.6,
    borderTopColor: '#E0E0E0',
    padding: 16,
  },
  saveButton: {
    height: 52,
    backgroundColor: '#C62828',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
  },
});

export default BillSummaryScreen;