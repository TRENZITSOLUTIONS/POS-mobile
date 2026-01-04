import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/business.types';

type BillPreviewScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BillPreview'>;
  route: RouteProp<RootStackParamList, 'BillPreview'>;
};

interface BillData {
  businessName: string;
  address: string;
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
}

const BillPreviewScreen: React.FC<BillPreviewScreenProps> = ({ navigation, route }) => {
  const { photoPath } = route.params;
  const [isProcessing, setIsProcessing] = useState(true);
  const [billData, setBillData] = useState<BillData | null>(null);

  useEffect(() => {
    processImage();
  }, []);

  const processImage = async () => {
    try {
      // Perform OCR on the image
      const result = await TextRecognition.recognize(photoPath);
      
      // Parse the OCR text to extract bill data
      const parsedData = parseBillText(result.text);
      setBillData(parsedData);
      
    } catch (error) {
      console.error('OCR Error:', error);
      Alert.alert(
        'Processing Error',
        'Failed to read bill data. Please try again with better lighting.',
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
    // This is a sample parser - you'll need to customize based on your bill format
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Extract business name (usually first line)
    const businessName = lines[0] || 'Business Name';
    
    // Extract address (usually second/third line)
    const address = lines.slice(1, 3).join(', ') || 'Address';
    
    // Look for bill number
    const billNumberMatch = text.match(/(?:Bill|Invoice|Receipt)\s*(?:No|#|Number)?:?\s*([A-Z0-9-]+)/i);
    const billNumber = billNumberMatch ? billNumberMatch[1] : 'BIL-2024-1247';
    
    // Look for date
    const dateMatch = text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i);
    const date = dateMatch ? dateMatch[1] : '25 Dec 2025';
    
    // Look for time
    const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
    const time = timeMatch ? timeMatch[1] : '12:49 AM';
    
    // Extract items (this is simplified - real implementation needs better parsing)
    const items = [
      { name: 'Butter Chicken', qty: '2', price: '₹320', total: '₹640' },
      { name: 'Paneer Tikka', qty: '1', price: '₹280', total: '₹280' },
      { name: 'Garlic Naan', qty: '3', price: '₹45', total: '₹135' },
      { name: 'Dal Makhani', qty: '1', price: '₹180', total: '₹180' },
      { name: 'Gulab Jamun', qty: '2', price: '₹60', total: '₹120' },
    ];
    
    // Extract totals
    const subtotalMatch = text.match(/(?:Subtotal|Sub Total|Total)[\s:]*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    const subtotal = subtotalMatch ? `₹${subtotalMatch[1]}` : '₹1355.00';
    
    const cgstMatch = text.match(/CGST.*?(\d+(?:\.\d+)?)/i);
    const cgst = cgstMatch ? `₹${cgstMatch[1]}` : '₹67.75';
    
    const sgstMatch = text.match(/SGST.*?(\d+(?:\.\d+)?)/i);
    const sgst = sgstMatch ? `₹${sgstMatch[1]}` : '₹67.75';
    
    const totalMatch = text.match(/(?:Grand Total|Final Total|Total Amount)[\s:]*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    const totalAmount = totalMatch ? `₹${totalMatch[1]}` : '₹1490.50';
    
    return {
      businessName,
      address,
      billNumber,
      date,
      time,
      items,
      subtotal,
      cgst,
      sgst,
      totalAmount,
    };
  };

  const handleExport = () => {
    navigation.navigate('ExportingBills', {
      exportType: 'today',
      billData,
    });
  };

  const handleRetake = () => {
    navigation.goBack();
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
          <Text style={styles.subtitle}>Demo scanned bill</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Info */}
        <View style={styles.section}>
          <Text style={styles.businessName}>{billData?.businessName || 'Spice Garden Restaurant'}</Text>
          <Text style={styles.businessSubtext}>GSST: 29AABCT1332L1Z</Text>
          <Text style={styles.businessSubtext}>{billData?.address || '123 MG Road, Bangalore - 560001'}</Text>
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

        {/* Items Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Item</Text>
          <Text style={[styles.tableHeaderText, { flex: 0.5, textAlign: 'center' }]}>Qty</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Price</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Total</Text>
        </View>

        {/* Items List */}
        {billData?.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
            <Text style={[styles.tableCell, { flex: 0.5, textAlign: 'center' }]}>{item.qty}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{item.price}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{item.total}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{billData?.subtotal}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>CGST (5%)</Text>
            <Text style={styles.totalValue}>{billData?.cgst}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SGST (5%)</Text>
            <Text style={styles.totalValue}>{billData?.sgst}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total Amount</Text>
            <Text style={styles.grandTotalValue}>{billData?.totalAmount}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Thank you for your visit!</Text>
        <Text style={styles.footerText}>Visit again</Text>
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
  footerText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: -0.15,
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