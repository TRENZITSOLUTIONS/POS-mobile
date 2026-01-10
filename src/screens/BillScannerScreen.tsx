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
  Linking,
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
  const [flashEnabled, setFlashEnabled] = useState(false);
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
      
      console.log('Camera permission status:', cameraPermission);
      
      if (cameraPermission === 'granted') {
        setHasPermission(true);
        setIsCameraReady(true);
        return;
      }

      if (cameraPermission === 'not-determined') {
        // Request permission
        const newPermission = await Camera.requestCameraPermission();
        console.log('New camera permission:', newPermission);
        
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
        'Failed to initialize camera. Please check your device settings.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      'Camera Permission Required',
      'Camera access is needed to scan bills. Please grant camera permission in your device settings.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
        { 
          text: 'Open Settings', 
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        },
      ]
    );
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const capturePhoto = async () => {
    if (!camera.current || isCapturing || !isCameraReady) {
      console.log('Cannot capture: camera ready?', isCameraReady, 'capturing?', isCapturing);
      return;
    }
    
    try {
      setIsCapturing(true);
      
      console.log('Taking photo with flash:', flashEnabled ? 'on' : 'off');
      
      const photo = await camera.current.takePhoto({
        flash: flashEnabled ? 'on' : 'off',
      });

      console.log('Photo captured:', photo.path);

      // Navigate to bill preview with photo path
      navigation.navigate('BillPreview', {
        photoPath: Platform.OS === 'android' ? `file://${photo.path}` : photo.path,
      });
    } catch (error) {
      console.error('Failed to capture photo:', error);
      Alert.alert(
        'Capture Error', 
        'Failed to capture photo. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    setIsCameraReady(false);
    setHasPermission(false);
    checkAndRequestPermissions();
  };

  // Show loading or error while checking permissions
  if (!hasPermission || !device) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.permissionContainer}>
          {!device ? (
            <>
              <Text style={styles.permissionTitle}>No Camera Found</Text>
              <Text style={styles.permissionText}>
                Unable to access camera device. Please check your device permissions.
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.secondaryButtonText}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleRetry}
                >
                  <Text style={styles.primaryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
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
        enableZoomGesture={true}
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

          <TouchableOpacity
            style={styles.flashButton}
            onPress={toggleFlash}
            activeOpacity={0.7}
          >
            <Text style={styles.flashIcon}>{flashEnabled ? '⚡' : '⚡'}</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>
          Position the bill clearly within the frame
        </Text>
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

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            ✓ Ensure good lighting
          </Text>
          <Text style={styles.instructionText}>
            ✓ Keep bill flat and readable
          </Text>
        </View>
      </View>

      {/* Bottom Overlay with Capture Button */}
      <View style={styles.bottomOverlay}>
        <View style={styles.captureContainer}>
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
          <Text style={styles.captureHint}>Tap to capture</Text>
        </View>
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
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.26,
  },
  permissionText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    letterSpacing: -0.31,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#C62828',
    borderRadius: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#333333',
    borderRadius: 10,
  },
  secondaryButtonText: {
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
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.26,
    lineHeight: 33,
  },
  flashButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: -0.15,
  },
  middleContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    bottom: 160,
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
    borderWidth: 2,
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
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
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
    opacity: 0.15,
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
  instructionContainer: {
    marginTop: 24,
    gap: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: -0.15,
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
  captureContainer: {
    alignItems: 'center',
    gap: 12,
  },
  captureButton: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderWidth: 4,
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
  captureHint: {
    fontSize: 14,
    color: '#CCCCCC',
    letterSpacing: -0.15,
  },
});

export default BillScannerScreen;