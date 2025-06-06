"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function RecipeMakerPage() {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get('items');
  const selectedItems = itemsParam ? itemsParam.split(',') : [];
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRecipes = async () => {
    if (selectedItems.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      
      const mockRecipes = [
        {
          id: 1,
          title: `Delicious ${selectedItems.join(' and ')} Recipe`,
          description: `A wonderful dish made with ${selectedItems.join(', ')}. Perfect for any occasion!`,
          ingredients: selectedItems,
          instructions: [
            "Wash and prepare all ingredients.",
            "Combine everything in a large pot.",
            "Cook on medium heat for 20 minutes.",
            "Serve hot and enjoy!"
          ],
          prepTime: "10 mins",
          cookTime: "20 mins"
        },
        {
          id: 2,
          title: `Quick ${selectedItems[0]} Snack`,
          description: `A simple snack featuring ${selectedItems[0]}.`,
          ingredients: [selectedItems[0]],
          instructions: [
            "Slice the main ingredient.",
            "Season to taste.",
            "Serve immediately."
          ],
          prepTime: "5 mins",
          cookTime: "0 mins"
        }
      ];
      
      setRecipes(mockRecipes);
    } catch (err) {
      setError("Failed to generate recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRecipes();
  }, [itemsParam]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">AI Recipe Maker</h1>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Selected Ingredients:</h2>
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item, index) => (
            <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600">Generating recipes...</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Suggested Recipes</h2>
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{recipe.title}</h3>
                <p className="text-gray-600 mt-1">{recipe.description}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">Ingredients:</h4>
                    <ul className="list-disc list-inside mt-1 text-gray-700">
                      {recipe.ingredients.map((ing, idx) => (
                        <li key={idx}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Time:</h4>
                    <p className="mt-1 text-gray-700">Prep: {recipe.prepTime}</p>
                    <p className="text-gray-700">Cook: {recipe.cookTime}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800">Instructions:</h4>
                  <ol className="list-decimal list-inside mt-1 space-y-1 text-gray-700">
                    {recipe.instructions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}