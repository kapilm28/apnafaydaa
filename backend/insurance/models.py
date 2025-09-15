from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import datetime

# Create your models here.

class InsurancePlan(models.Model):
    id = models.AutoField(primary_key=True)
    plan_name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sum_assured = models.CharField(max_length=100)
    icon_name = models.CharField(max_length=100, blank=True, null=True)  # e.g., "fa fa-heart"

    def __str__(self):
        return self.plan_name

# Upload path functions
def pan_upload_path(instance, filename):
    return f"pan/{instance.id}/{filename}"

def aadhaar_upload_path(instance, filename):
    return f"aadhaar/{instance.id}/{filename}"

class CustomUser(AbstractUser):
    id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    phone = models.CharField(max_length=100, blank=True)
    dob = models.DateField(null=True, blank=True)
    annual_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    plans = models.ManyToManyField(InsurancePlan, blank=True)

    # PAN Card details
    pan_number = models.CharField(max_length=10)  # e.g., ABCDE1234F
    pan_photo = models.FileField(upload_to=pan_upload_path, null=True, blank=True)

    # Aadhaar Card details
    aadhaar_number = models.CharField(max_length=12)
    aadhaar_front_photo = models.ImageField(upload_to=aadhaar_upload_path, null=True, blank=True)
    aadhaar_back_photo = models.ImageField(upload_to=aadhaar_upload_path, null=True, blank=True)

    # Nominee details
    nominee_name = models.CharField(max_length=100)
    nominee_dob = models.DateField(null=True, blank=True)
    nominee_relation = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'username']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.username})"


class Transaction(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,  # allow null
        blank=True
    )
    txnid = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    username = models.CharField(max_length=100, null=True, blank=True)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    annual_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    password = models.CharField(max_length=100, null=True, blank=True)  # Can hash later
    plan = models.ForeignKey(InsurancePlan, on_delete=models.SET_NULL, null=True, blank=True)

    pan_number = models.CharField(max_length=10)  # e.g., ABCDE1234F
    pan_photo = models.ImageField(upload_to=pan_upload_path)

    # Aadhaar Card details
    aadhaar_number = models.CharField(max_length=12)
    aadhaar_front_photo = models.ImageField(upload_to=aadhaar_upload_path)
    aadhaar_back_photo = models.ImageField(upload_to=aadhaar_upload_path)

    # Nominee details
    nominee_name = models.CharField(max_length=100)
    nominee_dob = models.DateField(null=True, blank=True)
    nominee_relation = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.email} - {self.txnid} - {self.status}"

from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class Payment(models.Model):
    STATUS_CHOICES = [
        ('PENDING','Pending'),
        ('PAID','Paid'),
        ('FAILED','Failed'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    vpa = models.CharField(max_length=128)  # vendor UPI ID e.g. kmeghnani28@okhdfcbank
    payer_name = models.CharField(max_length=128, blank=True)  # optional
    note = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    upi_link = models.TextField(blank=True)  # upi: link used / saved for QR
    qr_base64 = models.TextField(blank=True) # store QR as base64 PNG
    txn_id = models.CharField(max_length=128, blank=True)  # txn ref supplied by payer
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment({self.id}) {self.amount} {self.status}"