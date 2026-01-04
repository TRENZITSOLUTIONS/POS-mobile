import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';

type ExportBillsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ExportBills'>;
};

type ExportType = 'all' | 'dateRange' | 'today';

const ExportBillsScreen: React.FC<ExportBillsScreenProps> = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState<ExportType>('all');
  const [customDays, setCustomDays] = useState('');
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

  const handleExport = () => {
    if (selectedType === 'today') {
      // Open camera scanner for Today's Bills
      navigation.navigate('BillScanner');
    } else {
      // Start export process
      navigation.navigate('ExportingBills', {
        exportType: selectedType,
        customDays: selectedType === 'dateRange' ? customDays : undefined,
      });
    }
  };

  const isExportEnabled = 
    selectedType === 'all' || 
    selectedType === 'today' || 
    (selectedType === 'dateRange' && customDays !== '');

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

        <Text style={styles.title}>Export Bills</Text>
        <Text style={styles.subtitle}>Select bills to export</Text>
      </Animated.View>

      <View style={styles.content}>
        {/* Export Type Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export Type</Text>

          <View style={styles.optionsContainer}>
            {/* All Bills Option */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => setSelectedType('all')}
              activeOpacity={0.7}
            >
              <View style={styles.radioContainer}>
                <View style={[styles.radioOuter, selectedType === 'all' && styles.radioOuterSelected]}>
                  {selectedType === 'all' && <View style={styles.radioInner} />}
                </View>
              </View>

              <View style={styles.optionTextContainer}>
                <Text style={styles.optionLabel}>All Bills</Text>
                <Text style={styles.optionDescription}>Export complete bill history</Text>
              </View>
            </TouchableOpacity>

            {/* Date Range Option */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => setSelectedType('dateRange')}
              activeOpacity={0.7}
            >
              <View style={styles.radioContainer}>
                <View style={[styles.radioOuter, selectedType === 'dateRange' && styles.radioOuterSelected]}>
                  {selectedType === 'dateRange' && <View style={styles.radioInner} />}
                </View>
              </View>

              <View style={styles.optionTextContainer}>
                <Text style={styles.optionLabel}>Date Range</Text>
                <Text style={styles.optionDescription}>Select custom date range</Text>
              </View>
            </TouchableOpacity>

            {/* Custom Days Input (shows when Date Range selected) */}
            {selectedType === 'dateRange' && (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.numberInput}
                  value={customDays}
                  onChangeText={setCustomDays}
                  placeholder="2"
                  placeholderTextColor="rgba(51, 51, 51, 0.5)"
                  keyboardType="numeric"
                />
                {customDays && (
                  <Text style={styles.helperText}>
                    Showing data for last {customDays} days
                  </Text>
                )}
              </View>
            )}

            {/* Today's Bills Option (with Camera) */}
            <TouchableOpacity
              style={styles.option}
              onPress={() => setSelectedType('today')}
              activeOpacity={0.7}
            >
              <View style={styles.radioContainer}>
                <View style={[styles.radioOuter, selectedType === 'today' && styles.radioOuterSelected]}>
                  {selectedType === 'today' && <View style={styles.radioInner} />}
                </View>
              </View>

              <View style={styles.optionTextContainer}>
                <View style={styles.todayLabelRow}>
                  <Text style={styles.optionLabel}>Today's Bills</Text>
                  {selectedType === 'today' && (
                    <View style={styles.cameraIcon}>
                      <View style={styles.cameraBody} />
                      <View style={styles.cameraLens} />
                    </View>
                  )}
                </View>
                <Text style={styles.optionDescription}>Photograph bill to export</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[
            styles.exportButton,
            !isExportEnabled && styles.exportButtonDisabled,
          ]}
          onPress={handleExport}
          disabled={!isExportEnabled}
          activeOpacity={0.9}
        >
          <View style={styles.exportIcon}>
            <View style={styles.exportIconTop} />
            <View style={styles.exportIconMiddle} />
          </View>
          <Text style={styles.exportButtonText}>Export Bills</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 20,
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
    letterSpacing: -0.45,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 24,
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
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 0,
  },
  radioContainer: {
    marginRight: 0,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#000000',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C62828',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 24,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    letterSpacing: -0.15,
    lineHeight: 21,
  },
  optionDescription: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  todayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cameraIcon: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  cameraBody: {
    position: 'absolute',
    top: 3,
    left: 1,
    right: 1,
    bottom: 3,
    borderWidth: 1.33,
    borderColor: '#C62828',
  },
  cameraLens: {
    position: 'absolute',
    top: 7,
    left: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 1.33,
    borderColor: '#C62828',
  },
  customInputContainer: {
    marginLeft: 44,
    marginTop: -8,
    gap: 8,
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
    width: 212,
  },
  helperText: {
    fontSize: 15,
    color: '#999999',
    letterSpacing: -0.31,
  },
  exportButton: {
    height: 52,
    backgroundColor: '#C62828',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  exportIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  exportIconTop: {
    position: 'absolute',
    top: 2,
    left: 3,
    right: 3,
    height: 6,
    borderWidth: 1.67,
    borderColor: '#FFFFFF',
    borderBottomWidth: 0,
  },
  exportIconMiddle: {
    position: 'absolute',
    bottom: 2,
    left: 8,
    width: 4,
    height: 8,
    borderLeftWidth: 1.67,
    borderRightWidth: 1.67,
    borderColor: '#FFFFFF',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
  },
});

export default ExportBillsScreen;