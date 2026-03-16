from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import Budget, Expanse, Income, category,Recurring


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = category
        fields = ["id", "name", "is_default"]
        extra_kwargs = {"is_default": {"read_only": True}}

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["created_by"] = user
        validated_data["updated_by"] = user
        # Remove is_default if present since it's read-only
        validated_data.pop("is_default", None)
        return category.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user
        if instance.is_default:
            raise ValidationError("Cannot update a default category.")
        # Remove is_default from validated_data if present since it's read-only
        instance.name = validated_data.get("name", instance.name)
        instance.updated_by = user
        instance.save()
        return instance


class ExpanseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Expanse
        fields = ["id", "category", "category_name", "amount", "note", "date"]
        extra_kwargs = {
            "category": {"required": False, "allow_null": True, "write_only": True}
        }

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["created_by"] = user
        validated_data["updated_by"] = user
        return Expanse.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user
        instance.category = validated_data.get("category", instance.category)
        instance.amount = validated_data.get("amount", instance.amount)
        instance.note = validated_data.get("note", instance.note)
        instance.date = validated_data.get("date", instance.date)
        instance.updated_by = user
        instance.save()
        return instance


class IncomeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Income
        fields = ["id", "category", "category_name", "amount", "note", "date"]
        extra_kwargs = {
            "category": {"required": False, "allow_null": True, "write_only": True}
        }

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["created_by"] = user
        validated_data["updated_by"] = user
        return Income.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user
        instance.category = validated_data.get("category", instance.category)
        instance.amount = validated_data.get("amount", instance.amount)
        instance.note = validated_data.get("note", instance.note)
        instance.date = validated_data.get("date", instance.date)
        instance.updated_by = user
        instance.save()
        return instance

class RecurringSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.email", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Recurring
        fields = ['id','user','user_name','category','category_name','amount','note','start_date','end_date','next_run_date','frequency','type']
        
    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["created_by"] = user
        validated_data["updated_by"] = user
        return Recurring.objects.create(user=user, **validated_data)
    
    def update(self, instance, validated_data):
        user = self.context["request"].user
        instance.category = validated_data.get("category", instance.category)
        instance.amount = validated_data.get("amount", instance.amount)
        instance.note = validated_data.get("note", instance.note)
        instance.start_date = validated_data.get("start_date", instance.start_date)
        instance.end_date = validated_data.get("end_date", instance.end_date)
        instance.next_run_date = validated_data.get("next_run_date", instance.next_run_date)
        instance.frequency = validated_data.get("frequency", instance.frequency)
        instance.type = validated_data.get("type", instance.type)
        instance.updated_by = user
        instance.save()
        return instance
    