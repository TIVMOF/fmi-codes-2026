from vercel_blob import put
import os
import uuid


def upload_video(file_path):

    filename = f"{uuid.uuid4()}.mp4"

    with open(file_path, "rb") as f:
        file_bytes = f.read()

    result = put(
        f"videos/{filename}",
        file_bytes,
        multipart=True
    )

    return result["url"]