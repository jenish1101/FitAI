from pydantic import BaseModel, ConfigDict, Field


class APIModel(BaseModel):
    """Base Pydantic v2 model — camelCase JSON aliases for the mobile client."""

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class MessageResponse(APIModel):
    message: str = Field(min_length=1)


class ErrorResponse(APIModel):
    message: str = Field(min_length=1)
    errors: list[dict[str, object]] | None = None
