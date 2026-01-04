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
          <Text style={styles.message}>Bill has been exported successfully</Text>

          {/* Export Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Format:</Text>
              <Text style={styles.detailValue}>PDF</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Size:</Text>
              <Text style={styles.detailValue}>245 KB</Text>
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