import { useRouter } from 'next/router'
import React, { useState } from 'react'

// Grocery item interface
interface GroceryItem {
  id: string
  name: string
  quantity: string
  category: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  emoji?: string
}

// Predefined categories with emojis and colors
const GROCERY_CATEGORIES = [
  { name: 'Fruits', emoji: '🍎', color: '#FF6B6B', lightColor: '#FFE8E8' },
  { name: 'Vegetables', emoji: '🥕', color: '#4ECDC4', lightColor: '#E8FFFE' },
  { name: 'Dairy', emoji: '🥛', color: '#45B7D1', lightColor: '#E8F4FD' },
  { name: 'Meat', emoji: '🥩', color: '#96CEB4', lightColor: '#F0F9F4' },
  { name: 'Bakery', emoji: '🍞', color: '#FFEAA7', lightColor: '#FFFEF0' },
  { name: 'Snacks', emoji: '🍿', color: '#DDA0DD', lightColor: '#F8F0F8' },
  { name: 'Beverages', emoji: '🥤', color: '#98D8C8', lightColor: '#F0FAF7' },
  { name: 'Frozen', emoji: '🧊', color: '#74B9FF', lightColor: '#EBF4FF' },
  { name: 'Household', emoji: '🧽', color: '#A29BFE', lightColor: '#F0EFFF' },
  { name: 'Personal Care', emoji: '🧴', color: '#FD79A8', lightColor: '#FEF0F5' },
]

// Priority levels
const PRIORITY_LEVELS = [
  { level: 'low', color: '#8E8E93', emoji: '🔵', name: 'Low' },
  { level: 'medium', color: '#FF9500', emoji: '🟡', name: 'Medium' },
  { level: 'high', color: '#FF3B30', emoji: '🔴', name: 'High' },
] as const

// Common quantities
const QUICK_QUANTITIES = ['1', '2', '3', '1 kg', '500g', '1L', '2L', '1 pack', '1 bottle']

/**
 * Grocery list screen component for creating and managing grocery items
 * Features categorized grocery management with quantities and priorities
 */
export default function GroceryScreen(): React.ReactElement {
  const [groceryName, setGroceryName] = useState<string>('')
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([])
  const [selectedQuantity, setSelectedQuantity] = useState<string>('1')
  const [selectedCategory, setSelectedCategory] = useState<string>('Fruits')
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [selectedEmoji, setSelectedEmoji] = useState<string>('')
  
  const router = useRouter()

  const completedCount = groceryList.filter(item => item.completed).length
  const progressPercentage = groceryList.length > 0 ? (completedCount / groceryList.length) * 100 : 0

  /**
   * Add a new grocery item
   */
  const addGroceryItem = (): void => {
    if (groceryName.trim()) {
      const newItem: GroceryItem = {
        id: Date.now().toString(),
        name: groceryName.trim(),
        quantity: selectedQuantity,
        category: selectedCategory,
        completed: false,
        priority: selectedPriority,
        emoji: selectedEmoji
      }
      
      setGroceryList([...groceryList, newItem])
      resetForm()
    }
  }

  /**
   * Reset form to default values
   */
  const resetForm = (): void => {
    setGroceryName('')
    setSelectedQuantity('1')
    setSelectedCategory('Fruits')
    setSelectedPriority('medium')
    setSelectedEmoji('')
    setShowAddModal(false)
  }

  /**
   * Toggle grocery item completion status
   */
  const toggleGroceryCompletion = (id: string): void => {
    setGroceryList(groceryList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  /**
   * Remove a grocery item
   */
  const removeGroceryItem = (id: string): void => {
    setGroceryList(groceryList.filter(item => item.id !== id))
  }

  /**
   * Navigate to preview with grocery list
   */
  const navigateToPreview = (): void => {
    const groceryListParam = encodeURIComponent(JSON.stringify(groceryList))
    router.push(`/preview?groceryList=${groceryListParam}`)
  }

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
    const priorityLevel = PRIORITY_LEVELS.find(p => p.level === priority)
    return priorityLevel?.color || '#8E8E93'
  }

  /**
   * Get category info
   */
  const getCategoryInfo = (categoryName: string) => {
    return GROCERY_CATEGORIES.find(cat => cat.name === categoryName) || GROCERY_CATEGORIES[0]
  }

  /**
   * Group grocery items by category
   */
  const groupedGroceries = groceryList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, GroceryItem[]>)

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
          <h1 className="text-2xl font-bold text-white">Grocery List</h1>
          <div className="w-10" />
        </div>

        {/* Progress Card */}
        <div className="glass-effect rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-xl font-semibold">
                Shopping List
              </h2>
              <p className="text-gray-300">
                {groceryList.length} items total
              </p>
            </div>
            <div className="text-right">
              <p className="text-white text-lg font-semibold">
                {completedCount}/{groceryList.length}
              </p>
              <p className="text-gray-300 text-sm">Collected</p>
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

      {/* Grocery List */}
      <div className="px-6 pb-32">
        {groceryList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-white text-xl font-semibold mb-2">No items yet</h3>
            <p className="text-gray-400">Add your first grocery item to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedGroceries).map(([category, items]) => {
              const categoryInfo = getCategoryInfo(category)
              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: categoryInfo.color + '20' }}
                    >
                      <span className="text-lg">{categoryInfo.emoji}</span>
                    </div>
                    <h3 className="text-white font-semibold text-lg">{category}</h3>
                    <div className="flex-1 h-px bg-white/20" />
                  </div>

                  {/* Category Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="glass-effect rounded-2xl p-4">
                        <div className="flex items-start space-x-3">
                          {/* Completion Toggle */}
                          <button
                            onClick={() => toggleGroceryCompletion(item.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all duration-200 ${
                              item.completed 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-400 hover:border-white'
                            }`}
                          >
                            {item.completed && <span className="text-white text-sm">✓</span>}
                          </button>

                          {/* Item Content */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {item.emoji && <span className="text-lg">{item.emoji}</span>}
                              <span className={`text-white font-medium ${
                                item.completed ? 'line-through opacity-60' : ''
                              }`}>
                                {item.name}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-gray-300">📦 {item.quantity}</span>
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: getPriorityColor(item.priority) + '20',
                                  color: getPriorityColor(item.priority)
                                }}
                              >
                                {PRIORITY_LEVELS.find(p => p.level === item.priority)?.emoji} {item.priority}
                              </span>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => removeGroceryItem(item.id)}
                            className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Add Input */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/50 backdrop-blur-lg">
        <div className="flex space-x-3">
          <div className="flex-1 glass-effect rounded-2xl p-4">
            <input
              type="text"
              value={groceryName}
              onChange={(e) => setGroceryName(e.target.value)}
              placeholder="Add grocery item..."
              className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && addGroceryItem()}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold transition-transform hover:scale-105 active:scale-95"
          >
            ⚙️
          </button>
          <button
            onClick={addGroceryItem}
            disabled={!groceryName.trim()}
            className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-semibold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      {/* Generate Wallpaper Button */}
      {groceryList.length > 0 && (
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
              <h3 className="text-white text-xl font-semibold">Add Grocery Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Item Input */}
            <div className="mb-6">
              <label className="text-gray-300 text-sm font-medium mb-2 block">Item Name</label>
              <input
                type="text"
                value={groceryName}
                onChange={(e) => setGroceryName(e.target.value)}
                placeholder="Enter grocery item..."
                className="w-full bg-gray-800 text-white rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quantity Selection */}
            <div className="mb-6">
              <label className="text-gray-300 text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUANTITIES.map((quantity) => (
                  <button
                    key={quantity}
                    onClick={() => setSelectedQuantity(quantity)}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                      selectedQuantity === quantity
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {quantity}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                placeholder="Custom quantity"
                className="w-full bg-gray-800 text-white rounded-xl p-3 mt-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="text-gray-300 text-sm font-medium mb-2 block">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {GROCERY_CATEGORIES.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`p-3 rounded-xl transition-colors text-left ${
                      selectedCategory === category.name
                        ? 'text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.name ? category.color : undefined
                    }}
                  >
                    <span className="block text-lg mb-1">{category.emoji}</span>
                    <span className="text-sm font-medium">{category.name}</span>
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

            {/* Add Button */}
            <button
              onClick={addGroceryItem}
              disabled={!groceryName.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Item
            </button>
          </div>
        </div>
      )}
    </div>
  )
}