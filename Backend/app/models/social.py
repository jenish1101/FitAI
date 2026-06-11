from beanie import Document, PydanticObjectId


class UserChallengeDocument(Document):
    user_id: PydanticObjectId
    challenge_id: str
    progress: int | float = 0

    class Settings:
        name = "user_challenges"
        indexes = [("user_id", "challenge_id")]
