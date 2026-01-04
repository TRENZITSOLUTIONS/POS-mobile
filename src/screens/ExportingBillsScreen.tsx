import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/business.types';

type ExportingBillsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ExportingBills'>;
  route: RouteProp<RootStackParamList, 'ExportingBills'>;
};

const ExportingBillsScreen: React.FC<ExportingBillsScreenProps> = ({
  navigation,
  route,
}) => {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { exportType, customDays, billData } = route.params;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Rotation animation for the dashed circle
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigate to success screen after reaching 100%
          setTimeout(() => {
            navigation.replace('ExportSuccess', {
              exportType,
              billData,
            });
          }, 500);
          return 100;
        }
        return prev + 10; // Increment by 10% every 200ms
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.dashedCircle,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          />
          <Text style={styles.percentage}>{progress}%</Text>
        </View>

        {/* Status Text */}
        <Text style={styles.statusTitle}>Exporting bill...</Text>
        <Text style={styles.statusSubtext}>Preparing export file and formatting data</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    gap: 60,
  },
  progressContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dashedCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: '#C62828',
    borderStyle: 'dashed',
  },
  percentage: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.07,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.44,
    textAlign: 'center',
  },
  statusSubtext: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
    marginTop: -40,
  },
});

export default ExportingBillsScreen;