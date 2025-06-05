from sqlalchemy import Column, Integer, String
from app.database import Base

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
