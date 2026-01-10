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
import FileIcon from '../assets/icons/FileIcon.svg';
import SettingsIcon from '../assets/icons/SettingsIcon.svg';
import ItemsIcon from '../assets/icons/ItemsIcon.svg';
import CalenderGreyIcon from '../assets/icons/CalenderGreyIcon.svg';
import { RootStackParamList } from '../types/business.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDisplayDateTime } from '../utils/helpers';

type BackupDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BackupDetails'>;
};

interface BackupEntry {
  id: string;
  date: string;
  timestamp: string;
  items: Array<{
    name: string;
    count: number;
  }>;
}

const BackupDetailsScreen: React.FC<BackupDetailsScreenProps> = ({ navigation }) => {
  const [backupHistory, setBackupHistory] = useState<BackupEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadBackupHistory();
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

  const loadBackupHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem('sync_history');
      
      if (historyJson) {
        const history: BackupEntry[] = JSON.parse(historyJson);
        // Sort by timestamp descending (newest first)
        history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setBackupHistory(history);
      } else {
        // No history yet - show empty state or fallback
        setBackupHistory([]);
      }
    } catch (error) {
      console.error('Failed to load backup history:', error);
      setBackupHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForItem = (itemName: string) => {
    const name = itemName.toLowerCase();
    
    if (name.includes('bill')) {
      return <FileIcon width={16} height={16} />;
    } else if (name.includes('item')) {
      return <ItemsIcon width={16} height={16} />;
    } else if (name.includes('categor')) {
      return <ItemsIcon width={16} height={16} />;
    } else if (name.includes('gst') || name.includes('setting')) {
      return <SettingsIcon width={16} height={16} />;
    } else {
      return <FileIcon width={16} height={16} />;
    }
  };

  const renderBackupItem = (item: { name: string; count: number }) => {
    return (
      <View key={item.name} style={styles.backupItem}>
        <View style={styles.itemIcon}>
          {getIconForItem(item.name)}
        </View>
        <Text style={styles.itemText}>
          {item.name}
          {item.count > 0 && ` (${item.count})`}
        </Text>
      </View>
    );
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

        <Text style={styles.title}>Backup Details</Text>
        <Text style={styles.subtitle}>Recent backup history</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {backupHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No backup history yet</Text>
            <Text style={styles.emptySubtext}>
              Backups will appear here once you sync your data
            </Text>
          </View>
        ) : (
          backupHistory.map((backup) => (
            <View key={backup.id} style={styles.backupCard}>
              {/* Date Header */}
              <View style={styles.dateHeader}>
                <CalenderGreyIcon width={16} height={16} />
                <Text style={styles.dateText}>{backup.date}</Text>
              </View>

              {/* Backed Up Items */}
              <View style={styles.itemsContainer}>
                <Text style={styles.backedUpLabel}>Backed up:</Text>
                {backup.items.map((item) => renderBackupItem(item))}
              </View>
            </View>
          ))
        )}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.44,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  backupCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 21,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarIcon: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  calendarTop: {
    position: 'absolute',
    top: 1,
    left: 2,
    right: 2,
    height: 4,
    borderWidth: 1.33,
    borderColor: '#999999',
    borderBottomWidth: 0,
  },
  calendarBottom: {
    position: 'absolute',
    bottom: 1,
    left: 2,
    right: 2,
    height: 8,
    borderWidth: 1.33,
    borderColor: '#999999',
  },
  dateText: {
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  itemsContainer: {
    gap: 0,
  },
  backedUpLabel: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
    marginBottom: 4,
  },
  backupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
    paddingVertical: 4,
  },
  itemIcon: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  billsIcon: {
    position: 'absolute',
    top: 1,
    left: 3,
    right: 3,
    bottom: 1,
    borderWidth: 1.33,
    borderColor: '#C62828',
  },
  itemsIcon: {
    position: 'absolute',
    top: 1,
    left: 2,
    right: 2,
    bottom: 5,
    borderWidth: 1.33,
    borderColor: '#C62828',
    borderTopWidth: 1.33,
  },
  gstIcon: {
    position: 'absolute',
    top: 1,
    left: 2,
    right: 2,
    bottom: 1,
    borderWidth: 1.33,
    borderColor: '#C62828',
    borderRadius: 8,
  },
  formatIcon: {
    position: 'absolute',
    top: 1,
    left: 3,
    right: 3,
    bottom: 1,
    borderWidth: 1.33,
    borderColor: '#C62828',
  },
  itemText: {
    fontSize: 14,
    color: '#666666',
    letterSpacing: -0.15,
    lineHeight: 20,
  },
});

export default BackupDetailsScreen;