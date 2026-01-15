/**
 * AdminPinScreen.tsx
 * 
 * This screen handles LOCAL admin PIN verification for accessing admin features.
 * This is NOT related to API authentication - it's a local security layer.
 * 
 * The admin PIN is stored locally in business settings and verified client-side.
 * This is separate from the vendor account login which uses the API.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LockIcon from '../assets/icons/LockIcon.svg';
import { RootStackParamList } from '../types/business.types';
import { getBusinessSettings } from '../services/storage';
import CryptoJS from 'crypto-js';

type AdminPinScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminPin'>;
};

const AdminPinScreen: React.FC<AdminPinScreenProps> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkPinExists();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  const checkPinExists = async () => {
    try {
      const settings = await getBusinessSettings();
      
      // If no PIN is set, navigate to SetAdminPin
      if (!settings?.admin_pin) {
        navigation.replace('SetAdminPin');
        return;
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to check PIN:', error);
      Alert.alert('Error', 'Failed to load admin settings');
      navigation.goBack();
    }
  };

  const hashPin = (pinToHash: string): string => {
    return CryptoJS.SHA256(pinToHash).toString();
  };

  const verifyPin = async (enteredPin: string): Promise<boolean> => {
    try {
      const settings = await getBusinessSettings();
      
      if (!settings?.admin_pin) {
        return false;
      }
      
      const hashedEnteredPin = hashPin(enteredPin);
      return hashedEnteredPin === settings.admin_pin;
    } catch (error) {
      console.error('Failed to verify PIN:', error);
      return false;
    }
  };

  const handleVerify = async () => {
    if (pin.length !== 4) {
      setError(true);
      shakeAnimation();
      return;
    }

    setIsVerifying(true);

    try {
      const isValid = await verifyPin(pin);
      
      if (isValid) {
        navigation.replace('AdminDashboard');
      } else {
        setError(true);
        shakeAnimation();
        setPin('');
        setTimeout(() => {
          setError(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Failed to verify PIN');
    } finally {
      setIsVerifying(false);
    }
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Lock Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.lockCircle}>
            <LockIcon width={40} height={40} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Admin Verification</Text>
        <Text style={styles.subtitle}>Enter your admin PIN to continue</Text>

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateX: shakeAnim }],
            },
          ]}
        >
          {/* Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Admin PIN</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Enter PIN"
              placeholderTextColor="#999999"
              value={pin}
              onChangeText={(text) => {
                setPin(text);
                setError(false);
              }}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              editable={!isVerifying}
            />
            {error && (
              <Text style={styles.errorText}>Incorrect PIN. Please try again.</Text>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            activeOpacity={0.9}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  backButton: {
    paddingTop: 48,
    paddingBottom: 24,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    letterSpacing: -0.3125,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  lockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#C62828',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.257812,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.3125,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
    letterSpacing: -0.150391,
  },
  input: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.3125,
  },
  inputError: {
    borderColor: '#C62828',
  },
  errorText: {
    fontSize: 13,
    color: '#C62828',
    marginTop: 8,
    letterSpacing: -0.0761719,
  },
  verifyButton: {
    backgroundColor: '#C62828',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3125,
  },
});

export default AdminPinScreen;