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
import FileIcon from '../assets/icons/FileIcon.svg';
import SettingsIcon from '../assets/icons/SettingsIcon.svg';
import ItemsIcon from '../assets/icons/ItemsIcon.svg';
import CalenderGreyIcon from '../assets/icons/CalenderGreyIcon.svg';
import { RootStackParamList } from '../types/business.types';

type BackupDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BackupDetails'>;
};

interface BackupEntry {
  id: string;
  date: string;
  items: string[];
}

const BackupDetailsScreen: React.FC<BackupDetailsScreenProps> = ({ navigation }) => {
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

  const backupHistory: BackupEntry[] = [
    {
      id: '1',
      date: '14 Sep 2025, 10:32 AM',
      items: ['Bills', 'Items', 'GST Settings', 'Bill Format'],
    },
    {
      id: '2',
      date: '13 Sep 2025, 6:15 PM',
      items: ['Bills', 'Items', 'GST Settings', 'Bill Format'],
    },
    {
      id: '3',
      date: '12 Sep 2025, 2:48 PM',
      items: ['Bills', 'Items', 'GST Settings'],
    },
    {
      id: '4',
      date: '11 Sep 2025, 11:20 AM',
      items: ['Bills', 'Items', 'GST Settings', 'Bill Format'],
    },
  ];

  const renderBackupItem = (item: string) => {
    return (
      <View key={item} style={styles.backupItem}>
        <View style={styles.itemIcon}>
          {item === 'Bills' && <FileIcon width={16} height={16} />}
          {item === 'Items' && <ItemsIcon width={16} height={16} />}
          {item === 'GST Settings' && <SettingsIcon width={16} height={16} />}
          {item === 'Bill Format' && <FileIcon width={16} height={16} />}
        </View>
        <Text style={styles.itemText}>{item}</Text>
      </View>
    );
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

        <Text style={styles.title}>Backup Details</Text>
        <Text style={styles.subtitle}>Recent backup history</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {backupHistory.map((backup) => (
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
        ))}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
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