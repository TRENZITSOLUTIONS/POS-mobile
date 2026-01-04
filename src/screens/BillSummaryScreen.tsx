import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import SalesIcon from '../assets/icons/Sales.svg';
import TotalBillsIcon from '../assets/icons/TotalBills.svg';
import AvgIcon from '../assets/icons/AvgIcon.svg';
import TotalItemsIcon from '../assets/icons/TotalItems.svg';
import { RootStackParamList } from '../types/business.types';

type BillSummaryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BillSummary'>;
  route: RouteProp<RootStackParamList, 'BillSummary'>;
};

const BillSummaryScreen: React.FC<BillSummaryScreenProps> = ({ navigation, route }) => {
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
  }, []);

  const handleSavePDF = () => {
    // Navigate to success screen
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

  const categories = [
    { name: 'South Indian', amount: 18320, percentage: 40, color: '#C62828' },
    { name: 'North Indian', amount: 16030, percentage: 35, color: '#C62828' },
    { name: 'Beverages', amount: 6870, percentage: 15, color: '#C62828' },
    { name: 'Desserts', amount: 4580, percentage: 10, color: '#C62828' },
  ];

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
          <Text style={styles.bannerSubtext}>26 Dec 2025</Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#E8F5E9' }]}>
              <SalesIcon width={24} height={24} />
            </View>
            <Text style={styles.metricLabel}>Total Sales</Text>
            <Text style={styles.metricValue}>₹45,800</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#FEF2F2' }]}>
              <TotalBillsIcon width={24} height={24} />
            </View>
            <Text style={styles.metricLabel}>Total Bills</Text>
            <Text style={styles.metricValue}>124</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#E3F2FD' }]}>
              <AvgIcon width={24} height={24} />
            </View>
            <Text style={styles.metricLabel}>Avg. Bill Value</Text>
            <Text style={styles.metricValue}>₹369</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#FFF8E1' }]}>
              <TotalItemsIcon width={24} height={24} />
            </View>
            <Text style={styles.metricLabel}>Total Items</Text>
            <Text style={styles.metricValue}>372</Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.categoryCard}>
          <Text style={styles.cardTitle}>Category Breakdown</Text>
          
          <View style={styles.categoriesList}>
            {categories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View style={styles.categoryAmountRow}>
                    <Text style={styles.categoryAmount}>₹{category.amount.toLocaleString()}</Text>
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

        {/* Additional Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Additional Details</Text>
          
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Peak Hour:</Text>
              <Text style={styles.detailValue}>1:30 PM - 2:30 PM</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method:</Text>
              <Text style={styles.detailValue}>Cash & Digital</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>GST Collected:</Text>
              <Text style={styles.detailValue}>₹2,290</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Report Generated:</Text>
              <Text style={styles.detailValue}>06:03 PM</Text>
            </View>
          </View>
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Text style={styles.demoNoticeText}>
            This is demonstration data for preview purposes
          </Text>
        </View>
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
    color: '#333333',
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
  salesIcon: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
  },
  billsIcon: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#C62828',
  },
  avgIcon: {
    width: 20,
    height: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderTopWidth: 0,
  },
  itemsIcon: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#FF9800',
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