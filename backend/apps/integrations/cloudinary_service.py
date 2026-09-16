"""
Cloudinary Object Storage Service for Celarox Enterprise
All assets are organized strictly inside folder "Celarox Enterprise"
"""

import logging
import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=getattr(settings, 'CLOUDINARY_CLOUD_NAME', ''),
    api_key=getattr(settings, 'CLOUDINARY_API_KEY', ''),
    api_secret=getattr(settings, 'CLOUDINARY_API_SECRET', ''),
    secure=True
)


def upload_file_to_cloudinary(
    file_obj,
    subfolder: str = "documents",
    public_id: str = None,
    resource_type: str = "auto"
) -> dict:
    """
    Upload file directly to Cloudinary under root folder 'Celarox Enterprise'.
    """
    root_folder = getattr(settings, 'CLOUDINARY_FOLDER', 'Celarox Enterprise')
    target_folder = f"{root_folder}/{subfolder}".strip('/')

    options = {
        "folder": target_folder,
        "resource_type": resource_type,
        "use_filename": True,
        "unique_filename": True,
        "overwrite": False
    }

    if public_id:
        options["public_id"] = public_id

    try:
        response = cloudinary.uploader.upload(file_obj, **options)
        return {
            "success": True,
            "url": response.get("secure_url") or response.get("url"),
            "public_id": response.get("public_id"),
            "format": response.get("format"),
            "bytes": response.get("bytes"),
            "resource_type": response.get("resource_type"),
            "created_at": response.get("created_at"),
            "raw": response
        }
    except Exception as exc:
        logger.exception(f"Cloudinary upload failed: {exc}")
        return {
            "success": False,
            "error": str(exc)
        }


def delete_file_from_cloudinary(public_id: str, resource_type: str = "image") -> dict:
    """
    Remove asset from Cloudinary.
    """
    try:
        response = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return {"success": response.get("result") == "ok", "raw": response}
    except Exception as exc:
        logger.exception(f"Cloudinary delete failed: {exc}")
        return {"success": False, "error": str(exc)}
