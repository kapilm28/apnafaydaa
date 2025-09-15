from django.urls import path

from .views import (     
    initiate_payment,payu_success,payu_failure,Insurance_plans,Insurance_plan_detail,UserProfileView, 
    MyTokenObtainPairView,OTPRequestView,OTPVerifyView,ResetPasswordView,get_csrf_token,InitiatePaymentView, SubmitTxnView, AdminMarkPaidView, home
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', home),
    path('api/plans/', Insurance_plans, name='Insurance_plans'),
    path('api/plans/<int:pk>/', Insurance_plan_detail, name='plan-detail'),
    path('api/initiate-payment/', initiate_payment, name='initiate-payment'),
    path('api/payu/success/', payu_success, name='payu-success'),
    path('api/payu/failure/', payu_failure, name='payu-failure'),

    path('api/me/', UserProfileView.as_view(), name='user-profile'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/otp-request/', OTPRequestView.as_view(), name='otp-request'),
    path('api/otp-verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('api/get-csrf-token/', get_csrf_token),
    path('api/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('initiate/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('submit-txn/<uuid:pk>/', SubmitTxnView.as_view(), name='submit-txn'),
    path('admin-mark-paid/<uuid:pk>/', AdminMarkPaidView.as_view(), name='admin-mark-paid'),
]