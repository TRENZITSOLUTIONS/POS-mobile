import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  Clipboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import QRCode from 'react-native-qrcode-svg';
import { getUserData } from '../services/auth';
import { getBusinessSettings } from '../services/storage';

type AddPeopleScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddPeople'>;
};

type CopyState = 'idle' | 'copying' | 'copied';

const AddPeopleScreen: React.FC<AddPeopleScreenProps> = ({ navigation }) => {
  const [joinCode, setJoinCode] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadBusinessData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
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
  }, [isLoading]);

  const loadBusinessData = async () => {
    try {
      // Get user data (contains vendor_id)
      const userData = await getUserData();
      
      if (!userData) {
        Alert.alert('Error', 'Please login to continue');
        navigation.goBack();
        return;
      }

      // Get business settings
      const settings = await getBusinessSettings();
      
      // Use vendor_id as join code
      const code = userData.vendor_id || userData.user_id || 'DEMO123';
      setJoinCode(code);
      
      // Get business name from settings or userData
      const name = settings?.business_name || userData.business_name || 'My Business';
      setBusinessName(name);

    } catch (error) {
      console.error('Failed to load business data:', error);
      Alert.alert('Error', 'Failed to load business information');
      // Set fallback values
      setJoinCode('DEMO123');
      setBusinessName('My Business');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    setCopyState('copying');
    
    // Copy to clipboard
    Clipboard.setString(joinCode);
    
    // Show copying state briefly
    setTimeout(() => {
      setCopyState('copied');
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setCopyState('idle');
      }, 2000);
    }, 500);
  };

  const getButtonText = () => {
    switch (copyState) {
      case 'copying':
        return 'Copying...';
      case 'copied':
        return 'Copied';
      default:
        return 'Copy Code';
    }
  };

  const getButtonStyle = () => {
    switch (copyState) {
      case 'copied':
        return styles.copyButtonCopied;
      default:
        return styles.copyButton;
    }
  };

  const getButtonTextStyle = () => {
    switch (copyState) {
      case 'copied':
        return styles.copyButtonTextCopied;
      default:
        return styles.copyButtonText;
    }
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
          <Text style={styles.title}>Add People</Text>
          <Text style={styles.subtitle}>Invite staff to join {businessName}</Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* QR Code Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.cardTitle}>Invite via QR Code</Text>

          <View style={styles.qrContainer}>
            <View style={styles.qrCodeBox}>
              <QRCode
                value={`business_invite_${joinCode}`}
                size={240}
                backgroundColor="#FFFFFF"
                color="#000000"
              />
            </View>

            <Text style={styles.qrDescription}>Scan this QR to join business</Text>
            <Text style={styles.qrSubtext}>QR code refreshes automatically</Text>
          </View>
        </Animated.View>

        {/* Join Code Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.cardTitle}>Join Code</Text>

          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{joinCode}</Text>
            <Text style={styles.codeDescription}>Enter this code to join</Text>
          </View>

          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleCopyCode}
            activeOpacity={0.9}
            disabled={copyState !== 'idle'}
          >
            <Text style={getButtonTextStyle()}>{getButtonText()}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: -0.26,
    lineHeight: 33,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 32,
    gap: 34,
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
  qrContainer: {
    alignItems: 'center',
    gap: 12,
  },
  qrCodeBox: {
    width: 256,
    height: 256,
    backgroundColor: '#FFFFFF',
    borderWidth: 3.62,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  qrPlaceholder: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPattern: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  qrCorner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderWidth: 6,
    borderColor: '#000000',
  },
  qrCornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  qrCornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  qrCornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  qrDots: {
    position: 'absolute',
    top: '35%',
    left: '35%',
    gap: 8,
  },
  qrDotRow: {
    flexDirection: 'row',
    gap: 8,
  },
  qrDot: {
    width: 10,
    height: 10,
    backgroundColor: '#000000',
  },
  qrDescription: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  qrSubtext: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  codeContainer: {
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeText: {
    fontSize: 16,
    color: '#333333',
    letterSpacing: 1.29,
    lineHeight: 24,
    fontWeight: '400',
  },
  codeDescription: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  copyButton: {
    height: 48,
    borderWidth: 1.81,
    borderColor: '#C62828',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  copyButtonCopied: {
    height: 48,
    borderWidth: 1.81,
    borderColor: '#10B981',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonTextCopied: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
});

export default AddPeopleScreen;