from fastapi import FastAPI
from app.database import engine, Base
from app.routes import user, inventory

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(user.router)
app.include_router(inventory.router)

@app.get("/")
def root():
    return {"message": "Welcome to Recipe App API"}
