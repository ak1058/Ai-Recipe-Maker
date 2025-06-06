"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

// Icon mapping
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

  const toggleItemSelection = (itemName) => {
    setSelectedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const openRecipeModal = () => {
    if (selectedItems.length > 0) {
      setShowRecipeModal(true);
    }
  };

  const generateRecipe = () => {
    setIsGenerating(true);
    setTimeout(() => {
      router.push(`/dashboard/recipe-maker?items=${encodeURIComponent(selectedItems.join(','))}`);
      setIsGenerating(false);
      setShowRecipeModal(false);
    }, 2000);
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

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        {selectedItems.length > 0 && (
          <button
            onClick={openRecipeModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <CheckIcon className="w-5 h-5" />
            Create AI Recipe ({selectedItems.length} selected)
          </button>
        )}
      </div>
  
      {/* Category Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex space-x-2">
          {Object.keys(inventory).map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg min-w-[100px] transition-all ${activeTab === category ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'} border`}
            >
              <div className="w-8 h-8 mb-1 flex items-center justify-center">
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
  
      {/* Inventory Items Grid with proper scrolling */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab && inventory[activeTab] && (
          <div className="bg-white rounded-lg shadow h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">{activeTab}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {inventory[activeTab].map((item) => (
                  <div 
                    key={item.id} 
                    className={`relative flex flex-col items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedItems.includes(item.name) ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                    onClick={() => toggleItemSelection(item.name)}
                  >
                    <div className="relative w-20 h-20 mb-3 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-4xl text-gray-300">?</span>
                          <span className="text-xs text-gray-400 mt-1">no image</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-center text-gray-700">{item.name}</span>
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${selectedItems.includes(item.name) ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
                      <PlusIcon className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
  
      {/* Recipe Confirmation Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Selected Ingredients</h3>
                <button 
                  onClick={() => setShowRecipeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                {Object.entries(inventory).map(([category, items]) => {
                  const categoryItems = selectedItems.filter(itemName => 
                    items.some(item => item.name === itemName)
                  );
                  
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <div key={category} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={categoryIcons[category] || '/others.svg'} 
                          alt={category} 
                          className="w-6 h-6"
                        />
                        <h4 className="font-medium text-gray-800">{category}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {categoryItems.map(itemName => (
                          <span 
                            key={itemName} 
                            className="bg-white px-3 py-1 rounded-full text-sm shadow-xs border border-gray-200"
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
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${isGenerating ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white transition-colors`}
              >
                {isGenerating ? (
                  <>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Generating Recipe...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
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