import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';

type BackupDataScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BackupData'>;
};

const BackupDataScreen: React.FC<BackupDataScreenProps> = ({ navigation }) => {
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

  const handleBackupNow = () => {
    navigation.navigate('BackingUp');
  };

  const handleViewDetails = () => {
    navigation.navigate('BackupDetails');
  };

  const handleExportOptions = () => {
    navigation.navigate('ExportBills');
  };

  const handleRestoreData = () => {
    navigation.navigate('RestoreData');
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

        <Text style={styles.title}>Backup & Data</Text>
        <Text style={styles.subtitle}>Secure data management and recovery</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Last Backup Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last Backup</Text>
          
          <View style={styles.backupInfo}>
            <Text style={styles.backupLabel}>
              Last backup: <Text style={styles.backupValue}>14 Sep 2025, 10:32 AM</Text>
            </Text>
            <Text style={styles.backupDescription}>
              Bills, items, GST settings backed up
            </Text>
          </View>

          <TouchableOpacity onPress={handleViewDetails} activeOpacity={0.7}>
            <Text style={styles.viewDetailsButton}>View Details</Text>
          </TouchableOpacity>
        </View>

        {/* Sync Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sync Status</Text>
          
          <View style={styles.syncStatusRow}>
            <View style={styles.syncIcon}>
              <View style={styles.checkmark} />
            </View>
            <Text style={styles.syncedText}>All data is synced</Text>
          </View>

          <Text style={styles.syncDescription}>Your data is safely backed up</Text>
        </View>

        {/* Backup Now Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backup Now</Text>
          <Text style={styles.cardDescription}>
            Manually back up all bills and settings
          </Text>
          
          <TouchableOpacity
            style={styles.backupButton}
            onPress={handleBackupNow}
            activeOpacity={0.9}
          >
            <Text style={styles.backupButtonText}>Backup Now</Text>
          </TouchableOpacity>
        </View>

        {/* Export Options Card */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleExportOptions}
          activeOpacity={0.9}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionTextContainer}>
              <Text style={styles.cardTitle}>Export Options</Text>
              <Text style={styles.cardDescription}>
                Manually export bills and reports
              </Text>
            </View>
            <View style={styles.arrowIcon}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Restore Data Card */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleRestoreData}
          activeOpacity={0.9}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionTextContainer}>
              <Text style={styles.cardTitle}>Restore Data</Text>
              <Text style={styles.cardDescription}>
                Restore data from a backup file
              </Text>
            </View>
            <View style={styles.arrowIcon}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </View>
        </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 21,
    gap: 10,
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
  },
  cardDescription: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  backupInfo: {
    gap: 0,
  },
  backupLabel: {
    fontSize: 16,
    color: '#666666',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  backupValue: {
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.31,
  },
  backupDescription: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  viewDetailsButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    letterSpacing: -0.31,
    textAlign: 'center',
    lineHeight: 23,
  },
  syncStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 6,
    height: 3,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  syncedText: {
    fontSize: 16,
    color: '#4CAF50',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  syncDescription: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  backupButton: {
    height: 48,
    backgroundColor: '#C62828',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
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
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: '#999999',
    lineHeight: 20,
  },
});

export default BackupDataScreen;