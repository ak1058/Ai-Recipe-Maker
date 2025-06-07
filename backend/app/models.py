from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    name = Column(String)
    gender = Column(String)  



class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    description = Column(String, nullable=True)
    unit = Column(String, nullable=True)

class SavedRecipe(Base):
    __tablename__ = "saved_recipes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    ingredients_available = Column(Text) 
    ingredients_needed = Column(Text)     
    instructions = Column(Text)         
    prep_time = Column(String)
    cook_time = Column(String)
    total_time = Column(String)
    servings = Column(Integer)
    nutrition = Column(Text)            
    
    user = relationship("User", back_populates="saved_recipes")
    youtube_videos = relationship("RecipeYouTubeVideo", back_populates="recipe")

class RecipeYouTubeVideo(Base):
    __tablename__ = "recipe_youtube_videos"
    
    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("saved_recipes.id"))
    video_id = Column(String)
    title = Column(String)
    description = Column(Text)
    thumbnail_url = Column(String)
    channel_title = Column(String)
    published_at = Column(String)
    
    recipe = relationship("SavedRecipe", back_populates="youtube_videos")

User.saved_recipes = relationship("SavedRecipe", back_populates="user")