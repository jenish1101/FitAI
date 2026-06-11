from pydantic import Field

from app.schemas.common import APIModel


class Challenge(APIModel):
    id: str
    name: str
    description: str
    duration: int
    progress: int | float
    total: int | float
    participants: int
    active: bool
    type: str


class ChallengeProgressUpdate(APIModel):
    progress: int | float
