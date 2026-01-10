import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import Icon from 'react-native-vector-icons/Ionicons';
import { getBusinessSettings } from '../services/storage';

type BillFormatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BillFormat'>;
};

interface BillFormatOption {
  id: string;
  title: string;
  subtitle: string;
  route?: 'BusinessDetails' | 'InvoiceFormat' | 'InvoiceStructure' | 'LogoUpload' | 'FooterNote' | 'BillNumbering';
  multiline?: boolean;
  statusKey?: 'business_name' | 'business_logo_path' | 'bill_footer_note' | 'bill_prefix';
}

const BILL_FORMAT_OPTIONS: BillFormatOption[] = [
  {
    id: '1',
    title: 'Business Details',
    subtitle: 'Edit shop name, address, and contact details shown on the bill',
    route: 'BusinessDetails',
    multiline: true,
    statusKey: 'business_name',
  },
  {
    id: '2',
    title: 'Invoice Format',
    subtitle: 'Choose how the bill layout looks',
    route: 'InvoiceFormat',
  },
  {
    id: '3',
    title: 'Invoice Structure',
    subtitle: 'Configure bill content order and fields',
    route: 'InvoiceStructure',
  },
  {
    id: '4',
    title: 'Logo Upload',
    subtitle: 'Add or change logos used in app and bill',
    route: 'LogoUpload',
    multiline: true,
    statusKey: 'business_logo_path',
  },
  {
    id: '5',
    title: 'Footer Note',
    subtitle: 'Add a thank-you message on the bill',
    route: 'FooterNote',
    statusKey: 'bill_footer_note',
  },
  {
    id: '6',
    title: 'Bill Numbering',
    subtitle: 'Configure invoice number format',
    route: 'BillNumbering',
    statusKey: 'bill_prefix',
  },
];

const BillFormatScreen: React.FC<BillFormatScreenProps> = ({ navigation }) => {
  const [configStatus, setConfigStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadConfigStatus();
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

  const loadConfigStatus = async () => {
    try {
      const settings = await getBusinessSettings();
      
      const status: Record<string, boolean> = {};
      
      // Check which settings are configured
      if (settings) {
        status['business_name'] = !!settings.business_name;
        status['business_logo_path'] = !!settings.business_logo_path;
        status['bill_footer_note'] = !!settings.bill_footer_note;
        status['bill_prefix'] = !!settings.bill_prefix;
      }
      
      setConfigStatus(status);
    } catch (error) {
      console.error('Failed to load config status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionPress = (route?: BillFormatOption['route']) => {
    if (route) {
      // Handle each route explicitly
      switch (route) {
        case 'BusinessDetails':
          navigation.navigate('BusinessDetails');
          break;
        case 'InvoiceFormat':
          navigation.navigate('InvoiceFormat');
          break;
        case 'InvoiceStructure':
          navigation.navigate('InvoiceStructure');
          break;
        case 'LogoUpload':
          navigation.navigate('LogoUpload');
          break;
        case 'FooterNote':
          navigation.navigate('FooterNote');
          break;
        case 'BillNumbering':
          navigation.navigate('BillNumbering');
          break;
      }
    }
  };

  const isConfigured = (statusKey?: string): boolean => {
    if (!statusKey) return false;
    return configStatus[statusKey] || false;
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>Bill Format</Text>
          <Text style={styles.subtitle}>Configure bill layout and appearance</Text>
        </View>
      </View>

      {/* Options List */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {BILL_FORMAT_OPTIONS.map((option, index) => (
            <Animated.View
              key={option.id}
              style={[
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20 * (index + 1), 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  option.multiline && styles.optionCardMultiline,
                ]}
                onPress={() => handleOptionPress(option.route)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionTextContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      {option.statusKey && isConfigured(option.statusKey) && (
                        <View style={styles.configuredBadge}>
                          <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={styles.optionSubtitle}
                      numberOfLines={option.multiline ? 2 : 1}
                    >
                      {option.subtitle}
                    </Text>
                  </View>

                  <Icon name="chevron-forward" size={20} color="#999999" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '600',
    color: '#C62828',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
  },
  headerText: {},
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
    letterSpacing: 0.38,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 21,
  },
  optionCard: {
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
    minHeight: 93,
    justifyContent: 'center',
  },
  optionCardMultiline: {
    minHeight: 117,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.44,
    lineHeight: 27,
  },
  configuredBadge: {
    width: 16,
    height: 16,
  },
  optionSubtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
});

export default BillFormatScreen;