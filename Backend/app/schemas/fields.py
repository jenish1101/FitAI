from typing import Any

from pydantic import Field


def CamelField(
    default: Any = ...,
    *,
    alias: str,
    **kwargs: Any,
) -> Any:
    """Python snake_case param + camelCase JSON alias (Pyright-friendly)."""
    if default is ...:
        return Field(validation_alias=alias, serialization_alias=alias, **kwargs)
    return Field(default=default, validation_alias=alias, serialization_alias=alias, **kwargs)
