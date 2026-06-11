from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def _friendly_validation_message(errors: list[dict]) -> str:
    messages: list[str] = []

    for error in errors:
        loc = error.get("loc", ())
        field = loc[-1] if loc else None
        err_type = str(error.get("type", ""))

        if field == "email":
            messages.append("Please enter a valid email address.")
        elif field == "password" and "too_short" in err_type:
            messages.append("Password must be at least 6 characters.")
        elif field == "password" and "too_long" in err_type:
            messages.append("Password is too long.")
        elif field == "name":
            messages.append("Please enter your full name.")
        else:
            messages.append(str(error.get("msg", "Invalid input")))

    unique = list(dict.fromkeys(messages))
    return unique[0] if len(unique) == 1 else " ".join(unique)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        if isinstance(exc.detail, dict) and "message" in exc.detail:
            return JSONResponse(status_code=exc.status_code, content=exc.detail)
        return JSONResponse(status_code=exc.status_code, content={"message": str(exc.detail)})

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = exc.errors()
        message = _friendly_validation_message(errors)
        return JSONResponse(status_code=422, content={"message": message, "errors": errors})
