from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LowStockReportView, ProductViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('reports/low-stock/', LowStockReportView.as_view(), name='low-stock-report'),
    ]

