import html2canvas from 'html2canvas'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'

// Background options for wallpaper generation
const BACKGROUND_OPTIONS = [
  {
    id: 'gradient1',
    name: 'Ocean Breeze',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: '🌊'
  },
  {
    id: 'gradient2', 
    name: 'Sunset Glow',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    preview: '🌅'
  },
  {
    id: 'gradient3',
    name: 'Forest Green',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    preview: '🌲'
  },
  {
    id: 'gradient4',
    name: 'Purple Dream',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    preview: '💜'
  },
  {
    id: 'gradient5',
    name: 'Golden Hour',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    preview: '🌇'
  },
  {
    id: 'gradient6',
    name: 'Midnight Blue',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
    preview: '🌙'
  }
]

// Interface for todo items
interface TodoItem {
  id: string
  text: string
  time?: string
  tags?: string[]
  completed: boolean
  priority?: 'low' | 'medium' | 'high'
  emoji?: string
}

// Interface for grocery items
interface GroceryItem {
  id: string
  name: string
  quantity?: string
  category?: string
  completed: boolean
  priority?: 'low' | 'medium' | 'high'
  emoji?: string
}

/**
 * Preview screen component for generating wallpapers from todo/grocery lists
 * Features multiple background options and high-quality image generation
 */
export default function PreviewScreen(): React.ReactElement {
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUND_OPTIONS[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [todoList, setTodoList] = useState<TodoItem[]>([])
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([])
  const [listType, setListType] = useState<'todo' | 'grocery'>('todo')
  
  const wallpaperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Parse URL parameters on component mount
  useEffect(() => {
    const { todoList: todoParam, groceryList: groceryParam } = router.query
    
    if (todoParam && typeof todoParam === 'string') {
      try {
        const parsedTodos = JSON.parse(decodeURIComponent(todoParam))
        setTodoList(parsedTodos)
        setListType('todo')
      } catch (error) {
        console.error('Error parsing todo list:', error)
      }
    }
    
    if (groceryParam && typeof groceryParam === 'string') {
      try {
        const parsedGrocery = JSON.parse(decodeURIComponent(groceryParam))
        setGroceryList(parsedGrocery)
        setListType('grocery')
      } catch (error) {
        console.error('Error parsing grocery list:', error)
      }
    }
  }, [router.query])

  const currentList = listType === 'todo' ? todoList : groceryList
  const completedCount = currentList.filter(item => item.completed).length
  const progressPercentage = currentList.length > 0 ? (completedCount / currentList.length) * 100 : 0

  /**
   * Generate and download wallpaper image
   */
  const generateWallpaper = async (): Promise<void> => {
    if (!wallpaperRef.current) return
    
    setIsGenerating(true)
    
    try {
      // Configure html2canvas options for high quality
      const canvas = await html2canvas(wallpaperRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: 1080, // Phone wallpaper width
        height: 1920, // Phone wallpaper height
        scrollX: 0,
        scrollY: 0
      })
      
      // Create download link
      const link = document.createElement('a')
      link.download = `wallify-${listType}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error generating wallpaper:', error)
      alert('Failed to generate wallpaper. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Get current date information
   */
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

  const dateInfo = getCurrentDateInfo()

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
          <h1 className="text-2xl font-bold text-white">Preview Wallpaper</h1>
          <div className="w-10" />
        </div>

        {/* Background Selection */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-3">Choose Background</h3>
          <div className="grid grid-cols-3 gap-3">
            {BACKGROUND_OPTIONS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedBackground(bg)}
                className={`aspect-square rounded-2xl p-3 transition-all duration-200 ${
                  selectedBackground.id === bg.id 
                    ? 'ring-2 ring-white scale-105' 
                    : 'hover:scale-105'
                }`}
                style={{ background: bg.gradient }}
              >
                <div className="text-2xl mb-1">{bg.preview}</div>
                <div className="text-white text-xs font-medium">{bg.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wallpaper Preview */}
      <div className="px-6 pb-6">
        <div className="bg-gray-900 rounded-2xl p-4 mb-6">
          <h3 className="text-white text-lg font-semibold mb-3">Wallpaper Preview</h3>
          
          {/* Phone Frame */}
          <div className="mx-auto max-w-xs">
            <div className="bg-black rounded-3xl p-2">
              <div 
                ref={wallpaperRef}
                className="aspect-[9/16] rounded-2xl overflow-hidden relative"
                style={{ background: selectedBackground.gradient }}
              >
                {/* Wallpaper Content */}
                <div className="absolute inset-0 p-6 flex flex-col">
                  {/* Date Header */}
                  <div className="text-center mb-8">
                    <div className="text-white text-4xl font-bold mb-2">
                      {dateInfo.date}
                    </div>
                    <div className="text-white/90 text-lg font-medium">
                      {dateInfo.dayFull}
                    </div>
                    <div className="text-white/70 text-sm">
                      {dateInfo.month} {dateInfo.year}
                    </div>
                  </div>

                  {/* List Title */}
                  <div className="text-center mb-6">
                    <h2 className="text-white text-2xl font-bold mb-2">
                      {listType === 'todo' ? '📝 My Tasks' : '🛒 Shopping List'}
                    </h2>
                    <div className="text-white/80 text-sm">
                      {completedCount}/{currentList.length} completed
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* List Items */}
                  <div className="flex-1 space-y-3 overflow-hidden">
                    {currentList.slice(0, 8).map((item, index) => (
                      <div 
                        key={item.id}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center space-x-3"
                      >
                        {/* Completion Status */}
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          item.completed 
                            ? 'bg-white border-white' 
                            : 'border-white/60'
                        }`}>
                          {item.completed && <span className="text-black text-xs">✓</span>}
                        </div>

                        {/* Item Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            {item.emoji && <span className="text-sm">{item.emoji}</span>}
                            <span className={`text-white text-sm font-medium truncate ${
                              item.completed ? 'line-through opacity-60' : ''
                            }`}>
                              {listType === 'todo' ? (item as TodoItem).text : (item as GroceryItem).name}
                            </span>
                          </div>
                          
                          {/* Additional Info */}
                          <div className="flex items-center space-x-2 mt-1">
                            {listType === 'todo' && (item as TodoItem).time && (
                              <span className="text-white/70 text-xs">
                                ⏰ {(item as TodoItem).time}
                              </span>
                            )}
                            {listType === 'grocery' && (item as GroceryItem).quantity && (
                              <span className="text-white/70 text-xs">
                                📦 {(item as GroceryItem).quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show more indicator */}
                    {currentList.length > 8 && (
                      <div className="text-center">
                        <span className="text-white/60 text-sm">
                          +{currentList.length - 8} more items
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="text-center mt-6">
                    <div className="text-white/60 text-xs">
                      Generated with Wallify ✨
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/50 backdrop-blur-lg">
        <button
          onClick={generateWallpaper}
          disabled={isGenerating || currentList.length === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-4 rounded-2xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>📱</span>
              <span>Download Wallpaper</span>
            </>
          )}
        </button>
        
        {currentList.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-3">
            Add some items to your list first
          </p>
        )}
      </div>
    </div>
  )
}