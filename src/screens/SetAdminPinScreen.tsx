/**
 * SetAdminPinScreen.tsx
 * 
 * This screen handles setting up a LOCAL admin PIN for admin feature access.
 * This is NOT related to API authentication - it's a local security layer.
 * 
 * The admin PIN is stored locally (hashed) in business settings.
 * This is separate from the vendor account password used for API login.
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
import { saveBusinessSettings } from '../services/storage';
import CryptoJS from 'crypto-js';

type SetAdminPinScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SetAdminPin'>;
};

const SetAdminPinScreen: React.FC<SetAdminPinScreenProps> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const hashPin = (pinToHash: string): string => {
    return CryptoJS.SHA256(pinToHash).toString();
  };

  const handleContinue = () => {
    if (step === 'enter') {
      // Validate PIN
      if (pin.length !== 4) {
        setError('PIN must be 4 digits');
        shakeAnimation();
        return;
      }

      if (!/^\d{4}$/.test(pin)) {
        setError('PIN must contain only numbers');
        shakeAnimation();
        return;
      }

      // Move to confirm step
      setStep('confirm');
      setError('');
    } else {
      // Confirm step
      if (confirmPin !== pin) {
        setError('PINs do not match');
        shakeAnimation();
        setConfirmPin('');
        return;
      }

      // Save PIN
      savePin();
    }
  };

  const savePin = async () => {
    try {
      setIsSaving(true);
      
      const hashedPin = hashPin(pin);
      const timestamp = new Date().toISOString();
      
      // Save PIN and timestamp to business settings
      await saveBusinessSettings({
        admin_pin: hashedPin,
        admin_pin_set_date: timestamp,
      });

      Alert.alert(
        'Success',
        'Admin PIN has been set successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('AdminDashboard'),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save PIN:', error);
      Alert.alert('Error', 'Failed to save PIN. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('enter');
      setConfirmPin('');
      setError('');
    } else {
      navigation.goBack();
    }
  };

  const currentPin = step === 'enter' ? pin : confirmPin;
  const setCurrentPin = step === 'enter' ? setPin : setConfirmPin;

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
          disabled={isSaving}
        >
          <Text style={[styles.backText, isSaving && styles.disabledText]}>← Back</Text>
        </TouchableOpacity>

        {/* Lock Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.lockCircle}>
            <LockIcon width={40} height={40} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {step === 'enter' ? 'Set Admin PIN' : 'Confirm Admin PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'enter' 
            ? 'Create a 4-digit PIN to secure admin access' 
            : 'Re-enter your PIN to confirm'}
        </Text>

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
            <Text style={styles.label}>
              {step === 'enter' ? 'Enter PIN' : 'Confirm PIN'}
            </Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor="#999999"
              value={currentPin}
              onChangeText={(text) => {
                setCurrentPin(text);
                setError('');
              }}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              editable={!isSaving}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              isSaving && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.9}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>
                {step === 'enter' ? 'Continue' : 'Set PIN'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.infoText}>
            {step === 'enter' 
              ? 'Choose a PIN you can remember easily' 
              : 'Make sure both PINs match'}
          </Text>
        </Animated.View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityNoteText}>
            🔒 Your PIN is encrypted and stored securely
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
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
  disabledText: {
    opacity: 0.5,
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
    paddingHorizontal: 20,
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
    marginBottom: 24,
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
  continueButton: {
    backgroundColor: '#C62828',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3125,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    letterSpacing: -0.0761719,
  },
  securityNote: {
    marginTop: 24,
    paddingHorizontal: 32,
  },
  securityNoteText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SetAdminPinScreen;