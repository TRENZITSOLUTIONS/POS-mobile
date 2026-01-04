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
import CheckWhite from '../assets/icons/CheckWhite.svg';
import { RootStackParamList } from '../types/business.types';

type BackupCompleteScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BackupComplete'>;
};

const BackupCompleteScreen: React.FC<BackupCompleteScreenProps> = ({ navigation }) => {
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
          {/* Title */}
          <Text style={styles.title}>Backup Complete</Text>

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
              <CheckWhite width={64} height={64} />
            </Animated.View>
          </View>

          {/* Success Messages */}
          <View style={styles.messagesContainer}>
            <Text style={styles.successMessage}>Backup completed successfully</Text>
            <Text style={styles.infoMessage}>All data has been safely backed up</Text>
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
  iconContainer: {
    width: 272,
    height: 272,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 128,
    height: 128,
    backgroundColor: '#4CAF50',
    borderRadius: 64,
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
    width: 18,
    height: 10,
    borderLeftWidth: 5.33,
    borderBottomWidth: 5.33,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  messagesContainer: {
    alignItems: 'center',
    gap: 0,
    marginTop: -60,
  },
  successMessage: {
    fontSize: 16,
    color: '#4CAF50',
    letterSpacing: -0.31,
    lineHeight: 24,
    textAlign: 'center',
  },
  infoMessage: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default BackupCompleteScreen;