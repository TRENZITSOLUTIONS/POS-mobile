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
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import { getUnsyncedBillsCount } from '../services/storage';
import { syncAll, getNetworkStatus } from '../services/sync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDisplayDateTime } from '../utils/helpers';

type BackupDataScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BackupData'>;
};

const BackupDataScreen: React.FC<BackupDataScreenProps> = ({ navigation }) => {
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadBackupData();
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

  const loadBackupData = async () => {
    try {
      // Get last sync time
      const lastSync = await AsyncStorage.getItem('last_sync_time');
      setLastBackupTime(lastSync);

      // Get unsynced bills count
      const count = await getUnsyncedBillsCount();
      setUnsyncedCount(count);

      // Check network status
      const online = await getNetworkStatus();
      setIsOnline(online);
    } catch (error) {
      console.error('Failed to load backup data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupNow = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline',
        'Cannot backup now. Please check your internet connection and try again.'
      );
      return;
    }

    if (unsyncedCount === 0) {
      Alert.alert('Already Synced', 'All data is already backed up.');
      return;
    }

    setIsSyncing(true);

    try {
      // Trigger sync
      const result = await syncAll();

      if (result.success) {
        // Save last sync time
        const now = new Date().toISOString();
        await AsyncStorage.setItem('last_sync_time', now);
        setLastBackupTime(now);
        setUnsyncedCount(0);

        navigation.navigate('BackupComplete', {
          categoriesSynced: result.categoriesSynced,
          itemsSynced: result.itemsSynced,
          billsSynced: result.billsSynced,
        });
      } else {
        Alert.alert('Backup Failed', 'Some items could not be backed up. Please try again.');
      }
    } catch (error) {
      console.error('Backup failed:', error);
      Alert.alert('Error', 'Failed to backup data. Please try again.');
    } finally {
      setIsSyncing(false);
    }
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

  const formatLastBackup = () => {
    if (!lastBackupTime) {
      return 'Never backed up';
    }
    return formatDisplayDateTime(lastBackupTime);
  };

  const getSyncStatusText = () => {
    if (!isOnline) {
      return 'Offline - No connection';
    }
    if (unsyncedCount === 0) {
      return 'All data is synced';
    }
    return `${unsyncedCount} item${unsyncedCount > 1 ? 's' : ''} pending sync`;
  };

  const getSyncStatusColor = () => {
    if (!isOnline) return '#FFA726';
    if (unsyncedCount === 0) return '#4CAF50';
    return '#FFA726';
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
              Last backup: <Text style={styles.backupValue}>{formatLastBackup()}</Text>
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
            <View style={[styles.syncIcon, { backgroundColor: getSyncStatusColor() }]}>
              {unsyncedCount === 0 && isOnline ? (
                <View style={styles.checkmark} />
              ) : (
                <Text style={styles.syncCountText}>
                  {!isOnline ? '!' : unsyncedCount}
                </Text>
              )}
            </View>
            <Text style={[styles.syncedText, { color: getSyncStatusColor() }]}>
              {getSyncStatusText()}
            </Text>
          </View>

          <Text style={styles.syncDescription}>
            {isOnline 
              ? (unsyncedCount === 0 
                  ? 'Your data is safely backed up' 
                  : 'Tap "Backup Now" to sync pending items')
              : 'Connect to internet to sync your data'}
          </Text>
        </View>

        {/* Backup Now Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backup Now</Text>
          <Text style={styles.cardDescription}>
            Manually back up all bills and settings
          </Text>
          
          <TouchableOpacity
            style={[styles.backupButton, (!isOnline || isSyncing) && styles.backupButtonDisabled]}
            onPress={handleBackupNow}
            activeOpacity={0.9}
            disabled={!isOnline || isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.backupButtonText}>
                {isOnline ? 'Backup Now' : 'Offline'}
              </Text>
            )}
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
  syncCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  backupButtonDisabled: {
    opacity: 0.5,
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