import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Animated,
  Dimensions,
  FlatList,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Todo item interface
interface TodoItem {
  id: string;
  text: string;
  time: string;
  tags: string[];
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  emoji?: string;
}

// Predefined tags with better colors
const PREDEFINED_TAGS = [
  { name: 'Work', color: '#007AFF', emoji: '💼', lightColor: '#E3F2FF' },
  { name: 'Personal', color: '#34C759', emoji: '🏠', lightColor: '#E8F8EA' },
  { name: 'Health', color: '#FF3B30', emoji: '❤️', lightColor: '#FFE8E7' },
  { name: 'Learning', color: '#FF9500', emoji: '📚', lightColor: '#FFF2E0' },
  { name: 'Shopping', color: '#5856D6', emoji: '🛒', lightColor: '#EFEEFD' },
  { name: 'Travel', color: '#32D74B', emoji: '✈️', lightColor: '#E8F8EA' },
];

// Priority levels
const PRIORITY_LEVELS = [
  { level: 'low', color: '#8E8E93', emoji: '🔵', name: 'Low' },
  { level: 'medium', color: '#FF9500', emoji: '🟡', name: 'Medium' },
  { level: 'high', color: '#FF3B30', emoji: '🔴', name: 'High' },
];

// Quick time options
const QUICK_TIMES = ['09:00', '12:00', '15:00', '18:00', '20:00'];

// Get current date information
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

export default function TodoInputScreen(): React.ReactElement {
  const [todoText, setTodoText] = useState<string>('');
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [timePickerDate, setTimePickerDate] = useState<Date>(new Date());
  
  const router = useRouter();
  const dateInfo = getCurrentDateInfo();

  const completedCount = todoList.filter(t => t.completed).length;
  const progressPercentage = todoList.length > 0 ? (completedCount / todoList.length) * 100 : 0;

  // Add a new todo item
  const addTodoItem = (): void => {
    if (todoText.trim()) {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: todoText.trim(),
        time: selectedTime,
        tags: selectedTags,
        completed: false,
        priority: selectedPriority,
        emoji: selectedEmoji
      };
      
      setTodoList([...todoList, newTodo]);
      resetForm();
    }
  };

  const resetForm = (): void => {
    setTodoText('');
    setSelectedTags([]);
    setSelectedPriority('medium');
    setSelectedEmoji('');
    setShowAddModal(false);
    setShowTimePicker(false);
  };

  // Show action sheet for task options
  const showTaskOptions = (item: TodoItem): void => {
    const options = ['Edit', 'Duplicate', 'Delete', 'Cancel'];
    const destructiveButtonIndex = 2;
    const cancelButtonIndex = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
          title: item.text
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0: // Edit
              editTodoItem(item);
              break;
            case 1: // Duplicate
              duplicateTodoItem(item);
              break;
            case 2: // Delete
              deleteTodoItem(item.id);
              break;
          }
        }
      );
    }
  };

  const editTodoItem = (item: TodoItem): void => {
    setTodoText(item.text);
    setSelectedTime(item.time);
    setSelectedTags(item.tags);
    setSelectedPriority(item.priority);
    setSelectedEmoji(item.emoji || '');
    setTodoList(todoList.filter(t => t.id !== item.id));
    setShowAddModal(true);
  };

  const duplicateTodoItem = (item: TodoItem): void => {
    const duplicatedTodo: TodoItem = {
      ...item,
      id: Date.now().toString(),
      text: `${item.text} (Copy)`
    };
    setTodoList([...todoList, duplicatedTodo]);
  };

  const deleteTodoItem = (id: string): void => {
    setTodoList(todoList.filter(item => item.id !== id));
  };

  // Toggle todo completion
  const toggleTodoCompletion = (id: string): void => {
    setTodoList(todoList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // Handle time picker change
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedDate) {
      setTimePickerDate(selectedDate);
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
    }
  };

  const openTimePicker = () => {
    // Set initial time based on selectedTime
    const [hours, minutes] = selectedTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    setTimePickerDate(date);
    setShowTimePicker(true);
  };

  // Toggle tag selection
  const toggleTag = (tagName: string): void => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(tag => tag !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  // Navigate to preview
  const navigateToPreview = (): void => {
    router.push({
      pathname: '/preview',
      params: { todoList: JSON.stringify(todoList) }
    });
  };

  // Get tag info by name
  const getTagInfo = (tagName: string) => {
    return PREDEFINED_TAGS.find(tag => tag.name === tagName) || 
           { name: tagName, color: '#8E8E93', emoji: '🏷️', lightColor: '#F2F2F7' };
  };

  // Get priority info
  const getPriorityInfo = (priority: string) => {
    return PRIORITY_LEVELS.find(p => p.level === priority) || PRIORITY_LEVELS[1];
  };

  const renderTodoItem = ({ item, index }: { item: TodoItem; index: number }) => (
    <Animated.View style={[styles.todoItemWrapper, { opacity: item.completed ? 0.6 : 1 }]}>
      <View style={[
        styles.todoItem,
        item.completed && styles.completedTodoItem
      ]}>
        {/* Left section with completion and emoji */}
        <TouchableOpacity 
          style={styles.leftSection}
          onPress={() => toggleTodoCompletion(item.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.completionIndicator,
            item.completed && styles.completedIndicator,
            { borderColor: getPriorityInfo(item.priority).color }
          ]}>
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          {item.emoji && (
            <Text style={styles.taskEmoji}>{item.emoji}</Text>
          )}
        </TouchableOpacity>

        {/* Main content */}
        <View style={styles.mainSection}>
          <Text style={[
            styles.todoText,
            item.completed && styles.completedTodoText
          ]}>
            {item.text}
          </Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.timeText}>🕐 {item.time}</Text>
            {item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map((tagName, tagIndex) => {
                  const tagInfo = getTagInfo(tagName);
                  return (
                    <View key={tagIndex} style={[
                      styles.tag, 
                      { backgroundColor: tagInfo.lightColor }
                    ]}>
                      <Text style={styles.tagEmoji}>{tagInfo.emoji}</Text>
                      <Text style={[styles.tagText, { color: tagInfo.color }]}>
                        {tagInfo.name}
                      </Text>
                    </View>
                  );
                })}
                {item.tags.length > 2 && (
                  <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Right section with priority and menu */}
        <View style={styles.rightSection}>
          <Text style={styles.priorityEmoji}>
            {getPriorityInfo(item.priority).emoji}
          </Text>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => showTaskOptions(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.menuDots}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dateSection}>
          <Text style={styles.dayText}>{dateInfo.dayFull}</Text>
          <Text style={styles.dateText}>
            {dateInfo.month} {dateInfo.date}, {dateInfo.year}
          </Text>
        </View>
        
        {todoList.length > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completedCount}/{todoList.length} completed
            </Text>
          </View>
        )}
      </View>

      {/* Main title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Today's Tasks</Text>
        <Text style={styles.subtitle}>
          {todoList.length === 0 
            ? "Start building your perfect day" 
            : `${todoList.length} ${todoList.length === 1 ? 'task' : 'tasks'} planned`
          }
        </Text>
      </View>

      {/* Quick add button */}
      <TouchableOpacity 
        style={styles.quickAddButton}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#007AFF', '#5856D6']}
          style={styles.quickAddGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.plusIcon}>+</Text>
          <Text style={styles.quickAddText}>Add new task</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Todo List */}
      <FlatList
        style={styles.list}
        data={todoList}
        keyExtractor={(item) => item.id}
        renderItem={renderTodoItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={todoList.length === 0 ? styles.emptyListContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyEmoji}>📝</Text>
            </View>
            <Text style={styles.emptyTitle}>Ready to be productive?</Text>
            <Text style={styles.emptySubtitle}>
              Add your first task and start building your perfect day
            </Text>
          </View>
        }
      />

      {/* Generate button */}
      {todoList.length > 0 && (
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={navigateToPreview}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#34C759', '#30B455']}
            style={styles.generateGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.generateIcon}>✨</Text>
            <Text style={styles.generateButtonText}>Create Wallpaper</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Add Task Modal */}
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
            <Text style={styles.modalTitle}>New Task</Text>
            <TouchableOpacity 
              onPress={addTodoItem} 
              style={[styles.headerButton, !todoText.trim() && styles.disabledButton]}
              disabled={!todoText.trim()}
            >
              <Text style={[styles.saveText, !todoText.trim() && styles.disabledText]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Task input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.taskInput}
                value={todoText}
                onChangeText={setTodoText}
                placeholder="What needs to be done?"
                placeholderTextColor="#8E8E93"
                multiline={false}
                autoFocus
                maxLength={100}
                returnKeyType="done"
                onSubmitEditing={() => {}}
              />
              <Text style={styles.characterCount}>{todoText.length}/100</Text>
            </View>

            {/* Emoji picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add an emoji (optional)</Text>
              <View style={styles.emojiContainer}>
                {['📝', '💼', '🏃‍♂️', '🍔', '📚', '🎯', '💡', '🎉'].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      selectedEmoji === emoji && styles.selectedEmojiOption
                    ]}
                    onPress={() => setSelectedEmoji(selectedEmoji === emoji ? '' : emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time</Text>
              <TouchableOpacity 
                style={styles.timeSelector}
                onPress={openTimePicker}
              >
                <View style={styles.timeSelectorContent}>
                  <Text style={styles.timeSelectorIcon}>🕐</Text>
                  <Text style={styles.timeSelectorText}>{selectedTime}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              
              {/* Quick time options */}
              <View style={styles.quickTimeContainer}>
                <Text style={styles.quickTimeLabel}>Quick select:</Text>
                <View style={styles.quickTimeOptions}>
                  {QUICK_TIMES.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.quickTimeOption,
                        selectedTime === time && styles.selectedQuickTimeOption
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text style={[
                        styles.quickTimeOptionText,
                        selectedTime === time && styles.selectedQuickTimeOptionText
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Priority selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.priorityContainer}>
                {PRIORITY_LEVELS.map((priority) => (
                  <TouchableOpacity
                    key={priority.level}
                    style={[
                      styles.priorityOption,
                      selectedPriority === priority.level && styles.selectedPriorityOption
                    ]}
                    onPress={() => setSelectedPriority(priority.level)}
                  >
                    <Text style={styles.priorityEmoji}>{priority.emoji}</Text>
                    <Text style={[
                      styles.priorityText,
                      selectedPriority === priority.level && styles.selectedPriorityText
                    ]}>
                      {priority.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags selection */}
            <View style={[styles.section, styles.lastSection]}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsGrid}>
                {PREDEFINED_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag.name}
                    style={[
                      styles.tagOption,
                      selectedTags.includes(tag.name) && [
                        styles.selectedTagOption,
                        { backgroundColor: tag.lightColor, borderColor: tag.color }
                      ]
                    ]}
                    onPress={() => toggleTag(tag.name)}
                  >
                    <Text style={styles.tagOptionEmoji}>{tag.emoji}</Text>
                    <Text style={[
                      styles.tagOptionText,
                      selectedTags.includes(tag.name) && { color: tag.color }
                    ]}>
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          {/* Native Time Picker */}
          {showTimePicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showTimePicker}
              onRequestClose={() => setShowTimePicker(false)}
            >
              <View style={styles.timePickerOverlay}>
                <BlurView intensity={50} style={styles.timePickerBlur}>
                  <View style={styles.timePickerContainer}>
                    <View style={styles.timePickerHeader}>
                      <TouchableOpacity 
                        onPress={() => setShowTimePicker(false)}
                        style={styles.timePickerButton}
                      >
                        <Text style={styles.timePickerCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={styles.timePickerTitle}>Select Time</Text>
                      <TouchableOpacity 
                        onPress={() => setShowTimePicker(false)}
                        style={styles.timePickerButton}
                      >
                        <Text style={styles.timePickerDoneText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.timePickerContent}>
                      <DateTimePicker
                        value={timePickerDate}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleTimeChange}
                        style={styles.timePicker}
                        textColor="#FFFFFF"
                        themeVariant="dark"
                      />
                    </View>
                  </View>
                </BlurView>
              </View>
            </Modal>
          )}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dateSection: {
    marginBottom: 12,
  },
  dayText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressSection: {
    marginTop: 8,
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
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '400',
  },
  quickAddButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  quickAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  plusIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  quickAddText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  todoItemWrapper: {
    marginBottom: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  completedTodoItem: {
    backgroundColor: '#0A1F0A',
    borderColor: '#34C759',
  },
  leftSection: {
    alignItems: 'center',
    marginRight: 16,
  },
  completionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  completedIndicator: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskEmoji: {
    fontSize: 20,
  },
  mainSection: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 8,
    fontWeight: '500',
  },
  completedTodoText: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timeText: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'center',
    marginLeft: 12,
  },
  priorityEmoji: {
    fontSize: 16,
    marginBottom: 8,
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
    paddingHorizontal: 40,
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
    marginHorizontal: 24,
    marginBottom: 34,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#34C759',
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
    color: '#007AFF',
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
  taskInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    color: '#FFFFFF',
    fontSize: 16,
    height: 56,
    textAlignVertical: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  characterCount: {
    textAlign: 'right',
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  lastSection: {
    marginBottom: 60, // Extra space at bottom for scrolling
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEmojiOption: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF20',
  },
  emojiText: {
    fontSize: 20,
  },
  timeSelector: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSelectorIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  timeSelectorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    color: '#8E8E93',
    fontSize: 18,
    fontWeight: '500',
  },
  quickTimeContainer: {
    marginTop: 8,
  },
  quickTimeLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  quickTimeOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickTimeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedQuickTimeOption: {
    backgroundColor: '#007AFF20',
    borderColor: '#007AFF',
  },
  quickTimeOptionText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedQuickTimeOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  timePickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timePickerBlur: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  timePickerContainer: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#48484A',
  },
  timePickerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  timePickerCancelText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  timePickerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timePickerDoneText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timePickerContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  timePicker: {
    width: '100%',
    height: 200,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeOption: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF20',
  },
  timeOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTimeOptionText: {
    color: '#007AFF',
    fontWeight: '600',
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
    borderColor: '#007AFF',
    backgroundColor: '#007AFF20',
  },
  priorityText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  selectedPriorityText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tagOption: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTagOption: {
    borderWidth: 2,
  },
  tagOptionEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  tagOptionText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
});