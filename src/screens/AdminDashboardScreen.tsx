import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';

type AdminDashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;
};

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const businessCardAnim = useRef(new Animated.Value(0)).current;
  const settingsAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const card4Anim = useRef(new Animated.Value(0)).current;
  const card5Anim = useRef(new Animated.Value(0)).current;
  const card6Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(businessCardAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(settingsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(card1Anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(card2Anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(card3Anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(card4Anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(card5Anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(card6Anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleItemManagement = () => {
    navigation.navigate('ItemManagement');
  };

  const handleBillFormat = () => {
    navigation.navigate('BillFormat');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Admin Settings</Text>
        </Animated.View>

        {/* Business Information Card */}
        <Animated.View
          style={[
            styles.businessCard,
            {
              opacity: businessCardAnim,
              transform: [
                {
                  scale: businessCardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Business Information</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Business Name</Text>
            <Text style={styles.infoValue}>Saravaan's Tiffen Centre</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>123, Main Street, Tamil Nadu</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>1234567890</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email ID</Text>
            <Text style={styles.infoValue}>business@example.com</Text>
          </View>
        </Animated.View>

        {/* Settings Section */}
        <Animated.View
          style={[
            styles.settingsSection,
            {
              opacity: settingsAnim,
              transform: [
                {
                  translateY: settingsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.settingsTitle}>Settings</Text>
        </Animated.View>

        {/* 1. Item Management */}
        <Animated.View
          style={[
            styles.settingCard,
            {
              opacity: card1Anim,
              transform: [
                {
                  translateX: card1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cardContent}
            onPress={handleItemManagement}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFF5F5' }]}>
              <Text style={styles.iconText}>📦</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Item Management</Text>
              <Text style={styles.cardSubtitle}>Add, edit, or remove products</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 2. GST Settings */}
        <Animated.View
          style={[
            styles.settingCard,
            {
              opacity: card2Anim,
              transform: [
                {
                  translateX: card2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cardContent}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('GSTSettings')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F1F8E9' }]}>
              <Text style={styles.iconText}>📊</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>GST Settings</Text>
              <Text style={styles.cardSubtitle}>Configure tax rates and type</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 3. Bill Format */}
        <Animated.View
          style={[
            styles.settingCard,
            {
              opacity: card3Anim,
              transform: [
                {
                  translateX: card3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cardContent}
            activeOpacity={0.7}
            onPress={handleBillFormat}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F5F5F5' }]}>
              <Text style={styles.iconText}>📄</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Bill Format</Text>
              <Text style={styles.cardSubtitle}>Customize bill layout</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 4. Printer Setup */}
        <Animated.View
          style={[
            styles.settingCard,
            {
              opacity: card4Anim,
              transform: [
                {
                  translateX: card4Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cardContent}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PrinterSetup')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#EEEEEE' }]}>
              <Text style={styles.iconText}>🖨️</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Printer Setup</Text>
              <Text style={styles.cardSubtitle}>Configure printing options</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 5. Add People */}
        <Animated.View
          style={[
            styles.settingCard,
            {
              opacity: card5Anim,
              transform: [
                {
                  translateX: card5Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cardContent}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddPeople')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.iconText}>👥</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Add People</Text>
              <Text style={styles.cardSubtitle}>Manage users and permissions</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 6. Backup & Data */}
        <Animated.View
          style={[
            styles.settingCard,
            {
              opacity: card6Anim,
              transform: [
                {
                  translateX: card6Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cardContent}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BackupData')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
              <Text style={styles.iconText}>☁️</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Backup & Data</Text>
              <Text style={styles.cardSubtitle}>Export and manage data</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    fontWeight: '600',
    color: '#C62828',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  businessCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#999999',
  },
  arrow: {
    fontSize: 20,
    color: '#C62828',
  },
});

export default AdminDashboardScreen;