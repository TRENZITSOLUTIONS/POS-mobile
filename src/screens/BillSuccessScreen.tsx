import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Svg, {Path} from 'react-native-svg';
import AnimatedButton from '../components/AnimatedButton';
import type {RootStackParamList} from '../types/business.types';
import { getBusinessSettings } from '../services/storage';

type BillSuccessScreenProps = NativeStackScreenProps<RootStackParamList, 'BillSuccess'>;

const CheckIcon = () => (
  <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <Path
      d="M10 24L18 32L38 12"
      stroke="#FFFFFF"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BillSuccessScreen: React.FC<BillSuccessScreenProps> = ({navigation, route}) => {
  const {cart, subtotal, discount, gst, total, paymentMethod, billNumber, timestamp} = route.params;

  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const checkOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const billOpacity = useRef(new Animated.Value(0)).current;
  const billScale = useRef(new Animated.Value(0.95)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadBusinessInfo();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      startAnimations();
    }
  }, [isLoading]);

  const loadBusinessInfo = async () => {
    try {
      const settings = await getBusinessSettings();
      setBusinessName(settings.business_name || 'Business Name');
    } catch (error) {
      console.error('Failed to load business info:', error);
      setBusinessName('Business Name');
    } finally {
      setIsLoading(false);
    }
  };

  const startAnimations = () => {
    // Check icon
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Title
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Bill details
    Animated.sequence([
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(billOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(billScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Buttons
    Animated.sequence([
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonsTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handlePrintBill = () => {
    console.log('Print bill:', billNumber);
    // TODO: Integrate with Bluetooth printer
    // Example: await printBill({ billNumber, cart, total, businessName });
  };

  const handleNewBill = () => {
    // Navigate back to billing screen
    navigation.navigate('Billing');
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: checkOpacity,
              transform: [{scale: checkScale}],
            },
          ]}>
          <CheckIcon />
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{translateY: titleTranslateY}],
            },
          ]}>
          <Text style={styles.title}>Bill Generated Successfully</Text>
          <Text style={styles.billNumber}>{billNumber}</Text>
        </Animated.View>

        {/* Bill Card */}
        <Animated.View
          style={[
            styles.billCard,
            {
              opacity: billOpacity,
              transform: [{scale: billScale}],
            },
          ]}>
          {/* Business Name - Now from database */}
          <Text style={styles.businessName}>{businessName}</Text>
          <Text style={styles.timestamp}>{formatDate(timestamp)}</Text>
          <Text style={styles.billId}>{billNumber}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Items */}
          {cart.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>₹{item.price} × {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Totals */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>-₹{discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GST (18%)</Text>
            <Text style={styles.totalValue}>₹{gst.toFixed(2)}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Final Total */}
          <View style={styles.finalTotalRow}>
            <Text style={styles.finalTotalLabel}>Total Amount</Text>
            <Text style={styles.finalTotalValue}>₹{total.toFixed(2)}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Payment Method */}
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method</Text>
            <Text style={styles.paymentValue}>{paymentMethod}</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Buttons */}
      <Animated.View
        style={[
          styles.buttonsContainer,
          {
            opacity: buttonsOpacity,
            transform: [{translateY: buttonsTranslateY}],
          },
        ]}>
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <AnimatedButton
              title="Print Bill"
              onPress={handlePrintBill}
              variant="secondary"
            />
          </View>
          <View style={styles.buttonHalf}>
            <AnimatedButton
              title="New Bill"
              onPress={handleNewBill}
              variant="primary"
            />
          </View>
        </View>
      </Animated.View>
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
  content: {
    flex: 1,
    paddingTop: 60,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  billNumber: {
    fontSize: 14,
    color: '#666666',
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  billId: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 14,
    color: '#666666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666666',
  },
  totalValue: {
    fontSize: 16,
    color: '#333333',
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentLabel: {
    fontSize: 16,
    color: '#666666',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
});

export default BillSuccessScreen;