from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .utils import media

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
            "gender",
            "dob",
            "full_name",
            "profile_picture",
            "is_staff",
            "is_superuser",
        ]
        read_only_fields = [
            "id",
            "full_name",
            "profile_picture",
            "is_staff",
            "is_superuser",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
            "full_name": {"read_only": True},
            "profile_picture": {"read_only": True},
        }

    def get_profile_picture(self, obj):
        path = obj.profile_picture or media.DEFAULT_PROFILE_PICTURE
        request = self.context.get("request")
        if request is None:
            return path
        return media.media_url(request, path)

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password is not None:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        print("Update called with validated_data:", validated_data)
        if "password" in validated_data:
            raise ValidationError("Password cannot be updated through this endpoint.")
    
        if "email" in validated_data:
           raise ValidationError("Email cannot be changed.")
    
        return super().update(instance, validated_data)    