from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser
from app.core.ids import doc_id
from app.models.reference import ChallengeDocument
from app.models.social import UserChallengeDocument
from app.schemas.social import Challenge, ChallengeProgressUpdate

router = APIRouter(prefix="/social", tags=["social"])


@router.get("/challenges", response_model=list[Challenge])
async def list_challenges(current_user: CurrentUser) -> list[Challenge]:
    challenge_docs = await ChallengeDocument.find_all().to_list()
    user_progress = {
        doc.challenge_id: doc.progress
        for doc in await UserChallengeDocument.find(
            UserChallengeDocument.user_id == current_user.id
        ).to_list()
    }

    challenges: list[Challenge] = []
    for doc in challenge_docs:
        challenge = doc.data.model_copy()
        if doc.challenge_id in user_progress:
            challenge.progress = user_progress[doc.challenge_id]
        challenges.append(challenge)
    return challenges


@router.patch("/challenges/{challenge_id}", response_model=Challenge)
async def update_challenge_progress(
    challenge_id: str,
    payload: ChallengeProgressUpdate,
    current_user: CurrentUser,
) -> Challenge:
    challenge_doc = await ChallengeDocument.find_one(ChallengeDocument.challenge_id == challenge_id)
    if challenge_doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": "Challenge not found"},
        )

    user_challenge = await UserChallengeDocument.find_one(
        UserChallengeDocument.user_id == current_user.id,
        UserChallengeDocument.challenge_id == challenge_id,
    )
    if user_challenge is None:
        user_challenge = UserChallengeDocument(
            user_id=doc_id(current_user),
            challenge_id=challenge_id,
            progress=payload.progress,
        )
        await user_challenge.insert()
    else:
        user_challenge.progress = payload.progress
        await user_challenge.save()

    challenge = challenge_doc.data.model_copy()
    challenge.progress = payload.progress
    return challenge
