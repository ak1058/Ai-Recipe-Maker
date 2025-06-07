from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    gender: Optional[str] = None  


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    gender: Optional[str]

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    user: UserOut

class RecipeIngredientsRequest(BaseModel):
    ingredients: List[str]

class RecipeInstruction(BaseModel):
    step: Optional[str] = "1"
    description: Optional[str] = "No description provided"
    class Config:
        extra = "allow"  # Accept extra fields

class RecipeIngredientGroups(BaseModel):
    available: Optional[List[str]] = Field(default_factory=list)
    needed: Optional[List[str]] = Field(default_factory=list)
    class Config:
        extra = "allow"

class GeneratedRecipe(BaseModel):
    name: Optional[str] = "Unnamed Recipe"
    ingredients: Optional[RecipeIngredientGroups] = Field(default_factory=dict)
    instructions: Optional[List[RecipeInstruction]] = Field(default_factory=list)
    prep_time: Optional[str] = "N/A"
    cook_time: Optional[str] = "N/A"
    total_time: Optional[str] = "N/A"
    servings: Optional[int] = 1
    class Config:
        extra = "allow"

class RecipeResponse(BaseModel):
    recipes: Optional[List[GeneratedRecipe]] = Field(default_factory=list)
    class Config:
        extra = "allow"

class YouTubeSearchRequest(BaseModel):
    recipe_name: str
    
class YouTubeVideo(BaseModel):
    video_id: str
    title: str
    description: str
    thumbnail_url: str
    channel_title: str
    published_at: str

class YouTubeResponse(BaseModel):
    videos: List[YouTubeVideo]

class SavedRecipeCreate(BaseModel):
    name: str
    ingredients: RecipeIngredientGroups
    instructions: List[RecipeInstruction]
    prep_time: str
    cook_time: str
    total_time: str
    servings: int
    nutrition: Dict[str, str]
    youtube_videos: List[YouTubeVideo]

class SavedRecipeOut(BaseModel):
    id: int
    user_id: int
    name: str
    ingredients: Dict[str, List[str]]
    instructions: List[Dict[str, str]]
    prep_time: str
    cook_time: str
    total_time: str
    servings: int
    nutrition: Dict[str, str]
    youtube_videos: List[YouTubeVideo]
    
    class Config:
        orm_mode = True