import os
import uuid

from django.core.files.storage import default_storage

ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
DEFAULT_PROFILE_PICTURE = "default/default_profile_picture.png"


def save_profile_picture(file, user_id):
    """Save the upload under MEDIA_ROOT and return its storage path, or None if not an allowed image."""
    file_extension = os.path.splitext(file.name)[1].lstrip(".").lower()
    if file_extension not in ALLOWED_IMAGE_EXTENSIONS:
        return None
    filename = f"profile-pictures/{user_id}/{uuid.uuid4()}.{file_extension}"
    return default_storage.save(filename, file)


def media_url(request, path):
    return request.build_absolute_uri(default_storage.url(path))
