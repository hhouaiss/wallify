import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActionSheetIOS,
    Animated,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Grocery item interface
interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  priority: 'normal' | 'urgent';
  notes?: string;
}

// Predefined categories with emojis and colors
const GROCERY_CATEGORIES = [
  { name: 'Fruits & Vegetables', emoji: '🥬', color: '#34C759', lightColor: '#E8F8EA' },
  { name: 'Meat & Seafood', emoji: '🥩', color: '#FF3B30', lightColor: '#FFE8E7' },
  { name: 'Dairy & Eggs', emoji: '🥛', color: '#007AFF', lightColor: '#E3F2FF' },
  { name: 'Bakery', emoji: '🍞', color: '#FF9500', lightColor: '#FFF2E0' },
  { name: 'Pantry & Canned', emoji: '🥫', color: '#5856D6', lightColor: '#EFEEFD' },
  { name: 'Frozen', emoji: '🧊', color: '#32D74B', lightColor: '#E8F8EA' },
  { name: 'Beverages', emoji: '🥤', color: '#FF2D92', lightColor: '#FFE3F1' },
  { name: 'Snacks', emoji: '🍿', color: '#AF52DE', lightColor: '#F3E8FF' },
  { name: 'Health & Beauty', emoji: '🧴', color: '#00C7BE', lightColor: '#E0FAF9' },
  { name: 'Household', emoji: '🧽', color: '#8E8E93', lightColor: '#F2F2F7' },
];

// Common quantities
const QUANTITIES = ['1', '2', '3', '4', '5', '1 lb', '2 lbs', '1 kg', '1 pack', '1 box', '1 bottle', '1 bag'];

// Get current date info
const getCurrentDateInfo = () => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return {
    dayFull: days[now.getDay()],
    day: days[now.getDay()].substring(0, 3),
    date: now.getDate(),
    month: months[now.getMonth()],
    year: now.getFullYear()
  };
};

export default function GroceryScreen(): React.ReactElement {
  const [itemName, setItemName] = useState<string>('');
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [selectedQuantity, setSelectedQuantity] = useState<string>('1');
  const [selectedCategory, setSelectedCategory] = useState<string>('Fruits & Vegetables');
  const [selectedPriority, setSelectedPriority] = useState<'normal' | 'urgent'>('normal');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [itemNotes, setItemNotes] = useState<string>('');
  
  const router = useRouter();
  const dateInfo = getCurrentDateInfo();

  const checkedCount = groceryList.filter(item => item.checked).length;
  const totalCost = groceryList.length * 3.5; // Mock calculation
  const progressPercentage = groceryList.length > 0 ? (checkedCount / groceryList.length) * 100 : 0;

  // Add a new grocery item
  const addGroceryItem = (): void => {
    if (itemName.trim()) {
      const newItem: GroceryItem = {
        id: Date.now().toString(),
        name: itemName.trim(),
        quantity: selectedQuantity,
        category: selectedCategory,
        checked: false,
        priority: selectedPriority,
        notes: itemNotes.trim() || undefined
      };
      
      setGroceryList([...groceryList, newItem]);
      resetForm();
    }
  };

  const resetForm = (): void => {
    setItemName('');
    setSelectedQuantity('1');
    setSelectedCategory('Fruits & Vegetables');
    setSelectedPriority('normal');
    setItemNotes('');
    setShowAddModal(false);
  };

  // Show action sheet for item options
  const showItemOptions = (item: GroceryItem): void => {
    const options = ['Edit', 'Duplicate', 'Delete', 'Cancel'];
    const destructiveButtonIndex = 2;
    const cancelButtonIndex = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
          title: item.name
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0: // Edit
              editGroceryItem(item);
              break;
            case 1: // Duplicate
              duplicateGroceryItem(item);
              break;
            case 2: // Delete
              deleteGroceryItem(item.id);
              break;
          }
        }
      );
    }
  };

  const editGroceryItem = (item: GroceryItem): void => {
    setItemName(item.name);
    setSelectedQuantity(item.quantity);
    setSelectedCategory(item.category);
    setSelectedPriority(item.priority);
    setItemNotes(item.notes || '');
    setGroceryList(groceryList.filter(i => i.id !== item.id));
    setShowAddModal(true);
  };

  const duplicateGroceryItem = (item: GroceryItem): void => {
    const duplicatedItem: GroceryItem = {
      ...item,
      id: Date.now().toString(),
      name: `${item.name} (Copy)`
    };
    setGroceryList([...groceryList, duplicatedItem]);
  };

  const deleteGroceryItem = (id: string): void => {
    setGroceryList(groceryList.filter(item => item.id !== id));
  };

  // Toggle item completion
  const toggleItemCompletion = (id: string): void => {
    setGroceryList(groceryList.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // Navigate to preview
  const navigateToPreview = (): void => {
    router.push({
      pathname: '/grocery-preview',
      params: { groceryList: JSON.stringify(groceryList) }
    });
  };

  // Get category info by name
  const getCategoryInfo = (categoryName: string) => {
    return GROCERY_CATEGORIES.find(cat => cat.name === categoryName) || GROCERY_CATEGORIES[0];
  };

  // Group items by category
  const groupedItems = groceryList.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, GroceryItem[]>);

  const renderGroceryItem = ({ item }: { item: GroceryItem }) => {
    const categoryInfo = getCategoryInfo(item.category);
    
    return (
      <Animated.View style={[styles.groceryItemWrapper, { opacity: item.checked ? 0.6 : 1 }]}>
        <View style={[
          styles.groceryItem,
          item.checked && styles.checkedGroceryItem,
          item.priority === 'urgent' && styles.urgentGroceryItem
        ]}>
          {/* Left section with completion */}
          <TouchableOpacity 
            style={styles.leftSection}
            onPress={() => toggleItemCompletion(item.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.completionIndicator,
              item.checked && styles.checkedIndicator
            ]}>
              {item.checked && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          {/* Main content */}
          <View style={styles.mainSection}>
            <View style={styles.itemHeader}>
              <Text style={[
                styles.itemName,
                item.checked && styles.checkedItemName
              ]}>
                {item.name}
              </Text>
              {item.priority === 'urgent' && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>!</Text>
                </View>
              )}
            </View>
            
            <View style={styles.itemMeta}>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
              </View>
              
              <View style={[styles.categoryTag, { backgroundColor: categoryInfo.lightColor }]}>
                <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
                <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                  {categoryInfo.name}
                </Text>
              </View>
            </View>
            
            {item.notes && (
              <Text style={styles.itemNotes} numberOfLines={1}>
                💭 {item.notes}
              </Text>
            )}
          </View>

          {/* Right section with menu */}
          <View style={styles.rightSection}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => showItemOptions(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.menuDots}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderCategorySection = (categoryName: string, items: GroceryItem[]) => {
    const categoryInfo = getCategoryInfo(categoryName);
    const checkedInCategory = items.filter(item => item.checked).length;
    
    return (
      <View key={categoryName} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
            <Text style={styles.categoryTitle}>{categoryName}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.lightColor }]}>
              <Text style={[styles.categoryBadgeText, { color: categoryInfo.color }]}>
                {checkedInCategory}/{items.length}
              </Text>
            </View>
          </View>
        </View>
        
        {items.map((item) => (
          <View key={item.id}>
            {renderGroceryItem({ item })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grocery List</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{groceryList.length}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{checkedCount}</Text>
            <Text style={styles.statLabel}>Collected</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>${totalCost.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Est. Total</Text>
          </View>
        </View>
        
        {groceryList.length > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progressPercentage)}% collected
            </Text>
          </View>
        )}
      </View>

      {/* Quick add button */}
      <TouchableOpacity 
        style={styles.quickAddButton}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#34C759', '#30B455']}
          style={styles.quickAddGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.plusIcon}>+</Text>
          <Text style={styles.quickAddText}>Add grocery item</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Grocery List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={groceryList.length === 0 ? styles.emptyScrollContainer : styles.scrollContainer}
      >
        {groceryList.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyEmoji}>🛒</Text>
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add items to start building your shopping list
            </Text>
          </View>
        ) : (
          Object.entries(groupedItems).map(([categoryName, items]) =>
            renderCategorySection(categoryName, items)
          )
        )}
      </ScrollView>

      {/* Generate wallpaper button */}
      {groceryList.length > 0 && (
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={navigateToPreview}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#007AFF', '#5856D6']}
            style={styles.generateGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.generateIcon}>✨</Text>
            <Text style={styles.generateButtonText}>Create Shopping Wallpaper</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <BlurView intensity={100} style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={resetForm} style={styles.headerButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity 
              onPress={addGroceryItem} 
              style={[styles.headerButton, !itemName.trim() && styles.disabledButton]}
              disabled={!itemName.trim()}
            >
              <Text style={[styles.saveText, !itemName.trim() && styles.disabledText]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Item input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Item name</Text>
              <TextInput
                style={styles.itemInput}
                value={itemName}
                onChangeText={setItemName}
                placeholder="What do you need to buy?"
                placeholderTextColor="#8E8E93"
                autoFocus
                maxLength={50}
                returnKeyType="done"
              />
            </View>

            {/* Quantity selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityGrid}>
                {QUANTITIES.map((qty) => (
                  <TouchableOpacity
                    key={qty}
                    style={[
                      styles.quantityOption,
                      selectedQuantity === qty && styles.selectedQuantityOption
                    ]}
                    onPress={() => setSelectedQuantity(qty)}
                  >
                    <Text style={[
                      styles.quantityOptionText,
                      selectedQuantity === qty && styles.selectedQuantityOptionText
                    ]}>
                      {qty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryGrid}>
                {GROCERY_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category.name && [
                        styles.selectedCategoryOption,
                        { backgroundColor: category.lightColor, borderColor: category.color }
                      ]
                    ]}
                    onPress={() => setSelectedCategory(category.name)}
                  >
                    <Text style={styles.categoryOptionEmoji}>{category.emoji}</Text>
                    <Text style={[
                      styles.categoryOptionText,
                      selectedCategory === category.name && { color: category.color }
                    ]} numberOfLines={2}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.priorityContainer}>
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    selectedPriority === 'normal' && styles.selectedPriorityOption
                  ]}
                  onPress={() => setSelectedPriority('normal')}
                >
                  <Text style={styles.priorityEmoji}>📝</Text>
                  <Text style={[
                    styles.priorityText,
                    selectedPriority === 'normal' && styles.selectedPriorityText
                  ]}>
                    Normal
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    selectedPriority === 'urgent' && styles.selectedPriorityOption
                  ]}
                  onPress={() => setSelectedPriority('urgent')}
                >
                  <Text style={styles.priorityEmoji}>⚡</Text>
                  <Text style={[
                    styles.priorityText,
                    selectedPriority === 'urgent' && styles.selectedPriorityText
                  ]}>
                    Urgent
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <View style={[styles.section, styles.lastSection]}>
              <Text style={styles.sectionTitle}>Notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={itemNotes}
                onChangeText={setItemNotes}
                placeholder="Any special notes..."
                placeholderTextColor="#8E8E93"
                multiline
                maxLength={100}
              />
            </View>
          </ScrollView>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 60, // Balance the header
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1C1C1E',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
  },
  quickAddButton: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  quickAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  plusIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  quickAddText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  emptyScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    marginBottom: 16,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  groceryItemWrapper: {
    marginBottom: 12,
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  checkedGroceryItem: {
    backgroundColor: '#0A1F0A',
    borderColor: '#34C759',
  },
  urgentGroceryItem: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  leftSection: {
    marginRight: 12,
    paddingTop: 2,
  },
  completionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkedIndicator: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainSection: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  checkedItemName: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  urgentBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  quantityContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quantityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemNotes: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 4,
  },
  rightSection: {
    marginLeft: 12,
    paddingTop: 2,
  },
  menuButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDots: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  generateButton: {
    position: 'absolute',
    bottom: 34,
    left: 24,
    right: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  generateIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  saveText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#666666',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  section: {
    marginBottom: 32,
  },
  lastSection: {
    marginBottom: 60,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  quantityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quantityOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 60,
    alignItems: 'center',
  },
  selectedQuantityOption: {
    borderColor: '#34C759',
    backgroundColor: '#34C75920',
  },
  quantityOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedQuantityOptionText: {
    color: '#34C759',
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryOption: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
    flex: 1,
    maxWidth: '48%',
  },
  selectedCategoryOption: {
    borderWidth: 2,
  },
  categoryOptionEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  categoryOptionText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPriorityOption: {
    borderColor: '#34C759',
    backgroundColor: '#34C75920',
  },
  priorityEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  priorityText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedPriorityText: {
    color: '#34C759',
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'transparent',
  },
});