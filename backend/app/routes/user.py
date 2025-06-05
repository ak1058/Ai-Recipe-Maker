from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, utils, auth
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# Signup route
@router.post("/signup", response_model=schemas.UserOut)
def signup(user_create: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if email already exists
        existing_user = db.query(models.User).filter(models.User.email == user_create.email).first()
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        # Hash password
        hashed_password = utils.hash_password(user_create.password)

        # Create user model object
        new_user = models.User(
            email=user_create.email,
            hashed_password=hashed_password,
            name=user_create.name,
            gender=user_create.gender
        )

        # Add and commit to DB
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Unexpected error: {str(e)}")


# Login route
@router.post("/login", response_model=schemas.LoginResponse)
def login(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    try:
        # Find user by email
        user = db.query(models.User).filter(models.User.email == user_login.email).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        # Verify password
        if not utils.verify_password(user_login.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        # Create JWT token
        access_token = auth.create_access_token(data={"user_id": user.id})

        return {"access_token": access_token, "user": user}

    except SQLAlchemyError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Unexpected error: {str(e)}")
