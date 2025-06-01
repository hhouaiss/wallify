import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ViewShot from 'react-native-view-shot';

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

// Define constants for iPhone 13 dimensions
const IPHONE_13_WIDTH = 1170;
const IPHONE_13_HEIGHT = 2532;
const screenWidth = Dimensions.get('window').width;
const previewHeight = screenWidth * (IPHONE_13_HEIGHT / IPHONE_13_WIDTH);

// Custom filename for the generated wallpaper
const WALLPAPER_FILENAME = "wallify-grocery.png";

// Category configurations
const GROCERY_CATEGORIES = [
  { name: 'Fruits & Vegetables', emoji: '🥬', color: '#34C759' },
  { name: 'Meat & Seafood', emoji: '🥩', color: '#FF3B30' },
  { name: 'Dairy & Eggs', emoji: '🥛', color: '#007AFF' },
  { name: 'Bakery', emoji: '🍞', color: '#FF9500' },
  { name: 'Pantry & Canned', emoji: '🥫', color: '#5856D6' },
  { name: 'Frozen', emoji: '🧊', color: '#32D74B' },
  { name: 'Beverages', emoji: '🥤', color: '#FF2D92' },
  { name: 'Snacks', emoji: '🍿', color: '#AF52DE' },
  { name: 'Health & Beauty', emoji: '🧴', color: '#00C7BE' },
  { name: 'Household', emoji: '🧽', color: '#8E8E93' },
];

export default function GroceryPreviewScreen(): React.ReactElement {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [imageSaved, setImageSaved] = useState<boolean>(false);
  const [selectedBackground, setSelectedBackground] = useState<number>(0);
  const viewShotRef = useRef<ViewShot>(null);

  // Background color options - shopping themed
  const backgroundOptions = [
    {
      name: 'Market',
      colors: ['#1a5f3f', '#2d8f57', '#34C759'],
      preview: '#34C759'
    },
    {
      name: 'Fresh',
      colors: ['#0f4c75', '#3282b8', '#007AFF'],
      preview: '#007AFF'
    },
    {
      name: 'Organic',
      colors: ['#6b4226', '#a0522d', '#CD853F'],
      preview: '#CD853F'
    }
  ];

  // Parse the grocery list from URL params
  useEffect(() => {
    if (params.groceryList && typeof params.groceryList === 'string') {
      try {
        const parsedGroceries = JSON.parse(params.groceryList);
        setGroceryList(parsedGroceries);
      } catch (e) {
        console.error('Error parsing grocery list:', e);
      }
    }
  }, [params.groceryList]);

  // Get current date formatted like iOS
  const getCurrentDate = (): string => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
  };

  // Get category info by name
  const getCategoryInfo = (categoryName: string) => {
    return GROCERY_CATEGORIES.find(cat => cat.name === categoryName) || GROCERY_CATEGORIES[0];
  };

  // Calculate shopping stats
  const totalItems = groceryList.length;
  const checkedItems = groceryList.filter(item => item.checked).length;
  const urgentItems = groceryList.filter(item => item.priority === 'urgent' && !item.checked).length;

  // Run the Wallify shortcut
  const runWallifyShortcut = (): void => {
    const shortcutURL = 'shortcuts://run-shortcut?name=Wallify';
    
    Linking.canOpenURL(shortcutURL).then(supported => {
      if (supported) {
        Linking.openURL(shortcutURL);
      } else {
        Alert.alert(
          'Shortcut Not Found',
          'The "Wallify" shortcut is not installed on your device. Would you like to create it?',
          [
            {
              text: 'Create Shortcut',
              onPress: () => Linking.openURL('https://www.icloud.com/shortcuts/123456789abc')
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    }).catch(err => {
      console.error('Error checking shortcut URL:', err);
    });
  };

  // Save and apply wallpaper
  const saveAndApplyWallpaper = async (): Promise<void> => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status === 'granted') {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          
          const fileUri = `${FileSystem.cacheDirectory}${WALLPAPER_FILENAME}`;
          await FileSystem.copyAsync({
            from: uri,
            to: fileUri
          });
          
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          
          const album = await MediaLibrary.getAlbumAsync('Wallify');
          if (album === null) {
            await MediaLibrary.createAlbumAsync('Wallify', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
            
            const assetsInAlbum = await MediaLibrary.getAssetsAsync({
              album: album,
              sortBy: [['creationTime', false]]
            });
            
            if (assetsInAlbum.assets.length > 5) {
              const assetsToDelete = assetsInAlbum.assets.slice(5);
              
              for (const assetToDelete of assetsToDelete) {
                await MediaLibrary.deleteAssetsAsync([assetToDelete]);
              }
            }
          }
          
          setImageSaved(true);
          
          setTimeout(() => {
            runWallifyShortcut();
          }, 500);
        }
      } else {
        Alert.alert(
          'Permission Required',
          'Please grant permission to save images to your photo library.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  // Add this helper function to determine if scrolling is needed
  const shouldEnableScroll = groceryList.length > 2;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Wallpaper</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Conditional ScrollView wrapper */}
      {shouldEnableScroll ? (
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ViewShot
            ref={viewShotRef}
            options={{
              format: 'png',
              quality: 1,
              width: IPHONE_13_WIDTH,
              height: IPHONE_13_HEIGHT,
            }}
            style={styles.previewContainer}
          >
            {/* Dynamic Background */}
            <LinearGradient
              colors={backgroundOptions[selectedBackground].colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dynamicBackground}
            >
              {/* Shopping Widget Container */}
              <View style={styles.widgetContainer}>
                {/* Widget Background */}
                <View style={styles.widgetBackground}>
                  {/* Widget Header */}
                  <View style={styles.widgetHeader}>
                    <View style={styles.headerLeft}>
                      <View style={styles.appIconContainer}>
                        <Text style={styles.appIcon}>🛒</Text>
                      </View>
                      <View style={styles.headerTextContainer}>
                        <Text style={styles.widgetTitle}>Shopping List</Text>
                        <Text style={styles.widgetSubtitle}>{getCurrentDate()}</Text>
                      </View>
                    </View>
                    <View style={styles.moreButton}>
                      <Text style={styles.moreButtonText}>•••</Text>
                    </View>
                  </View>

                  {/* Shopping Stats */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{totalItems}</Text>
                      <Text style={styles.statLabel}>Items</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{checkedItems}</Text>
                      <Text style={styles.statLabel}>Collected</Text>
                    </View>
                    {urgentItems > 0 && (
                      <>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                          <Text style={[styles.statNumber, styles.urgentNumber]}>
                            {urgentItems}
                          </Text>
                          <Text style={styles.statLabel}>Urgent</Text>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Shopping Items */}
                  <View style={styles.widgetContent}>
                    {groceryList.slice(0, 4).map((item, index) => {
                      const categoryInfo = getCategoryInfo(item.category);
                      return (
                        <View key={item.id || index} style={styles.shoppingItem}>
                          <View style={styles.itemCheckbox}>
                            <View style={[
                              styles.checkboxInner,
                              item.checked ? styles.completedCheckbox : styles.uncompletedCheckbox
                            ]}>
                              {item.checked ? (
                                <Text style={styles.checkboxCheck}>✓</Text>
                              ) : (
                                <View style={styles.emptyCheckbox} />
                              )}
                            </View>
                          </View>
                          
                          <View style={styles.itemContent}>
                            <View style={styles.itemMainContent}>
                              <Text style={styles.categoryEmoji}>
                                {categoryInfo.emoji}
                              </Text>
                              <Text 
                                style={[
                                  styles.itemText, 
                                  item.checked && styles.completedItemText
                                ]} 
                                numberOfLines={1}
                              >
                                {item.name}
                              </Text>
                              {item.priority === 'urgent' && !item.checked && (
                                <View style={styles.urgentIndicator}>
                                  <Text style={styles.urgentText}>!</Text>
                                </View>
                              )}
                            </View>
                            
                            <View style={styles.itemMeta}>
                              <Text style={[
                                styles.quantityText,
                                item.checked && styles.completedQuantityText
                              ]}>
                                Qty: {item.quantity}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                    
                    {/* Show more indicator */}
                    {groceryList.length > 4 && (
                      <View style={styles.moreItemsIndicator}>
                        <Text style={styles.moreItemsText}>
                          +{groceryList.length - 4} more items
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Widget Footer */}
                  <View style={styles.widgetFooter}>
                    <Text style={styles.footerText}>
                      {Math.round((checkedItems / Math.max(totalItems, 1)) * 100)}% collected
                      {urgentItems > 0 && ` • ${urgentItems} urgent`}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ViewShot>

          {/* Controls Section - now inside ScrollView */}
          <View style={styles.scrollableButtonsContainer}>
            {/* Background Selection */}
            <View style={styles.colorSelectionContainer}>
              <Text style={styles.sectionTitle}>Choose Background</Text>
              <View style={styles.colorCards}>
                {backgroundOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorCard,
                      selectedBackground === index && styles.selectedColorCard
                    ]}
                    onPress={() => setSelectedBackground(index)}
                  >
                    <LinearGradient
                      colors={option.colors}
                      style={styles.colorPreview}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <Text style={styles.colorName}>{option.name}</Text>
                    {selectedBackground === index && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={[styles.saveButton, imageSaved && styles.savedButton]} 
              onPress={saveAndApplyWallpaper}
              disabled={imageSaved}
            >
              <LinearGradient
                colors={imageSaved ? ['#34C759', '#30B455'] : ['#34C759', '#30B455']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  {imageSaved ? '✓ Shopping Wallpaper Applied' : '🛒 Create Shopping Wallpaper'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        // Non-scrollable version for 2 or fewer items
        <>
          <ViewShot
            ref={viewShotRef}
            options={{
              format: 'png',
              quality: 1,
              width: IPHONE_13_WIDTH,
              height: IPHONE_13_HEIGHT,
            }}
            style={styles.previewContainer}
          >
            <LinearGradient
              colors={backgroundOptions[selectedBackground].colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dynamicBackground}
            >
              <View style={styles.widgetContainer}>
                {/* Widget Background */}
                <View style={styles.widgetBackground}>
                  {/* Widget Header */}
                  <View style={styles.widgetHeader}>
                    <View style={styles.headerLeft}>
                      <View style={styles.appIconContainer}>
                        <Text style={styles.appIcon}>🛒</Text>
                      </View>
                      <View style={styles.headerTextContainer}>
                        <Text style={styles.widgetTitle}>Shopping List</Text>
                        <Text style={styles.widgetSubtitle}>{getCurrentDate()}</Text>
                      </View>
                    </View>
                    <View style={styles.moreButton}>
                      <Text style={styles.moreButtonText}>•••</Text>
                    </View>
                  </View>

                  {/* Shopping Stats */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{totalItems}</Text>
                      <Text style={styles.statLabel}>Items</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{checkedItems}</Text>
                      <Text style={styles.statLabel}>Collected</Text>
                    </View>
                    {urgentItems > 0 && (
                      <>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                          <Text style={[styles.statNumber, styles.urgentNumber]}>
                            {urgentItems}
                          </Text>
                          <Text style={styles.statLabel}>Urgent</Text>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Shopping Items */}
                  <View style={styles.widgetContent}>
                    {groceryList.slice(0, 4).map((item, index) => {
                      const categoryInfo = getCategoryInfo(item.category);
                      return (
                        <View key={item.id || index} style={styles.shoppingItem}>
                          <View style={styles.itemCheckbox}>
                            <View style={[
                              styles.checkboxInner,
                              item.checked ? styles.completedCheckbox : styles.uncompletedCheckbox
                            ]}>
                              {item.checked ? (
                                <Text style={styles.checkboxCheck}>✓</Text>
                              ) : (
                                <View style={styles.emptyCheckbox} />
                              )}
                            </View>
                          </View>
                          
                          <View style={styles.itemContent}>
                            <View style={styles.itemMainContent}>
                              <Text style={styles.categoryEmoji}>
                                {categoryInfo.emoji}
                              </Text>
                              <Text 
                                style={[
                                  styles.itemText, 
                                  item.checked && styles.completedItemText
                                ]} 
                                numberOfLines={1}
                              >
                                {item.name}
                              </Text>
                              {item.priority === 'urgent' && !item.checked && (
                                <View style={styles.urgentIndicator}>
                                  <Text style={styles.urgentText}>!</Text>
                                </View>
                              )}
                            </View>
                            
                            <View style={styles.itemMeta}>
                              <Text style={[
                                styles.quantityText,
                                item.checked && styles.completedQuantityText
                              ]}>
                                Qty: {item.quantity}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                    
                    {/* Show more indicator */}
                    {groceryList.length > 4 && (
                      <View style={styles.moreItemsIndicator}>
                        <Text style={styles.moreItemsText}>
                          +{groceryList.length - 4} more items
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Widget Footer */}
                  <View style={styles.widgetFooter}>
                    <Text style={styles.footerText}>
                      {Math.round((checkedItems / Math.max(totalItems, 1)) * 100)}% collected
                      {urgentItems > 0 && ` • ${urgentItems} urgent`}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ViewShot>

          {/* Controls Section - positioned absolutely for non-scroll mode */}
          <View style={styles.buttonsContainer}>
            {/* Background Selection */}
            <View style={styles.colorSelectionContainer}>
              <Text style={styles.sectionTitle}>Choose Background</Text>
              <View style={styles.colorCards}>
                {backgroundOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorCard,
                      selectedBackground === index && styles.selectedColorCard
                    ]}
                    onPress={() => setSelectedBackground(index)}
                  >
                    <LinearGradient
                      colors={option.colors}
                      style={styles.colorPreview}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <Text style={styles.colorName}>{option.name}</Text>
                    {selectedBackground === index && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={[styles.saveButton, imageSaved && styles.savedButton]} 
              onPress={saveAndApplyWallpaper}
              disabled={imageSaved}
            >
              <LinearGradient
                colors={imageSaved ? ['#34C759', '#30B455'] : ['#34C759', '#30B455']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>
                  {imageSaved ? '✓ Shopping Wallpaper Applied' : '🛒 Create Shopping Wallpaper'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
} // Remove the extra }; here

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'space-between',
    width: '100%',
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
    width: 60,
  },
  previewContainer: {
    width: screenWidth,
    height: previewHeight,
    position: 'relative',
  },
  dynamicBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  widgetContainer: {
    position: 'absolute',
    top: '35%',
    left: '6%',
    right: '6%',
    width: '88%',
  },
  widgetBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  appIcon: {
    fontSize: 14,
  },
  headerTextContainer: {
    flex: 1,
  },
  widgetTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  widgetSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 1,
  },
  moreButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  urgentNumber: {
    color: '#FF3B30',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  widgetContent: {
    marginBottom: 8,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 2,
  },
  itemCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxInner: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheckbox: {
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  uncompletedCheckbox: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  emptyCheckbox: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryEmoji: {
    fontSize: 12,
    marginRight: 6,
  },
  itemText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
  },
  completedItemText: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  urgentIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemMeta: {
    marginLeft: 18,
  },
  quantityText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '400',
  },
  completedQuantityText: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  moreItemsIndicator: {
    paddingTop: 6,
    paddingLeft: 28,
  },
  moreItemsText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  widgetFooter: {
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '90%',
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  colorSelectionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  colorCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  colorCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedColorCard: {
    borderColor: '#34C759',
    backgroundColor: 'rgba(52,199,89,0.1)',
  },
  colorPreview: {
    width: 60,
    height: 40,
    borderRadius: 8,
    marginBottom: 8,
  },
  colorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#34C759',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  savedButton: {
    shadowColor: '#34C759',
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});