import { useRouter } from 'next/router'
import React from 'react'

// Category types and their configurations
interface CategoryConfig {
  id: string
  title: string
  subtitle: string
  icon: string
  gradient: string[]
  accentColor: string
  lightColor: string
  route: string
  previewType: 'todo' | 'grocery' | 'habit' | 'calendar' | 'event'
}

// Mock data for demonstration
interface TodoItem {
  id: string
  text: string
  completed: boolean
  time?: string
}

interface GroceryItem {
  id: string
  name: string
  checked: boolean
  category: string
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
    gradient: ['#FF3B30', '#FF6B6B'],
    accentColor: '#FF3B30',
    lightColor: '#FFE8E7',
    route: '/calendar',
    previewType: 'calendar'
  }
]

// Sample data for previews
const SAMPLE_TODOS: TodoItem[] = [
  { id: '1', text: 'Morning workout', completed: false, time: '07:00' },
  { id: '2', text: 'Team meeting', completed: true, time: '10:00' },
  { id: '3', text: 'Grocery shopping', completed: false, time: '15:00' }
]

const SAMPLE_GROCERY: GroceryItem[] = [
  { id: '1', name: 'Apples', checked: false, category: 'Fruits' },
  { id: '2', name: 'Milk', checked: true, category: 'Dairy' },
  { id: '3', name: 'Bread', checked: false, category: 'Bakery' }
]

/**
 * Welcome screen component that displays category selection
 * Users can choose between different types of lists to create
 */
export default function WelcomeScreen(): React.ReactElement {
  const router = useRouter()

  /**
   * Handle category selection and navigation
   */
  const handleCategoryPress = (category: CategoryConfig): void => {
    router.push(category.route)
  }

  /**
   * Render preview content based on category type
   */
  const renderPreviewContent = (category: CategoryConfig) => {
    switch (category.previewType) {
      case 'todo':
        return (
          <div className="space-y-2">
            {SAMPLE_TODOS.slice(0, 3).map((todo, index) => (
              <div key={todo.id} className="flex items-center space-x-2 text-xs">
                <div className={`w-3 h-3 rounded-full border-2 ${todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`} />
                <span className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {todo.text}
                </span>
              </div>
            ))}
          </div>
        )
      case 'grocery':
        return (
          <div className="space-y-2">
            {SAMPLE_GROCERY.slice(0, 3).map((item, index) => (
              <div key={item.id} className="flex items-center space-x-2 text-xs">
                <div className={`w-3 h-3 rounded border ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-400'}`} />
                <span className={`${item.checked ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )
      default:
        return (
          <div className="text-xs text-gray-600 text-center">
            Coming Soon
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="pt-16 pb-8 px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Choose Category</h1>
          <p className="text-gray-300 text-lg">What would you like to create today?</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-6 pb-20">
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryPress(category)}
              className="glass-effect rounded-2xl p-4 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="text-center">
                {/* Icon */}
                <div 
                  className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${category.gradient[0]}, ${category.gradient[1]})`
                  }}
                >
                  {category.icon}
                </div>
                
                {/* Title and Subtitle */}
                <h3 className="text-white font-semibold text-lg mb-1">{category.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{category.subtitle}</p>
                
                {/* Preview */}
                <div className="bg-white/10 rounded-lg p-3 min-h-[80px] flex items-center justify-center">
                  {renderPreviewContent(category)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation Hint */}
      <div className="fixed bottom-8 left-0 right-0 px-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Select a category to start creating your wallpaper
          </p>
        </div>
      </div>
    </div>
  )
}