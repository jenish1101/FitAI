import logging


def configure_logging(debug: bool = False) -> None:
    """App INFO logs; third-party drivers (pymongo, etc.) stay quiet."""
    level = logging.DEBUG if debug else logging.INFO

    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%H:%M:%S",
        force=True,
    )

    for logger_name in (
        "pymongo",
        "motor",
        "beanie",
        "watchfiles",
        "multipart",
        "passlib",
    ):
        logging.getLogger(logger_name).setLevel(logging.WARNING)

    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("app").setLevel(level)
