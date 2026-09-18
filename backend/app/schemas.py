from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EntityBase(BaseModel):
    name: str
    type: str
    case_id: str

class EntityCreate(EntityBase):
    id: str

class Entity(EntityCreate):
    created_at: datetime
    class Config:
        orm_mode = True

class RelationshipBase(BaseModel):
    source_id: str
    target_id: str
    type: str
    case_id: str
    weight: float = 1.0

class RelationshipCreate(RelationshipBase):
    pass

class Relationship(RelationshipBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class AlertBase(BaseModel):
    case_id: str
    severity: str
    title: str
    description: str
    entity_id: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True
