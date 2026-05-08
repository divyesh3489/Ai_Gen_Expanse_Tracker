import boto3
from botocore.exceptions import NoCredentialsError
import uuid
from django.conf import settings

AWS_ACCESS_KEY_ID = settings.AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY = settings.AWS_SECRET_ACCESS_KEY
AWS_STORAGE_BUCKET_NAME = settings.AWS_STORAGE_BUCKET_NAME
AWS_S3_REGION_NAME = settings.AWS_S3_REGION_NAME

def upload_profile_picture_to_s3(file, user_id):
    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_S3_REGION_NAME,
    )
    file_extension = file.name.split(".")[-1]
    unique_filename = f"profile-pictures/{user_id}/{uuid.uuid4()}.{file_extension}"
    try:
        s3.upload_fileobj(file, AWS_STORAGE_BUCKET_NAME, unique_filename)
        file_url = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com/{unique_filename}"
        return file_url
    except NoCredentialsError:
        return None
    