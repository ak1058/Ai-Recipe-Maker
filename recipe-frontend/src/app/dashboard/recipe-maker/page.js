"use client";
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  FiClock, 
  FiUser, 
  FiShoppingBag, 
  FiCheckCircle, 
  FiPlusCircle, 
  FiSave,
  FiYoutube,
  FiChevronLeft,
  FiChevronRight,
  FiActivity
} from 'react-icons/fi';
import { 
  GiCookingPot, 
  GiMeal,
  GiSaucepan,
  GiFruitBowl
} from 'react-icons/gi';
import { 
  FaBlender, 
  FaUtensils,
  FaLeaf,
  FaIceCream,
  FaCarrot,
  FaWeight,
  FaEgg 
} from 'react-icons/fa';
import { 
  IoIosNutrition,
  IoMdTime,
  IoMdNutrition
} from 'react-icons/io';
import { FaRegSmileWink } from 'react-icons/fa';
import { BiBowlRice } from 'react-icons/bi';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export default function RecipeMakerPage() {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get('items');
  const selectedItems = itemsParam ? itemsParam.split(',') : [];
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoStates, setVideoStates] = useState({});
  const [saveStates, setSaveStates] = useState({});
  const videoContainersRef = useRef({});
  const [scrollPositions, setScrollPositions] = useState({});

  useEffect(() => {
    const loadRecipes = () => {
      try {
        const storedRecipes = localStorage.getItem('generatedRecipes');
        
        if (storedRecipes) {
          setRecipes(JSON.parse(storedRecipes));
        } else {
          setError("No recipes found. Please generate recipes first.");
        }
      } catch (err) {
        setError("Failed to load recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [itemsParam]);

  const handleSaveRecipe = async (recipe, index) => {
    try {
      setSaveStates(prev => ({
        ...prev,
        [index]: { loading: true, error: null, success: false }
      }));

      const response = await fetch('/api/save-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recipe,
          youtube_videos: videoStates[index]?.videos || []
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save recipe');
      }

      setSaveStates(prev => ({
        ...prev,
        [index]: { loading: false, error: null, success: true }
      }));

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveStates(prev => ({
          ...prev,
          [index]: { ...prev[index], success: false }
        }));
      }, 3000);

    } catch (error) {
      setSaveStates(prev => ({
        ...prev,
        [index]: { loading: false, error: error.message, success: false }
      }));
    }
  };

  const handleFetchVideos = async (recipeName, recipeIndex) => {
    try {
      setVideoStates(prev => ({
        ...prev,
        [recipeIndex]: { loading: true, error: null, videos: null }
      }));

      const response = await fetch('/api/fetch-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipe_name: recipeName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch videos');
      }

      setVideoStates(prev => ({
        ...prev,
        [recipeIndex]: { 
          loading: false, 
          error: null, 
          videos: data.videos 
        }
      }));
    } catch (error) {
      setVideoStates(prev => ({
        ...prev,
        [recipeIndex]: { 
          loading: false, 
          error: error.message, 
          videos: null 
        }
      }));
    }
  };

  const scrollVideos = (direction, recipeIndex) => {
    const container = videoContainersRef.current[recipeIndex];
    if (!container) return;
    
    const scrollAmount = direction === 'left' ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleScroll = (recipeIndex) => {
    const container = videoContainersRef.current[recipeIndex];
    if (!container) return;
    
    setScrollPositions(prev => ({
      ...prev,
      [recipeIndex]: {
        left: container.scrollLeft > 0,
        right: container.scrollLeft < container.scrollWidth - container.clientWidth
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-xl bg-red-100 p-4 text-center border-l-4 border-red-500">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const NutritionCard = ({ label, value, icon, color }) => {
    return (
      <div className={`bg-${color}-50 px-2 py-1 rounded-lg flex items-center gap-2 `}>
        <div className={`bg-${color}-100 p-1 rounded-full text-${color}-600 flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex items-baseline gap-1 text-xs">
          <span className="text-gray-500 font-medium">{label}:</span>
          <span className="text-gray-800 font-semibold">{value}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <GiCookingPot className="text-amber-600" /> 
          <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            Delicious Recipe Suggestions
          </span>
        </h1>
        <p className="mt-3 text-gray-600">Recipes crafted from your available ingredients</p>
      </header>
      
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-sm p-6 mb-8 border border-amber-100">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-amber-900">
          <FiShoppingBag className="text-amber-600" /> Your Ingredients:
        </h2>
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm flex items-center gap-1 border border-amber-200"
            >
              <FiCheckCircle size={14} className="text-green-600" /> 
              <span className="capitalize">{item}</span>
            </span>
          ))}
        </div>
      </div>

      {recipes.length > 0 && (
        <div className="space-y-10">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <GiMeal className="text-orange-500" /> 
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Crafted Recipes for You <FaRegSmileWink className="inline text-yellow-500" />
            </span>
          </h2>

          {recipes.map((recipe, index) => {
            const videoState = videoStates[index] || {};
            const saveState = saveStates[index] || {};
            const scrollPosition = scrollPositions[index] || { left: false, right: true };
            
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                {/* Recipe Header */}
                <div className="p-8 pb-0">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{recipe.name}</h3>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                          <IoMdTime className="text-amber-600" /> {recipe.total_time}
                        </span>
                        <span className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                          <FiUser className="text-green-600" /> {recipe.servings || 2} serving{recipe.servings !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleFetchVideos(recipe.name, index)}
                        disabled={videoState.loading || videoState.videos}
                        className={`flex items-center gap-2 px-5 py-2.5 ${videoState.videos ? 'bg-gray-100 text-gray-800' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'} rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70`}
                      >
                        {videoState.loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Searching...
                          </>
                        ) : (
                          <>
                            <FiYoutube size={16} />
                            {videoState.videos ? 'Videos Found' : 'Get Video'}
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => handleSaveRecipe(recipe, index)}
                        disabled={saveState.loading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70 relative"
                      >
                        {saveState.loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave size={16} /> 
                            {saveState.success ? 'Saved!' : 'Save Recipe'}
                          </>
                        )}
                        {saveState.success && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-ping opacity-75"></span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Recipe Content */}
                <div className="p-8">
                  {/* YouTube Videos Section */}
                  {videoState.videos && (
                    <div className="mb-8 group">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                        <FiYoutube className="text-red-600" /> Video Tutorials
                      </h4>
                      <div className="relative">
                        {videoState.videos.length > 3 && (
                          <>
                            {scrollPosition.left && (
                              <button 
                                onClick={() => scrollVideos('left', index)}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all z-10"
                              >
                                <FiChevronLeft className="text-gray-700" />
                              </button>
                            )}
                            {scrollPosition.right && (
                              <button 
                                onClick={() => scrollVideos('right', index)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all z-10"
                              >
                                <FiChevronRight className="text-gray-700" />
                              </button>
                            )}
                          </>
                        )}
                        <div 
                          ref={el => {
                            videoContainersRef.current[index] = el;
                            if (el && !scrollPositions[index]) {
                              handleScroll(index);
                            }
                          }}
                          onScroll={() => handleScroll(index)}
                          className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {videoState.videos.map((video, idx) => (
                            <div key={idx} className="flex-shrink-0 w-72 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                              <a 
                                href={`https://www.youtube.com/watch?v=${video.video_id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <div className="relative pt-[56.25%] overflow-hidden">
                                  <img 
                                    src={video.thumbnail_url} 
                                    alt={video.title}
                                    className="absolute top-0 left-0 w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
                                      <FiYoutube className="text-white text-xl" />
                                    </div>
                                  </div>
                                </div>
                                <div className="p-3">
                                  <h5 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{video.title}</h5>
                                  <p className="text-xs text-gray-500">{video.channel_title}</p>
                                </div>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ingredients Section */}
                    <div className="lg:col-span-1">
                      <div className="bg-gradient-to-b from-green-50 to-amber-50 rounded-xl p-6 h-full border border-green-100">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                          <FaUtensils className="text-green-600" /> Ingredients
                        </h4>
                        <div className="space-y-5">
                          <div>
                          <h5 className={`text-[15px] font-medium text-gray-700 mb-3 flex items-center gap-2 border-b border-green-400 pb-1 ${roboto.className}`}>
                            <FiCheckCircle className="text-green-500" />
                            <span className="text-green-800">Available Ingredients</span>
                          </h5>
                            <ul className="space-y-3">
                              {recipe.ingredients.available.map((ing, idx) => (
                                <li key={`available-${idx}`} className="flex items-start gap-3 text-gray-700">
                                  <span className="mt-1.5 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                                  <span className="capitalize">{ing}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {recipe.ingredients.needed && recipe.ingredients.needed.length > 0 && (
                            <div>
                              <h5 className={`text-[15px] font-medium text-gray-700 mb-3 flex items-center gap-2 border-b border-amber-600 pb-1 ${roboto.className}`}>
                                <FiPlusCircle className="text-amber-500" /> 
                                <span className="text-amber-800">Extra Needed Ingredients</span>
                              </h5>
                              <ul className="space-y-3">
                                {recipe.ingredients.needed.map((ing, idx) => (
                                  <li key={`needed-${idx}`} className="flex items-start gap-3 text-gray-700">
                                    <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                                    <span className="capitalize">{ing}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {recipe.nutrition && (
                                  <div className="mt-6">
                                    <h5 className={`text-[15px] font-medium text-gray-700 mb-3 flex items-center gap-2 border-b border-purple-400 pb-1 ${roboto.className}`}>
                                      <IoMdNutrition className="text-purple-600" /> 
                                      <span className="text-purple-800">Nutrition Facts (per serving)</span>
                                    </h5>
                                    <div className="grid grid-cols-2 gap-3">
                                      <NutritionCard 
                                        label="Protein" 
                                        value={recipe.nutrition.protein} 
                                        icon={<FaEgg size={14} />} 
                                        color="blue" 
                                      />
                                      <NutritionCard 
                                        label="Carbs" 
                                        value={recipe.nutrition.carbs} 
                                        icon={<BiBowlRice size={14} />} 
                                        color="amber" 
                                      />
                                      <NutritionCard 
                                        label="Fat" 
                                        value={recipe.nutrition.fat} 
                                        icon={<FaWeight size={14} />} 
                                        color="red" 
                                      />
                                      {recipe.nutrition.sugars && (
                                        <NutritionCard 
                                          label="Sugars" 
                                          value={recipe.nutrition.sugars} 
                                          icon={<FaCarrot size={14} />} 
                                          color="green" 
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}

                        </div>
                      </div>
                    </div>
                    
                    {/* Time and Instructions Section */}
                    <div className="lg:col-span-2">
                      {/* Time Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-green-50 p-4 rounded-xl text-center border border-green-100">
                          <div className="text-xs text-green-600 mb-1 flex items-center justify-center gap-1">
                            <FiClock size={14} /> Prep
                          </div>
                          <div className="font-medium text-green-800 text-lg">{recipe.prep_time || "5 mins"}</div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl text-center border border-amber-100">
                          <div className="text-xs text-amber-600 mb-1 flex items-center justify-center gap-1">
                            <GiSaucepan size={14} /> Cook
                          </div>
                          <div className="font-medium text-amber-800 text-lg">{recipe.cook_time || "15 mins"}</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-200 shadow-inner">
                          <div className="text-xs text-orange-700 mb-1 flex items-center justify-center gap-1 font-medium">
                            <FaBlender size={14} /> Total
                          </div>
                          <div className="font-bold text-orange-900 text-lg">{recipe.total_time || "20 mins"}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-5 flex items-center gap-2 text-lg">
                          <GiFruitBowl className="text-orange-500" /> Cooking Instructions
                        </h4>
                        <div className="relative">
                          <div 
                            className="instruction-scroll-container overflow-y-auto pr-4" 
                            style={{ maxHeight: '310px' }}
                          >
                            <ol className="space-y-5">
                              {recipe.instructions.map((step) => (
                                <li key={step.step} className="flex gap-4 group">
                                  <div className="flex-shrink-0 relative">
                                    <div className="absolute -left-0.5 -top-0.5 w-8 h-8 rounded-full bg-amber-200 opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-medium text-sm">
                                      {step.step}
                                    </div>
                                  </div>
                                  <div className="text-gray-700 pt-0.5 pb-4 border-b border-gray-100 group-last:border-b-0">
                                    {step.description}
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}