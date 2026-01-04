import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BillingIcon from '../assets/icons/BillingIcon.svg';
import { RootStackParamList } from '../types/business.types';

type ModeSelectionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ModeSelection'>;
};

const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({
  navigation,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBillingMode = () => {
    navigation.navigate('Billing');
  };

  const handleAdminMode = () => {
    navigation.navigate('AdminPin');
  };

  const handleDashboardMode = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Title */}
        <Text style={styles.title}>Select Mode</Text>

        {/* Billing Mode - Large Card */}
        <TouchableOpacity
          style={styles.largeCard}
          onPress={handleBillingMode}
          activeOpacity={0.9}
        >
          <View style={styles.imageContainer}>
            <BillingIcon width={317} height={192} />
          </View>

          <View style={styles.largeCardContent}>
            <Text style={styles.largeCardTitle}>Billing Mode</Text>
            <Text style={styles.largeCardSubtitle}>
              Create bills and process sales
            </Text>
          </View>
        </TouchableOpacity>

        {/* Small Cards Container */}
        <View style={styles.smallCardsContainer}>
          {/* Dashboard Mode */}
          <TouchableOpacity
            style={styles.smallCard}
            onPress={handleDashboardMode}
            activeOpacity={0.9}
          >
            <Text style={styles.smallCardTitle}>Dashboard Mode</Text>
            <Text style={styles.smallCardSubtitle}>View sales and insights</Text>
          </TouchableOpacity>

          {/* Admin Mode */}
          <TouchableOpacity
            style={styles.smallCard}
            onPress={handleAdminMode}
            activeOpacity={0.9}
          >
            <Text style={styles.smallCardTitle}>Admin Mode</Text>
            <Text style={styles.smallCardSubtitle}>
              Manage settings and inventory
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginTop: 86,
    marginBottom: 32,
    letterSpacing: 0.382812,
  },
  largeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 192,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderIcon: {
    fontSize: 64,
    opacity: 0.5,
  },
  largeCardContent: {
    padding: 24,
  },
  largeCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
    letterSpacing: -0.257812,
  },
  largeCardSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999999',
    letterSpacing: -0.3125,
  },
  smallCardsContainer: {
    gap: 16,
  },
  smallCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  smallCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    letterSpacing: -0.439453,
  },
  smallCardSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999999',
    letterSpacing: -0.3125,
  },
});

export default ModeSelectionScreen;