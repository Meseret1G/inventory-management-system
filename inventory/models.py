from django.db import models

# Create your models here.

from django.conf import settings
from django.core.exceptions import ValidationError


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class Product(models.Model):
    sku = models.CharField(max_length=50, unique=True, help_text="Unique Stock Keeping Unit")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    low_stock_threshold = models.PositiveIntegerField(default=10, help_text="Threshold for low stock alert")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sku} - {self.name}"
    
    def clean(self):
        if self.price < 0:
            raise ValidationError("Price cannot be negative.")
        if self.quantity < 0:
            raise ValidationError("Quantity cannot be negative.")
        
class StockMovement(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_movements')
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    quantity_change = models.IntegerField(help_text="Positive for stock in, negative for stock out")
    
    reason = models.CharField(max_length=255, help_text="Restock, Sale, Damage, etc.")    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.product.sku} - {self.quantity_change} on {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"