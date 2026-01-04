import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/business.types';

type RestoringDataScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RestoringData'>;
  route: RouteProp<RootStackParamList, 'RestoringData'>;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RestoringDataScreen: React.FC<RestoringDataScreenProps> = ({
  navigation,
  route,
}) => {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const { fileName } = route.params;

  const radius = 64;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Progress animation from 0 to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigate to success screen after reaching 100%
          setTimeout(() => {
            navigation.replace('RestoreSuccess', { fileName });
          }, 500);
          return 100;
        }
        return prev + 8; // Increment by 8% every 150ms
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Animate progress circle
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <Text style={styles.title}>Restore Data</Text>
        <Text style={styles.subtitle}>Restore from backup file</Text>

        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <Svg width={140} height={140}>
            {/* Background circle */}
            <Circle
              cx={70}
              cy={70}
              r={radius}
              stroke="#E0E0E0"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <AnimatedCircle
              cx={70}
              cy={70}
              r={radius}
              stroke="#C62828"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 70 70)`}
            />
          </Svg>
          <View style={styles.progressTextContainer}>
            <Text style={styles.percentage}>{progress}%</Text>
          </View>
        </View>

        {/* Status Text */}
        <Text style={styles.statusTitle}>Restoring data...</Text>
        <Text style={styles.statusSubtext}>Please wait, this may take a moment</Text>
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
    gap: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
    marginTop: -32,
  },
  progressContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.07,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333333',
    letterSpacing: -0.44,
    textAlign: 'center',
  },
  statusSubtext: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
    marginTop: -32,
  },
});

export default RestoringDataScreen;