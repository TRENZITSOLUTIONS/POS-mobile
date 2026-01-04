import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProgressIndicator from '../components/ProgressIndicator';
import { RootStackParamList } from '../types/business.types';

type BackingUpScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BackingUp'>;
};

const BackingUpScreen: React.FC<BackingUpScreenProps> = ({ navigation }) => {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) {
          clearInterval(interval);
          // Navigate to backup complete after reaching 94%
          setTimeout(() => {
            navigation.replace('BackupComplete');
          }, 500);
          return 94;
        }
        return prev + 6;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Title */}
        <Text style={styles.title}>Backing Up Data</Text>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <ProgressIndicator progress={progress} size={140} />
        </View>

        {/* Status Text */}
        <Text style={styles.statusTitle}>Backing up settings...</Text>
        <Text style={styles.statusSubtext}>Please wait while we secure your data</Text>
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
    paddingVertical: 90,
  },
  content: {
    alignItems: 'center',
    gap: 89,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
    lineHeight: 42,
    textAlign: 'center',
  },
  progressContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: -60,
  },
});

export default BackingUpScreen;