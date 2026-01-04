import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Modal,
  Alert,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import RNFS from 'react-native-fs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';

type RestoreDataScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RestoreData'>;
};

const RestoreDataScreen: React.FC<RestoreDataScreenProps> = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState<{ name: string; uri: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFileListModal, setShowFileListModal] = useState(false);
  const [backupFiles, setBackupFiles] = useState<Array<{ name: string; path: string; size: number }>>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to read backup files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const scanForBackupFiles = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Storage permission is needed to access backup files'
        );
        return;
      }

      // Scan common directories for backup files
      const directories = [
        RNFS.DocumentDirectoryPath,
        RNFS.DownloadDirectoryPath,
        `${RNFS.ExternalStorageDirectoryPath}/Download`,
        `${RNFS.ExternalStorageDirectoryPath}/Documents`,
      ];

      const foundFiles: Array<{ name: string; path: string; size: number }> = [];

      for (const dir of directories) {
        try {
          const exists = await RNFS.exists(dir);
          if (!exists) continue;

          const items = await RNFS.readDir(dir);
          
          for (const item of items) {
            if (
              item.isFile() &&
              (item.name.endsWith('.backup') ||
                item.name.endsWith('.dat') ||
                item.name.endsWith('.zip'))
            ) {
              foundFiles.push({
                name: item.name,
                path: item.path,
                size: item.size,
              });
            }
          }
        } catch (error) {
          console.log(`Could not scan ${dir}:`, error);
        }
      }

      if (foundFiles.length === 0) {
        Alert.alert(
          'No Backup Files Found',
          'No backup files (.backup, .dat, .zip) were found in common directories.\n\nYou can create a demo backup file to test the restore feature.',
          [
            {
              text: 'Create Demo File',
              onPress: createDemoBackupFile,
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
        return;
      }

      setBackupFiles(foundFiles);
      setShowFileListModal(true);
    } catch (error) {
      console.error('Error scanning for files:', error);
      Alert.alert('Error', 'Failed to scan for backup files');
    }
  };

  const createDemoBackupFile = async () => {
    try {
      const demoFileName = 'backup_14Sep2025.backup';
      const demoPath = `${RNFS.DocumentDirectoryPath}/${demoFileName}`;
      
      const demoData = {
        version: '1.0',
        created: new Date().toISOString(),
        data: {
          bills: [],
          items: [],
          settings: {},
        },
      };

      await RNFS.writeFile(demoPath, JSON.stringify(demoData), 'utf8');

      Alert.alert(
        'Demo File Created',
        `Created ${demoFileName} in app directory`,
        [
          {
            text: 'Select It',
            onPress: () => {
              setSelectedFile({
                name: demoFileName,
                uri: demoPath,
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating demo file:', error);
      Alert.alert('Error', 'Failed to create demo file');
    }
  };

  const handleSelectFile = () => {
    scanForBackupFiles();
  };

  const handleFileSelect = (file: { name: string; path: string; size: number }) => {
    setSelectedFile({
      name: file.name,
      uri: file.path,
    });
    setShowFileListModal(false);

    const fileSizeKB = (file.size / 1024).toFixed(2);
    Alert.alert(
      'File Selected',
      `${file.name}\nSize: ${fileSizeKB} KB`,
      [{ text: 'OK' }]
    );
  };

  const handleRestoreData = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmRestore = () => {
    setShowConfirmModal(false);
    navigation.navigate('RestoringData', {
      fileName: selectedFile?.name || 'backup_14Sep2025.backup',
    });
  };

  const handleCancelRestore = () => {
    setShowConfirmModal(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Restore Data</Text>
        <Text style={styles.subtitle}>Restore from backup file</Text>
      </Animated.View>

      <View style={styles.content}>
        {/* Select Backup File Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Backup File</Text>

          <TouchableOpacity
            style={styles.filePicker}
            onPress={handleSelectFile}
            activeOpacity={0.7}
          >
            {!selectedFile ? (
              // No file selected state
              <>
                <View style={styles.uploadIcon}>
                  <View style={styles.uploadIconTop} />
                  <View style={styles.uploadIconBottom} />
                </View>
                <Text style={styles.filePickerText}>Tap to select file</Text>
                <Text style={styles.filePickerSubtext}>
                  Supported: .backup / .dat / .zip
                </Text>
              </>
            ) : (
              // File selected state
              <>
                <View style={styles.selectedIconContainer}>
                  <View style={styles.selectedIcon}>
                    <View style={styles.checkmark} />
                  </View>
                </View>
                <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                <Text style={styles.changeFileText}>Tap to change file</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.helperText}>
            Select a backup file (.backup / .dat / .zip)
          </Text>
        </View>

        {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningIcon}>
            <View style={styles.warningTriangle} />
            <View style={styles.warningDot} />
            <View style={styles.warningLine} />
          </View>
          <Text style={styles.warningText}>
            Restoring data will overwrite current data. Make sure you have a
            recent backup before proceeding.
          </Text>
        </View>

        {/* Restore Button */}
        <TouchableOpacity
          style={[
            styles.restoreButton,
            !selectedFile && styles.restoreButtonDisabled,
          ]}
          onPress={handleRestoreData}
          disabled={!selectedFile}
          activeOpacity={0.9}
        >
          <Text
            style={[
              styles.restoreButtonText,
              !selectedFile && styles.restoreButtonTextDisabled,
            ]}
          >
            Restore Data
          </Text>
        </TouchableOpacity>
      </View>

      {/* File List Modal */}
      <Modal
        visible={showFileListModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFileListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fileListContainer}>
            <Text style={styles.fileListTitle}>Select Backup File</Text>
            
            <ScrollView style={styles.fileList}>
              {backupFiles.map((file, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.fileItem}
                  onPress={() => handleFileSelect(file)}
                  activeOpacity={0.7}
                >
                  <View style={styles.fileIconContainer}>
                    <View style={styles.fileIcon} />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileSize}>
                      {(file.size / 1024).toFixed(2)} KB
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFileListModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelRestore}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Restore</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmRestore}
                activeOpacity={0.9}
              >
                <Text style={styles.confirmButtonText}>YES, RESTORE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelRestore}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '600',
    color: '#C62828',
    lineHeight: 28,
    letterSpacing: -0.45,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    letterSpacing: -0.31,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
    lineHeight: 42,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 21,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: -0.44,
    lineHeight: 27,
    marginBottom: 12,
  },
  filePicker: {
    borderWidth: 1.81,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 34,
    alignItems: 'center',
    minHeight: 176,
    justifyContent: 'center',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
    position: 'relative',
  },
  uploadIconTop: {
    position: 'absolute',
    top: 6,
    left: 24,
    width: 0,
    height: 12,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#999999',
  },
  uploadIconBottom: {
    position: 'absolute',
    bottom: 6,
    left: 12,
    right: 12,
    height: 16,
    borderWidth: 4,
    borderColor: '#999999',
    borderTopWidth: 0,
  },
  filePickerText: {
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.31,
    textAlign: 'center',
    marginBottom: 4,
  },
  filePickerSubtext: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
  },
  selectedIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedIcon: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    left: 4,
    width: 12,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  selectedFileName: {
    fontSize: 16,
    color: '#333333',
    letterSpacing: -0.31,
    textAlign: 'center',
    marginBottom: 4,
  },
  changeFileText: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 16,
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
    marginTop: 16,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderWidth: 0.6,
    borderColor: '#FFE082',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  warningIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  warningTriangle: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderWidth: 1.67,
    borderColor: '#FF9800',
    borderRadius: 2,
  },
  warningLine: {
    position: 'absolute',
    top: 7,
    left: 9,
    width: 2,
    height: 4,
    backgroundColor: '#FF9800',
  },
  warningDot: {
    position: 'absolute',
    bottom: 6,
    left: 9,
    width: 2,
    height: 2,
    backgroundColor: '#FF9800',
    borderRadius: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 16,
    color: '#666666',
    letterSpacing: -0.31,
    lineHeight: 24,
  },
  restoreButton: {
    height: 52,
    backgroundColor: '#C62828',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
  },
  restoreButtonTextDisabled: {
    color: '#999999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fileListContainer: {
    width: '100%',
    maxWidth: 353,
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 10,
  },
  fileListTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: -0.26,
    textAlign: 'center',
    marginBottom: 20,
  },
  fileList: {
    flex: 1,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
    marginBottom: 12,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#C62828',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileIcon: {
    width: 20,
    height: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopWidth: 6,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#999999',
  },
  closeButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: -0.31,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 353,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: -0.26,
    textAlign: 'center',
    marginBottom: 32,
  },
  modalButtons: {
    gap: 12,
  },
  confirmButton: {
    height: 48,
    backgroundColor: '#C62828',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
  },
  cancelButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: -0.31,
  },
});

export default RestoreDataScreen;