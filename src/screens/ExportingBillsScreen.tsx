import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/business.types';
import { getBills } from '../services/storage';

type ExportingBillsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ExportingBills'>;
  route: RouteProp<RootStackParamList, 'ExportingBills'>;
};

const ExportingBillsScreen: React.FC<ExportingBillsScreenProps> = ({
  navigation,
  route,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Loading bills...');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { exportType, customDays } = route.params;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Rotation animation for the dashed circle
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Start real export process
    performExport();
  }, []);

  const performExport = async () => {
    try {
      // Step 1: Calculate date range (15%)
      setProgress(15);
      setStatusText('Calculating date range...');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
      
      const dateRange = calculateDateRange(exportType, customDays);

      // Step 2: Load bills from database (40%)
      setProgress(40);
      setStatusText('Loading bills from database...');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
      
      const allBills = await getBills();

      // Step 3: Filter bills (60%)
      setProgress(60);
      setStatusText('Filtering bills...');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
      
      const filteredBills = allBills.filter(bill => {
        const billDate = new Date(bill.created_at);
        return billDate >= dateRange.start && billDate <= dateRange.end;
      });

      // Step 4: Format data (80%)
      setProgress(80);
      setStatusText('Formatting export data...');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
      
      const exportData = formatBillsForExport(filteredBills);

      // Step 5: Complete (100%)
      setProgress(100);
      setStatusText('Export complete!');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

      // Navigate to success screen with real data
      navigation.replace('ExportSuccess', {
        exportType,
        billCount: filteredBills.length,
        exportData, // Real formatted data
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to export bills:', error);
      Alert.alert(
        'Export Failed',
        'Failed to export bills. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const calculateDateRange = (type: string, days?: string) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (type) {
      case 'today':
        // Start: Today 00:00, End: Today 23:59
        break;
      case 'dateRange':
        // Custom days
        if (days) {
          const numDays = parseInt(days, 10);
          start.setDate(start.getDate() - numDays);
        }
        break;
      case 'all':
      default:
        // All time - set start to very old date
        start = new Date('2020-01-01');
        break;
    }

    return { start, end };
  };

  const formatBillsForExport = (bills: any[]) => {
    // Format bills into CSV-style data
    return bills.map(bill => ({
      bill_number: bill.bill_number,
      date: new Date(bill.created_at).toLocaleDateString('en-IN'),
      time: new Date(bill.created_at).toLocaleTimeString('en-IN'),
      items: JSON.parse(bill.items || '[]').length,
      subtotal: bill.subtotal.toFixed(2),
      tax: bill.tax_amount.toFixed(2),
      discount: bill.discount_amount.toFixed(2),
      total: bill.total_amount.toFixed(2),
      payment_method: bill.payment_method || 'Cash',
    }));
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.dashedCircle,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          />
          <Text style={styles.percentage}>{progress}%</Text>
        </View>

        {/* Status Text */}
        <Text style={styles.statusTitle}>{statusText}</Text>
        <Text style={styles.statusSubtext}>Preparing export file and formatting data</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    gap: 60,
  },
  progressContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dashedCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: '#C62828',
    borderStyle: 'dashed',
  },
  percentage: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.07,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.44,
    textAlign: 'center',
  },
  statusSubtext: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
    marginTop: -40,
  },
});

export default ExportingBillsScreen;