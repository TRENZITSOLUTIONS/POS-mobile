import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/business.types';

type ExportSuccessScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ExportSuccess'>;
  route: RouteProp<RootStackParamList, 'ExportSuccess'>;
};

const ExportSuccessScreen: React.FC<ExportSuccessScreenProps> = ({
  navigation,
  route,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  const { exportType, billCount, exportData, dateRange } = route.params;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTap = () => {
    navigation.navigate('BackupData');
  };

  // Format export type for display
  const getExportTypeDisplay = () => {
    switch (exportType) {
      case 'all':
        return 'All Bills';
      case 'today':
        return "Today's Bills";
      case 'dateRange':
        return 'Date Range';
      default:
        return 'Bills';
    }
  };

  // Format date range for display
  const getDateRangeDisplay = () => {
    if (!dateRange) return 'N/A';
    
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    };

    if (start.toDateString() === end.toDateString()) {
      return formatDate(start);
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Calculate estimated file size based on data
  const getEstimatedFileSize = () => {
    if (!exportData || exportData.length === 0) {
      return '0 KB';
    }

    // Estimate: ~1 KB per bill for CSV format
    const estimatedKB = exportData.length * 1;
    
    if (estimatedKB < 1024) {
      return `${estimatedKB} KB`;
    } else {
      const estimatedMB = (estimatedKB / 1024).toFixed(1);
      return `${estimatedMB} MB`;
    }
  };

  // Get current time
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.successCircle,
                {
                  transform: [{ scale: checkmarkAnim }],
                },
              ]}
            >
              <View style={styles.checkmarkIcon}>
                <View style={styles.checkmarkStroke} />
              </View>
            </Animated.View>
          </View>

          {/* Success Title */}
          <Text style={styles.title}>Export Successful</Text>

          {/* Success Message */}
          <Text style={styles.message}>
            {billCount !== undefined
              ? `${billCount} bill${billCount !== 1 ? 's' : ''} exported successfully`
              : 'Bills exported successfully'}
          </Text>

          {/* Export Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Export Type:</Text>
              <Text style={styles.detailValue}>{getExportTypeDisplay()}</Text>
            </View>

            {billCount !== undefined && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bills Exported:</Text>
                <Text style={styles.detailValue}>{billCount}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date Range:</Text>
              <Text style={styles.detailValue}>{getDateRangeDisplay()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Format:</Text>
              <Text style={styles.detailValue}>CSV</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Size:</Text>
              <Text style={styles.detailValue}>{getEstimatedFileSize()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Exported:</Text>
              <Text style={styles.detailValue}>{currentTime}</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 8,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    width: 64,
    height: 64,
    position: 'relative',
  },
  checkmarkStroke: {
    position: 'absolute',
    top: 20,
    left: 12,
    width: 28,
    height: 16,
    borderLeftWidth: 8,
    borderBottomWidth: 8,
    borderColor: '#4CAF50',
    transform: [{ rotate: '-45deg' }],
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: -0.26,
    lineHeight: 33,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    letterSpacing: -0.31,
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999999',
    letterSpacing: -0.15,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333333',
    letterSpacing: -0.15,
  },
});

export default ExportSuccessScreen;