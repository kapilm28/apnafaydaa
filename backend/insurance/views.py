from rest_framework import generics, permissions
from .models import CustomUser,InsurancePlan,Transaction
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from rest_framework import status
from django.http import JsonResponse
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from django.http import HttpResponseRedirect
from django.http import HttpResponse

from .serializers import UserSerializer,InsurancePlanSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.shortcuts import get_object_or_404

from django.core.cache import cache
import random
import smtplib
import ssl
from django.core.mail import EmailMessage
from email.message import EmailMessage
from django.utils.timezone import now
from django.utils import timezone
from django.middleware.csrf import get_token


import uuid
import hashlib

from django.conf import settings

from .models import Payment
from .serializers import PaymentSerializer
import qrcode
import io
import base64
from django.utils import timezone
from decimal import Decimal
from django.views import View

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
import json

@method_decorator(csrf_exempt, name="dispatch")
class InitiatePaymentView(View):
    def post(self, request, *args, **kwargs):
        data = {}

        try:
            # First try form-data
            if request.POST:
                data = request.POST.dict()

            # If still empty, parse JSON
            if not data:
                body_unicode = request.body.decode("utf-8")
                if body_unicode:
                    data = json.loads(body_unicode)
            
            print("🔹 Final data parsed:", data)

        except Exception as e:
            return JsonResponse({"error": f"Invalid request body: {str(e)}"}, status=400)

        # ✅ Now extract safely
        amount = data.get("amount")
        upi_id = data.get("upi_id", "kmeghnani28@okhdfcbank")
        name = data.get("name", "Kapil Meghnani")

        if amount is None or amount == "":
            return JsonResponse({"error": "Amount is required"}, status=400)

        # Build UPI URL
        upi_url = f"upi://pay?pa={upi_id}&pn={name}&am={amount}&cu=INR"

        return JsonResponse({
            "upi_url": upi_url,
            "qr_code": f"https://api.qrserver.com/v1/create-qr-code/?data={upi_url}&size=200x200"
        })

class SubmitTxnView(View):
    def post(self, request, pk, *args, **kwargs):
        data = request.POST or request.data
        utr = data.get("utr")

        try:
            txn = Transaction.objects.get(id=pk)
            txn.utr = utr
            txn.status = "submitted"
            txn.save()
            return JsonResponse({"message": "Transaction submitted, pending admin verification"})
        except Transaction.DoesNotExist:
            return JsonResponse({"error": "Transaction not found"}, status=404)


class AdminMarkPaidView(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            txn = Transaction.objects.get(id=pk)
            txn.status = "paid"
            txn.save()
            return JsonResponse({"message": "Transaction marked as paid"})
        except Transaction.DoesNotExist:
            return JsonResponse({"error": "Transaction not found"}, status=404)

# Create your views here.

# Initiate PayU Payment
@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def initiate_payment(request):
    # Extract data
    plan_id = request.data.get("plan_id")
    firstname = request.data.get("firstname")
    lastname = request.data.get("lastname")
    email = request.data.get("email")
    phone = request.data.get("mobile")
    dob = request.data.get("dob")
    username = request.data.get("username")
    password = request.data.get("password")
    pan_number = request.data.get("pan_number")
    annual_income = request.data.get("annual_income")
    aadhaar_number = request.data.get("aadhaar_number")
    nominee_name = request.data.get("nominee_name")
    nominee_dob = request.data.get("nominee_dob")
    nominee_relation = request.data.get("nominee_relation")
    pan_photo = request.FILES.get("pan_photo")
    aadhaar_front_photo = request.FILES.get("aadhaar_front_photo")
    aadhaar_back_photo = request.FILES.get("aadhaar_back_photo")

    # Validate required fields
    required_fields = [plan_id, firstname, lastname, email, password, pan_number,
                       pan_photo, aadhaar_number, aadhaar_front_photo, aadhaar_back_photo,
                       nominee_name, nominee_dob]
    if not all(required_fields):
        return Response({"error": "All required fields must be provided"}, status=400)

    # Get plan
    plan = get_object_or_404(InsurancePlan, id=plan_id)

    # Generate transaction ID
    txnid = str(uuid.uuid4())[:20]
    amount = str(plan.price)
    key = settings.PAYU_MERCHANT_KEY
    salt = settings.PAYU_MERCHANT_SALT
    productinfo = plan.plan_name
    surl = f"{settings.BASE_URL}/api/payu/success/"
    furl = f"{settings.BASE_URL}/api/payu/failure/"

    # Generate PayU hash
    hash_string = f"{key}|{txnid}|{amount}|{productinfo}|{firstname}|{email}|||||||||||{salt}"
    hashh = hashlib.sha512(hash_string.encode('utf-8')).hexdigest().lower()

    # Save Transaction (without user)
    transaction = Transaction.objects.create(
        txnid=txnid,
        amount=amount,
        status="Pending",
        email=email,
        phone=phone,
        username=username,
        first_name=firstname,
        last_name=lastname,
        dob=dob,
        password=password,  # temporarily store for post-payment creation
        pan_number=pan_number,
        annual_income=annual_income,
        pan_photo=pan_photo,
        aadhaar_number=aadhaar_number,
        aadhaar_front_photo=aadhaar_front_photo,
        aadhaar_back_photo=aadhaar_back_photo,
        nominee_name=nominee_name,
        nominee_dob=nominee_dob,
        nominee_relation=nominee_relation
    )
    
    transaction.plan = plan
    transaction.save()

    # Return PayU details
    return Response({
        "key": key,
        "txnid": txnid,
        "amount": amount,
        "productinfo": productinfo,
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "phone": phone,
        "username": username,
        "surl": surl,
        "furl": furl,
        "hash": hashh,
    })

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@csrf_exempt
def payu_success(request):
    if request.method != 'POST':
        return HttpResponse("Invalid request method", status=405)

    posted_data = request.POST.dict()
    status = posted_data.get("status")
    txnid = posted_data.get("txnid")

    if status != "success":
        return HttpResponse("Payment failed", status=400)

    try:
        transaction = Transaction.objects.get(txnid=txnid)
    except Transaction.DoesNotExist:
        return HttpResponse("Transaction not found", status=404)

    User = get_user_model()
    user = User.objects.filter(email=transaction.email).first()

    plan = transaction.plan  # PayU transaction can have multiple plans

    if not user:
        # Create user after payment
        user = User.objects.create(
            email=transaction.email,
            username=transaction.username,
            first_name=transaction.first_name,
            last_name=transaction.last_name,
            phone=transaction.phone,
            dob=transaction.dob,
            pan_number=transaction.pan_number,
            annual_income=transaction.annual_income,
            pan_photo=transaction.pan_photo,
            aadhaar_number=transaction.aadhaar_number,
            aadhaar_front_photo=transaction.aadhaar_front_photo,
            aadhaar_back_photo=transaction.aadhaar_back_photo,
            nominee_name=transaction.nominee_name,
            nominee_dob=transaction.nominee_dob,
            nominee_relation=transaction.nominee_relation,
        )
        user.set_password(transaction.password)
        user.save()

    # Add the plan to the user if not already assigned
    if plan and plan not in user.plans.all():
        user.plans.add(plan)
        user.save()

    # Update transaction
    transaction.user = user
    transaction.status = "Success"
    transaction.save()

    # Generate JWT tokens
    tokens = get_tokens_for_user(user)
    redirect_url = f"http://localhost:4200/payment-login?access={tokens['access']}&refresh={tokens['refresh']}"
    return HttpResponseRedirect(redirect_url)



# Failure Callback from PayU
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def payu_failure(request):
    return Response({"message": "Payment failed."}, status=400)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def Insurance_plans(request):
    if request.method == 'GET':
        plans = InsurancePlan.objects.all()
        serializer = InsurancePlanSerializer(plans, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = InsurancePlanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def Insurance_plan_detail(request, pk):
    """Get single plan by ID"""
    plan = get_object_or_404(InsurancePlan, pk=pk)
    serializer = InsurancePlanSerializer(plan)
    return Response(serializer.data)

# ✅ Custom JWT token with username/email
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['email'] = self.user.email
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# ✅ Simple homepage response
def home(request):
    return JsonResponse({'message': '🎉 Welcome to the Reminder App API'})

# ✅ Logged-in user can view/update own profile
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class OTPRequestView(APIView):
    permission_classes = [permissions.AllowAny]  # ✅ Required for public access
    def post(self, request):
        request.session.modified = True
        uemail = request.data.get("email")
        if not uemail:
            return Response({"error": "Email is required."}, status=400)

        try:
            user = User.objects.get(email=uemail)
        except User.DoesNotExist:
            return Response({"error": "❌ No user found with that email."}, status=404)

        # Generate OTP and save in session
        userotp = random.randint(100000, 999999)

        cache_key = f"otp:{user.username}"
        cache.set(f"otp:{userotp}", user.username, timeout=300)

        print(f"[DEBUG] OTP for {user.username}: {userotp}")

        # Email Setup
        sender = settings.EMAIL_HOST_USER
        password = settings.EMAIL_HOST_PASSWORD
        receiver = user.email

        msg = EmailMessage()
        msg.set_content(
           f"""
                <html>
                    <body>
                        <p>Hello <strong>{user.username}</strong>,</p>
                        <p>Your OTP for password reset is: <strong>{userotp}</strong></p>                        
                        <p>Regards,<br>HRM Team</p>
                    </body>
                </html>
            """, subtype='html'            
        )
        msg["Subject"] = "🔐 HRM Password Reset OTP"
        msg["From"] = sender
        msg["To"] = receiver

        # ⚠️ SSL context with certificate verification disabled (development only!)
        context = ssl._create_unverified_context()

        try:
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls(context=context)
                server.login(sender, password)
                server.send_message(msg)
            return Response({"message": "✅ OTP sent successfully."}, status=200)
        except Exception as e:
            return Response({"error": f"❌ Failed to send email: {str(e)}"}, status=500)
        
    def is_valid(self):
        return timezone.now() - self.created_at < timezone.timedelta(minutes=10)
        
from django.contrib.auth import get_user_model
User = get_user_model()

class OTPVerifyView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        otp = request.data.get("otp")

        if not otp:
            return Response({"error": "OTP is required."}, status=400)

        cache_key = f"otp:{otp}"
        username = cache.get(cache_key)

        if username is None:
            return Response({"error": "OTP expired or invalid."}, status=404)

        # Optionally delete OTP after success
        cache.delete(cache_key)

        return Response({
            "message": "✅ OTP verified successfully.",
            "username": username
        }, status=200)      

User = get_user_model()

class ResetPasswordView(APIView):

    authentication_classes = []  # ✅ No login required
    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if not all([username, password, confirm_password]):
            return Response({"error": "All fields are required."}, status=400)

        if password != confirm_password:
            return Response({"error": "Passwords do not match."}, status=400)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)

        user.set_password(password)
        user.save()

        return Response({"message": "✅ Password reset successful."}, status=200)
    

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})
