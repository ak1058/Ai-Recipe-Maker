from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.auth import get_current_user
from app.database import get_db
from app.config import GEMINI_API_KEY, YOUTUBE_API_KEY
from app.models import SavedRecipe, RecipeYouTubeVideo
from app.schemas import RecipeResponse, RecipeIngredientsRequest, YouTubeResponse, YouTubeVideo, YouTubeSearchRequest, SavedRecipeCreate, SavedRecipeOut
import google.generativeai as genai
import json
import re
import requests
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/recipes",
    tags=["recipes"]
)

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')  # Using the latest model

@router.post("/generate", response_model=RecipeResponse)
async def generate_recipes(
    request: RecipeIngredientsRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        ingredients = request.ingredients
        
        prompt = f"""
        I have these ingredients in my kitchen: {', '.join(ingredients)}.
        Please suggest 2 different recipes I can make using primarily these ingredients.
        You may include minimal additional common pantry items if absolutely necessary.
        
        For each recipe, provide:
        - Recipe name
        - Ingredients grouped as:
          * available: ingredients I already have
          * needed: minimal additional ingredients required
        - Step-by-step instructions with step numbers
        - Preparation time
        - Cooking time
        - Total time
        - Number of servings
        - Nutrition information:
            * protein (g)
            * carbs (g)
            * fat (g)
            * sugars (g)
        
        Format the response as a perfect JSON object with this exact structure:
        {{
            "recipes": [
                {{
                    "name": "Recipe name",
                    "ingredients": {{
                        "available": ["ingredient1", "ingredient2"],
                        "needed": ["salt", "pepper"]
                    }},
                    "instructions": [
                        {{"step": "1", "description": "Do something"}},
                        {{"step": "2", "description": "Do something else"}}
                    ],
                    "prep_time": "10 mins",
                    "cook_time": "20 mins",
                    "total_time": "30 mins",
                    "servings": 2,
                    "nutrition": {{
                        "protein": "10g",
                        "carbs": "30g",
                        "fat": "15g",
                        "sugars": "5g"
                    }}
                }}
            ]
        }}
        
        Important:
        1. Return ONLY the JSON object
        2. Don't include any additional text or markdown formatting
        3. Ensure all fields are included for each recipe
        4. Ingredients must be grouped under "available" and "needed"
        """
        
        # Call Gemini API
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 2000
            }
        )
        
        # Extract and clean the response
        response_text = response.text
        
        # Remove markdown code blocks if present
        response_text = re.sub(r'^```json|```$', '', response_text, flags=re.MULTILINE).strip()
        
        # Parse the response
        try:
            recipes_data = json.loads(response_text)
            return recipes_data
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to parse Gemini response: {str(e)}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recipes: {str(e)}"
        )

@router.post("/youtube-search", response_model=YouTubeResponse)
async def search_youtube_videos(
    request: YouTubeSearchRequest,  
    current_user: dict = Depends(get_current_user)
):
    try:
        if not YOUTUBE_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="YouTube API key not configured"
            )

        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': f"{request.recipe_name} recipe", 
            'type': 'video',
            'maxResults': 4,
            'key': YOUTUBE_API_KEY
        }

        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        if 'items' not in data or not data['items']:
            return {"videos": []}

        videos = []
        for item in data['items']:
            video_data = {
                'video_id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'description': item['snippet']['description'],
                'thumbnail_url': item['snippet']['thumbnails']['high']['url'],
                'channel_title': item['snippet']['channelTitle'],
                'published_at': item['snippet']['publishedAt']
            }
            videos.append(YouTubeVideo(**video_data))

        return {"videos": videos}

    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"YouTube API request failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching YouTube videos: {str(e)}"
        )

@router.post("/save", response_model=SavedRecipeOut)
async def save_recipe(
    recipe_data: SavedRecipeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Create the recipe
        db_recipe = SavedRecipe(
            user_id=current_user.id,
            name=recipe_data.name,
            ingredients_available=json.dumps(recipe_data.ingredients.available),
            ingredients_needed=json.dumps(recipe_data.ingredients.needed),
            instructions=json.dumps([inst.dict() for inst in recipe_data.instructions]),
            prep_time=recipe_data.prep_time,
            cook_time=recipe_data.cook_time,
            total_time=recipe_data.total_time,
            servings=recipe_data.servings,
            nutrition=json.dumps(recipe_data.nutrition)
        )
        
        db.add(db_recipe)
        db.commit()
        db.refresh(db_recipe)
        
        # Add YouTube videos
        for video in recipe_data.youtube_videos:
            db_video = RecipeYouTubeVideo(
                recipe_id=db_recipe.id,
                video_id=video.video_id,
                title=video.title,
                description=video.description,
                thumbnail_url=video.thumbnail_url,
                channel_title=video.channel_title,
                published_at=video.published_at
            )
            db.add(db_video)
        
        db.commit()
        
        response_data = {
            "id": db_recipe.id,
            "user_id": db_recipe.user_id,
            "name": db_recipe.name,
            "ingredients": {
                "available": json.loads(db_recipe.ingredients_available),
                "needed": json.loads(db_recipe.ingredients_needed)
            },
            "instructions": json.loads(db_recipe.instructions),
            "prep_time": db_recipe.prep_time,
            "cook_time": db_recipe.cook_time,
            "total_time": db_recipe.total_time,
            "servings": db_recipe.servings,
            "nutrition": json.loads(db_recipe.nutrition),
            "youtube_videos": recipe_data.youtube_videos
        }
        
        return response_data
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving recipe: {str(e)}"
        )
    

@router.get("/saved", response_model=List[SavedRecipeOut])
async def get_saved_recipes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        recipes = db.query(SavedRecipe).filter(
            SavedRecipe.user_id == current_user.id
        ).all()
        
        response = []
        for recipe in recipes:
            videos = [
                {
                    "video_id": video.video_id,
                    "title": video.title,
                    "description": video.description,
                    "thumbnail_url": video.thumbnail_url,
                    "channel_title": video.channel_title,
                    "published_at": video.published_at
                }
                for video in recipe.youtube_videos
            ]
            
            response.append({
                "id": recipe.id,
                "user_id": recipe.user_id,
                "name": recipe.name,
                "ingredients": {
                    "available": json.loads(recipe.ingredients_available),
                    "needed": json.loads(recipe.ingredients_needed)
                },
                "instructions": json.loads(recipe.instructions),
                "prep_time": recipe.prep_time,
                "cook_time": recipe.cook_time,
                "total_time": recipe.total_time,
                "servings": recipe.servings,
                "nutrition": json.loads(recipe.nutrition),
                "youtube_videos": videos
            })
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving saved recipes: {str(e)}"
        )