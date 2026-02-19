from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from ..database import SessionLocal
from .. import crud, schemas, models, config
from ..config import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/users", tags=["users"])

# -------- SECURITY --------
security = HTTPBearer()

# -------- DATABASE DEPENDENCY --------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------- CURRENT USER --------
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = crud.get_user(db, user_id)
    if not user:
        raise credentials_exception

    return user


# -------- ROUTES --------

@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserOut)
def update_me(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    update_data = {
        "name": payload.name,
        "education": payload.education,
        "address": payload.address,
        "skills": payload.skills,
        "company_interest": payload.company_interest
    }

    updated = crud.update_user(db, current_user, update_data)
    return updated


@router.post("/me/upload_resume", response_model=schemas.UploadResponse)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes allowed")

    filename = f"{current_user.id}_{file.filename.replace(' ', '_')}"
    path = f"{config.UPLOAD_DIR}/{filename}"

    with open(path, "wb") as f:
        content = file.file.read()
        f.write(content)

    current_user.resume_path = path
    db.add(current_user)
    db.commit()

    return {"uploaded": True, "resume_path": path}


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
