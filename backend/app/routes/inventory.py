from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from collections import defaultdict
from app.database import get_db
from app.models import Inventory
from app.auth import get_current_user  

router = APIRouter(
    prefix="/inventory",
    tags=["inventory"]
)

@router.get("/", response_model=dict)
def get_inventory_grouped(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)  
):
    try:
        items = db.query(Inventory).all()

        if not items:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No inventory items found"
            )

        grouped_inventory = defaultdict(list)
        for item in items:
            grouped_inventory[item.category].append({
                "id": item.id,
                "name": item.name,
                "description": item.description,
                "image_url": item.image_url,
                "unit": item.unit
            })

        return grouped_inventory

    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while fetching inventory."
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )
