"use client";
import { useState, useEffect } from 'react';
import { 
  FiClock, 
  FiUser, 
  FiShoppingBag, 
  FiCheckCircle, 
  FiPlusCircle,
  FiChevronDown,
  FiChevronUp,
  FiYoutube,
  FiBookmark,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { 
  GiCookingPot, 
  GiMeal,
  GiSaucepan,
  GiFruitBowl
} from 'react-icons/gi';
import { FaUtensils, FaEgg, FaWeight, FaCarrot } from 'react-icons/fa';
import { IoMdNutrition } from 'react-icons/io';
import { BiBowlRice } from 'react-icons/bi';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const NutritionCard = ({ label, value, icon, color }) => {
  return (
    <div className={`bg-${color}-50 px-3 py-2 rounded-lg flex items-center gap-2`}>
      <div className={`bg-${color}-100 p-1.5 rounded-full text-${color}-600 flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex items-baseline gap-1 text-sm">
        <span className="text-gray-500 font-medium">{label}:</span>
        <span className="text-gray-800 font-semibold">{value}</span>
      </div>
    </div>
  );
};

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [videoScrollPositions, setVideoScrollPositions] = useState({});

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/get-saved-recipes');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch saved recipes');
        }

        setRecipes(data);
      } catch (err) {
        setError(err.message || 'Failed to load saved recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, []);

  const toggleRecipeExpand = (recipeId) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };

  const scrollVideos = (direction, recipeId) => {
    const container = document.getElementById(`videos-${recipeId}`);
    if (!container) return;
    
    const scrollAmount = direction === 'left' ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    
    // Update scroll positions after a slight delay
    setTimeout(() => {
      setVideoScrollPositions(prev => ({
        ...prev,
        [recipeId]: {
          left: container.scrollLeft > 0,
          right: container.scrollLeft < container.scrollWidth - container.clientWidth
        }
      }));
    }, 300);
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <FiBookmark className="text-amber-600" /> 
          <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            Your Saved Recipes
          </span>
        </h1>
        <p className="mt-3 text-gray-600">All your favorite recipes in one place</p>
      </header>

      {recipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <GiCookingPot className="text-amber-500 text-4xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-700">No saved recipes yet</h3>
          <p className="text-gray-500 mt-2">Save recipes to see them appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {recipes.map((recipe) => {
            const isExpanded = expandedRecipeId === recipe.id;
            const scrollPosition = videoScrollPositions[recipe.id] || { left: false, right: true };
            
            return (
              <div 
                key={recipe.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-lg"
              >
                {/* Recipe Header (always visible) */}
                <div 
                  className="p-6 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleRecipeExpand(recipe.id)}
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{recipe.name}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FiClock className="text-amber-500" /> {recipe.total_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiUser className="text-green-500" /> {recipe.servings} servings
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-amber-600 transition-colors">
                    {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-6 space-y-6">
                    {/* YouTube Videos Section */}
                    {recipe.youtube_videos && recipe.youtube_videos.length > 0 && (
                      <div className="group relative">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FiYoutube className="text-red-500" /> Video Tutorials
                        </h4>
                        <div className="relative">
                          {recipe.youtube_videos.length > 3 && (
                            <>
                              {scrollPosition.left && (
                                <button 
                                  onClick={() => scrollVideos('left', recipe.id)}
                                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all z-10"
                                >
                                  <FiChevronLeft className="text-gray-700" />
                                </button>
                              )}
                              {scrollPosition.right && (
                                <button 
                                  onClick={() => scrollVideos('right', recipe.id)}
                                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all z-10"
                                >
                                  <FiChevronRight className="text-gray-700" />
                                </button>
                              )}
                            </>
                          )}
                          <div 
                            id={`videos-${recipe.id}`}
                            onScroll={(e) => {
                              const container = e.target;
                              setVideoScrollPositions(prev => ({
                                ...prev,
                                [recipe.id]: {
                                  left: container.scrollLeft > 0,
                                  right: container.scrollLeft < container.scrollWidth - container.clientWidth
                                }
                              }));
                            }}
                            className="flex overflow-x-auto scrollbar-hide gap-4 pb-4"
                          >
                            {recipe.youtube_videos.map((video, idx) => (
                              <div key={idx} className="flex-shrink-0 w-72 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Ingredients Section */}
                      <div className="lg:col-span-1">
                        <div className="bg-gradient-to-b from-green-50 to-amber-50 rounded-lg p-5 h-full border border-green-100">
                          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaUtensils className="text-green-500" /> Ingredients
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <h5 className={`text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 border-b border-green-200 pb-1 ${roboto.className}`}>
                                <FiCheckCircle className="text-green-500" />
                                <span>Available Ingredients</span>
                              </h5>
                              <ul className="space-y-2">
                                {recipe.ingredients.available.map((ing, idx) => (
                                  <li key={`available-${idx}`} className="flex items-start gap-2 text-gray-700">
                                    <span className="mt-1.5 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                                    <span className="capitalize text-sm">{ing}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {recipe.ingredients.needed && recipe.ingredients.needed.length > 0 && (
                              <div>
                                <h5 className={`text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 border-b border-amber-200 pb-1 ${roboto.className}`}>
                                  <FiPlusCircle className="text-amber-500" /> 
                                  <span>Extra Needed Ingredients</span>
                                </h5>
                                <ul className="space-y-2">
                                  {recipe.ingredients.needed.map((ing, idx) => (
                                    <li key={`needed-${idx}`} className="flex items-start gap-2 text-gray-700">
                                      <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                                      <span className="capitalize text-sm">{ing}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Time and Instructions Section */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Nutrition Facts */}
                        {recipe.nutrition && (
                          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-5 border border-purple-100">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <IoMdNutrition className="text-purple-500" /> Nutrition Facts
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

                        {/* Time Cards */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                            <div className="text-xs text-green-600 mb-1 flex items-center justify-center gap-1">
                              <FiClock size={12} /> Prep
                            </div>
                            <div className="font-medium text-green-800">{recipe.prep_time}</div>
                          </div>
                          <div className="bg-amber-50 p-3 rounded-lg text-center border border-amber-100">
                            <div className="text-xs text-amber-600 mb-1 flex items-center justify-center gap-1">
                              <GiSaucepan size={12} /> Cook
                            </div>
                            <div className="font-medium text-amber-800">{recipe.cook_time}</div>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg text-center border border-orange-100 shadow-inner">
                            <div className="text-xs text-orange-600 mb-1 flex items-center justify-center gap-1">
                              <GiCookingPot size={12} /> Total
                            </div>
                            <div className="font-medium text-orange-800">{recipe.total_time}</div>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <GiFruitBowl className="text-orange-500" /> Instructions
                          </h4>
                          <ol className="space-y-4">
                            {recipe.instructions.map((step) => (
                              <li key={step.step} className="flex gap-3 group">
                                <div className="flex-shrink-0 relative">
                                  <div className="absolute -left-0.5 -top-0.5 w-7 h-7 rounded-full bg-amber-200 opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                  <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-medium text-xs">
                                    {step.step}
                                  </div>
                                </div>
                                <div className="text-gray-700 pt-0.5 text-sm">
                                  {step.description}
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}