from dotenv import load_dotenv
import os

load_dotenv()  # automatically loads from .env file

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
DATABASE_URL = os.getenv("DATABASE_URL")
