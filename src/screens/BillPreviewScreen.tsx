import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/business.types';
import { getBusinessSettings } from '../services/storage';

type BillPreviewScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BillPreview'>;
  route: RouteProp<RootStackParamList, 'BillPreview'>;
};

interface BillData {
  businessName: string;
  address: string;
  gstin?: string;
  billNumber: string;
  date: string;
  time: string;
  items: Array<{
    name: string;
    qty: string;
    price: string;
    total: string;
  }>;
  subtotal: string;
  cgst: string;
  sgst: string;
  totalAmount: string;
  rawText: string; // Store raw OCR text for debugging
}

const BillPreviewScreen: React.FC<BillPreviewScreenProps> = ({ navigation, route }) => {
  const { photoPath } = route.params;
  const [isProcessing, setIsProcessing] = useState(true);
  const [billData, setBillData] = useState<BillData | null>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);

  useEffect(() => {
    loadBusinessInfo();
    processImage();
  }, []);

  const loadBusinessInfo = async () => {
    try {
      const settings = await getBusinessSettings();
      setBusinessInfo(settings);
    } catch (error) {
      console.error('Failed to load business info:', error);
    }
  };

  const processImage = async () => {
    try {
      // Perform OCR on the image
      const result = await TextRecognition.recognize(photoPath);
      
      console.log('OCR Raw Text:', result.text);
      
      // Parse the OCR text to extract bill data
      const parsedData = parseBillText(result.text);
      setBillData(parsedData);
      
    } catch (error) {
      console.error('OCR Error:', error);
      Alert.alert(
        'Processing Error',
        'Failed to read bill data. Please try again with better lighting and ensure the bill is clearly visible.',
        [
          { text: 'Retry', onPress: () => navigation.goBack() },
          { text: 'Cancel', onPress: () => navigation.navigate('ExportBills') },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const parseBillText = (text: string): BillData => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Extract business name (usually first 1-2 lines)
    const businessName = extractBusinessName(lines);
    
    // Extract address
    const address = extractAddress(lines);
    
    // Extract GSTIN
    const gstin = extractGSTIN(text);
    
    // Extract bill number
    const billNumber = extractBillNumber(text);
    
    // Extract date
    const date = extractDate(text);
    
    // Extract time
    const time = extractTime(text);
    
    // Extract items (most complex part)
    const items = extractItems(text);
    
    // Extract financial totals
    const subtotal = extractAmount(text, ['subtotal', 'sub total', 'sub-total']);
    const cgst = extractAmount(text, ['cgst']);
    const sgst = extractAmount(text, ['sgst']);
    const totalAmount = extractAmount(text, ['total amount', 'grand total', 'final total', 'net amount']);
    
    return {
      businessName,
      address,
      gstin,
      billNumber,
      date,
      time,
      items,
      subtotal,
      cgst,
      sgst,
      totalAmount,
      rawText: text,
    };
  };

  const extractBusinessName = (lines: string[]): string => {
    // Business name is usually the first non-empty line
    // Skip lines that are too short or numbers
    for (const line of lines.slice(0, 5)) {
      const cleaned = line.trim();
      if (cleaned.length > 3 && !/^\d+$/.test(cleaned)) {
        return cleaned;
      }
    }
    return 'Business Name Not Found';
  };

  const extractAddress = (lines: string[]): string => {
    // Address usually comes after business name
    // Look for lines with common address keywords
    const addressLines = lines.filter(line => {
      const lower = line.toLowerCase();
      return lower.includes('road') || 
             lower.includes('street') || 
             lower.includes('nagar') ||
             lower.includes('colony') ||
             /\d{6}/.test(line); // Pincode
    });
    
    return addressLines.slice(0, 2).join(', ') || 'Address Not Found';
  };

  const extractGSTIN = (text: string): string | undefined => {
    const gstinMatch = text.match(/GSTIN?[\s:]*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[A-Z0-9]{1})/i);
    return gstinMatch ? gstinMatch[1] : undefined;
  };

  const extractBillNumber = (text: string): string => {
    // Look for various bill number patterns
    const patterns = [
      /(?:Bill|Invoice|Receipt)\s*(?:No|#|Number)?[\s:]*([A-Z0-9-]+)/i,
      /(?:No|#)[\s:]*([A-Z0-9-]{5,})/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return 'Not Found';
  };

  const extractDate = (text: string): string => {
    // Look for date patterns
    const patterns = [
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
      /(\d{2,4}[-\/]\d{1,2}[-\/]\d{1,2})/,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Return current date if not found
    const today = new Date();
    return today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const extractTime = (text: string): string => {
    const timeMatch = text.match(/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i);
    if (timeMatch && timeMatch[1]) {
      return timeMatch[1];
    }
    
    // Return current time if not found
    const now = new Date();
    return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const extractItems = (text: string): Array<{ name: string; qty: string; price: string; total: string }> => {
    const items: Array<{ name: string; qty: string; price: string; total: string }> = [];
    const lines = text.split('\n');
    
    // Look for lines that might be items
    // Pattern: Name + Quantity + Price + Total (with various separators)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip headers, totals, and empty lines
      if (!line || 
          line.toLowerCase().includes('item') ||
          line.toLowerCase().includes('qty') ||
          line.toLowerCase().includes('subtotal') ||
          line.toLowerCase().includes('cgst') ||
          line.toLowerCase().includes('sgst') ||
          line.toLowerCase().includes('total')) {
        continue;
      }
      
      // Try to match item pattern: Name Qty Price Total
      // Example: "Butter Chicken 2 320 640"
      const itemMatch = line.match(/^(.+?)\s+(\d+)\s+(?:₹|Rs\.?)?\s*(\d+(?:\.\d+)?)\s+(?:₹|Rs\.?)?\s*(\d+(?:\.\d+)?)$/);
      
      if (itemMatch) {
        items.push({
          name: itemMatch[1].trim(),
          qty: itemMatch[2],
          price: `₹${itemMatch[3]}`,
          total: `₹${itemMatch[4]}`,
        });
      }
    }
    
    // If no items found, return empty array (no hardcoded fallback)
    return items;
  };

  const extractAmount = (text: string, keywords: string[]): string => {
    for (const keyword of keywords) {
      const pattern = new RegExp(`${keyword}[\\s:]*(?:₹|Rs\\.?)?\\s*(\\d+(?:,\\d+)*(?:\\.\\d+)?)`, 'i');
      const match = text.match(pattern);
      if (match && match[1]) {
        return `₹${match[1].replace(',', '')}`;
      }
    }
    
    return '₹0.00';
  };

  const handleExport = () => {
    if (!billData) {
      Alert.alert('Error', 'No bill data to export');
      return;
    }

    // Check if any critical data is missing
    if (billData.items.length === 0) {
      Alert.alert(
        'Incomplete Data',
        'No items were detected in the bill. Would you like to continue anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => navigation.navigate('ExportingBills', {
              exportType: 'today',
              billData,
            })
          },
        ]
      );
      return;
    }

    navigation.navigate('ExportingBills', {
      exportType: 'today',
      billData,
    });
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  const handleViewRawText = () => {
    if (billData) {
      Alert.alert('Raw OCR Text', billData.rawText, [{ text: 'OK' }]);
    }
  };

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C62828" />
          <Text style={styles.loadingText}>Processing bill...</Text>
          <Text style={styles.loadingSubtext}>Extracting data from image</Text>
        </View>
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
          onPress={handleRetake}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Bill Preview</Text>
          <Text style={styles.subtitle}>Scanned bill data</Text>
        </View>

        <TouchableOpacity
          onPress={handleViewRawText}
          activeOpacity={0.7}
          style={styles.debugButton}
        >
          <Text style={styles.debugButtonText}>View Raw</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Info */}
        <View style={styles.section}>
          <Text style={styles.businessName}>{billData?.businessName || 'Business Name Not Detected'}</Text>
          {billData?.gstin && (
            <Text style={styles.businessSubtext}>GSTIN: {billData.gstin}</Text>
          )}
          <Text style={styles.businessSubtext}>{billData?.address || 'Address Not Detected'}</Text>
        </View>

        {/* Bill Details */}
        <View style={styles.billInfoRow}>
          <View style={styles.billInfoColumn}>
            <Text style={styles.billInfoLabel}>Bill No.</Text>
            <Text style={styles.billInfoValue}>{billData?.billNumber}</Text>
          </View>
          <View style={styles.billInfoColumn}>
            <Text style={styles.billInfoLabel}>Date & Time</Text>
            <Text style={styles.billInfoValue}>{billData?.date}</Text>
            <Text style={styles.billInfoValue}>{billData?.time}</Text>
          </View>
        </View>

        {/* Items Section */}
        {billData && billData.items.length > 0 ? (
          <>
            {/* Items Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Item</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.5, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Price</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Total</Text>
            </View>

            {/* Items List */}
            {billData.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={2}>{item.name}</Text>
                <Text style={[styles.tableCell, { flex: 0.5, textAlign: 'center' }]}>{item.qty}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{item.price}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{item.total}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.noItemsContainer}>
            <Text style={styles.noItemsText}>No items detected</Text>
            <Text style={styles.noItemsSubtext}>The OCR couldn't detect individual items from the bill</Text>
          </View>
        )}

        {/* Totals */}
        <View style={styles.totalsSection}>
          {billData && billData.subtotal !== '₹0.00' && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{billData.subtotal}</Text>
            </View>
          )}
          {billData && billData.cgst !== '₹0.00' && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>CGST</Text>
              <Text style={styles.totalValue}>{billData.cgst}</Text>
            </View>
          )}
          {billData && billData.sgst !== '₹0.00' && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>SGST</Text>
              <Text style={styles.totalValue}>{billData.sgst}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total Amount</Text>
            <Text style={styles.grandTotalValue}>{billData?.totalAmount || '₹0.00'}</Text>
          </View>
        </View>

        {/* Warning if data is incomplete */}
        {billData && billData.items.length === 0 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>⚠️ Incomplete Data Detected</Text>
            <Text style={styles.warningSubtext}>
              Some information couldn't be extracted. You can still export, but please review the data.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={handleRetake}
          activeOpacity={0.9}
        >
          <Text style={styles.retakeButtonText}>Retake Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExport}
          activeOpacity={0.9}
        >
          <Text style={styles.exportButtonText}>Export Bill</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.44,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    fontWeight: '600',
    color: '#C62828',
    letterSpacing: -0.45,
  },
  headerTitleContainer: {
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
    fontSize: 14,
    color: '#999999',
    letterSpacing: -0.15,
  },
  debugButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  debugButtonText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 16,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: -0.31,
    marginBottom: 4,
  },
  businessSubtext: {
    fontSize: 14,
    color: '#666666',
    letterSpacing: -0.15,
    lineHeight: 20,
  },
  billInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  billInfoColumn: {
    flex: 1,
  },
  billInfoLabel: {
    fontSize: 12,
    color: '#999999',
    letterSpacing: -0.15,
    marginBottom: 4,
  },
  billInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    letterSpacing: -0.15,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: -0.15,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  tableCell: {
    fontSize: 14,
    color: '#333333',
    letterSpacing: -0.15,
  },
  noItemsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginVertical: 16,
  },
  noItemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  noItemsSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  totalsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666666',
    letterSpacing: -0.15,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    letterSpacing: -0.15,
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#C62828',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: -0.31,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C62828',
    letterSpacing: -0.31,
  },
  warningCard: {
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#FFB74D',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 8,
  },
  warningSubtext: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  retakeButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.31,
  },
  exportButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#C62828',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
  },
});

export default BillPreviewScreen;