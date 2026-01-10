import React, {useEffect, useState, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ProgressIndicator from '../components/ProgressIndicator';
import type {RootStackParamList} from '../types/business.types';
import { saveBusinessSettings } from '../services/storage';

type CreatingBusinessScreenProps = NativeStackScreenProps<RootStackParamList, 'CreatingBusiness'>;

const CreatingBusinessScreen: React.FC<CreatingBusinessScreenProps> = ({
  navigation,
  route,
}) => {
  const {businessData} = route.params;
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Validating information...');
  
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;
  const progressScale = useRef(new Animated.Value(0.8)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    startAnimations();
    createBusiness();
  }, []);

  const startAnimations = () => {
    // Title animation
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Progress indicator animation
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(progressOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(progressScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Subtitle animation
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const createBusiness = async () => {
    try {
      // Step 1: Validate data (15%)
      setProgress(15);
      setCurrentStep('Validating information...');
      await sleep(500);

      // Step 2: Prepare database (35%)
      setProgress(35);
      setCurrentStep('Preparing database...');
      await sleep(500);

      // Step 3: Save business settings (55%)
      setProgress(55);
      setCurrentStep('Saving business details...');
      
      // Actually save to database
      const businessSettings = {
        business_name: businessData.businessName,
        gstin: businessData.gstNumber,
        gst_type: businessData.gstType,
        phone: businessData.phoneNumber,
        email: businessData.emailAddress,
        address: '', // Can be added later
        logo_url: '', // Can be added later
      };

      await saveBusinessSettings(businessSettings);
      console.log('Business settings saved:', businessSettings);
      
      await sleep(500);

      // Step 4: Initialize workspace (75%)
      setProgress(75);
      setCurrentStep('Setting up workspace...');
      await sleep(500);

      // Step 5: Finalizing (90%)
      setProgress(90);
      setCurrentStep('Finalizing setup...');
      await sleep(500);

      // Step 6: Complete (100%)
      setProgress(100);
      setCurrentStep('Complete!');
      await sleep(500);

      // Navigate to success screen
      navigation.replace('SetupSuccess', {
        businessName: businessData.businessName,
      });

    } catch (error) {
      console.error('Failed to create business:', error);
      
      // Navigate to failure screen
      navigation.replace('SetupFailure', {
        error: 'Failed to save business information. Please try again.',
      });
    }
  };

  const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(() => resolve(), ms));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{translateY: titleTranslateY}],
          }}>
          <Text style={styles.title}>Creating Business</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.progressContainer,
            {
              opacity: progressOpacity,
              transform: [{scale: progressScale}],
            },
          ]}>
          <ProgressIndicator progress={progress} size={140} />
        </Animated.View>

        <Animated.View
          style={{
            opacity: subtitleOpacity,
            transform: [{translateY: subtitleTranslateY}],
          }}>
          <Text style={styles.subtitle}>{currentStep}</Text>
          <Text style={styles.description}>Please wait, this may take a moment</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c2c2c',
    marginBottom: 60,
  },
  progressContainer: {
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default CreatingBusinessScreen;