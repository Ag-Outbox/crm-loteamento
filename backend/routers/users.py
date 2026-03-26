from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas.user as schemas
from routers.auth import get_current_user, check_role
from auth_utils import get_password_hash

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/", response_model=List[schemas.UserResponse])
def list_users(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(check_role([models.UserRole.ADMIN, models.UserRole.MANAGER, models.UserRole.SUPER_ADMIN]))
):
    """Lista todos os usuários (corretores/equipe) do tenant atual."""
    return db.query(models.User).filter(models.User.tenant_id == current_user.tenant_id).all()

@router.post("/", response_model=schemas.UserResponse)
def create_user(
    user_in: schemas.UserCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role([models.UserRole.ADMIN, models.UserRole.SUPER_ADMIN]))
):
    """Cria um novo usuário (geralmente um corretor) vinculado ao tenant logado."""
    # Verificar se email já existe
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    
    db_user = models.User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        tenant_id=current_user.tenant_id, # Forçar o mesmo tenant do admin
        is_active=user_in.is_active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_role([models.UserRole.ADMIN, models.UserRole.SUPER_ADMIN]))
):
    """Remove um usuário da equipe."""
    db_user = db.query(models.User).filter(
        models.User.id == user_id, 
        models.User.tenant_id == current_user.tenant_id
    ).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    if db_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode excluir a si mesmo.")

    db.delete(db_user)
    db.commit()
    return None
