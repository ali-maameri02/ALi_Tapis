# pylint: disable=no-member

import datetime
from django.shortcuts import redirect
from django.conf import settings
from django.http import HttpResponseBadRequest
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
# from google_auth_oauthlib.flow import Flow
# from googleapiclient.discovery import build

from .models import Order
from .serializers import OrderSerializer

class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def get_permissions(self):
        # Allow both authenticated and unauthenticated users
        if self.request.method == 'POST':
            return []  # No permissions required for creating orders
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # If user is authenticated, associate with user
        # Guest users will have their data stored in guest fields
        if self.request.user.is_authenticated:
            serializer.save(client=self.request.user)
        else:
            serializer.save()

class OrderHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(client=request.user).prefetch_related("items__product")
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(client=self.request.user)


# def oauth2_init(request):
#     flow = Flow.from_client_secrets_file(
#         settings.GOOGLE_CLIENT_SECRET_FILE,
#         scopes=[
#             'https://www.googleapis.com/auth/drive',
#             'https://www.googleapis.com/auth/spreadsheets',
#             'https://www.googleapis.com/auth/userinfo.email',
#             'openid'
#         ],
#         redirect_uri=settings.GOOGLE_REDIRECT_URI
#     )
#     authorization_url, state = flow.authorization_url(
#         access_type='offline',
#         include_granted_scopes='true'
#     )
#     request.session['oauth_state'] = state
#     return redirect(authorization_url)


# def oauth2_callback(request):
#     if 'oauth_state' not in request.session:
#         return HttpResponseBadRequest("OAuth state missing or expired.")

#     # Complete OAuth flow
#     flow = Flow.from_client_secrets_file(
#         settings.GOOGLE_CLIENT_SECRET_FILE,
#         scopes=[
#             'https://www.googleapis.com/auth/drive',
#             'https://www.googleapis.com/auth/spreadsheets',
#             'https://www.googleapis.com/auth/userinfo.email',
#             'openid'
#         ],
#         state=request.session['oauth_state'],
#         redirect_uri=settings.GOOGLE_REDIRECT_URI
#     )
#     flow.fetch_token(authorization_response=request.build_absolute_uri())
#     credentials = flow.credentials

#     # Create a new Google Sheet
#     sheets_service = build('sheets', 'v4', credentials=credentials)
#     today = datetime.date.today()
#     spreadsheet = sheets_service.spreadsheets().create(
#         body={"properties": {"title": f"Orders Export - {today.isoformat()}"}},
#         fields='spreadsheetId'
#     ).execute()
#     spreadsheet_id = spreadsheet['spreadsheetId']

#     # Collect today's orders with related items and products
#     start = datetime.datetime.combine(today, datetime.time.min)
#     end = datetime.datetime.combine(today, datetime.time.max)
#     orders = (
#         Order.objects
#         .filter(created_at__range=(start, end))
#         .select_related('client')
#         .prefetch_related('items__product')
#     )

#     # Format data rows
#     sheet_data = [["Order ID", "Client Name", "Client Email", "Client Phone", "Created At", "Is Sent", "Product", "Quantity"]]
#     for order in orders:
#         for item in order.items.all():
#             sheet_data.append([
#                 order.id,
#                 order.client.name,
#                 order.client.email,
#                 order.client.phone,
#                 order.created_at.strftime("%Y-%m-%d %H:%M"),
#                 "Yes" if order.is_sent else "No",
#                 item.product.name,
#                 item.quantity
#             ])

#     # Write data to the sheet
#     sheets_service.spreadsheets().values().update(
#         spreadsheetId=spreadsheet_id,
#         range='A1',
#         valueInputOption='RAW',
#         body={'values': sheet_data}
#     ).execute()

#     # Redirect to Google Sheet
#     return redirect(f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}")
