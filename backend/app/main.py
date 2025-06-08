from fastapi import FastAPI
from app.database import engine, Base
from app.routes import user, inventory, recipe  

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(user.router)
app.include_router(inventory.router)
app.include_router(recipe.router)

# @app.get("/")
# def root():
#     return {"message": "Welcome to Recipe App API"}

@app.head("/")
def health_check():
    return {"message": "Welcome to Recipe App API"}
