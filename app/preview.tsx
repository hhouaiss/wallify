import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ViewShot from 'react-native-view-shot';

// Todo item interface to match the main screen
interface TodoItem {
  id: string;
  text: string;
  time: string;
  tags: string[];
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  emoji?: string;
}

// Define constants for iPhone 13 dimensions - exact pixel dimensions for perfect fit
const IPHONE_13_WIDTH = 1170;
const IPHONE_13_HEIGHT = 2532;
const screenWidth = Dimensions.get('window').width;
// Calculate height to maintain exact iPhone 13 aspect ratio
const previewHeight = screenWidth * (IPHONE_13_HEIGHT / IPHONE_13_WIDTH);

// Custom filename for the generated wallpaper
const WALLPAPER_FILENAME = "wallify-todo.png";

export default function ImagePreviewScreen(): React.ReactElement {
  const params = useLocalSearchParams();
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [imageSaved, setImageSaved] = useState<boolean>(false);
  const [selectedBackground, setSelectedBackground] = useState<number>(0);
  const viewShotRef = useRef<ViewShot>(null);

  // Background color options
  const backgroundOptions = [
    {
      name: 'Midnight',
      colors: ['#000000', '#1a1a2e', '#16213e'],
      preview: '#000000'
    },
    {
      name: 'Ocean',
      colors: ['#0f0c29', '#302b63', '#24243e'],
      preview: '#1e3c72'
    },
    {
      name: 'Sunset',
      colors: ['#2d1b69', '#11998e', '#38ef7d'],
      preview: '#fc466b'
    }
  ];

  // Parse the todo list from URL params when component mounts
  useEffect(() => {
    if (params.todoList && typeof params.todoList === 'string') {
      try {
        const parsedTodos = JSON.parse(params.todoList);
        // Handle both old format (array of strings) and new format (array of objects)
        if (Array.isArray(parsedTodos)) {
          if (parsedTodos.length > 0 && typeof parsedTodos[0] === 'string') {
            // Old format - convert to new format
            const convertedTodos: TodoItem[] = parsedTodos.map((text: string, index: number) => ({
              id: `${index}`,
              text,
              time: `${(8 + index).toString().padStart(2, '0')}:00`,
              tags: [],
              completed: false,
              priority: 'medium' as const,
              emoji: undefined
            }));
            setTodoList(convertedTodos);
          } else {
            // New format - use as is
            setTodoList(parsedTodos);
          }
        }
      } catch (e) {
        console.error('Error parsing todo list:', e);
      }
    }
  }, [params.todoList]);

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

  // Run the Wallify shortcut to set the wallpaper
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

  // Save the image and run the Wallify shortcut
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

  return (
    <SafeAreaView style={styles.container}>
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
          {/* iOS Widget Container */}
          <View style={styles.widgetContainer}>
            {/* Widget Background with iOS-style blur and materials */}
            <View style={styles.widgetBackground}>
              {/* Widget Header */}
              <View style={styles.widgetHeader}>
                <View style={styles.headerLeft}>
                  <View style={styles.appIconContainer}>
                    <Text style={styles.appIcon}>✓</Text>
                  </View>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.widgetTitle}>Tasks</Text>
                    <Text style={styles.widgetSubtitle}>{getCurrentDate()}</Text>
                  </View>
                </View>
                <View style={styles.moreButton}>
                  <Text style={styles.moreButtonText}>•••</Text>
                </View>
              </View>

              {/* Widget Content */}
              <View style={styles.widgetContent}>
                {todoList.slice(0, 4).map((item, index) => (
                  <View key={item.id || index} style={styles.taskItem}>
                    <View style={styles.taskCheckbox}>
                      <View style={[
                        styles.checkboxInner,
                        item.completed ? styles.completedCheckbox : styles.uncompletedCheckbox
                      ]}>
                        {item.completed ? (
                          <Text style={styles.checkboxCheck}>✓</Text>
                        ) : (
                          <View style={styles.emptyCheckbox} />
                        )}
                      </View>
                    </View>
                    <View style={styles.taskContent}>
                      <View style={styles.taskMainContent}>
                        {item.emoji && (
                          <Text style={styles.taskEmoji}>{item.emoji}</Text>
                        )}
                        <Text 
                          style={[
                            styles.taskText, 
                            item.completed && styles.completedTaskText
                          ]} 
                          numberOfLines={1}
                        >
                          {item.text}
                        </Text>
                      </View>
                      <Text style={[
                        styles.taskTime,
                        item.completed && styles.completedTaskTime
                      ]}>
                        {item.time}
                      </Text>
                    </View>
                  </View>
                ))}
                
                {/* Show more indicator if there are more than 4 items */}
                {todoList.length > 4 && (
                  <View style={styles.moreItemsIndicator}>
                    <Text style={styles.moreItemsText}>
                      +{todoList.length - 4} more tasks
                    </Text>
                  </View>
                )}
              </View>

              {/* Widget Footer */}
              <View style={styles.widgetFooter}>
                <Text style={styles.footerText}>
                  {todoList.length} {todoList.length === 1 ? 'task' : 'tasks'} today
                  {todoList.filter(t => t.completed).length > 0 && 
                    ` • ${todoList.filter(t => t.completed).length} completed`
                  }
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ViewShot>

      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        {/* Color Selection Cards */}
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
        <TouchableOpacity 
          style={[styles.saveButton, imageSaved && styles.savedButton]} 
          onPress={saveAndApplyWallpaper}
          disabled={imageSaved}
        >
          <LinearGradient
            colors={imageSaved ? ['#34C759', '#30B455'] : ['#007AFF', '#5856D6']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {imageSaved ? '✓ Wallpaper Applied' : 'Turn to Wallpaper'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
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
    top: '38%', // Positioned like a medium iOS widget
    left: '6%',
    right: '6%',
    width: '88%',
  },
  widgetBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20, // iOS widget corner radius
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
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  appIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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
  widgetContent: {
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 2,
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheckbox: {
    backgroundColor: '#34C759',
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
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emptyCheckbox: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  taskText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
    flex: 1,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  taskTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
    marginLeft: 8,
  },
  completedTaskTime: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  moreItemsIndicator: {
    paddingTop: 6,
    paddingLeft: 32,
  },
  moreItemsText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  colorSelectionContainer: {
    width: '90%',
    marginTop: 20,
    marginBottom: 10,
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
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0,122,255,0.1)',
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
    backgroundColor: '#007AFF',
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
  buttonsContainer: {
    width: '90%',
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  saveButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    marginTop: 15,
    shadowColor: '#007AFF',
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
    fontSize: 18,
    fontWeight: '600',
  },
});