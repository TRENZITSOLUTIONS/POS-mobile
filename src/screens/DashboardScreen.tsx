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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';

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
  };
  leastSoldProduct: {
    name: string;
    soldCount: number;
    category: string;
    image?: string;
  };
  mostSoldCategory: {
    name: string;
    itemsSold: number;
  };
  leastSoldCategory: {
    name: string;
    itemsSold: number;
  };
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [selectedRange, setSelectedRange] = useState<DateRange>('today');
  const [customDays, setCustomDays] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Sample data for different date ranges
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSales: 1366,
    totalBills: 4,
    avgBillValue: 342,
    mostSoldProduct: {
      name: 'Idli',
      soldCount: 6,
      category: 'Rice & Dosa',
    },
    leastSoldProduct: {
      name: 'Vada',
      soldCount: 1,
      category: 'Rice & Dosa',
    },
    mostSoldCategory: {
      name: 'Rice & Dosa',
      itemsSold: 18,
    },
    leastSoldCategory: {
      name: 'Tea & Coffee',
      itemsSold: 2,
    },
  });

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
  }, []);

  const handleRangeSelect = (range: DateRange) => {
    setSelectedRange(range);
    setShowCustomInput(range === 'custom');

    // Update data based on selected range
    switch (range) {
      case 'today':
        setDashboardData({
          totalSales: 1366,
          totalBills: 4,
          avgBillValue: 342,
          mostSoldProduct: { name: 'Idli', soldCount: 6, category: 'Rice & Dosa' },
          leastSoldProduct: { name: 'Vada', soldCount: 1, category: 'Rice & Dosa' },
          mostSoldCategory: { name: 'Rice & Dosa', itemsSold: 18 },
          leastSoldCategory: { name: 'Tea & Coffee', itemsSold: 2 },
        });
        break;
      case 'yesterday':
        setDashboardData({
          totalSales: 830,
          totalBills: 3,
          avgBillValue: 277,
          mostSoldProduct: { name: 'Masala Dosa', soldCount: 5, category: 'Rice & Dosa' },
          leastSoldProduct: { name: 'Curd Rice', soldCount: 1, category: 'Rice & Dosa' },
          mostSoldCategory: { name: 'Rice & Dosa', itemsSold: 16 },
          leastSoldCategory: { name: 'Snacks', itemsSold: 3 },
        });
        break;
      case 'last7days':
        setDashboardData({
          totalSales: 4894,
          totalBills: 15,
          avgBillValue: 326,
          mostSoldProduct: { name: 'Idli', soldCount: 11, category: 'Rice & Dosa' },
          leastSoldProduct: { name: 'Mutton Biryani', soldCount: 1, category: 'Rice & Dosa' },
          mostSoldCategory: { name: 'Rice & Dosa', itemsSold: 56 },
          leastSoldCategory: { name: 'Tea & Coffee', itemsSold: 2 },
        });
        break;
      case 'custom':
        // Show empty state or custom input
        break;
    }
  };

  const handleApplyCustomRange = () => {
    if (customDays && parseInt(customDays) > 0) {
      setDashboardData({
        totalSales: 2616,
        totalBills: 8,
        avgBillValue: 327,
        mostSoldProduct: { name: 'Veg Meals', soldCount: 9, category: 'Rice & Dosa' },
        leastSoldProduct: { name: 'Curd Rice', soldCount: 1, category: 'Rice & Dosa' },
        mostSoldCategory: { name: 'Rice & Dosa', itemsSold: 34 },
        leastSoldCategory: { name: 'Chapati & Curry', itemsSold: 2 },
      });
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

  const hasData = selectedRange !== 'custom' || (selectedRange === 'custom' && customDays);

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
              <Text style={styles.metricValue}>₹ {dashboardData.totalSales.toLocaleString()}</Text>
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

            {/* Least Sold Product Card */}
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
            <View style={styles.categoryCard}>
              <Text style={styles.cardTitle}>Category Performance</Text>

              <View style={styles.categorySection}>
                <Text style={styles.categoryLabel}>Most Sold Category</Text>
                <Text style={styles.categoryName}>{dashboardData.mostSoldCategory.name}</Text>
                <Text style={styles.categoryItems}>{dashboardData.mostSoldCategory.itemsSold} items sold</Text>
              </View>

              {dashboardData.leastSoldCategory && (
                <View style={styles.categorySectionBottom}>
                  <Text style={styles.categoryLabel}>Least Sold Category</Text>
                  <Text style={styles.categoryName}>{dashboardData.leastSoldCategory.name}</Text>
                  <Text style={styles.categoryItems}>{dashboardData.leastSoldCategory.itemsSold} items sold</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No data available for custom range</Text>
            <Text style={styles.emptyStateSubtext}>Try selecting a different date range</Text>
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