from beanie import PydanticObjectId
from beanie.odm.documents import Document


def doc_id(document: Document) -> PydanticObjectId:
    """Return a persisted document's ObjectId (raises if not yet saved)."""
    oid = document.id
    if oid is None:
        raise ValueError("Document must be persisted before accessing id")
    return oid
