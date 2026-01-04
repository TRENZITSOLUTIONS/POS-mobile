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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LockIcon from '../assets/icons/LockIcon.svg';
import { RootStackParamList } from '../types/business.types';

type AdminPinScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminPin'>;
};

const CORRECT_PIN = '1234'; // Demo PIN

const AdminPinScreen: React.FC<AdminPinScreenProps> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

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

  const handleVerify = () => {
    if (pin === CORRECT_PIN) {
      navigation.replace('AdminDashboard');
    } else {
      // Shake animation for error
      setError(true);
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
      ]).start(() => {
        setTimeout(() => {
          setError(false);
        }, 1000);
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

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
            />
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerify}
            activeOpacity={0.9}
          >
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>

          {/* Demo PIN */}
          <Text style={styles.demoText}>Demo PIN: 1234</Text>
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
  lockBody: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockShackle: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: '#D4AF37',
    borderBottomWidth: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: 'transparent',
  },
  lockKeyhole: {
    position: 'absolute',
    top: 12,
    width: 6,
    height: 10,
    backgroundColor: '#C62828',
    borderRadius: 3,
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
    borderColor: '#CA9A9A',
  },
  verifyButton: {
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
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3125,
  },
  demoText: {
    fontSize: 13,
    fontWeight: '300',
    color: '#666666',
    textAlign: 'center',
    letterSpacing: -0.0761719,
  },
});

export default AdminPinScreen;