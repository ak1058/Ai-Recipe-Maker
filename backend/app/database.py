from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    echo=False,  
    future=True      # Enables SQLAlchemy 2.0 style usage
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False  # Prevents attributes from expiring after commit
)

Base = declarative_base()

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    except Exception as e:
        raise e
    finally:
        db.close()
