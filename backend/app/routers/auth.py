from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserRole
from ..schemas import UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/users", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.get("/switch-role/{role}", response_model=UserResponse)
def switch_role(role: str, db: Session = Depends(get_db)):
    """Convenient endpoint for switching between Student, Teacher, and Parent demo roles."""
    role_enum = None
    if role.lower() == "student":
        role_enum = UserRole.STUDENT
    elif role.lower() == "teacher":
        role_enum = UserRole.TEACHER
    elif role.lower() == "parent":
        role_enum = UserRole.PARENT
    else:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    user = db.query(User).filter(User.role == role_enum).first()
    if not user:
        raise HTTPException(status_code=404, detail="Default user for role not found")
    return user


@router.get("/me/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
