import secrets
import string
from datetime import datetime, timedelta, timezone

from app.core.security import hash_password, verify_password
from app.models.password_reset import PasswordResetDocument
from app.models.user import UserDocument

RESET_CODE_LENGTH = 6
RESET_EXPIRE_MINUTES = 15

GENERIC_RESET_MESSAGE = (
    "If an account exists with that email, a reset code has been sent."
)


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _generate_code() -> str:
    return "".join(secrets.choice(string.digits) for _ in range(RESET_CODE_LENGTH))


async def request_password_reset(email: str) -> str | None:
    """Create a reset code for the user. Returns the plain code when user exists."""
    user = await UserDocument.find_one(UserDocument.email == email)
    if user is None:
        return None

    await PasswordResetDocument.find(PasswordResetDocument.email == email).delete()

    code = _generate_code()
    await PasswordResetDocument(
        email=email,
        code_hash=hash_password(code),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=RESET_EXPIRE_MINUTES),
    ).insert()

    return code


async def reset_password_with_code(email: str, code: str, new_password: str) -> None:
    user = await UserDocument.find_one(UserDocument.email == email)
    if user is None:
        raise ValueError("Invalid reset code or email")

    reset_doc = await PasswordResetDocument.find_one(
        PasswordResetDocument.email == email,
        PasswordResetDocument.used == False,  # noqa: E712
    )
    if reset_doc is None:
        raise ValueError("Invalid or expired reset code")

    if _as_utc(reset_doc.expires_at) < datetime.now(timezone.utc):
        raise ValueError("Reset code has expired. Request a new code.")

    if not verify_password(code, reset_doc.code_hash):
        raise ValueError("Invalid reset code")

    user.password_hash = hash_password(new_password)
    await user.save()

    reset_doc.used = True
    await reset_doc.save()
