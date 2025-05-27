import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // Two cards per row with padding

// Category types and their configurations
interface CategoryConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string[];
  accentColor: string;
  lightColor: string;
  route: string;
  previewType: 'todo' | 'grocery' | 'habit' | 'calendar' | 'event';
}

// Mock data for demonstration
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  time?: string;
}

interface GroceryItem {
  id: string;
  name: string;
  checked: boolean;
  category: string;
}

interface HabitItem {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'personal' | 'reminder';
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'todos',
    title: 'Tasks',
    subtitle: 'Daily productivity',
    icon: '✓',
    gradient: ['#007AFF', '#5856D6'],
    accentColor: '#007AFF',
    lightColor: '#E3F2FF',
    route: '/todo',
    previewType: 'todo'
  },
  {
    id: 'grocery',
    title: 'Grocery',
    subtitle: 'Shopping lists',
    icon: '🛒',
    gradient: ['#34C759', '#30B455'],
    accentColor: '#34C759',
    lightColor: '#E8F8EA',
    route: '/grocery',
    previewType: 'grocery'
  },
  {
    id: 'habits',
    title: 'Habits',
    subtitle: 'Build consistency',
    icon: '🎯',
    gradient: ['#FF9500', '#FF6B00'],
    accentColor: '#FF9500',
    lightColor: '#FFF2E0',
    route: '/habits',
    previewType: 'habit'
  },
  {
    id: 'calendar',
    title: 'Calendar',
    subtitle: 'Schedule & events',
    icon: '📅',
    gradient: ['#5856D6', '#AF52DE'],
    accentColor: '#5856D6',
    lightColor: '#EFEEFD',
    route: '/calendar',
    previewType: 'calendar'
  },
  {
    id: 'events',
    title: 'Events',
    subtitle: 'Upcoming activities',
    icon: '🎉',
    gradient: ['#FF3B30', '#FF6B6B'],
    accentColor: '#FF3B30',
    lightColor: '#FFE8E7',
    route: '/events',
    previewType: 'event'
  }
];

// Mock data
const mockTodos: TodoItem[] = [
  { id: '1', text: 'Review project proposal', completed: false, time: '09:00' },
  { id: '2', text: 'Gym workout', completed: true, time: '18:00' },
  { id: '3', text: 'Call dentist', completed: false, time: '14:00' }
];

const mockGroceries: GroceryItem[] = [
  { id: '1', name: 'Organic Bananas', checked: false, category: '🍎 Fruits' },
  { id: '2', name: 'Greek Yogurt', checked: true, category: '🥛 Dairy' },
  { id: '3', name: 'Whole Grain Bread', checked: false, category: '🍞 Bakery' }
];

const mockHabits: HabitItem[] = [
  { id: '1', name: 'Drink 8 glasses of water', streak: 12, completedToday: true },
  { id: '2', name: 'Read for 30 minutes', streak: 5, completedToday: false },
  { id: '3', name: 'Meditate', streak: 8, completedToday: true }
];

const mockEvents: EventItem[] = [
  { id: '1', title: 'Team standup', date: 'Today', time: '10:00', type: 'meeting' },
  { id: '2', title: 'Lunch with Sarah', date: 'Tomorrow', time: '12:30', type: 'personal' },
  { id: '3', title: 'Doctor appointment', date: 'Friday', time: '15:00', type: 'reminder' }
];

// Get current date info
const getCurrentDateInfo = () => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return {
    dayFull: days[now.getDay()],
    day: days[now.getDay()].substring(0, 3),
    date: now.getDate(),
    month: months[now.getMonth()],
    year: now.getFullYear(),
    greeting: now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'
  };
};

export default function HomeHubScreen(): React.ReactElement {
  const router = useRouter();
  const dateInfo = getCurrentDateInfo();

  // Preview widget renderers for each category
  const renderTodoPreview = () => (
    <View style={styles.previewContainer}>
      {mockTodos.slice(0, 3).map((item, index) => (
        <View key={item.id} style={styles.todoPreviewItem}>
          <View style={[
            styles.todoCheckbox,
            item.completed ? styles.completedCheckbox : styles.uncompletedCheckbox
          ]}>
            {item.completed && <Text style={styles.checkText}>✓</Text>}
          </View>
          <Text style={[
            styles.todoPreviewText,
            item.completed && styles.completedText
          ]} numberOfLines={1}>
            {item.text}
          </Text>
          <Text style={styles.todoTimeText}>{item.time}</Text>
        </View>
      ))}
    </View>
  );

  const renderGroceryPreview = () => (
    <View style={styles.previewContainer}>
      {mockGroceries.slice(0, 3).map((item) => (
        <View key={item.id} style={styles.groceryPreviewItem}>
          <View style={[
            styles.groceryCheckbox,
            item.checked ? styles.checkedGrocery : styles.uncheckedGrocery
          ]}>
            {item.checked && <Text style={styles.checkText}>✓</Text>}
          </View>
          <View style={styles.groceryContent}>
            <Text style={[
              styles.groceryNameText,
              item.checked && styles.completedText
            ]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.groceryCategoryText}>{item.category}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderHabitPreview = () => (
    <View style={styles.previewContainer}>
      {mockHabits.slice(0, 3).map((item) => (
        <View key={item.id} style={styles.habitPreviewItem}>
          <View style={styles.habitStatus}>
            <View style={[
              styles.habitIndicator,
              item.completedToday ? styles.habitCompleted : styles.habitPending
            ]}>
              <Text style={styles.habitIndicatorText}>
                {item.completedToday ? '✓' : '◯'}
              </Text>
            </View>
            <View style={styles.streakContainer}>
              <Text style={styles.streakNumber}>{item.streak}</Text>
              <Text style={styles.streakText}>🔥</Text>
            </View>
          </View>
          <Text style={styles.habitNameText} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderCalendarPreview = () => (
    <View style={styles.calendarPreviewContainer}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarMonth}>{dateInfo.month}</Text>
        <Text style={styles.calendarYear}>{dateInfo.year}</Text>
      </View>
      <View style={styles.calendarGrid}>
        {Array.from({ length: 7 }, (_, i) => (
          <View key={i} style={[
            styles.calendarDay,
            i === 2 && styles.todayCalendar // Highlight today (mock)
          ]}>
            <Text style={[
              styles.calendarDayText,
              i === 2 && styles.todayText
            ]}>
              {15 + i}
            </Text>
            {(i === 1 || i === 4) && <View style={styles.eventDot} />}
          </View>
        ))}
      </View>
    </View>
  );

  const renderEventPreview = () => (
    <View style={styles.previewContainer}>
      {mockEvents.slice(0, 3).map((item) => (
        <View key={item.id} style={styles.eventPreviewItem}>
          <View style={[
            styles.eventTypeIndicator,
            { backgroundColor: item.type === 'meeting' ? '#007AFF' : 
                              item.type === 'personal' ? '#34C759' : '#FF9500' }
          ]} />
          <View style={styles.eventContent}>
            <Text style={styles.eventTitleText} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.eventTimeText}>
              {item.date} • {item.time}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const getPreviewContent = (type: string) => {
    switch (type) {
      case 'todo': return renderTodoPreview();
      case 'grocery': return renderGroceryPreview();
      case 'habit': return renderHabitPreview();
      case 'calendar': return renderCalendarPreview();
      case 'event': return renderEventPreview();
      default: return renderTodoPreview();
    }
  };

  const renderCategoryCard = ({ item }: { item: CategoryConfig }) => (
    <TouchableOpacity 
      style={[styles.categoryCard, { width: CARD_WIDTH }]}
      onPress={() => router.push(item.route)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[...item.gradient, item.gradient[0] + '80']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIconContainer}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>
        </View>

        {/* Preview Content */}
        <View style={styles.cardPreview}>
          {getPreviewContent(item.previewType)}
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardFooterText}>Tap to open</Text>
          <Text style={styles.cardChevron}>›</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>{dateInfo.greeting}</Text>
          <Text style={styles.dateText}>
            {dateInfo.dayFull}, {dateInfo.month} {dateInfo.date}
          </Text>
        </View>
        
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Overview Stats */}
        <View style={styles.statsSection}>
          <BlurView intensity={20} style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Habits</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
          </BlurView>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Your Productivity Hub</Text>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.cardRow}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionButton}>
              <LinearGradient
                colors={['#007AFF', '#5856D6']}
                style={styles.quickActionGradient}
              >
                <Text style={styles.quickActionIcon}>✨</Text>
                <Text style={styles.quickActionText}>Create Wallpaper</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <LinearGradient
                colors={['#34C759', '#30B455']}
                style={styles.quickActionGradient}
              >
                <Text style={styles.quickActionIcon}>📊</Text>
                <Text style={styles.quickActionText}>View Analytics</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  profileSection: {
    marginLeft: 16,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 34,
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  categoriesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  cardRow: {
    justifyContent: 'space-between',
  },
  cardSeparator: {
    height: 16,
  },
  categoryCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  cardPreview: {
    flex: 1,
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardFooterText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  cardChevron: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  previewContainer: {
    gap: 8,
  },
  
  // Todo Preview Styles
  todoPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todoCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCheckbox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  uncompletedCheckbox: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'transparent',
  },
  checkText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#34C759',
  },
  todoPreviewText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  todoTimeText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  
  // Grocery Preview Styles
  groceryPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groceryCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedGrocery: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  uncheckedGrocery: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'transparent',
  },
  groceryContent: {
    flex: 1,
  },
  groceryNameText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  groceryCategoryText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  
  // Habit Preview Styles
  habitPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  habitStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  habitIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  habitPending: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'transparent',
  },
  habitIndicatorText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  streakText: {
    fontSize: 10,
  },
  habitNameText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  
  // Calendar Preview Styles
  calendarPreviewContainer: {
    alignItems: 'center',
  },
  calendarHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarMonth: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  calendarYear: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  calendarDay: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  todayCalendar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  calendarDayText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  todayText: {
    color: '#5856D6',
  },
  eventDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
    bottom: 2,
  },
  
  // Event Preview Styles
  eventPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  eventContent: {
    flex: 1,
  },
  eventTitleText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  eventTimeText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  
  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 24,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  quickActionIcon: {
    fontSize: 16,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});