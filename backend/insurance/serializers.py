from rest_framework import serializers
from .models import CustomUser,InsurancePlan,Transaction,Payment,ContactMessage
import smtplib
import ssl
from email.message import EmailMessage
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'password', 'email', 'first_name', 'last_name',
            'phone', 'annual_income', 'dob', 'plans','pan_number','pan_photo','aadhaar_number',
            'aadhaar_front_photo','aadhaar_back_photo','nominee_name','nominee_dob','nominee_relation',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
   
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        self.send_welcome_email(user)
        return user
    
    def send_welcome_email(self, user):
        sender = settings.EMAIL_HOST_USER
        password = settings.EMAIL_HOST_PASSWORD
        receiver = user.email

        msg = EmailMessage()
        msg.set_content(
           f"""
                <html>
                    <body>
                        <p>Hello <strong>{user.first_name}</strong>,</p>
                        <p>"🎉 Welcome to Reminder App!</p>
                        <p>"Your username is: {user.username}"</p>
                        
                        <p>Regards,<br>Reminder App Team</p>
                    </body>
                </html>
            """, subtype='html'            
        )        
        msg["Subject"] = "🎉 Welcome to Reminder App Portal"
        msg["From"] = sender
        msg["To"] = receiver

        context = ssl._create_unverified_context()

        try:
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls(context=context)
                server.login(sender, password)
                server.send_message(msg)
        except Exception as e:
            # Log the error instead of using `messages` or `redirect`
            print(f"❌ Failed to send welcome email: {e}")

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
    

class InsurancePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsurancePlan
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['txnid', 'status', 'created_at', 'user']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('id','status','created_at','updated_at','upi_link','qr_base64')

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"