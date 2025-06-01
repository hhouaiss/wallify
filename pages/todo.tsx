import { useRouter } from 'next/router'
import React, { useState } from 'react'

// Todo item interface
interface TodoItem {
  id: string
  text: string
  time: string
  tags: string[]
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  emoji?: string
}

// Predefined tags with better colors
const PREDEFINED_TAGS = [
  { name: 'Work', color: '#007AFF', emoji: '💼', lightColor: '#E3F2FF' },
  { name: 'Personal', color: '#34C759', emoji: '🏠', lightColor: '#E8F8EA' },
  { name: 'Health', color: '#FF3B30', emoji: '❤️', lightColor: '#FFE8E7' },
  { name: 'Learning', color: '#FF9500', emoji: '📚', lightColor: '#FFF2E0' },
  { name: 'Shopping', color: '#5856D6', emoji: '🛒', lightColor: '#EFEEFD' },
  { name: 'Travel', color: '#32D74B', emoji: '✈️', lightColor: '#E8F8EA' },
]

// Priority levels
const PRIORITY_LEVELS = [
  { level: 'low', color: '#8E8E93', emoji: '🔵', name: 'Low' },
  { level: 'medium', color: '#FF9500', emoji: '🟡', name: 'Medium' },
  { level: 'high', color: '#FF3B30', emoji: '🔴', name: 'High' },
] as const

// Quick time options
const QUICK_TIMES = ['09:00', '12:00', '15:00', '18:00', '20:00']

// Get current date information
const getCurrentDateInfo = () => {
  const now = new Date()
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return {
    dayFull: days[now.getDay()],
    day: days[now.getDay()].substring(0, 3),
    date: now.getDate(),
    month: months[now.getMonth()],
    year: now.getFullYear()
  }
}

/**
 * Todo input screen component for creating and managing todo items
 * Features advanced todo creation with tags, priorities, and time scheduling
 */
export default function TodoInputScreen(): React.ReactElement {
  const [todoText, setTodoText] = useState<string>('')
  const [todoList, setTodoList] = useState<TodoItem[]>([])
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [selectedEmoji, setSelectedEmoji] = useState<string>('')
  
  const router = useRouter()
  const dateInfo = getCurrentDateInfo()

  const completedCount = todoList.filter(t => t.completed).length
  const progressPercentage = todoList.length > 0 ? (completedCount / todoList.length) * 100 : 0

  /**
   * Add a new todo item
   */
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
      }
      
      setTodoList([...todoList, newTodo])
      resetForm()
    }
  }

  /**
   * Reset form to default values
   */
  const resetForm = (): void => {
    setTodoText('')
    setSelectedTags([])
    setSelectedPriority('medium')
    setSelectedEmoji('')
    setShowAddModal(false)
  }

  /**
   * Toggle todo completion status
   */
  const toggleTodoCompletion = (id: string): void => {
    setTodoList(todoList.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  /**
   * Remove a todo item
   */
  const removeTodoItem = (id: string): void => {
    setTodoList(todoList.filter(todo => todo.id !== id))
  }

  /**
   * Toggle tag selection
   */
  const toggleTag = (tagName: string): void => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(tag => tag !== tagName)
        : [...prev, tagName]
    )
  }

  /**
   * Navigate to preview with todo list
   */
  const navigateToPreview = (): void => {
    const todoListParam = encodeURIComponent(JSON.stringify(todoList))
    router.push(`/preview?todoList=${todoListParam}`)
  }

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
    const priorityLevel = PRIORITY_LEVELS.find(p => p.level === priority)
    return priorityLevel?.color || '#8E8E93'
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="pt-16 pb-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full glass-effect flex items-center justify-center"
          >
            <span className="text-white text-lg">←</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <div className="w-10" />
        </div>

        {/* Date and Progress */}
        <div className="glass-effect rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-xl font-semibold">
                {dateInfo.dayFull}
              </h2>
              <p className="text-gray-300">
                {dateInfo.month} {dateInfo.date}, {dateInfo.year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white text-lg font-semibold">
                {completedCount}/{todoList.length}
              </p>
              <p className="text-gray-300 text-sm">Completed</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="px-6 pb-32">
        {todoList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-white text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-gray-400">Add your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todoList.map((todo) => (
              <div key={todo.id} className="glass-effect rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  {/* Completion Toggle */}
                  <button
                    onClick={() => toggleTodoCompletion(todo.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all duration-200 ${
                      todo.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-400 hover:border-white'
                    }`}
                  >
                    {todo.completed && <span className="text-white text-sm">✓</span>}
                  </button>

                  {/* Todo Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {todo.emoji && <span className="text-lg">{todo.emoji}</span>}
                      <span className={`text-white font-medium ${
                        todo.completed ? 'line-through opacity-60' : ''
                      }`}>
                        {todo.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-300">⏰ {todo.time}</span>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: getPriorityColor(todo.priority) + '20',
                          color: getPriorityColor(todo.priority)
                        }}
                      >
                        {PRIORITY_LEVELS.find(p => p.level === todo.priority)?.emoji} {todo.priority}
                      </span>
                    </div>
                    
                    {/* Tags */}
                    {todo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {todo.tags.map((tagName) => {
                          const tag = PREDEFINED_TAGS.find(t => t.name === tagName)
                          return (
                            <span
                              key={tagName}
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: tag?.color + '20',
                                color: tag?.color
                              }}
                            >
                              {tag?.emoji} {tagName}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeTodoItem(todo.id)}
                    className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Input */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/50 backdrop-blur-lg">
        <div className="flex space-x-3">
          <div className="flex-1 glass-effect rounded-2xl p-4">
            <input
              type="text"
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              placeholder="Add a new task..."
              className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && addTodoItem()}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold transition-transform hover:scale-105 active:scale-95"
          >
            ⚙️
          </button>
          <button
            onClick={addTodoItem}
            disabled={!todoText.trim()}
            className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-semibold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      {/* Generate Wallpaper Button */}
      {todoList.length > 0 && (
        <div className="fixed bottom-24 left-6 right-6">
          <button
            onClick={navigateToPreview}
            className="w-full glass-effect rounded-2xl p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
          >
            <span className="text-white font-semibold text-lg">Generate Wallpaper ✨</span>
          </button>
        </div>
      )}

      {/* Advanced Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50">
          <div className="w-full bg-gray-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-semibold">Add Task</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Task Input */}
            <div className="mb-6">
              <label className="text-gray-300 text-sm font-medium mb-2 block">Task</label>
              <input
                type="text"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                placeholder="Enter your task..."
                className="w-full bg-gray-800 text-white rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Time Selection */}
            <div className="mb-6">
              <label className="text-gray-300 text-sm font-medium mb-2 block">Time</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_TIMES.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                      selectedTime === time
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Selection */}
            <div className="mb-6">
              <label className="text-gray-300 text-sm font-medium mb-2 block">Priority</label>
              <div className="flex gap-2">
                {PRIORITY_LEVELS.map((priority) => (
                  <button
                    key={priority.level}
                    onClick={() => setSelectedPriority(priority.level)}
                    className={`flex-1 p-3 rounded-xl transition-colors ${
                      selectedPriority === priority.level
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span className="block text-lg mb-1">{priority.emoji}</span>
                    <span className="text-sm">{priority.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Selection */}
            <div className="mb-6">
              <label className="text-gray-300 text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => toggleTag(tag.name)}
                    className={`px-3 py-2 rounded-xl transition-colors ${
                      selectedTags.includes(tag.name)
                        ? 'text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.name) ? tag.color : undefined
                    }}
                  >
                    {tag.emoji} {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={addTodoItem}
              disabled={!todoText.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Task
            </button>
          </div>
        </div>
      )}
    </div>
  )
}