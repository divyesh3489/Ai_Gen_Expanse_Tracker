from django.contrib import admin
from .models import Expanse,Income,category,Budget,Recurring
# Register your models here.

admin.site.register(Expanse)
admin.site.register(Income)
admin.site.register(category)   
admin.site.register(Budget)
admin.site.register(Recurring)