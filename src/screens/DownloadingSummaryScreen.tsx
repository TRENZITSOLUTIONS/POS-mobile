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
import DocIconRed from '../assets/icons/DocIconRed.svg';
import ProgressIndicator from '../components/ProgressIndicator';
import { RootStackParamList } from '../types/business.types';

type DownloadingSummaryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DownloadingSummary'>;
  route: RouteProp<RootStackParamList, 'DownloadingSummary'>;
};

const DownloadingSummaryScreen: React.FC<DownloadingSummaryScreenProps> = ({
  navigation,
  route,
}) => {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Rotation animation for spinner
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
        if (prev >= 88) {
          clearInterval(interval);
          // Navigate to bill summary after completion
          setTimeout(() => {
            navigation.replace('BillSummary', {
              dateRange: route.params?.dateRange || 'today',
              customDays: route.params?.customDays,
            });
          }, 500);
          return 88;
        }
        return prev + 8;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <Text style={styles.title}>Downloading Summary</Text>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <ProgressIndicator progress={progress} size={140} />
        </View>

        {/* Status Text */}
        <Text style={styles.statusTitle}>Preparing bill summary…</Text>
        <Text style={styles.statusSubtext}>This may take a few seconds</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: progressWidth },
            ]}
          />
        </View>

        {/* Bottom Status */}
        <View style={styles.bottomStatus}>
          <Text style={styles.bottomStatusText}>Generating summary report</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 77,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
    lineHeight: 42,
    marginBottom: 60,
  },
  progressContainer: {
    marginBottom: 48,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: -0.26,
    lineHeight: 33,
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
    marginBottom: 48,
  },
  progressBarContainer: {
    width: 320,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C62828',
    borderRadius: 4,
  },
  bottomStatus: {
    position: 'absolute',
    bottom: 50,
    left: 32,
    right: 32,
    height: 49,
    backgroundColor: '#F2F2F2',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  bottomStatusText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    letterSpacing: -0.31,
  },
});

export default DownloadingSummaryScreen;