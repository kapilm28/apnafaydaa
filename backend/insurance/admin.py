from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser,InsurancePlan,Transaction

# Register your models here.

class InsurancePlanAdmin(admin.ModelAdmin):
    list_display = ('id','plan_name', 'description', 'price', 'sum_assured', 'icon_name',)

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = (
        'id', 'email', 'username', 'first_name', 'last_name', 'phone','dob',
        'get_plans','pan_number','pan_photo',
        'aadhaar_number','aadhaar_front_photo','aadhaar_back_photo',
        'nominee_name','nominee_dob','nominee_relation','annual_income',
        'is_active', 'is_staff'
    )
    list_filter = ('is_active', 'is_staff', 'is_superuser')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)

    def get_plans(self, obj):
        return ", ".join([p.plan_name for p in obj.plans.all()])
    get_plans.short_description = "Plans"

    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {
            'fields': (
                'first_name', 'last_name', 'phone','dob',
                'pan_number','pan_photo',
                'aadhaar_number','aadhaar_front_photo','aadhaar_back_photo',
                'nominee_name','nominee_dob','nominee_relation','annual_income'
            )
        }),
        ('Plans', {'fields': ('plans',)}),  # ✅ real field instead of get_plans
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'username', 'first_name', 'last_name', 'phone',
                'pan_number','pan_photo',
                'aadhaar_number','aadhaar_front_photo','aadhaar_back_photo',
                'nominee_name','nominee_dob','nominee_relation','annual_income',
                'password1', 'password2', 'is_active', 'is_staff'
            )},
            ('Plans', {
                'fields': ('plans',),
            }),
        ),
    )

filter_horizontal = ('plans',) 


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(InsurancePlan,InsurancePlanAdmin)