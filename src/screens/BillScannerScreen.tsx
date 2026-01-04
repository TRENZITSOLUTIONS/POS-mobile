import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';

type BillScannerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BillScanner'>;
};

const BillScannerScreen: React.FC<BillScannerScreenProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const camera = useRef<Camera>(null);
  
  // Try to get back camera
  const device = useCameraDevice('back');

  useEffect(() => {
    checkAndRequestPermissions();
  }, []);

  const checkAndRequestPermissions = async () => {
    try {
      // Check current permission status
      const cameraPermission = await Camera.getCameraPermissionStatus();
      
      if (cameraPermission === 'granted') {
        setHasPermission(true);
        setIsCameraReady(true);
        return;
      }

      if (cameraPermission === 'not-determined') {
        // Request permission
        const newPermission = await Camera.requestCameraPermission();
        setHasPermission(newPermission === 'granted');
        setIsCameraReady(newPermission === 'granted');
        
        if (newPermission === 'denied') {
          showPermissionAlert();
        }
      } else {
        // Permission was denied
        showPermissionAlert();
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert(
        'Camera Error',
        'Failed to initialize camera. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      'Camera Permission Required',
      'Please grant camera permission in settings to scan bills.',
      [
        { text: 'Cancel', onPress: () => navigation.goBack() },
        { text: 'Open Settings', onPress: () => Camera.requestCameraPermission() },
      ]
    );
  };

  const capturePhoto = async () => {
    if (!camera.current || isCapturing || !isCameraReady) return;
    
    try {
      setIsCapturing(true);
      
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });

      // Navigate to bill preview with photo path
      navigation.navigate('BillPreview', {
        photoPath: Platform.OS === 'android' ? `file://${photo.path}` : photo.path,
      });
    } catch (error) {
      console.error('Failed to capture photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  // Show loading while checking permissions
  if (!hasPermission || !device) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.permissionContainer}>
          {!device ? (
            <>
              <Text style={styles.permissionText}>No camera device found</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.retryButtonText}>Go Back</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color="#C62828" />
              <Text style={styles.permissionText}>Initializing camera...</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Camera View */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Top Overlay */}
      <View style={styles.topOverlay}>
        <View style={styles.topContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Scan Bill</Text>

          <View style={styles.spacer} />
        </View>
      </View>

      {/* Middle Section with Scan Frame */}
      <View style={styles.middleContainer}>
        <View style={styles.scanOverlay} />

        {/* Scan Frame */}
        <View style={styles.scanFrame}>
          {/* Corner Markers */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />

          {/* Camera Icon */}
          <View style={styles.cameraIconContainer}>
            <View style={styles.cameraIcon}>
              <View style={styles.cameraLens} />
            </View>
          </View>
        </View>

        <Text style={styles.instructionText}>Align bill inside the frame</Text>
      </View>

      {/* Bottom Overlay with Capture Button */}
      <View style={styles.bottomOverlay}>
        <TouchableOpacity
          style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
          onPress={capturePhoto}
          disabled={isCapturing}
          activeOpacity={0.9}
        >
          {isCapturing ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#C62828',
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 92,
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 32,
    letterSpacing: 0.07,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.26,
    lineHeight: 33,
  },
  spacer: {
    width: 44,
  },
  middleContainer: {
    position: 'absolute',
    top: 92,
    left: 0,
    right: 0,
    height: 600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanFrame: {
    width: 288,
    height: 384,
    borderWidth: 1.81,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 48,
    height: 48,
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 3.62,
    borderLeftWidth: 3.62,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 3.62,
    borderRightWidth: 3.62,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3.62,
    borderLeftWidth: 3.62,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3.62,
    borderRightWidth: 3.62,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 16,
  },
  cameraIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -48,
    marginLeft: -48,
    width: 96,
    height: 96,
    opacity: 0.2,
  },
  cameraIcon: {
    width: 96,
    height: 96,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLens: {
    width: 24,
    height: 24,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  },
  instructionText: {
    marginTop: 24,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: -0.31,
    textAlign: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderWidth: 3.62,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 10,
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    backgroundColor: '#C62828',
    borderRadius: 32,
  },
});

export default BillScannerScreen;