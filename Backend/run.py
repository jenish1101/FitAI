"""Uvicorn entry point — reads host/port/reload from Pydantic settings."""

import errno
import socket
import sys

import uvicorn

from app.core.config import get_settings
from app.core.logging_config import configure_logging


def _port_in_use(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((host if host != "0.0.0.0" else "127.0.0.1", port))
        except OSError as exc:
            return exc.errno in {errno.EADDRINUSE, errno.EACCES}
    return False


def main() -> None:
    settings = get_settings()
    configure_logging(settings.debug)

    if _port_in_use(settings.host, settings.port):
        print(
            f"ERROR: Port {settings.port} is already in use.\n"
            f"  • Change PORT in .env (e.g. PORT=8001)\n"
            f"  • Or stop the other service (Portainer often uses 8000)\n"
            f"  • Quick override: PORT=8001 python run.py",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Starting FitAI API at http://{settings.host}:{settings.port}{settings.api_v1_prefix}")
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug and settings.app_env == "development",
        log_level="info",
        access_log=True,
    )


if __name__ == "__main__":
    main()
