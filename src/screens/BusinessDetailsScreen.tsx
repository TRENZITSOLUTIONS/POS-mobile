import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import { getBusinessSettings, saveBusinessSettings } from '../services/storage';
import { getUserData } from '../services/auth';

type BusinessDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BusinessDetails'>;
};

interface BusinessData {
  shopName: string;
  address: string;
  phoneNumber: string;
  emailId: string;
}

const BusinessDetailsScreen: React.FC<BusinessDetailsScreenProps> = ({ navigation }) => {
  const [businessData, setBusinessData] = useState<BusinessData>({
    shopName: '',
    address: '',
    phoneNumber: '',
    emailId: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

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
      // First try to get from local business settings
      const settings = await getBusinessSettings();
      
      // Then get vendor data from auth (login response)
      const userData = await getUserData();
      
      setBusinessData({
        shopName: settings?.business_name || userData?.business_name || '',
        address: settings?.business_address || '',
        phoneNumber: settings?.business_phone || '',
        emailId: settings?.business_email || '',
      });
    } catch (error) {
      console.error('Failed to load business data:', error);
      Alert.alert('Error', 'Failed to load business details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = () => {
    // Validate required fields
    if (!businessData.shopName.trim()) {
      Alert.alert('Missing Information', 'Please enter your shop name.');
      return;
    }

    if (!businessData.address.trim()) {
      Alert.alert('Missing Information', 'Please enter your business address.');
      return;
    }

    if (!businessData.phoneNumber.trim()) {
      Alert.alert('Missing Information', 'Please enter your phone number.');
      return;
    }

    // Validate phone number (basic check)
    if (businessData.phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
      return;
    }

    // Validate email if provided
    if (businessData.emailId.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(businessData.emailId)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
    }

    setConfirmModalVisible(true);
  };

  const handleConfirmApply = async () => {
    setConfirmModalVisible(false);
    setIsSaving(true);

    try {
      // Save to database
      await saveBusinessSettings({
        business_name: businessData.shopName.trim(),
        business_address: businessData.address.trim(),
        business_phone: businessData.phoneNumber.trim(),
        business_email: businessData.emailId.trim(),
      });

      Alert.alert(
        'Success',
        'Business details have been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save business data:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmModalVisible(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={styles.loadingText}>Loading business details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
            <Text style={styles.title}>Business Details</Text>
            <Text style={styles.subtitle}>Edit details shown on the bill</Text>
          </View>
        </Animated.View>

        {/* Form */}
        <Animated.View
          style={[
            styles.form,
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
          {/* Shop Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Shop Name</Text>
            <TextInput
              style={styles.input}
              value={businessData.shopName}
              onChangeText={(text) =>
                setBusinessData({ ...businessData, shopName: text })
              }
              placeholder="Enter shop name"
              placeholderTextColor="#999999"
              editable={!isSaving}
            />
          </View>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={businessData.address}
              onChangeText={(text) =>
                setBusinessData({ ...businessData, address: text })
              }
              placeholder="Enter address"
              placeholderTextColor="#999999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isSaving}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={businessData.phoneNumber}
              onChangeText={(text) =>
                setBusinessData({ ...businessData, phoneNumber: text })
              }
              placeholder="Enter phone number"
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
              maxLength={15}
              editable={!isSaving}
            />
          </View>

          {/* Email ID */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Email ID</Text>
              <Text style={styles.optional}>(Optional)</Text>
            </View>
            <TextInput
              style={styles.input}
              value={businessData.emailId}
              onChangeText={(text) =>
                setBusinessData({ ...businessData, emailId: text })
              }
              placeholder="Enter email address"
              placeholderTextColor="#999999"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSaving}
            />
          </View>
        </Animated.View>

        {/* Apply Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.applyButton, isSaving && styles.applyButtonDisabled]}
            onPress={handleApplyChanges}
            activeOpacity={0.9}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.applyButtonText}>Apply Changes</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelConfirm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Business Details</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to save these changes? These details will appear on all your bills.
            </Text>

            {/* Preview */}
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>{businessData.shopName}</Text>
              <Text style={styles.previewText}>{businessData.address}</Text>
              <Text style={styles.previewText}>{businessData.phoneNumber}</Text>
              {businessData.emailId ? (
                <Text style={styles.previewText}>{businessData.emailId}</Text>
              ) : null}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmApply}
                activeOpacity={0.9}
              >
                <Text style={styles.confirmButtonText}>YES, APPLY</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 48,
    gap: 24,
  },
  header: {
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
  form: {
    gap: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    letterSpacing: -0.15,
    lineHeight: 21,
  },
  optional: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
    letterSpacing: -0.15,
    lineHeight: 20,
  },
  input: {
    height: 48,
    borderWidth: 1.81,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.31,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
  applyButton: {
    backgroundColor: '#C62828',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 353,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    letterSpacing: -0.26,
    lineHeight: 33,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  previewCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 16,
    gap: 4,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  modalButtons: {
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#C62828',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  cancelButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
});

export default BusinessDetailsScreen;