from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, StockMovement, Category
from .serializers import ProductSerializer, StockAdjustmentSerializer, CategorySerializer
from inventory import serializers
from .permissions import IsInventoryAdmin
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from django.db import models

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsInventoryAdmin]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'quantity']
    search_fields = ['name', 'sku']
    ordering_fields = ['price', 'quantity', 'timestamp']
    
    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        product = self.get_object()
        serializer = StockAdjustmentSerializer(data=request.data)
        if serializer.is_valid():
            try:
                updated_product = serializer.update_stock(product, request.user)
                return Response(ProductSerializer(updated_product).data,
                status=status.HTTP_200_OK)
            except serializers.ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    permission_classes = [IsInventoryAdmin]

class LowStockReportView(APIView):
    permission_classes = [IsInventoryAdmin]
    serializer_class = ProductSerializer
    
    def get(self, request):
        low_stock_products = Product.objects.filter(quantity__lte=models.F('low_stock_threshold'))
        serializer = ProductSerializer(low_stock_products, many=True)
        return Response({
            'count': low_stock_products.count(),
            'products': serializer.data
        })