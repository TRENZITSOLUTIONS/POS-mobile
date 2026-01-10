import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/business.types';
import { getNextBillNumber } from '../utils/billNumbering';
import { saveBill } from '../services/storage';

type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({navigation, route}) => {
  const {cart} = route.params;
  const [discountAmount, setDiscountAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI'>('Cash');
  const [isGenerating, setIsGenerating] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const summaryOpacity = useRef(new Animated.Value(0)).current;
  const summaryScale = useRef(new Animated.Value(0.95)).current;
  const discountOpacity = useRef(new Animated.Value(0)).current;
  const discountTranslateY = useRef(new Animated.Value(20)).current;
  const paymentOpacity = useRef(new Animated.Value(0)).current;
  const paymentTranslateY = useRef(new Animated.Value(20)).current;
  const billOpacity = useRef(new Animated.Value(0)).current;
  const billTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Header
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(headerTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Summary
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(summaryOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(summaryScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Discount
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(discountOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(discountTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Payment
    Animated.sequence([
      Animated.delay(550),
      Animated.parallel([
        Animated.timing(paymentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(paymentTranslateY, {
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
        Animated.spring(billTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateGST = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(discountAmount) || 0;
    return ((subtotal - discount) * 0.18);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(discountAmount) || 0;
    const gst = calculateGST();
    return subtotal - discount + gst;
  };

  const handleGenerateBill = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      // Get next bill number from the numbering system
      const billNumber = await getNextBillNumber();
      
      const subtotal = calculateSubtotal();
      const discount = parseFloat(discountAmount) || 0;
      const gst = calculateGST();
      const total = calculateTotal();
      const timestamp = new Date().toISOString();

      // Create bill object for database
      const bill = {
        bill_number: billNumber,
        items: JSON.stringify(cart), // Store cart items as JSON
        subtotal: subtotal,
        tax_amount: gst,
        discount_amount: discount,
        total_amount: total,
        payment_method: paymentMethod,
        customer_name: '', // Can be added as optional field
        customer_phone: '', // Can be added as optional field
        notes: '',
        created_at: timestamp,
      };

      // Save bill to database
      await saveBill(bill);
      
      console.log('Bill saved successfully:', billNumber);

      // Navigate to success screen with bill data
      navigation.navigate('BillSuccess', {
        cart,
        subtotal,
        discount,
        gst,
        total,
        paymentMethod,
        billNumber,
        timestamp,
      });

    } catch (error) {
      console.error('Failed to generate bill:', error);
      Alert.alert(
        'Error',
        'Failed to generate bill. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{translateY: headerTranslateY}],
          },
        ]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: summaryOpacity,
              transform: [{scale: summaryScale}],
            },
          ]}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          {cart.map(item => (
            <View key={item.id} style={styles.summaryItem}>
              <View style={styles.summaryItemLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price} × {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Discount */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: discountOpacity,
              transform: [{translateY: discountTranslateY}],
            },
          ]}>
          <Text style={styles.cardTitle}>Discount Amount</Text>
          <TextInput
            style={styles.discountInput}
            placeholder="0"
            placeholderTextColor="#999"
            value={discountAmount}
            onChangeText={setDiscountAmount}
            keyboardType="decimal-pad"
            editable={!isGenerating}
          />
        </Animated.View>

        {/* Payment Method */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: paymentOpacity,
              transform: [{translateY: paymentTranslateY}],
            },
          ]}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <View style={styles.paymentToggle}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === 'Cash' && styles.paymentButtonActive,
              ]}
              onPress={() => setPaymentMethod('Cash')}
              disabled={isGenerating}>
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === 'Cash' && styles.paymentTextActive,
                ]}>
                Cash
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === 'UPI' && styles.paymentButtonActive,
              ]}
              onPress={() => setPaymentMethod('UPI')}
              disabled={isGenerating}>
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === 'UPI' && styles.paymentTextActive,
                ]}>
                UPI
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bill Details */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: billOpacity,
              transform: [{translateY: billTranslateY}],
            },
          ]}>
          <Text style={styles.cardTitle}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>₹{calculateSubtotal().toFixed(2)}</Text>
          </View>
          {parseFloat(discountAmount) > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Discount</Text>
              <Text style={styles.billValue}>-₹{parseFloat(discountAmount).toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>GST (18%) (Incl.)</Text>
            <Text style={styles.billValue}>₹{calculateGST().toFixed(2)}</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{calculateTotal().toFixed(2)}</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Generate Bill Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]} 
          onPress={handleGenerateBill}
          disabled={isGenerating}>
          {isGenerating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.generateText}>Generate Bill</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backText: {
    fontSize: 24,
    color: '#C62828',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryItemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  discountInput: {
    height: 56,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  paymentButtonActive: {
    backgroundColor: '#C62828',
    borderColor: '#C62828',
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  paymentTextActive: {
    color: '#FFFFFF',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 16,
    color: '#666666',
  },
  billValue: {
    fontSize: 16,
    color: '#333333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  generateButton: {
    backgroundColor: '#C62828',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CheckoutScreen;