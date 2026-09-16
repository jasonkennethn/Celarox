"""
Google OAuth and Google Drive Integration Service for Celarox Enterprise
"""

import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def verify_google_id_token(id_token: str) -> dict:
    """
    Verify Google ID token via Google TokenInfo endpoint.
    """
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    try:
        response = requests.get(url, timeout=8)
        if response.status_code == 200:
            token_info = response.json()
            client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '')
            # Verify audience
            if client_id and token_info.get("aud") != client_id:
                logger.warning(f"Google Token aud mismatch: {token_info.get('aud')} vs {client_id}")
            return {
                "success": True,
                "email": token_info.get("email"),
                "email_verified": token_info.get("email_verified") in (True, 'true', 'True'),
                "name": token_info.get("name", ""),
                "picture": token_info.get("picture", ""),
                "sub": token_info.get("sub"),
                "raw": token_info
            }
        else:
            return {"success": False, "error": response.text}
    except Exception as exc:
        logger.exception(f"Google token verification failed: {exc}")
        return {"success": False, "error": str(exc)}
