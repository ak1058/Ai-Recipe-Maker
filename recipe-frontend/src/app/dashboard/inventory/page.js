"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { PlusIcon, CheckIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

const categoryIcons = {
  'Vegetables': '/vegetable.svg',
  'Fruits': '/fruits.svg',
  'Dairy & Bread': '/dairy.svg',
  'Eggs': '/eggs.svg',
  'Pulses & Grains': '/pulses.svg',
  'Others': '/others.svg'
};

export default function InventoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRecipeReady, setShowRecipeReady] = useState(false);
  const [apiCompleted, setApiCompleted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [generationMessages] = useState([
    "🔥 Heating up the tandoor...",
    " Mixing AI with masala...",
    "Chef Amit is cooking up ideas...",
    "Calling the recipe gods...",
    "Just a little bit more time...",
    "Loading your recipeeeeeeee...",
  ]);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [abortController, setAbortController] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('/api/inventory', {
          credentials: 'include',
        });
        const data = await response.json();
        
        if (response.ok) {
          setInventory(data);
          const firstCategory = Object.keys(data)[0];
          setActiveTab(firstCategory);
        } else {
          throw new Error(data.error || 'Failed to fetch inventory');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setCurrentMessage(prev => (prev + 1) % generationMessages.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isGenerating, generationMessages.length]);

  const toggleItemSelection = (itemName) => {
    setSelectedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const openRecipeModal = () => {
    if (selectedItems.length > 0 && selectedItems.length <= 5) {
      setShowRecipeModal(true);
      setShowRecipeReady(false);
    }
  };

  const generateRecipe = async () => {
    if (!showRecipeModal) return;
    
    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);
    setApiCompleted(false);
    
    try {
      const response = await fetch('/api/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: selectedItems }),
        credentials: 'include',
        signal: controller.signal
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recipes');
      }

      localStorage.setItem('generatedRecipes', JSON.stringify(data.recipes));
      setApiCompleted(true);
      setRedirecting(true);

      // Only redirect if modal is still open
      if (showRecipeModal) {
        router.push(`/dashboard/recipe-maker?items=${encodeURIComponent(selectedItems.join(','))}`);
      } else {
        setShowRecipeReady(true);
        setTimeout(() => setShowRecipeReady(false), 60000);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const closeModal = () => {
    // Abort any ongoing request
    if (abortController) {
      abortController.abort();
    }
    
    setShowRecipeModal(false);
    setRedirecting(false);
    
    // Show notification if API completed
    if (apiCompleted) {
      setShowRecipeReady(true);
      setTimeout(() => setShowRecipeReady(false), 60000);
    }
  };

  const viewGeneratedRecipe = () => {
    router.push(`/dashboard/recipe-maker?items=${encodeURIComponent(selectedItems.join(','))}`);
    setShowRecipeReady(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-lg font-medium text-gray-500">No inventory data found</p>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Redirecting...</h2>
        <p className="text-gray-600 mt-2">Preparing your Serving Table...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 h-full flex flex-col px-2 sm:px-4">
      {showRecipeReady && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 border border-green-200 max-w-xs">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckIcon className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Your recipe has been generated!
                </p>
                <button
                  onClick={viewGeneratedRecipe}
                  className="mt-1 text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
                >
                  View recipe <ArrowRightIcon className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowRecipeReady(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory</h1>
        {selectedItems.length > 0 && selectedItems.length <= 5 && (
          <button
            onClick={openRecipeModal}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Create AI Recipe ({selectedItems.length} selected)</span>
          </button>
        )}
      </div>

      {selectedItems.length > 5 && (
        <div className="rounded-lg bg-yellow-50 p-3 text-yellow-800 text-sm">
          Please select maximum 5 ingredients for recipe generation
        </div>
      )}
  
      <div className="flex overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex space-x-2">
          {Object.keys(inventory).map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`flex flex-col items-center justify-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg min-w-[80px] sm:min-w-[100px] transition-all ${activeTab === category ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer'} border`}
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 mb-1 flex items-center justify-center">
                {categoryIcons[category] ? (
                  <img 
                    src={categoryIcons[category]} 
                    alt={category} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400">?</span>
                )}
              </div>
              <span className="text-xs font-medium text-center truncate w-full">
                {category.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
  
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab && inventory[activeTab] && (
          <div className="bg-white rounded-lg shadow h-full flex flex-col">
            <div className="p-3 sm:p-4 border-b">
              <h2 className="text-md sm:text-lg font-semibold text-gray-800">{activeTab}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {inventory[activeTab].map((item) => (
                  <div 
                    key={item.id} 
                    className={`relative flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedItems.includes(item.name) ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                    onClick={() => toggleItemSelection(item.name)}
                  >
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2 sm:mb-3 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-3xl sm:text-4xl text-gray-300">?</span>
                          <span className="text-xs text-gray-400 mt-1">no image</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-center text-gray-700 line-clamp-2">{item.name}</span>
                    <div className={`absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${selectedItems.includes(item.name) ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
                      <PlusIcon className="w-2 h-2 sm:w-3 sm:h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
  
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Selected Ingredients</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {Object.entries(inventory).map(([category, items]) => {
                  const categoryItems = selectedItems.filter(itemName => 
                    items.some(item => item.name === itemName)
                  );
                  
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <div key={category} className="bg-gray-50 rounded-lg p-2 sm:p-3">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <img 
                          src={categoryIcons[category] || '/others.svg'} 
                          alt={category} 
                          className="w-5 h-5 sm:w-6 sm:h-6"
                        />
                        <h4 className="font-medium text-sm sm:text-base text-gray-800">{category}</h4>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {categoryItems.map(itemName => (
                          <span 
                            key={itemName} 
                            className="bg-white px-2 py-1 rounded-full text-xs sm:text-sm shadow-xs border border-gray-200"
                          >
                            {itemName}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={generateRecipe}
                disabled={isGenerating}
                className={`w-full py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 ${isGenerating ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'} text-white transition-colors text-sm sm:text-base`}
              >
                {isGenerating ? (
                  <>
                    <div className="flex space-x-1 cursor-wait">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>{generationMessages[currentMessage]}</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Create AI Recipe</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}