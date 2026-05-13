from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import Budget, Expanse, Income, Category,Recurring,  UserCategoryPreference


class CategorySerializer(serializers.ModelSerializer):
    color = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "type", "icon", "color", "default_color"]
        extra_kwargs = {
            "name": {"required": True, "allow_blank": False},
            "type": {"required": True, "allow_blank": False},
            "icon": {"required": True, "allow_blank": False},
        }

    def get_color(self, obj):
        user = self.context["request"].user
        try:
            preference = UserCategoryPreference.objects.get(user=user, category=obj)
            return preference.custom_color if preference.custom_color else obj.default_color
        except UserCategoryPreference.DoesNotExist:
            return obj.default_color
    
    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["created_by"] = user
        validated_data["updated_by"] = user
        return Category.objects.create(**validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user
        instance.name = validated_data.get("name", instance.name)
        instance.type = validated_data.get("type", instance.type)
        instance.icon = validated_data.get("icon", instance.icon)
        instance.default_color = validated_data.get("default_color", instance.default_color)
        instance.updated_by = user
        instance.save()
        return instance

class UserCategoryPreferenceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = UserCategoryPreference
        fields = ["id", "category", "category_name", "custom_color"]
        extra_kwargs = {
            "category": {"required": True, "allow_null": False, "write_only": True}
        }

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        created_by = user
        updated_by = user   
        return UserCategoryPreference.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.custom_color = validated_data.get("custom_color", instance.custom_color)
        created_by = instance.created_by
        updated_by = self.context["request"].user
        instance.save()
        return instance     

class ExpanseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_color = serializers.SerializerMethodField()

    class Meta:
        model = Expanse
        fields = ["id", "category", "category_name", "category_color", "amount", "note", "date"]
        extra_kwargs = {
            "category": {"required": False, "allow_null": True, "write_only": True}
        }

    def get_category_color(self, obj):
        if obj.category_id is None:
            return None
        prefs = self.context.get("category_preferences")
        if prefs is not None:
            p = prefs.get(obj.category_id)
            if p is not None:
                return p.custom_color if p.custom_color else obj.category.default_color
            return obj.category.default_color
        try:
            user = obj.user
            preference = UserCategoryPreference.objects.get(user=user, category=obj.category)
            return preference.custom_color if preference.custom_color else obj.category.default_color
        except UserCategoryPreference.DoesNotExist:
            return obj.category.default_color
    
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
    category_color = serializers.SerializerMethodField()

    class Meta:
        model = Income
        fields = ["id", "category", "category_name", "category_color", "amount", "note", "date"]
        extra_kwargs = {
            "category": {"required": False, "allow_null": True, "write_only": True}
        }

    def get_category_color(self, obj):
        if obj.category_id is None:
            return None
        prefs = self.context.get("category_preferences")
        if prefs is not None:
            p = prefs.get(obj.category_id)
            if p is not None:
                return p.custom_color if p.custom_color else obj.category.default_color
            return obj.category.default_color
        try:
            user = obj.user
            preference = UserCategoryPreference.objects.get(user=user, category=obj.category)
            return preference.custom_color if preference.custom_color else obj.category.default_color
        except UserCategoryPreference.DoesNotExist:
            return obj.category.default_color
        
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


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_color = serializers.SerializerMethodField()
    class Meta:
        model = Budget
        fields = ["id", "category", "category_name", "category_color", "amount", "start_date", "end_date"]
        extra_kwargs = {
            "category": {"required": False, "allow_null": True, "write_only": True}
        }

    def get_category_color(self, obj):
        if obj.category_id is None:
            return None
        prefs = self.context.get("category_preferences")
        if prefs is not None:
            p = prefs.get(obj.category_id)
            if p is not None:
                return p.custom_color if p.custom_color else obj.category.default_color
            return obj.category.default_color
        try:
            user = obj.user
            preference = UserCategoryPreference.objects.get(user=user, category=obj.category)
            return preference.custom_color if preference.custom_color else obj.category.default_color
        except UserCategoryPreference.DoesNotExist:
            return obj.category.default_color
    
    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["created_by"] = user
        validated_data["updated_by"] = user
        return Budget.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        user = self.context["request"].user
        instance.category = validated_data.get("category", instance.category)
        instance.amount = validated_data.get("amount", instance.amount)
        instance.start_date = validated_data.get("start_date", instance.start_date)
        instance.end_date = validated_data.get("end_date", instance.end_date)
        instance.updated_by = user
        instance.save()
        return instance

class RecurringSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.email", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    category_color = serializers.SerializerMethodField()
    class Meta:
        model = Recurring
        fields = ['id','user','user_name','category','category_name','category_color','amount','note','start_date','end_date','next_run_date','frequency','type']

    def get_category_color(self, obj):  
        if obj.category_id is None:
            return None
        prefs = self.context.get("category_preferences")
        if prefs is not None:
            p = prefs.get(obj.category_id)
            if p is not None:
                return p.custom_color if p.custom_color else obj.category.default_color
            return obj.category.default_color
        try:
            user = obj.user
            preference = UserCategoryPreference.objects.get(user=user, category=obj.category)
            return preference.custom_color if preference.custom_color else obj.category.default_color
        except UserCategoryPreference.DoesNotExist:
            return obj.category.default_color
     
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
    

    def validate(self, data):
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        if end_date and start_date and start_date > end_date:
            raise ValidationError("End date must be after start date.")
        return data
    
    