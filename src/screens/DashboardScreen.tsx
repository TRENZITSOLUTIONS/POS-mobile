import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import { getBills, getItems, getCategories } from '../services/storage';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

type DateRange = 'today' | 'yesterday' | 'last7days' | 'custom';

interface DashboardData {
  totalSales: number;
  totalBills: number;
  avgBillValue: number;
  mostSoldProduct: {
    name: string;
    soldCount: number;
    category: string;
    image?: string;
  } | null;
  leastSoldProduct: {
    name: string;
    soldCount: number;
    category: string;
    image?: string;
  } | null;
  mostSoldCategory: {
    name: string;
    itemsSold: number;
  } | null;
  leastSoldCategory: {
    name: string;
    itemsSold: number;
  } | null;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [selectedRange, setSelectedRange] = useState<DateRange>('today');
  const [customDays, setCustomDays] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSales: 0,
    totalBills: 0,
    avgBillValue: 0,
    mostSoldProduct: null,
    leastSoldProduct: null,
    mostSoldCategory: null,
    leastSoldCategory: null,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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

    loadDashboardData('today');
  }, []);

  const calculateDateRange = (range: DateRange, days?: number) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (range) {
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
        if (days) {
          start.setDate(start.getDate() - days);
        }
        break;
    }

    return { start, end };
  };

  const loadDashboardData = async (range: DateRange, customDaysValue?: string) => {
    try {
      setIsLoading(true);

      const days = customDaysValue ? parseInt(customDaysValue, 10) : undefined;
      const dateRange = calculateDateRange(range, days);

      // Load bills from database
      const allBills = await getBills();
      
      // Filter bills by date range
      const filteredBills = allBills.filter(bill => {
        const billDate = new Date(bill.created_at);
        return billDate >= dateRange.start && billDate <= dateRange.end;
      });

      // Load items and categories for product analysis
      const allItems = await getItems();
      const allCategories = await getCategories();

      // Calculate dashboard metrics
      const data = calculateDashboardMetrics(filteredBills, allItems, allCategories);
      
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set empty data on error
      setDashboardData({
        totalSales: 0,
        totalBills: 0,
        avgBillValue: 0,
        mostSoldProduct: null,
        leastSoldProduct: null,
        mostSoldCategory: null,
        leastSoldCategory: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDashboardMetrics = (
    bills: any[],
    items: any[],
    categories: any[]
  ): DashboardData => {
    // Total sales
    const totalSales = bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
    
    // Total bills
    const totalBills = bills.length;
    
    // Average bill value
    const avgBillValue = totalBills > 0 ? Math.round(totalSales / totalBills) : 0;
    
    // Track product sales
    const productSales: { [key: string]: { name: string; count: number; categoryId: string; itemData: any } } = {};
    
    // Track category sales
    const categorySales: { [key: string]: number } = {};

    bills.forEach(bill => {
      try {
        const billItems = JSON.parse(bill.items || '[]');
        
        billItems.forEach((item: any) => {
          const itemId = item.id;
          const quantity = item.quantity || 0;
          
          // Track product sales
          if (!productSales[itemId]) {
            const itemData = items.find(i => i.id === itemId);
            productSales[itemId] = {
              name: item.name,
              count: 0,
              categoryId: itemData?.category_ids?.[0] || '',
              itemData,
            };
          }
          productSales[itemId].count += quantity;
          
          // Track category sales
          const itemData = items.find(i => i.id === itemId);
          if (itemData && itemData.category_ids && itemData.category_ids.length > 0) {
            const categoryId = itemData.category_ids[0];
            categorySales[categoryId] = (categorySales[categoryId] || 0) + quantity;
          }
        });
      } catch (error) {
        console.error('Error parsing bill items:', error);
      }
    });

    // Find most/least sold products
    const productEntries = Object.entries(productSales);
    let mostSoldProduct = null;
    let leastSoldProduct = null;

    if (productEntries.length > 0) {
      const sortedProducts = productEntries.sort((a, b) => b[1].count - a[1].count);
      
      const mostSold = sortedProducts[0][1];
      const category = categories.find(c => c.id === mostSold.categoryId);
      mostSoldProduct = {
        name: mostSold.name,
        soldCount: mostSold.count,
        category: category?.name || 'Uncategorized',
      };

      const leastSold = sortedProducts[sortedProducts.length - 1][1];
      const leastCategory = categories.find(c => c.id === leastSold.categoryId);
      leastSoldProduct = {
        name: leastSold.name,
        soldCount: leastSold.count,
        category: leastCategory?.name || 'Uncategorized',
      };
    }

    // Find most/least sold categories
    const categoryEntries = Object.entries(categorySales);
    let mostSoldCategory = null;
    let leastSoldCategory = null;

    if (categoryEntries.length > 0) {
      const sortedCategories = categoryEntries.sort((a, b) => b[1] - a[1]);
      
      const mostCat = categories.find(c => c.id === sortedCategories[0][0]);
      if (mostCat) {
        mostSoldCategory = {
          name: mostCat.name,
          itemsSold: sortedCategories[0][1],
        };
      }

      const leastCat = categories.find(c => c.id === sortedCategories[sortedCategories.length - 1][0]);
      if (leastCat) {
        leastSoldCategory = {
          name: leastCat.name,
          itemsSold: sortedCategories[sortedCategories.length - 1][1],
        };
      }
    }

    return {
      totalSales,
      totalBills,
      avgBillValue,
      mostSoldProduct,
      leastSoldProduct,
      mostSoldCategory,
      leastSoldCategory,
    };
  };

  const handleRangeSelect = (range: DateRange) => {
    setSelectedRange(range);
    setShowCustomInput(range === 'custom');

    if (range !== 'custom') {
      loadDashboardData(range);
    } else {
      // Clear custom days when switching to custom
      setCustomDays('');
    }
  };

  const handleApplyCustomRange = () => {
    if (customDays && parseInt(customDays) > 0) {
      loadDashboardData('custom', customDays);
    }
  };

  const handleDownloadSummary = () => {
    navigation.navigate('SelectSummaryDate');
  };

  const getDateRangeText = () => {
    if (selectedRange === 'custom' && customDays) {
      return `Showing data for last ${customDays} days`;
    }
    return '';
  };

  const hasData = selectedRange !== 'custom' || (selectedRange === 'custom' && customDays && !isLoading);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Dashboard</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Date Range Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.cardTitle}>Date Range</Text>

          <View style={styles.dateButtonsGrid}>
            <TouchableOpacity
              style={[
                styles.dateButton,
                selectedRange === 'today' && styles.dateButtonActive,
              ]}
              onPress={() => handleRangeSelect('today')}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  selectedRange === 'today' && styles.dateButtonTextActive,
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateButton,
                selectedRange === 'yesterday' && styles.dateButtonActive,
              ]}
              onPress={() => handleRangeSelect('yesterday')}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  selectedRange === 'yesterday' && styles.dateButtonTextActive,
                ]}
              >
                Yesterday
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateButton,
                selectedRange === 'last7days' && styles.dateButtonActive,
              ]}
              onPress={() => handleRangeSelect('last7days')}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  selectedRange === 'last7days' && styles.dateButtonTextActive,
                ]}
              >
                Last 7 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateButton,
                selectedRange === 'custom' && styles.dateButtonActive,
              ]}
              onPress={() => handleRangeSelect('custom')}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  selectedRange === 'custom' && styles.dateButtonTextActive,
                ]}
              >
                Custom Range
              </Text>
            </TouchableOpacity>
          </View>

          {showCustomInput && (
            <View style={styles.customInputSection}>
              <View style={styles.customInputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Enter number of days</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={customDays}
                    onChangeText={setCustomDays}
                    placeholder="Enter number of days"
                    placeholderTextColor="rgba(51, 51, 51, 0.5)"
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyCustomRange}
                  activeOpacity={0.9}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {customDays && (
                <Text style={styles.dateRangeText}>{getDateRangeText()}</Text>
              )}
            </View>
          )}
        </Animated.View>

        {hasData ? (
          <>
            {/* Total Sales Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Sales</Text>
              <Text style={styles.metricValue}>₹ {dashboardData.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
              <Text style={styles.metricSubtext}>Based on selected date range</Text>
            </View>

            {/* Total Bills Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Bills</Text>
              <Text style={styles.metricValue}>{dashboardData.totalBills} Bills</Text>
            </View>

            {/* Average Bill Value Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Average Bill Value</Text>
              <Text style={styles.metricValue}>₹ {dashboardData.avgBillValue}</Text>
            </View>

            {/* Most Sold Product Card */}
            {dashboardData.mostSoldProduct && (
              <View style={styles.productCard}>
                <Text style={styles.cardTitle}>Most Sold Product</Text>
                <View style={styles.productInfo}>
                  <View style={styles.productImage}>
                    <Text style={styles.imagePlaceholder}>🍛</Text>
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{dashboardData.mostSoldProduct.name}</Text>
                    <Text style={styles.productSold}>{dashboardData.mostSoldProduct.soldCount} sold</Text>
                    <Text style={styles.productCategory}>Category: {dashboardData.mostSoldProduct.category}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Least Sold Product Card */}
            {dashboardData.leastSoldProduct && (
              <View style={styles.productCard}>
                <Text style={styles.cardTitle}>Least Sold Product</Text>
                <View style={styles.productInfo}>
                  <View style={styles.productImage}>
                    <Text style={styles.imagePlaceholder}>🥘</Text>
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{dashboardData.leastSoldProduct.name}</Text>
                    <Text style={styles.productSold}>{dashboardData.leastSoldProduct.soldCount} sold</Text>
                    <Text style={styles.productCategory}>Category: {dashboardData.leastSoldProduct.category}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Daily Bill Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Daily Bill Summary</Text>
              <Text style={styles.summaryDescription}>
                Download a summary of bills for the selected date
              </Text>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={handleDownloadSummary}
                activeOpacity={0.9}
              >
                <Text style={styles.downloadButtonText}>Download Summary</Text>
              </TouchableOpacity>
            </View>

            {/* Category Performance Card */}
            {(dashboardData.mostSoldCategory || dashboardData.leastSoldCategory) && (
              <View style={styles.categoryCard}>
                <Text style={styles.cardTitle}>Category Performance</Text>

                {dashboardData.mostSoldCategory && (
                  <View style={styles.categorySection}>
                    <Text style={styles.categoryLabel}>Most Sold Category</Text>
                    <Text style={styles.categoryName}>{dashboardData.mostSoldCategory.name}</Text>
                    <Text style={styles.categoryItems}>{dashboardData.mostSoldCategory.itemsSold} items sold</Text>
                  </View>
                )}

                {dashboardData.leastSoldCategory && (
                  <View style={styles.categorySectionBottom}>
                    <Text style={styles.categoryLabel}>Least Sold Category</Text>
                    <Text style={styles.categoryName}>{dashboardData.leastSoldCategory.name}</Text>
                    <Text style={styles.categoryItems}>{dashboardData.leastSoldCategory.itemsSold} items sold</Text>
                  </View>
                )}
              </View>
            )}

            {/* Show message if no bills */}
            {dashboardData.totalBills === 0 && (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateText}>No bills found for this date range</Text>
                <Text style={styles.emptyStateSubtext}>Try selecting a different date range</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>Please enter number of days and tap Apply</Text>
            <Text style={styles.emptyStateSubtext}>Custom date range requires input</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '600',
    color: '#C62828',
    lineHeight: 28,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    letterSpacing: -0.31,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
    lineHeight: 42,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  card: {
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
    lineHeight: 27,
    marginBottom: 16,
  },
  dateButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateButton: {
    width: '48.5%',
    height: 44,
    backgroundColor: '#F5F5F5',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonActive: {
    backgroundColor: '#C62828',
    borderColor: '#C62828',
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.31,
  },
  dateButtonTextActive: {
    color: '#FFFFFF',
  },
  customInputSection: {
    marginTop: 17,
    paddingTop: 17,
    borderTopWidth: 0.6,
    borderTopColor: '#E0E0E0',
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  inputContainer: {
    flex: 1,
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    letterSpacing: -0.15,
    lineHeight: 20,
  },
  numberInput: {
    height: 48,
    borderWidth: 1.81,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.31,
  },
  applyButton: {
    width: 92,
    height: 48,
    backgroundColor: '#C62828',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
  },
  dateRangeText: {
    fontSize: 15,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
    marginTop: 8,
  },
  metricValue: {
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.31,
    lineHeight: 24,
    marginBottom: 8,
  },
  metricSubtext: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  productCard: {
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
  productInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 40,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  productSold: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  productCategory: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 17,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryDescription: {
    fontSize: 15,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  downloadButton: {
    height: 48,
    backgroundColor: '#C62828',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
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
  categorySection: {
    paddingBottom: 8,
    borderBottomWidth: 0.6,
    borderBottomColor: '#E0E0E0',
  },
  categorySectionBottom: {
    paddingTop: 8,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  categoryName: {
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  categoryItems: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
});

export default DashboardScreen;