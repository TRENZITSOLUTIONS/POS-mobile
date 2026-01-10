import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/business.types';
import Icon from 'react-native-vector-icons/Ionicons';
import { getItems, getCategories } from '../services/storage';

type BillingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Billing'>;
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  categoryId: string;
  image?: string;
};

type CartItem = MenuItem & {
  quantity: number;
};

const MEAL_TIMES = ['Morning', 'Lunch', 'Evening', 'Dinner'];

const BillingScreen: React.FC<BillingScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealTime, setSelectedMealTime] = useState('Morning');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Array<{id: string; name: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const searchTranslateY = useRef(new Animated.Value(20)).current;
  const filtersOpacity = useRef(new Animated.Value(0)).current;
  const filtersTranslateX = useRef(new Animated.Value(-20)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      startAnimations();
    }
  }, [isLoading]);

  const loadData = async () => {
    try {
      // Load categories
      const categoriesData = await getCategories();
      setCategories(categoriesData);

      // Load items
      const itemsData = await getItems();
      
      // Map items with category names
      const mappedItems = itemsData.map(item => {
        // Get category name from first category (assuming single category per item for POS)
        const categoryId = item.category_ids?.[0] || '';
        const category = categoriesData.find(cat => cat.id === categoryId);
        
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          category: category?.name || 'Uncategorized',
          categoryId: categoryId,
          image: item.image_url,
        };
      });

      setMenuItems(mappedItems);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startAnimations = () => {
    // Header animation
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(headerTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Search animation
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(searchOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(searchTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Filters animation
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(filtersOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(filtersTranslateX, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Content animation
    Animated.sequence([
      Animated.delay(550),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map(cartItem =>
          cartItem.id === item.id
            ? {...cartItem, quantity: cartItem.quantity + 1}
            : cartItem
        )
      );
    } else {
      setCart([...cart, {...item, quantity: 1}]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map(cartItem =>
          cartItem.id === itemId
            ? {...cartItem, quantity: cartItem.quantity - 1}
            : cartItem
        )
      );
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const getItemQuantity = (itemId: string) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout', {cart});
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Get unique category names for filter buttons
  const getCategoryFilters = () => {
    const uniqueCategories = Array.from(new Set(menuItems.map(item => item.category)));
    return ['All Items', ...uniqueCategories];
  };

  // Filter items based on search and category
  const getFilteredItems = () => {
    return menuItems
      .filter(item => 
        selectedCategory === 'All Items' || item.category === selectedCategory
      )
      .filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  const filteredItems = getFilteredItems();
  const categoryFilters = getCategoryFilters();

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{translateY: headerTranslateY}],
          },
        ]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Billing</Text>
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: searchOpacity,
              transform: [{translateY: searchTranslateY}],
            },
          ]}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search item (e.g., Dosa, Tea)"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        {/* Meal Time Filters */}
        <Animated.View
          style={[
            styles.filtersContainer,
            {
              opacity: filtersOpacity,
              transform: [{translateX: filtersTranslateX}],
            },
          ]}>
          <View style={styles.filtersInner}>
            {MEAL_TIMES.map(time => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.filterButton,
                  selectedMealTime === time && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedMealTime(time)}>
                <Text
                  style={[
                    styles.filterText,
                    selectedMealTime === time && styles.filterTextActive,
                  ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Popular Items Section */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: contentOpacity,
              transform: [{translateY: contentTranslateY}],
            },
          ]}>
          <Text style={styles.sectionTitle}>Popular Items</Text>
          {menuItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items available</Text>
              <Text style={styles.emptySubtext}>Add items to get started</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularItemsScroll}>
              {menuItems.slice(0, 5).map(item => {
                const quantity = getItemQuantity(item.id);
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.popularItemCard}
                    onPress={() => quantity === 0 && addToCart(item)}
                    activeOpacity={quantity > 0 ? 1 : 0.7}>
                    <View style={styles.itemImageContainer}>
                      <Icon name="restaurant-outline" size={40} color="#C62828" />
                    </View>
                    <Text style={styles.popularItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.popularItemPrice}>₹{item.price.toFixed(2)}</Text>
                    {quantity === 0 ? (
                      <View style={styles.addButtonSmall}>
                        <Text style={styles.addButtonSmallText}>Add</Text>
                      </View>
                    ) : (
                      <View style={styles.quantityControlSmall}>
                        <TouchableOpacity
                          style={styles.quantityButtonSmall}
                          onPress={() => removeFromCart(item.id)}>
                          <Text style={styles.quantityButtonTextSmall}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityTextSmall}>{quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButtonSmall}
                          onPress={() => addToCart(item)}>
                          <Text style={styles.quantityButtonTextSmall}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </Animated.View>

        {/* Category Filters */}
        <Animated.View
          style={[
            styles.categoryContainer,
            {opacity: contentOpacity},
          ]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categoryFilters.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* All Items Section */}
        <Animated.View
          style={[
            styles.allItemsContainer,
            {opacity: contentOpacity},
          ]}>
          <Text style={styles.sectionTitle}>All Items</Text>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubtext}>Try a different search or category</Text>
            </View>
          ) : (
            <View style={styles.allItemsGrid}>
              {filteredItems.map(item => {
                const quantity = getItemQuantity(item.id);
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.allItemCard}
                    onPress={() => quantity === 0 && addToCart(item)}
                    activeOpacity={quantity > 0 ? 1 : 0.7}>
                    <View style={styles.itemImageContainer}>
                      <Icon name="restaurant-outline" size={40} color="#C62828" />
                    </View>
                    <Text style={styles.allItemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.allItemPrice}>₹{item.price.toFixed(2)}</Text>
                    {quantity === 0 ? (
                      <View style={styles.addButtonSmall}>
                        <Text style={styles.addButtonSmallText}>Add</Text>
                      </View>
                    ) : (
                      <View style={styles.quantityControlSmall}>
                        <TouchableOpacity
                          style={styles.quantityButtonSmall}
                          onPress={() => removeFromCart(item.id)}>
                          <Text style={styles.quantityButtonTextSmall}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityTextSmall}>{quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButtonSmall}
                          onPress={() => addToCart(item)}>
                          <Text style={styles.quantityButtonTextSmall}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <Animated.View style={styles.cartFooter}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItems}>Items: {getTotalItems()}</Text>
            <Text style={styles.cartTotal}>Total: ₹{getTotalAmount().toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
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
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#C62828',
    fontWeight: '600',
    letterSpacing: -0.31,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.38,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16.4,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1.8,
    borderColor: '#E0E0E0',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  filtersInner: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderRadius: 6.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#C62828',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    letterSpacing: -0.31,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    letterSpacing: -0.26,
  },
  popularItemsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  popularItemCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    padding: 12.6,
    paddingBottom: 0.6,
  },
  itemImageContainer: {
    width: '100%',
    height: 112,
    backgroundColor: '#F5F5F5',
    borderRadius: 6.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  popularItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    letterSpacing: -0.44,
  },
  popularItemPrice: {
    fontSize: 16,
    fontWeight: '400',
    color: '#C62828',
    letterSpacing: -0.31,
    marginBottom: 12,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#C62828',
    borderColor: '#C62828',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    letterSpacing: -0.31,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  allItemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  allItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  allItemCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 0.6,
    borderColor: '#E0E0E0',
    padding: 12.6,
    paddingBottom: 0.6,
  },
  allItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    letterSpacing: -0.44,
  },
  allItemPrice: {
    fontSize: 16,
    fontWeight: '400',
    color: '#C62828',
    letterSpacing: -0.31,
    marginBottom: 8,
  },
  addButtonSmall: {
    backgroundColor: '#C62828',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonSmallText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quantityControlSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 4,
    marginTop: 4,
  },
  quantityButtonSmall: {
    width: 24,
    height: 24,
    backgroundColor: '#C62828',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonTextSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quantityTextSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  cartInfo: {
    flex: 1,
  },
  cartItems: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  checkoutButton: {
    backgroundColor: '#C62828',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BillingScreen;