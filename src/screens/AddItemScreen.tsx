import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/business.types';
import { getCategories, createItem } from '../services/storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

type AddItemScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddItem'>;
};

const AddItemScreen: React.FC<AddItemScreenProps> = ({ navigation }) => {
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [useGlobalGST, setUseGlobalGST] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCategories();
    
    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await getCategories();
      setCategories(result);
      
      if (result.length > 0) {
        setCategory(result[0].name);
        setCategoryId(result[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter valid price');
      return;
    }

    if (!categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setIsSaving(true);

    try {
      // Create item using API (will also save locally and queue for sync)
      const itemData = {
        name: itemName.trim(),
        price: parseFloat(price),
        category_ids: [categoryId],
        stock_quantity: 0, // Default stock quantity
      };

      // Use local storage (which will queue for API sync)
      await createItem(itemData);

      Alert.alert(
        'Success',
        'Item added successfully! It will be synced to the server.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to add item:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = () => {
    Alert.alert(
      'Upload Image',
      'Choose upload method',
      [
        { 
          text: 'Camera', 
          onPress: () => openCamera() 
        },
        { 
          text: 'Gallery', 
          onPress: () => openGallery() 
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
      ]
    );
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        saveToPhotos: true,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Error', 'Failed to open camera');
          return;
        }
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setImagePath(asset.uri || '');
          setImageUrl(''); // Clear URL if file is selected
        }
      }
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Error', 'Failed to open gallery');
          return;
        }
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setImagePath(asset.uri || '');
          setImageUrl(''); // Clear URL if file is selected
        }
      }
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Item</Text>
      </Animated.View>

      {/* Scrollable Form */}
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: formAnim,
            transform: [
              {
                translateY: formAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Item Image */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Item Image</Text>
            <TouchableOpacity style={styles.imageUploadContainer} onPress={handleImageUpload}>
              <View style={styles.imageUploadInner}>
                {/* Upload Icon */}
                <View style={styles.uploadIcon}>
                  {/* Camera Icon using lines */}
                  <View style={styles.cameraTop} />
                  <View style={styles.cameraBody} />
                  <View style={styles.cameraLens} />
                </View>
                <Text style={styles.uploadText}>
                  {imagePath ? 'Image Selected' : 'Upload Item Image'}
                </Text>
                <Text style={styles.browseText}>
                  {imagePath ? 'Tap to change' : 'Tap to browse files'}
                </Text>
              </View>
              
              {/* URL Input */}
              <TextInput
                style={styles.urlInput}
                placeholder="Or paste image URL"
                placeholderTextColor="#999999"
                value={imageUrl}
                onChangeText={(text) => {
                  setImageUrl(text);
                  if (text) setImagePath(''); // Clear file if URL is entered
                }}
              />
            </TouchableOpacity>
          </View>

          {/* Item Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Idli"
              placeholderTextColor="#999999"
              value={itemName}
              onChangeText={setItemName}
            />
          </View>

          {/* Price */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Price</Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="40"
                placeholderTextColor="#999999"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={styles.dropdownText}>
                {category || 'Select Category'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {showCategoryDropdown && (
              <View style={styles.dropdownMenu}>
                <ScrollView 
                  style={styles.dropdownScrollView}
                  nestedScrollEnabled={true}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCategory(cat.name);
                        setCategoryId(cat.id);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* GST Settings */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>GST Settings</Text>
            <View style={styles.gstContainer}>
              {/* Use Global GST */}
              <TouchableOpacity
                style={[
                  styles.gstButton,
                  useGlobalGST && styles.gstButtonSelected,
                ]}
                onPress={() => setUseGlobalGST(true)}
              >
                <View style={[styles.radioOuter, useGlobalGST && styles.radioOuterSelected]}>
                  {useGlobalGST && <View style={styles.radioInner} />}
                </View>
                <View style={styles.gstTextContainer}>
                  <Text style={styles.gstTitle}>Use Global GST</Text>
                  <Text style={styles.gstSubtitle}>Apply business-wide GST rate</Text>
                </View>
              </TouchableOpacity>

              {/* Set Item-level GST */}
              <TouchableOpacity
                style={[
                  styles.gstButton,
                  !useGlobalGST && styles.gstButtonSelected,
                ]}
                onPress={() => setUseGlobalGST(false)}
              >
                <View style={[styles.radioOuter, !useGlobalGST && styles.radioOuterSelected]}>
                  {!useGlobalGST && <View style={styles.radioInner} />}
                </View>
                <View style={styles.gstTextContainer}>
                  <Text style={styles.gstTitle}>Set Item-level GST</Text>
                  <Text style={styles.gstSubtitle}>Custom GST for this item only</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Footer - Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Add Item</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.6,
    borderBottomColor: '#E0E0E0',
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16.6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backArrow: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: '#C62828',
    letterSpacing: -0.45,
  },
  backText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#C62828',
    letterSpacing: -0.31,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 42,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
    marginTop: 12,
  },
  formContainer: {
    flex: 1,
    paddingTop: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 140,
  },
  fieldContainer: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: '#333333',
    letterSpacing: -0.15,
  },
  imageUploadContainer: {
    gap: 12,
  },
  imageUploadInner: {
    height: 192,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.8,
    borderColor: '#E0E0E0',
    borderRadius: 16.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#E0E0E0',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cameraTop: {
    width: 10,
    height: 2,
    backgroundColor: '#999999',
    position: 'absolute',
    top: 16,
  },
  cameraBody: {
    width: 18,
    height: 12,
    borderWidth: 2,
    borderColor: '#999999',
    borderRadius: 2,
    position: 'absolute',
    top: 22,
  },
  cameraLens: {
    width: 6,
    height: 6,
    borderWidth: 2,
    borderColor: '#999999',
    borderRadius: 3,
    position: 'absolute',
    top: 25,
  },
  uploadText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#333333',
    letterSpacing: -0.31,
    textAlign: 'center',
  },
  browseText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#999999',
    letterSpacing: -0.31,
    textAlign: 'center',
    marginTop: 8,
  },
  urlInput: {
    height: 49.2,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: -0.31,
    color: '#333333',
  },
  textInput: {
    height: 49.2,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: -0.31,
    color: '#333333',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 49.2,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingLeft: 16,
  },
  rupeeSymbol: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#333333',
    letterSpacing: -0.31,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: -0.31,
    color: '#333333',
    paddingRight: 16,
  },
  dropdown: {
    height: 49.2,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: -0.31,
    color: '#333333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#999999',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.6,
    borderBottomColor: '#F5F5F5',
  },
  dropdownItemText: {
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: -0.31,
    color: '#333333',
  },
  gstContainer: {
    gap: 12,
  },
  gstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    height: 73.2,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    borderRadius: 10,
  },
  gstButtonSelected: {
    backgroundColor: '#FFF5F5',
    borderColor: '#C62828',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#C62828',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C62828',
  },
  gstTextContainer: {
    flex: 1,
  },
  gstTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#333333',
    letterSpacing: -0.31,
  },
  gstSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#999999',
    letterSpacing: -0.31,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.6,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingTop: 16.6,
    paddingBottom: 32,
  },
  saveButton: {
    height: 52,
    backgroundColor: '#C62828',
    borderRadius: 16.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.31,
  },
});

export default AddItemScreen;