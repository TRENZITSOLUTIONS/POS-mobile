import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';

type PrinterSetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PrinterSetup'>;
};

type PrinterModel = 'Epson TM-T82' | 'HP Receipt Printer' | 'Star Micronics TSP100' | 'Generic Bluetooth Printer';
type PaperSize = '58mm' | '80mm' | 'A4';
type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'disconnecting';

const PrinterSetupScreen: React.FC<PrinterSetupScreenProps> = ({ navigation }) => {
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterModel>('Epson TM-T82');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [selectedPaperSize, setSelectedPaperSize] = useState<PaperSize>('58mm');
  const [autoPrint, setAutoPrint] = useState(true);

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

  const printers: PrinterModel[] = [
    'Epson TM-T82',
    'HP Receipt Printer',
    'Star Micronics TSP100',
    'Generic Bluetooth Printer',
  ];

  const paperSizes: { value: PaperSize; label: string }[] = [
    { value: '58mm', label: '58 mm Receipt' },
    { value: '80mm', label: '80 mm Receipt' },
    { value: 'A4', label: 'A4 Sheet' },
  ];

  const handleApplyPrinter = () => {
    // Apply printer selection
    console.log('Applied printer:', selectedPrinter);
  };

  const handleToggleConnection = (value: boolean) => {
    if (value) {
      setConnectionStatus('connecting');
      setTimeout(() => {
        setConnectionStatus('connected');
      }, 2000);
    } else {
      setConnectionStatus('disconnecting');
      setTimeout(() => {
        setConnectionStatus('disconnected');
      }, 2000);
    }
  };

  const handleTestPrint = () => {
    navigation.navigate('TestPrintPreview')
  };

  const handleApplyPaperSize = () => {
    console.log('Applied paper size:', selectedPaperSize);
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'connecting':
        return 'Connecting.......';
      case 'disconnecting':
        return 'Disconnecting.....';
    }
  };

  const getConnectionColor = () => {
    return connectionStatus === 'connected' ? '#10B981' : '#999999';
  };

  const isConnectionActive = () => {
    return connectionStatus === 'connected';
  };

  const isConnectionLoading = () => {
    return connectionStatus === 'connecting' || connectionStatus === 'disconnecting';
  };

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

        <View style={styles.headerText}>
          <Text style={styles.title}>Printer Setup</Text>
          <Text style={styles.subtitle}>Configure printing options</Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Available Printers Card */}
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
          <Text style={styles.cardTitle}>Available Printers</Text>

          <View style={styles.radioGroup}>
            {printers.map((printer) => (
              <TouchableOpacity
                key={printer}
                style={styles.radioOption}
                onPress={() => setSelectedPrinter(printer)}
                activeOpacity={0.7}
              >
                <View style={styles.radioButton}>
                  {selectedPrinter === printer && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{printer}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyPrinter}
            activeOpacity={0.9}
          >
            <Text style={styles.applyButtonText}>Apply Printer</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Printer Connection Card */}
        <Animated.View
          style={[
            styles.card,
            styles.connectionCard,
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
          <Text style={styles.cardTitle}>Printer Connection</Text>

          <View style={styles.connectionRow}>
            <Text style={styles.connectionLabel}>Connection Status</Text>
            <Switch
              value={isConnectionActive()}
              onValueChange={handleToggleConnection}
              trackColor={{ false: '#E0E0E0', true: '#C62828' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E0E0E0"
              disabled={isConnectionLoading()}
              style={{ opacity: isConnectionLoading() ? 0.5 : 1 }}
            />
          </View>

          <View style={styles.statusRow}>
            {isConnectionLoading() && (
              <ActivityIndicator
                size="small"
                color={connectionStatus === 'connecting' ? '#C62828' : '#999999'}
                style={styles.statusSpinner}
              />
            )}
            <Text style={[styles.statusText, { color: getConnectionColor() }]}>
              {getConnectionText()}
            </Text>
          </View>
        </Animated.View>

        {/* Test Printer Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.cardTitle}>Test Printer</Text>
          <Text style={styles.cardDescription}>
            Print a sample bill to test the selected printer
          </Text>

          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestPrint}
            activeOpacity={0.9}
          >
            <Text style={styles.testButtonText}>Test Print</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Paper Size Selector Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.cardTitle}>Paper Size Selector</Text>

          <View style={styles.radioGroup}>
            {paperSizes.map((size) => (
              <TouchableOpacity
                key={size.value}
                style={styles.radioOption}
                onPress={() => setSelectedPaperSize(size.value)}
                activeOpacity={0.7}
              >
                <View style={styles.radioButton}>
                  {selectedPaperSize === size.value && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{size.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyPaperSize}
            activeOpacity={0.9}
          >
            <Text style={styles.applyButtonText}>Apply Paper Size</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Auto Print Card */}
        <Animated.View
          style={[
            styles.card,
            styles.autoPrintCard,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.autoPrintContent}>
            <View style={styles.autoPrintInfo}>
              <Text style={styles.cardTitle}>Auto Print</Text>
              <Text style={styles.cardDescription}>
                Automatically print bill after checkout
              </Text>
            </View>

            <Switch
              value={autoPrint}
              onValueChange={setAutoPrint}
              trackColor={{ false: '#E0E0E0', true: '#C62828' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E0E0E0"
            />
          </View>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: 24,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    gap: 14,
  },
  connectionCard: {
    gap: 6,
  },
  autoPrintCard: {
    paddingVertical: 21,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.44,
    lineHeight: 27,
  },
  cardDescription: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  radioGroup: {
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C62828',
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555555',
    letterSpacing: -0.15,
    lineHeight: 21,
  },
  applyButton: {
    backgroundColor: '#C62828',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectionLabel: {
    fontSize: 16,
    color: '#666666',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusSpinner: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.15,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#C62828',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  autoPrintContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  autoPrintInfo: {
    flex: 1,
    gap: 4,
  },
});

export default PrinterSetupScreen;