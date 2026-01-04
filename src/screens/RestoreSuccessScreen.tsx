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

type RestoreSuccessScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RestoreSuccess'>;
  route: RouteProp<RootStackParamList, 'RestoreSuccess'>;
};

const RestoreSuccessScreen: React.FC<RestoreSuccessScreenProps> = ({
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
          {/* Header */}
          <Text style={styles.title}>Restore Data</Text>
          <Text style={styles.subtitle}>Restore from backup file</Text>

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

          {/* Success Messages */}
          <Text style={styles.successMessage}>Data restored successfully</Text>
          <Text style={styles.successDescription}>
            All data has been recovered from backup
          </Text>
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
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
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
  iconContainer: {
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#4CAF50',
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
    top: 24,
    left: 16,
    width: 32,
    height: 18,
    borderLeftWidth: 5.33,
    borderBottomWidth: 5.33,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  successMessage: {
    fontSize: 16,
    color: '#4CAF50',
    letterSpacing: -0.31,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
    marginTop: -32,
  },
});

export default RestoreSuccessScreen;