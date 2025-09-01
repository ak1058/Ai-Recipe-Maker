from fastapi import FastAPI
from app.database import engine, Base
from app.routes import user, inventory, recipe  
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  
)

app.include_router(user.router)
app.include_router(inventory.router)
app.include_router(recipe.router)

# @app.get("/")
# def root():
#     return {"message": "Welcome to Recipe App API"}

@app.head("/")
def health_check():
    return {"message": "Welcome to Recipe App API"}
