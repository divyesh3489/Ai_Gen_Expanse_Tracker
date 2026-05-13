from django.contrib import admin

from .models import Budget, Expanse, Income, Recurring, Category, UserCategoryPreference

# Register your models here.

admin.site.register(Expanse)
admin.site.register(Income)
admin.site.register(Category)
admin.site.register(Budget)
admin.site.register(Recurring)
admin.site.register(UserCategoryPreference)
